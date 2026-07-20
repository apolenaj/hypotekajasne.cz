import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  generateWatchAlertCandidates,
  stampObservedRates,
} from "@/lib/watchlist/alerts";
import { filterAlertsByThrottle } from "@/lib/watchlist/throttle";
import { applyMajetioObservation } from "@/lib/watchlist/majetio-sync";
import { emptyWatchTarget, type WatchAlert } from "@/lib/watchlist/types";
import { NOTIFY_CHANNELS, NOTIFY_ARCHITECTURE } from "@/lib/watchlist/notify-architecture";
import { MAJETIO_WATCH_SYNC_STATUS } from "@/lib/watchlist/majetio-sync";

describe("smart watchlist alerts — no invented data", () => {
  it("emits price drop only when previous + current known and delta ≥ 50k", () => {
    const target = emptyWatchTarget({
      id: "t1",
      kind: "property",
      label: "Byt Praha",
      priceCzk: 4_650_000,
      previousPriceCzk: 5_000_000,
    });
    const alerts = generateWatchAlertCandidates({
      targets: [target],
      currentRatePercent: null,
      doc: null,
    });
    const drop = alerts.find((a) => a.kind === "price_drop");
    assert.ok(drop);
    assert.match(drop!.title, /350\s*000|350000/);
  });

  it("does not claim listing age without listingPublishedAt", () => {
    const target = emptyWatchTarget({
      id: "t2",
      kind: "property",
      label: "Dům",
      priceCzk: 8_000_000,
      createdAt: "2024-01-01T00:00:00.000Z",
    });
    const alerts = generateWatchAlertCandidates({
      targets: [target],
      currentRatePercent: null,
      doc: null,
      now: new Date("2026-07-20T00:00:00.000Z"),
    });
    assert.equal(
      alerts.filter((a) => a.kind === "listing_age").length,
      0
    );
  });

  it("emits listing age when Majetio published date is known", () => {
    const target = emptyWatchTarget({
      id: "t3",
      kind: "property",
      label: "Ateliér",
      listingPublishedAt: "2026-04-17T00:00:00.000Z",
    });
    const alerts = generateWatchAlertCandidates({
      targets: [target],
      currentRatePercent: null,
      doc: null,
      now: new Date("2026-07-20T00:00:00.000Z"),
    });
    const age = alerts.find((a) => a.kind === "listing_age");
    assert.ok(age);
    assert.match(age!.title, /94 dní/);
  });

  it("never invents similar_listing without Majetio payload", () => {
    const target = emptyWatchTarget({
      id: "t4",
      kind: "property",
      label: "X",
      priceCzk: 3_000_000,
    });
    const alerts = generateWatchAlertCandidates({
      targets: [target],
      currentRatePercent: 5,
      doc: null,
    });
    assert.equal(alerts.filter((a) => a.kind === "similar_listing").length, 0);
  });

  it("yield change requires both previous and current", () => {
    const onlyCurrent = emptyWatchTarget({
      id: "t5",
      kind: "property",
      label: "Y",
      estimatedYieldPct: 5.1,
    });
    assert.equal(
      generateWatchAlertCandidates({
        targets: [onlyCurrent],
        currentRatePercent: null,
        doc: null,
      }).filter((a) => a.kind === "yield_change").length,
      0
    );

    const both = emptyWatchTarget({
      id: "t6",
      kind: "property",
      label: "Y",
      estimatedYieldPct: 5.1,
      previousYieldPct: 5.7,
    });
    const y = generateWatchAlertCandidates({
      targets: [both],
      currentRatePercent: null,
      doc: null,
    }).find((a) => a.kind === "yield_change");
    assert.ok(y);
    assert.match(y!.title, /klesl.*5,7|5\.7.*5,1|5\.1/);
  });

  it("rate payment change is MODEL and needs lastObservedRate", () => {
    const target = emptyWatchTarget({
      id: "t7",
      kind: "property",
      label: "Z",
      priceCzk: 6_000_000,
      lastObservedRatePercent: 5.5,
    });
    const alerts = generateWatchAlertCandidates({
      targets: [target],
      currentRatePercent: 4.8,
      doc: null,
    });
    const rate = alerts.find((a) => a.kind === "rate_payment_change");
    assert.ok(rate);
    assert.equal(rate!.claimKind, "MODEL");
    assert.match(rate!.title, /snížila|zvýšila/);
  });
});

