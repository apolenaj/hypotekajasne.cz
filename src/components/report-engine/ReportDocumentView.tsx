"use client";

import {
  ClaimBadge,
  ClaimLegend,
} from "@/components/property-rentgen/ClaimBadge";
import type { ReportBlock, ReportDocument } from "@/lib/report-engine/types";

function BlockSection({ block }: { block: ReportBlock }) {
  return (
    <section
      id={block.id}
      className="rounded-2xl border border-border bg-white p-5 print:break-inside-avoid print:rounded-none print:border-stone-300"
    >
      <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-deep-teal">
        {block.title}
      </h2>
      <dl className="mt-3 divide-y divide-border">
        {block.items.map((item) => (
          <div
            key={`${block.id}-${item.label}`}
            className="grid gap-1 py-2.5 sm:grid-cols-[minmax(140px,34%)_1fr]"
          >
            <dt className="text-xs font-semibold text-muted-foreground">
              {item.label}
            </dt>
            <dd className="text-sm font-semibold text-foreground">
              {item.value}
              {item.claimKind ? (
                <span className="ml-2 inline-flex align-middle">
                  <ClaimBadge kind={item.claimKind} />
                </span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
      {block.prose?.map((p) => (
        <p key={p.slice(0, 40)} className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {p}
        </p>
      ))}
      {block.tables?.map((table) => (
        <div key={table.headers.join("-")} className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[280px] border-collapse text-xs">
            <thead>
              <tr className="bg-[#f8fafc]">
                {table.headers.map((h) => (
                  <th
                    key={h}
                    className="border border-border px-3 py-2 text-left font-bold uppercase tracking-wide text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={row.join("-")}>
                  {row.map((cell, i) => (
                    <td key={`${i}-${cell}`} className="border border-border px-3 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </section>
  );
}

type ReportDocumentViewProps = {
  report: ReportDocument;
  mode?: "web" | "print" | "share";
};

export function ReportDocumentView({ report, mode = "web" }: ReportDocumentViewProps) {
  const wl = report.whiteLabel;
  const isShare = mode === "share";

  return (
    <div className="report-engine-print min-h-screen bg-gradient-to-b from-[#eef3f1] to-white print:bg-white">
      {wl?.companyName ? (
        <div className="border-b border-border bg-white print:border-stone-300">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-4 px-4 py-4">
            {wl.agentLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={wl.agentLogoUrl}
                alt=""
                className="max-h-10 max-w-[120px] object-contain"
              />
            ) : null}
            <div>
              <p className="font-heading text-sm font-bold">{wl.companyName}</p>
              <p className="text-xs text-muted-foreground">
                {[wl.contactEmail, wl.contactPhone].filter(Boolean).join(" · ")}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Metodika, zdroje a claim typy: HypotekaJasne.cz / Majetio — transparentně v
                reportu.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <header className="border-b border-border bg-deep-teal text-white print:border-stone-300 print:bg-white print:text-black">
        <div className="mx-auto max-w-4xl px-4 py-10 print:py-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-gold print:text-stone-600">
            Profesionální report · {report.type.replace(/_/g, " ")}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-black md:text-4xl">{report.title}</h1>
          <p className="mt-2 text-sm text-emerald-50/90 print:text-stone-700">
            Vygenerováno {new Date(report.generatedAt).toLocaleString("cs-CZ")} · Verze{" "}
            {report.version}
            {isShare || report.sensitivity === "shareable_summary"
              ? " · Sdílená verze (citlivá data maskována)"
              : " · Soukromý report"}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3">
            {report.highlights.map((h) => (
              <div
                key={h.label}
                className="rounded-xl border border-white/20 bg-white/10 p-4 print:border-stone-200 print:bg-stone-50"
              >
                <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                  {h.label}
                </p>
                <p className="mt-1 font-heading text-2xl font-black tabular-nums">{h.value}</p>
                {h.sub ? (
                  <p className="mt-1 text-xs opacity-80">{h.sub}</p>
                ) : null}
                {h.claimKind ? (
                  <span className="mt-2 inline-block">
                    <ClaimBadge kind={h.claimKind} />
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl space-y-4 px-4 py-8 print:space-y-3 print:py-4">
        <div className="print:hidden">
          <ClaimLegend />
        </div>

        <BlockSection block={report.inputs} />
        <BlockSection block={report.outputs} />
        <BlockSection block={report.assumptions} />
        <BlockSection block={report.sources} />
        <BlockSection block={report.dataFreshness} />
        <BlockSection block={report.methodology} />
        <BlockSection block={report.disclaimers} />
        <BlockSection block={report.nextSteps} />

        <p className="pt-4 text-center text-[11px] text-muted-foreground print:pt-2">
          HypotekaJasne.cz — informační platforma. Ne banka, ne investiční poradce.
        </p>
      </div>
    </div>
  );
}
