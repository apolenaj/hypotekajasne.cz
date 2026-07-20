"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Building2,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  Lock,
  MessageSquare,
  Share2,
  UserCheck,
  Users,
} from "lucide-react";
import {
  ClaimBadge,
  ClaimLegend,
} from "@/components/property-rentgen/ClaimBadge";
import { FeatureStatusBadge } from "@/components/majetio/FeatureStatusBadge";
import {
  buildDealRoomDashboard,
  canShareDocument,
  createDealRoomWorkspace,
  DEAL_ROOM_FEATURE_STATUS,
  DEAL_ROOM_ROLE_LABELS,
  DEAL_ROOM_SECTION_LABELS,
  grantDocumentShare,
  loadDealRoomStore,
  saveDealRoomStore,
  DEMO_DEAL_ROOM_SEEDED,
  upsertWorkspace,
  type DealRoomRole,
  type DealRoomSectionId,
  type DealRoomWorkspace,
} from "@/lib/deal-room";
import { routes } from "@/lib/routes";

function subscribeNoop() {
  return () => {};
}
function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-800",
  in_progress: "bg-sky-100 text-sky-900",
  waiting: "bg-amber-100 text-amber-900",
  pending: "bg-stone-100 text-stone-600",
  blocked: "bg-red-100 text-red-800",
};

const SECTION_ICONS: Partial<Record<DealRoomSectionId, React.ReactNode>> = {
  property: <Building2 className="h-4 w-4" />,
  financing: <UserCheck className="h-4 w-4" />,
  documents: <FileText className="h-4 w-4" />,
  questions: <MessageSquare className="h-4 w-4" />,
  timeline: <Calendar className="h-4 w-4" />,
  contacts: <Users className="h-4 w-4" />,
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("cs-CZ");
}

function fmtCzk(n: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(n);
}

type Props = {
  workspaceId: string;
};

