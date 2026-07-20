"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";
import {
  ClaimBadge,
  ClaimLegend,
} from "@/components/property-rentgen/ClaimBadge";
import { FeatureStatusBadge } from "@/components/majetio/FeatureStatusBadge";
import {
  buildDueDiligenceModel,
  DD_CATEGORY_LABELS,
  DEMO_DD_INPUT,
  DUE_DILIGENCE_FEATURE_STATUS,
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
  RESPONSIBLE_PARTY_LABELS,
  saveDueDiligenceOverrides,
  TRAFFIC_LIGHT_LABELS,
  type DDCategory,
  type DueDiligenceInput,
  type PropertyType,
  type TrafficLight,
} from "@/lib/due-diligence";
import { routes } from "@/lib/routes";

function subscribeNoop() {
  return () => {};
}
function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

const LIGHT_STYLES: Record<TrafficLight, string> = {
  GREEN: "bg-emerald-100 border-emerald-400 text-emerald-900",
  AMBER: "bg-amber-100 border-amber-400 text-amber-950",
  RED: "bg-red-100 border-red-400 text-red-900",
  GREY: "bg-stone-200 border-stone-400 text-stone-700",
};

const LIGHT_DOTS: Record<TrafficLight, string> = {
  GREEN: "bg-emerald-500",
  AMBER: "bg-amber-500",
  RED: "bg-red-500",
  GREY: "bg-stone-400",
};