describe("alert throttling", () => {
  const sample: WatchAlert = {
    id: "a1",
    targetId: "t1",
    kind: "price_drop",
    title: "Cena klesla",
    body: "x",
    createdAt: "2026-07-20T10:00:00.000Z",
    claimKind: "DATA",
    magnitude: 100_000,
    href: null,
    severity: "notable",
  };

  it("caps daily alerts", () => {
    const candidates = Array.from({ length: 8 }, (_, i) => ({
      ...sample,
      id: `a${i}`,
      targetId: `t${i}`,
    }));
    const { accepted, rejected } = filterAlertsByThrottle(
      candidates,
      { lastEmittedAt: {}, recentEmissionDays: [] },
      {
        maxAlertsPerDay: 5,
        minHoursBetweenSameKind: 48,
        digestOnly: false,
      },
      new Date("2026-07-20T12:00:00.000Z")
    );
    assert.equal(accepted.length, 5);
    assert.ok(rejected.some((r) => r.includes("daily_cap")));
  });

  it("cooldown blocks same target+kind", () => {
    const { accepted, rejected } = filterAlertsByThrottle(
      [sample],
      {
        lastEmittedAt: {
          "t1:price_drop": "2026-07-19T12:00:00.000Z",
        },
        recentEmissionDays: [],
      },
      {
        maxAlertsPerDay: 5,
        minHoursBetweenSameKind: 48,
        digestOnly: false,
      },
      new Date("2026-07-20T12:00:00.000Z")
    );
    assert.equal(accepted.length, 0);
    assert.ok(rejected[0]?.includes("cooldown"));
  });

  it("digestOnly suppresses immediate emission", () => {
    const { accepted, rejected } = filterAlertsByThrottle(
      [sample],
      { lastEmittedAt: {}, recentEmissionDays: [] },
      {
        maxAlertsPerDay: 5,
        minHoursBetweenSameKind: 48,
        digestOnly: true,
      }
    );
    assert.equal(accepted.length, 0);
    assert.ok(rejected[0]?.includes("digest_only"));
  });
});

describe("Majetio observation + notify architecture", () => {
  it("similar listing alert only from Majetio similarListings", () => {
    const target = emptyWatchTarget({
      id: "t8",
      kind: "property",
      label: "Watched",
      priceCzk: 5_000_000,
    });
    const { similarAlerts } = applyMajetioObservation(target, {
      majetioListingId: "mj-1",
      priceCzk: 5_000_000,
      observedAt: "2026-07-20T00:00:00.000Z",
      similarListings: [
        {
          listingId: "mj-2",
          priceCzk: 4_450_000,
          cheaperThanWatchedPct: 11,
        },
      ],
    });
    assert.equal(similarAlerts.length, 1);
    assert.match(similarAlerts[0]!.title, /11 %/);
  });

  it("stampObservedRates updates property targets", () => {
    const targets = [
      emptyWatchTarget({ id: "p", kind: "property", label: "P" }),
      emptyWatchTarget({ id: "c", kind: "city", label: "Brno" }),
    ];
    const stamped = stampObservedRates(targets, 4.9);
    assert.equal(stamped[0]!.lastObservedRatePercent, 4.9);
    assert.equal(stamped[1]!.lastObservedRatePercent, null);
  });

  it("email/push stay COMING_SOON; in_app LIVE; sync COMING_SOON", () => {
    assert.equal(NOTIFY_CHANNELS.in_app.status, "LIVE");
    assert.equal(NOTIFY_CHANNELS.email.status, "COMING_SOON");
    assert.equal(NOTIFY_CHANNELS.web_push.status, "COMING_SOON");
    assert.equal(MAJETIO_WATCH_SYNC_STATUS, "COMING_SOON");
    assert.ok(NOTIFY_ARCHITECTURE.pipeline.length >= 4);
  });
});