export function DealRoomView({ workspaceId }: Props) {
  const ready = useIsClient();
  const [section, setSection] = useState<DealRoomSectionId>("timeline");
  const [workspace, setWorkspace] = useState<DealRoomWorkspace | null>(null);
  const [shareTarget, setShareTarget] = useState<{
    docId: string;
    toRole: DealRoomRole;
  } | null>(null);
  const [consentNote, setConsentNote] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!ready) return;
    const store = loadDealRoomStore();
    const ws = store.workspaces.find((w) => w.id === workspaceId);
    setWorkspace(ws ?? null);
  }, [ready, workspaceId, tick]);

  const dashboard = useMemo(() => {
    if (!workspace) return null;
    return buildDealRoomDashboard(workspace);
  }, [workspace]);

  const persist = useCallback(
    (ws: DealRoomWorkspace) => {
      const store = upsertWorkspace(loadDealRoomStore(), ws);
      saveDealRoomStore(store);
      setWorkspace(ws);
      setTick((t) => t + 1);
    },
    []
  );

  const handleGrantShare = useCallback(() => {
    if (!workspace || !shareTarget || !consentNote.trim()) return;
    const perm = grantDocumentShare({
      documentId: shareTarget.docId,
      fromRole: "user",
      toRole: shareTarget.toRole,
      grantedBy: "user",
      consentNote: consentNote.trim(),
      expiresInDays: 30,
    });
    persist({
      ...workspace,
      sharePermissions: [...workspace.sharePermissions, perm],
    });
    setShareTarget(null);
    setConsentNote("");
  }, [consentNote, persist, shareTarget, workspace]);

  if (!ready || !workspace || !dashboard) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">
        Deal Room nenalezen —{" "}
        <Link href={routes.dealRoom} className="underline">
          vytvořit nový
        </Link>
      </div>
    );
  }

  const { now } = dashboard;
  const ws = workspace;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3f1] to-white">
      <header className="border-b border-border bg-deep-teal text-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-wrap items-center gap-2">
            <FeatureStatusBadge status={DEAL_ROOM_FEATURE_STATUS} />
            <span className="text-xs text-emerald-100/80">Deal Room</span>
          </div>
          <h1 className="mt-2 font-heading text-2xl font-black md:text-3xl">
            {ws.property.title}
          </h1>
          <p className="text-sm text-emerald-50/90">{ws.property.address}</p>
          <p className="mt-1 text-sm font-semibold text-muted-gold">
            {fmtCzk(ws.property.priceCzk)}
          </p>
        </div>
      </header>

      {/* Now summary — 3 questions */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 md:grid-cols-3">
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
            <p className="text-xs font-bold uppercase text-sky-800">
              Co se děje nyní?
            </p>
            <p className="mt-1 text-sm text-sky-950">{now.happeningNow}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold uppercase text-amber-800">
              Co čekáme?
            </p>
            <p className="mt-1 text-sm text-amber-950">{now.waitingFor}</p>
          </div>
          <div className="rounded-xl border border-deep-teal/20 bg-deep-teal/5 p-4">
            <p className="text-xs font-bold uppercase text-deep-teal">
              Kdo je na tahu?
            </p>
            <p className="mt-1 text-sm font-semibold">{now.whoseTurnLabel}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Section tabs */}
        <nav className="mb-6 flex flex-wrap gap-2">
          {(Object.keys(DEAL_ROOM_SECTION_LABELS) as DealRoomSectionId[]).map(
            (id) => (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  section === id
                    ? "bg-deep-teal text-white"
                    : "border border-border bg-white text-foreground"
                }`}
              >
                {SECTION_ICONS[id]}
                {DEAL_ROOM_SECTION_LABELS[id]}
              </button>
            )
          )}
        </nav>

        {/* Section content */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          {section === "property" && (
            <div className="space-y-3 text-sm">
              <p>
                <strong>Adresa:</strong> {ws.property.address}
              </p>
              <p>
                <strong>Cena:</strong> {fmtCzk(ws.property.priceCzk)}
              </p>
              {ws.property.majetioListingRef && (
                <p>
                  <strong>Majetio ref:</strong> {ws.property.majetioListingRef}
                </p>
              )}
              {ws.property.listingUrl && (
                <a
                  href={ws.property.listingUrl}
                  className="text-deep-teal underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Listing na Majetio
                </a>
              )}
            </div>
          )}

          {section === "financing" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Propojeno s Global Financing Router a Document Vault.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={routes.globalFinancing}
                  className="rounded-full bg-deep-teal/10 px-4 py-2 text-sm font-semibold text-deep-teal"
                >
                  Global Financing Router
                </Link>
                <Link
                  href={routes.documentVault}
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold"
                >
                  Document Vault
                </Link>
                <Link
                  href={routes.refinanceRadar}
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold"
                >
                  Refinance Radar
                </Link>
              </div>
            </div>
          )}

          {section === "analysis" && (
            <div>
              <p className="text-sm text-muted-foreground">
                Investiční rentgen a compare — MODEL analýza, ne právní posudek.
              </p>
              <Link
                href={routes.investicniRentgen}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-deep-teal underline"
              >
                Otevřít Investiční rentgen
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {section === "documents" && (
            <div className="space-y-4">
              <p className="flex items-center gap-2 text-xs text-amber-800">
                <Lock className="h-4 w-4" />
                Dokumenty se mezi rolemi nesdílí automaticky — vyžadují explicitní
                permission.
              </p>
              {ws.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Zatím žádné dokumenty — propojte Document Vault.
                </p>
              ) : (
                ws.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{doc.label}</p>
                      <ClaimBadge kind={doc.claimKind} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Viditelné pro:{" "}
                      {doc.visibleToRoles.map((r) => DEAL_ROOM_ROLE_LABELS[r]).join(", ")}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(["lawyer", "mortgage_specialist", "agent_developer"] as DealRoomRole[]).map(
                        (role) => {
                          const shared = canShareDocument({
                            permissions: ws.sharePermissions,
                            documentId: doc.id,
                            fromRole: "user",
                            toRole: role,
                          });
                          return (
                            <button
                              key={role}
                              type="button"
                              disabled={shared}
                              onClick={() =>
                                setShareTarget({ docId: doc.id, toRole: role })
                              }
                              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs disabled:opacity-50"
                            >
                              <Share2 className="h-3 w-3" />
                              {shared ? "Sdíleno" : `Sdílet: ${DEAL_ROOM_ROLE_LABELS[role]}`}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                ))
              )}
              {shareTarget && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold">
                    Sdílet s {DEAL_ROOM_ROLE_LABELS[shareTarget.toRole]}
                  </p>
                  <textarea
                    value={consentNote}
                    onChange={(e) => setConsentNote(e.target.value)}
                    placeholder="Souhlasím se sdílením tohoto dokumentu za účelem…"
                    rows={2}
                    className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleGrantShare}
                    className="mt-2 rounded-full bg-deep-teal px-4 py-1.5 text-xs font-semibold text-white"
                  >
                    Potvrdit sdílení
                  </button>
                </div>
              )}
              <Link
                href={routes.documentVault}
                className="inline-block text-sm text-deep-teal underline"
              >
                Document Vault →
              </Link>
            </div>
          )}

          {section === "questions" && (
            <ul className="space-y-3">
              {ws.questions.length === 0 ? (
                <li className="text-sm text-muted-foreground">Zatím žádné dotazy.</li>
              ) : (
                ws.questions.map((q) => (
                  <li key={q.id} className="rounded-lg border border-border p-3 text-sm">
                    <p>{q.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {DEAL_ROOM_ROLE_LABELS[q.authorRole]} ·{" "}
                      {fmtDate(q.createdAt)}
                    </p>
                  </li>
                ))
              )}
            </ul>
          )}

          {section === "offers" && (
            <ul className="space-y-3">
              {ws.offers.map((o) => (
                <li key={o.id} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="font-medium">
                    {o.amount != null ? fmtCzk(o.amount) : "Koncept"}
                  </span>
                  <span className="text-xs uppercase">{o.status}</span>
                </li>
              ))}
              {ws.offers.length === 0 && (
                <li className="text-sm text-muted-foreground">Zatím žádná nabídka.</li>
              )}
            </ul>
          )}

          {section === "timeline" && (
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 h-full w-px bg-border" />
              {ws.timeline.map((step) => (
                <div key={step.id} className="relative mb-6">
                  <span
                    className={`absolute -left-4 top-1 h-3 w-3 rounded-full ${
                      step.status === "completed"
                        ? "bg-emerald-500"
                        : step.status === "in_progress"
                          ? "bg-sky-500 ring-2 ring-sky-200"
                          : "bg-stone-300"
                    }`}
                  />
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{step.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {DEAL_ROOM_ROLE_LABELS[step.owner]} · termín {fmtDate(step.dueAt)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[step.status] ?? ""}`}
                    >
                      {step.status}
                    </span>
                  </div>
                  {step.requiredDocuments.length > 0 && (
                    <ul className="mt-2 text-xs text-muted-foreground">
                      {step.requiredDocuments.map((d) => (
                        <li key={d}>· {d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {section === "contacts" && (
            <ul className="divide-y divide-border">
              {ws.contacts.map((c) => (
                <li key={c.role} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{DEAL_ROOM_ROLE_LABELS[c.role]}</p>
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold ${c.connected ? "text-emerald-600" : "text-muted-foreground"}`}
                  >
                    {c.connected ? "Propojeno" : "Nepřipojeno"}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {section === "tasks" && (
            <ul className="space-y-2">
              {ws.tasks.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className={t.done ? "line-through text-muted-foreground" : ""}>
                      {t.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {DEAL_ROOM_ROLE_LABELS[t.owner]} · {fmtDate(t.dueAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <section className="mt-8 rounded-2xl border border-border bg-muted/30 p-5">
          <h3 className="mb-2 flex items-center gap-2 font-heading font-bold">
            <HelpCircle className="h-4 w-4" />
            Metodika
          </h3>
          <ul className="space-y-1">
            {dashboard.methodology.map((m) => (
              <li key={m} className="text-xs text-muted-foreground">
                · {m}
              </li>
            ))}
          </ul>
          <ClaimLegend />
        </section>
      </div>
    </div>
  );
}

/** Landing — create workspace via „Mám vážný zájem“ */
export function DealRoomLandingView() {
  const ready = useIsClient();
  const router = useRouter();
  const [title, setTitle] = useState("Byt 3+kk — demo");
  const [address, setAddress] = useState("Korunní 123, Praha 2");

  const handleSeriousInterest = useCallback(() => {
    const ws = createDealRoomWorkspace({
      propertyTitle: title,
      propertyAddress: address,
      country: "cz",
      priceCzk: 8_900_000,
    });
    const store = upsertWorkspace(loadDealRoomStore(), ws);
    saveDealRoomStore(store);
    router.push(`${routes.dealRoom}/${ws.id}`);
  }, [address, router, title]);

  const loadDemo = useCallback(() => {
    const store = upsertWorkspace(loadDealRoomStore(), DEMO_DEAL_ROOM_SEEDED);
    saveDealRoomStore(store);
    router.push(`${routes.dealRoom}/${DEMO_DEAL_ROOM_SEEDED.id}`);
  }, [router]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">
        Načítám…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3f1] to-white">
      <header className="border-b border-border bg-deep-teal text-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <FeatureStatusBadge status={DEAL_ROOM_FEATURE_STATUS} />
          <h1 className="mt-2 font-heading text-3xl font-black">Property Deal Room</h1>
          <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">
            Jeden workspace pro transakci — místo chaosu z WhatsAppu, e-mailů a PDF
            příloh.
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-10">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg font-bold">Nová transakce</h2>
          <div className="mt-4 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Název nemovitosti"
            />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Adresa"
            />
          </div>
          <button
            type="button"
            onClick={handleSeriousInterest}
            className="mt-5 w-full rounded-full bg-muted-gold py-3 font-heading font-bold text-deep-teal"
          >
            Mám vážný zájem
          </button>
          <button
            type="button"
            onClick={loadDemo}
            className="mt-3 w-full rounded-full border border-border py-2 text-sm"
          >
            Otevřít demo Deal Room
          </button>
        </div>
      </main>
    </div>
  );
}
