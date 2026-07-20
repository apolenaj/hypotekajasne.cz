"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Building2,
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  Link2,
  Shield,
  Users,
} from "lucide-react";
import { B2bDataProvenanceLegend } from "@/components/b2b-portal/B2bDataProvenanceBadge";
import { MajetioIntelligenceBadge } from "@/components/b2b-portal/MajetioIntelligenceBadge";
import { SponsoredPlacementBadge } from "@/components/b2b-portal/SponsoredPlacementBadge";
import { FeatureStatusBadge } from "@/components/majetio/FeatureStatusBadge";
import {
  B2B_ARCHITECTURE_LAYERS,
  B2B_ORG_TYPE_LABELS,
  B2B_PORTAL_FEATURE_STATUS,
  B2B_SCORE_ISOLATION_RULES,
  BILLING_PLAN_IDS,
  auditActionLabel,
  buildB2bPortalDashboard,
  createAnalysisOrder,
  defaultWorkspaceForOrgType,
  deliverAnalysisOrder,
  engagementSummaryForOrder,
  formatPlanPrice,
  listProjectsForOrg,
  loadB2bPortalStore,
  memberHasPermission,
  recordAnalysisPayment,
  recordQualifiedInterest,
  saveB2bPortalStore,
  submitProperty,
  switchActiveOrg,
  trackShareEngagement,
  type AnalysisOrder,
  type B2bPortalStore,
} from "@/lib/b2b-portal";
import { routes } from "@/lib/routes";
import { downloadReportHtml } from "@/lib/report-engine";
import { buildSharePath } from "@/lib/report-engine/share";
import { loadReportEngineStore } from "@/lib/report-engine/storage";

function subscribeNoop() {
  return () => {};
}
function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

const STATUS_LABELS: Record<AnalysisOrder["status"], string> = {
  draft: "Koncept",
  awaiting_payment: "Čeká na platbu",
  paid: "Zaplaceno",
  in_progress: "Zpracovává se",
  ready: "Připraveno",
  delivered: "Doručeno",
  cancelled: "Zrušeno",
};