export function DueDiligenceView() {
  const ready = useIsClient();
  const [input, setInput] = useState<DueDiligenceInput>(DEMO_DD_INPUT);
  const [expandedCategory, setExpandedCategory] = useState<DDCategory | "ALL">("ALL");

  const model = useMemo(() => {
    if (!ready) return null;
    return buildDueDiligenceModel(input);
  }, [ready, input]);

  const updateItem = useCallback(
    (
      itemId: string,
      patch: { status?: TrafficLight; evidence?: string; source?: string }
    ) => {
      setInput((prev) => {
        const next = {
          ...prev,
          itemOverrides: {
            ...prev.itemOverrides,
            [itemId]: { ...prev.itemOverrides[itemId], ...patch },
          },
        };
        saveDueDiligenceOverrides(next.propertyType, next.itemOverrides);
        return next;
      });
    },
    []
  );

  const setPropertyType = useCallback((pt: PropertyType) => {
    setInput((prev) => ({
      ...defaultFreshInput(pt, prev.propertyLabel),
    }));
  }, []);

  if (!ready || !model) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">
        Načítám Dynamickou prověrku nemovitosti…
      </div>
    );
  }

  const categories = [...new Set(model.items.map((i) => i.category))];
  const filtered =
    expandedCategory === "ALL"
      ? model.items
      : model.items.filter((i) => i.category === expandedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3f1] to-white">
      <header className="border-b border-border bg-deep-teal text-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <FeatureStatusBadge status={DUE_DILIGENCE_FEATURE_STATUS} />
          <h1 className="mt-2 font-heading text-3xl font-black">
            Dynamická prověrka nemovitosti
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">
            Personalizovaný checklist dle typu nemovitosti. Unknown není Green —
            absence dat neznamená absenci rizika.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
        {/* Property type */}
        <section className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((pt) => (
            <button
              key={pt}
              type="button"
              onClick={() => setPropertyType(pt)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                input.propertyType === pt
                  ? "bg-deep-teal text-white"
                  : "border border-border bg-white"
              }`}
            >
              {PROPERTY_TYPE_LABELS[pt]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setInput(DEMO_DD_INPUT)}
            className="rounded-full border border-white/30 bg-deep-teal/10 px-4 py-2 text-sm"
          >
            Demo byt
          </button>
        </section>

        {/* Summary traffic lights */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {(
            [
              ["GREEN", model.summary.verifiedCount],
              ["AMBER", model.summary.checkRequiredCount],
              ["RED", model.summary.materialIssueCount],
              ["GREY", model.summary.unknownCount],
            ] as const
          ).map(([light, count]) => (
            <div
              key={light}
              className={`rounded-2xl border-2 p-4 ${LIGHT_STYLES[light]}`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${LIGHT_DOTS[light]}`} />
                <span className="text-xs font-bold uppercase">{light}</span>
              </div>
              <p className="mt-2 font-heading text-3xl font-black">{count}</p>
              <p className="text-xs opacity-80">{TRAFFIC_LIGHT_LABELS[light]}</p>
            </div>
          ))}
        </section>

        <p className="text-center text-sm font-medium text-foreground">
          {model.summary.summaryLine}
        </p>

        {/* Expert escalation */}
        {model.escalation.recommended && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-red-900">
              <ShieldAlert className="h-5 w-5" />
              Eskalace k lidskému specialistovi
            </h2>
            <p className="mt-2 text-sm text-red-900/90">{model.escalation.reason}</p>
            <Link
              href={model.escalation.ctaHref}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-deep-teal px-5 py-2 text-sm font-semibold text-white"
            >
              {model.escalation.ctaLabel}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </section>
        )}

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setExpandedCategory("ALL")}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              expandedCategory === "ALL" ? "bg-deep-teal text-white" : "border"
            }`}
          >
            Vše
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setExpandedCategory(c)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                expandedCategory === c ? "bg-deep-teal text-white" : "border"
              }`}
            >
              {DD_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        {/* Checklist items */}
        <section className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border-2 p-4 ${LIGHT_STYLES[item.status]}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold uppercase opacity-70">
                    {DD_CATEGORY_LABELS[item.category]}
                  </p>
                  <p className="font-semibold">{item.label}</p>
                  <p className="mt-1 text-xs opacity-80">{item.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-3 w-3 rounded-full ${LIGHT_DOTS[item.status]}`}
                  />
                  <ClaimBadge kind={item.claimKind} />
                </div>
              </div>
              <dl className="mt-3 grid gap-1 text-xs sm:grid-cols-2">
                <div>
                  <dt className="font-semibold">Podklady</dt>
                  <dd>{item.evidence ?? "—"}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Zdroj</dt>
                  <dd>{item.source ?? "—"}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Odpovědnost</dt>
                  <dd>{RESPONSIBLE_PARTY_LABELS[item.responsibleParty]}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Závažnost</dt>
                  <dd>{item.severity}</dd>
                </div>
              </dl>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["AMBER", "GREEN", "RED", "GREY"] as TrafficLight[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateItem(item.id, { status: s })}
                    className="rounded border border-black/10 px-2 py-0.5 text-[10px] font-bold"
                  >
                    {s}
                  </button>
                ))}
              </div>
              {item.status === "GREEN" && (
                <p className="mt-2 flex items-center gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  GREEN vyžaduje evidence + source (viz pole níže)
                </p>
              )}
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <input
                  placeholder="Podklady…"
                  defaultValue={item.evidence ?? ""}
                  onBlur={(e) =>
                    updateItem(item.id, { evidence: e.target.value || undefined })
                  }
                  className="rounded border px-2 py-1 text-xs"
                />
                <input
                  placeholder="Zdroj…"
                  defaultValue={item.source ?? ""}
                  onBlur={(e) =>
                    updateItem(item.id, { source: e.target.value || undefined })
                  }
                  className="rounded border px-2 py-1 text-xs"
                />
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mb-1 inline h-4 w-4" />
          AI ani systém nevyvozují z absence dat, že problém neexistuje. GREY =
          neznámé, ne OK.
        </section>

        <section className="rounded-2xl border border-border bg-muted/30 p-5">
          <h3 className="mb-2 flex items-center gap-2 font-heading font-bold">
            <HelpCircle className="h-4 w-4" />
            Metodika
          </h3>
          <ul className="space-y-1">
            {model.methodology.map((m) => (
              <li key={m} className="text-xs text-muted-foreground">
                · {m}
              </li>
            ))}
          </ul>
          <ClaimLegend />
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={routes.dealRoom} className="text-sm text-deep-teal underline">
              Transakční místnost →
            </Link>
            <Link href={routes.documentVault} className="text-sm text-deep-teal underline">
              Dokumentový trezor →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function defaultFreshInput(
  propertyType: PropertyType,
  label: string
): DueDiligenceInput {
  return {
    propertyType,
    propertyLabel: label,
    country: "cz",
    itemOverrides: {},
  };
}
