"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { FileDown, FileText, Printer, Sparkles } from "lucide-react";
import { FeatureStatusBadge } from "@/components/majetio/FeatureStatusBadge";
import { ReportDocumentView } from "@/components/report-engine/ReportDocumentView";
import { ReportSharePanel } from "@/components/report-engine/ReportSharePanel";
import { routes } from "@/lib/routes";
import { useCurrentRates } from "@/lib/rates";
import {
  REPORT_ENGINE_FEATURE_STATUS,
  REPORT_TYPE_LABELS,
  REPORT_TYPES,
  downloadReportHtml,
  generateAndStoreReport,
  listReports,
  loadReportEngineStore,
  type ReportDocument,
  type ReportType,
} from "@/lib/report-engine";

function subscribeNoop() {
  return () => {};
}
function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

export function ReportEngineView() {
  const ready = useIsClient();
  const { rates } = useCurrentRates();
  const ratePercent = rates?.rateWithInsurance ?? null;

  const [reports, setReports] = useState<ReportDocument[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [whiteLabelCompany, setWhiteLabelCompany] = useState("");
  const [whiteLabelEmail, setWhiteLabelEmail] = useState("");
  const [whiteLabelPhone, setWhiteLabelPhone] = useState("");
  const [whiteLabelLogo, setWhiteLabelLogo] = useState("");

  const refreshReports = useCallback(() => {
    setReports(listReports(loadReportEngineStore()));
  }, []);

  useEffect(() => {
    if (ready) refreshReports();
  }, [ready, refreshReports]);

  const selected = reports.find((r) => r.id === selectedId) ?? reports[0] ?? null;

  const wlPartial = whiteLabelCompany.trim()
    ? {
        companyName: whiteLabelCompany.trim(),
        contactEmail: whiteLabelEmail.trim() || null,
        contactPhone: whiteLabelPhone.trim() || null,
        agentLogoUrl: whiteLabelLogo.trim() || null,
      }
    : null;

  const onGenerate = (type: ReportType) => {
    const doc = generateAndStoreReport({
      type,
      ratePercent,
      whiteLabel: wlPartial,
    });
    refreshReports();
    setSelectedId(doc.id);
  };

  const onPrint = () => window.print();

  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-sm text-muted-foreground">
        Načítám report engine…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3f1] to-white">
      <header className="border-b border-border bg-deep-teal text-white print:hidden">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="flex flex-wrap items-center gap-2">
            <FeatureStatusBadge status={REPORT_ENGINE_FEATURE_STATUS} />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-gold">
              Sdílení a export
            </span>
          </div>
          <h1 className="mt-2 font-heading text-3xl font-black md:text-4xl">
            Profesionální reporty
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">
            Investment-bank kvalita: vstupy, výstupy, předpoklady, zdroje, čerstvost dat, metodika,
            disclaimer a další kroky. Web · tisk · HTML připravené pro PDF. Sdílení s časově
            omezeným tokenem — citlivá data defaultně maskována.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 print:hidden">
        <section className="rounded-2xl border border-border bg-white p-5">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
            <Sparkles className="h-5 w-5 text-deep-teal" />
            Vygenerovat report
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {REPORT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onGenerate(type)}
                className="rounded-xl border border-border bg-[#f8fafc] px-4 py-3 text-left text-sm font-semibold transition hover:border-deep-teal/40 hover:bg-white"
              >
                <FileText className="mb-1 h-4 w-4 text-deep-teal" />
                {REPORT_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-deep-teal/30 bg-white p-5">
          <h2 className="font-heading text-sm font-bold">Vlastní značka (B2B)</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Logo agenta, firma a kontakt — metodika a zdroje HypotékaJasně/Majetio zůstávají
            transparentní.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Název společnosti / agentury"
              value={whiteLabelCompany}
              onChange={(e) => setWhiteLabelCompany(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              placeholder="URL loga (volitelné)"
              value={whiteLabelLogo}
              onChange={(e) => setWhiteLabelLogo(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              placeholder="E-mail kontakt"
              value={whiteLabelEmail}
              onChange={(e) => setWhiteLabelEmail(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              placeholder="Telefon kontakt"
              value={whiteLabelPhone}
              onChange={(e) => setWhiteLabelPhone(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
        </section>

        {reports.length > 0 ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-semibold">Uložené reporty</label>
              <select
                value={selected?.id ?? ""}
                onChange={(e) => setSelectedId(e.target.value)}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {REPORT_TYPE_LABELS[r.type]} —{" "}
                    {new Date(r.generatedAt).toLocaleString("cs-CZ")}
                  </option>
                ))}
              </select>
              {selected ? (
                <>
                  <button
                    type="button"
                    onClick={onPrint}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-4 py-2 text-xs font-bold"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Tisk / PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadReportHtml(selected, "pdf")}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-4 py-2 text-xs font-bold"
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    HTML připravené pro PDF
                  </button>
                </>
              ) : null}
            </div>

            {selected ? (
              <>
                <ReportSharePanel report={selected} />
                <Link
                  href={routes.metodika}
                  className="text-xs font-semibold text-deep-teal underline"
                >
                  Metodika platformy (vždy v reportu)
                </Link>
              </>
            ) : null}
          </section>
        ) : (
          <p className="text-sm text-muted-foreground">
            Zatím žádný report — vyberte typ výše.
          </p>
        )}
      </div>

      {selected ? <ReportDocumentView report={selected} mode="web" /> : null}
    </div>
  );
}