export function B2bPortalView() {
  const ready = useIsClient();
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState<"agent" | "developer" | "billing" | "audit" | "architecture">("agent");

  const dash = buildB2bPortalDashboard();
  void tick;
  const org = dash.organization;
  const member = dash.member;

  useEffect(() => {
    if (org) {
      setTab(defaultWorkspaceForOrgType(org.type));
    }
  }, [org?.id, org?.type]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const persist = useCallback((store: B2bPortalStore) => {
    saveB2bPortalStore(store);
    refresh();
  }, [refresh]);

  const [form, setForm] = useState({
    label: "Byt k analýze",
    city: "Praha",
    areaM2: 55,
    priceCzk: 5_200_000,
    rentMonthlyCzk: 19_500,
  });

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">
        Načítám B2B portál…
      </div>
    );
  }

  const onSwitchOrg = (orgId: string) => {
    const store = loadB2bPortalStore();
    persist(switchActiveOrg(store, orgId));
  };

  const onSubmitAndOrder = (planId: (typeof BILLING_PLAN_IDS)[number] = "single_analysis") => {
    if (!org || !member) return;
    let store = loadB2bPortalStore();
    const { store: s1, submission } = submitProperty({
      store,
      orgId: org.id,
      memberId: member.id,
      data: {
        label: form.label,
        country: "Česká republika",
        city: form.city,
        propertyType: "Byt",
        areaM2: form.areaM2,
        priceCzk: form.priceCzk,
        rentMonthlyCzk: form.rentMonthlyCzk,
        listingUrl: null,
        notes: null,
      },
    });
    const { store: s2 } = createAnalysisOrder({
      store: s1,
      orgId: org.id,
      memberId: member.id,
      propertySubmissionId: submission.id,
      planId,
    });
    persist(s2);
  };

  const onPay = (orderId: string) => {
    if (!member) return;
    const store = loadB2bPortalStore();
    persist(recordAnalysisPayment({ store, orderId, memberId: member.id }));
  };

  const onDeliver = (orderId: string) => {
    if (!member || !org) return;
    let store = loadB2bPortalStore();
    store = recordAnalysisPayment({ store, orderId, memberId: member.id });
    persist(
      deliverAnalysisOrder({
        store,
        orderId,
        memberId: member.id,
        orgName: org.name,
      })
    );
  };

  const onTrackView = (orderId: string) => {
    if (!org || !member) return;
    const store = loadB2bPortalStore();
    persist(
      trackShareEngagement({
        store,
        analysisOrderId: orderId,
        orgId: org.id,
        memberId: member.id,
        eventType: "view",
      })
    );
  };

  const onSimulateInterest = (orderId: string) => {
    if (!org || !member) return;
    const store = loadB2bPortalStore();
    const { store: next } = recordQualifiedInterest({
      store,
      analysisOrderId: orderId,
      orgId: org.id,
      memberId: member.id,
      consentId: `consent_${Date.now()}`,
      consentText:
        "Souhlasím se sdílením kontaktu s makléřem za účelem follow-up k této nemovitosti.",
      contactName: "Zájemce A.",
      contactEmail: "zajemce@example.cz",
      interestType: "viewing",
    });
    persist(next);
  };

  const orgOptions = Object.values(dash.store.organizations);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3f1] to-white">
      <header className="border-b border-border bg-deep-teal text-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-wrap items-center gap-2">
            <FeatureStatusBadge status={B2B_PORTAL_FEATURE_STATUS} />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-gold">
              B2B Professional Portal · SaaS
            </span>
          </div>
          <h1 className="mt-2 font-heading text-3xl font-black md:text-4xl">
            Profesionální portál pro partnery
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-emerald-50/90">
            Makléři, kanceláře, developeři a hypoteční partneři — organizace, role, billing-ready
            objednávky analýz, reporty, engagement a qualified interest se souhlasem.
          </p>

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <label className="text-xs font-semibold">
              Organizace
              <select
                value={org?.id ?? ""}
                onChange={(e) => onSwitchOrg(e.target.value)}
                className="mt-1 block rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white"
              >
                {orgOptions.map((o) => (
                  <option key={o.id} value={o.id} className="text-black">
                    {o.name} ({B2B_ORG_TYPE_LABELS[o.type]})
                  </option>
                ))}
              </select>
            </label>
            {member ? (
              <p className="text-xs text-emerald-100/80">
                Přihlášen: {member.displayName} · {member.role}
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <MajetioIntelligenceBadge />
        <B2bDataProvenanceLegend />

        <nav className="flex flex-wrap gap-2 border-b border-border pb-2">
          {(
            [
              ["agent", "Makléř / analýza", Users],
              ["developer", "Developer", Building2],
              ["billing", "Billing", FileText],
              ["audit", "Audit log", ClipboardList],
              ["architecture", "Architektura", Shield],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold ${
                tab === id
                  ? "bg-deep-teal text-white"
                  : "border border-border bg-white text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </nav>

        {tab === "agent" && member && memberHasPermission(member.role, "analysis.order") ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-border bg-white p-5">
              <h2 className="font-heading text-lg font-bold">Submit property + objednat analýzu</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Skóre se vypočte ihned — platba ho nemění. Cena jednotlivé analýzy:{" "}
                {formatPlanPrice("single_analysis")}.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(["label", "city"] as const).map((k) => (
                  <label key={k} className="text-xs font-semibold sm:col-span-2">
                    {k === "label" ? "Název" : "Město"}
                    <input
                      value={form[k]}
                      onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                    />
                  </label>
                ))}
                <label className="text-xs font-semibold">
                  Plocha m²
                  <input
                    type="number"
                    value={form.areaM2}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, areaM2: Number(e.target.value) }))
                    }
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-xs font-semibold">
                  Cena (Kč)
                  <input
                    type="number"
                    value={form.priceCzk}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, priceCzk: Number(e.target.value) }))
                    }
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onSubmitAndOrder("single_analysis")}
                  className="rounded-full bg-deep-teal px-5 py-2.5 text-sm font-bold text-white"
                >
                  Objednat analýzu (5 000 Kč)
                </button>
                <button
                  type="button"
                  onClick={() => onSubmitAndOrder("package_starter")}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-bold"
                >
                  Balíček 5×
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-white p-5">
              <h2 className="font-heading text-lg font-bold">Objednávky & tracking</h2>
              <ul className="mt-4 space-y-3">
                {dash.orders.length === 0 ? (
                  <li className="text-sm text-muted-foreground">Zatím žádné objednávky.</li>
                ) : (
                  dash.orders.map((order) => {
                    const eng = engagementSummaryForOrder(dash.store, order.id);
                    const submission =
                      dash.store.propertySubmissions[order.propertySubmissionId];
                    return (
                      <li
                        key={order.id}
                        className="rounded-xl border border-border p-4 text-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-bold">
                              {submission?.label ?? order.id}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {STATUS_LABELS[order.status]} ·{" "}
                              {order.amountCzk.toLocaleString("cs-CZ")} Kč
                            </p>
                            {order.scoreSnapshot.investmentScore != null ? (
                              <p className="mt-1 text-xs">
                                Investiční skóre (MODEL):{" "}
                                <strong>{order.scoreSnapshot.investmentScore}/100</strong>
                                <span className="ml-1 text-muted-foreground">
                                  — zamčeno před platbou
                                </span>
                              </p>
                            ) : null}
                          </div>
                          {order.status === "delivered" ? (
                            <MajetioIntelligenceBadge className="scale-90" />
                          ) : null}
                        </div>

                        {order.sponsoredPlacements.map((sp) => (
                          <SponsoredPlacementBadge
                            key={sp.id}
                            label={sp.label}
                            className="mt-3"
                          />
                        ))}

                        <div className="mt-3 flex flex-wrap gap-2">
                          {order.status === "awaiting_payment" ? (
                            <button
                              type="button"
                              onClick={() => onPay(order.id)}
                              className="rounded-lg bg-deep-teal px-3 py-1.5 text-xs font-bold text-white"
                            >
                              Simulovat platbu
                            </button>
                          ) : null}
                          {(order.status === "paid" || order.status === "awaiting_payment") &&
                          order.status !== "delivered" ? (
                            <button
                              type="button"
                              onClick={() => onDeliver(order.id)}
                              className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold"
                            >
                              Doručit report
                            </button>
                          ) : null}
                          {order.shareToken ? (
                            <>
                              <Link
                                href={buildSharePath(order.shareToken)}
                                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold"
                              >
                                <Link2 className="h-3 w-3" />
                                Share link
                              </Link>
                              <button
                                type="button"
                                onClick={() => onTrackView(order.id)}
                                className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold"
                              >
                                +1 view (anon)
                              </button>
                            </>
                          ) : null}
                          {order.reportId ? (
                            <button
                              type="button"
                              onClick={() => {
                                const report =
                                  loadReportEngineStore().reports[order.reportId!];
                                if (report) downloadReportHtml(report, "pdf");
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold"
                            >
                              <Download className="h-3 w-3" />
                              PDF HTML
                            </button>
                          ) : null}
                          {order.status === "delivered" ? (
                            <button
                              type="button"
                              onClick={() => onSimulateInterest(order.id)}
                              className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900"
                            >
                              Simulovat qualified interest
                            </button>
                          ) : null}
                        </div>
                        <p className="mt-2 text-[10px] text-muted-foreground">
                          Engagement: {eng.views} views · {eng.downloads} downloads ·{" "}
                          {eng.ctaClicks} CTA
                        </p>
                      </li>
                    );
                  })
                )}
              </ul>
            </section>

            {dash.interests.length > 0 ? (
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 lg:col-span-2">
                <h2 className="font-heading text-lg font-bold">Qualified interest (consent)</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {dash.interests.map((l) => (
                    <li key={l.id} className="rounded-lg border border-emerald-200 bg-white p-3">
                      <strong>{l.contactName}</strong> · {l.contactEmail} · {l.interestType}
                      <p className="text-[10px] text-muted-foreground">
                        Consent {l.consentId} · {new Date(l.consentGrantedAt).toLocaleString("cs-CZ")}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        ) : null}

        {tab === "developer" ? (
          <div className="space-y-4">
            {org
              ? listProjectsForOrg(dash.store, org.id).map((project) => (
                  <section
                    key={project.id}
                    className="rounded-2xl border border-border bg-white p-5"
                  >
                    <h2 className="font-heading text-xl font-black">{project.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {project.city} · fáze {project.phase}
                    </p>

                    <h3 className="mt-4 text-xs font-bold uppercase text-deep-teal">Jednotky</h3>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      {project.units.map((u) => (
                        <div key={u.id} className="rounded-lg border border-border p-3 text-sm">
                          <p className="font-bold">{u.label}</p>
                          <p>{u.areaM2} m² · {u.priceCzk.toLocaleString("cs-CZ")} Kč</p>
                          <p className="text-xs capitalize text-muted-foreground">{u.status}</p>
                        </div>
                      ))}
                    </div>

                    <h3 className="mt-4 text-xs font-bold uppercase text-deep-teal">
                      Platební plány
                    </h3>
                    {project.paymentPlans.map((plan) => (
                      <div key={plan.id} className="mt-2 rounded-lg bg-[#f8fafc] p-3 text-xs">
                        <p className="font-bold">{plan.name}</p>
                        <ul className="mt-1 list-disc pl-4">
                          {plan.installments.map((i) => (
                            <li key={i.label}>
                              {i.label}: {i.amountCzk.toLocaleString("cs-CZ")} Kč
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    <h3 className="mt-4 text-xs font-bold uppercase text-deep-teal">
                      Ověřené financování
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {project.financingOptions.map((f) => (
                        <li key={f.id} className="text-sm">
                          {f.sponsored ? (
                            <SponsoredPlacementBadge label={f.lenderLabel} />
                          ) : (
                            <span className="font-semibold">{f.lenderLabel}</span>
                          )}
                          <span className="ml-2 text-muted-foreground">
                            LTV do {f.maxLtvPercent} % · od {f.rateFromPercent} %
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))
              : null}
            {org && listProjectsForOrg(dash.store, org.id).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Pro tuto organizaci nejsou projekty — přepněte na Developer demo org.
              </p>
            ) : null}
          </div>
        ) : null}

        {tab === "billing" ? (
          <section className="rounded-2xl border border-border bg-white p-5">
            <h2 className="font-heading text-lg font-bold">Billing-ready struktura</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {BILLING_PLAN_IDS.map((planId) => {
                const plan = dash.billingPlans[planId];
                return (
                  <div
                    key={planId}
                    className={`rounded-xl border p-4 ${
                      plan.status === "coming_soon" ? "opacity-60" : ""
                    }`}
                  >
                    <p className="font-bold">{plan.name}</p>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <p className="mt-2 font-heading text-xl font-black">
                      {formatPlanPrice(planId)}
                    </p>
                    {plan.status === "coming_soon" ? (
                      <span className="text-xs font-bold text-amber-700">COMING_SOON</span>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Faktury: draft → pending_payment → paid. Pole externalPaymentIntentId připraveno pro
              Stripe. Subscription enterprise — architektura hotová, aktivace později.
            </p>
          </section>
        ) : null}

        {tab === "audit" ? (
          <section className="rounded-2xl border border-border bg-white p-5">
            <h2 className="font-heading text-lg font-bold">Audit log</h2>
            <ul className="mt-4 max-h-96 space-y-1 overflow-y-auto text-xs">
              {dash.recentAudit.map((e) => (
                <li key={e.id} className="rounded border border-border px-3 py-2 font-mono">
                  {new Date(e.at).toLocaleString("cs-CZ")} · {auditActionLabel(e.action)} ·{" "}
                  {e.resourceType}/{e.resourceId}
                </li>
              ))}
              {dash.recentAudit.length === 0 ? (
                <li className="text-muted-foreground">Zatím prázdné</li>
              ) : null}
            </ul>
          </section>
        ) : null}

        {tab === "architecture" ? (
          <section className="space-y-4">
            <div className="rounded-2xl border border-border bg-white p-5">
              <h2 className="font-heading text-lg font-bold">SaaS vrstvy</h2>
              <ul className="mt-3 space-y-3">
                {B2B_ARCHITECTURE_LAYERS.map((layer) => (
                  <li key={layer.id} className="flex gap-2 text-sm">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-deep-teal" />
                    <div>
                      <strong>{layer.name}</strong>
                      <p className="text-muted-foreground">{layer.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-deep-teal/30 bg-[#eef3f1] p-5">
              <h3 className="font-heading text-sm font-bold">Score isolation (enforce)</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                {B2B_SCORE_ISOLATION_RULES.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <Link
              href={routes.reportEngine}
              className="inline-flex text-sm font-bold text-deep-teal underline"
            >
              Report Engine →
            </Link>
          </section>
        ) : null}
      </div>
    </div>
  );
}
