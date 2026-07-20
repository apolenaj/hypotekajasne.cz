"use client";

import { useCallback, useState } from "react";
import { Download, Link2, Scale } from "lucide-react";
import type { ChartMeta } from "@/lib/decision-lab";
import { cn } from "@/lib/utils";

type DecisionLabChartFrameProps = {
  meta: ChartMeta;
  assumptions?: string[];
  /** CSV rows for export */
  exportRows?: string[][];
  exportFilename?: string;
  className?: string;
  children: React.ReactNode;
};

export function DecisionLabChartFrame({
  meta,
  assumptions,
  exportRows,
  exportFilename = "decision-lab-export.csv",
  className,
  children,
}: DecisionLabChartFrameProps) {
  const [copied, setCopied] = useState(false);

  const onShare = useCallback(async () => {
    const text = [
      meta.title,
      meta.methodology,
      `Zdroj: ${meta.source}`,
      meta.statusNote,
      ...(assumptions ?? []),
      typeof window !== "undefined" ? window.location.href : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      if (navigator.share) {
        await navigator.share({ title: meta.title, text, url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* ignore */
      }
    }
  }, [meta, assumptions]);

  const onExport = useCallback(() => {
    if (!exportRows?.length) return;
    const csv = exportRows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFilename;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportRows, exportFilename]);

  return (
    <div className={cn("rounded-2xl border border-border bg-white", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Decision Lab
          </p>
          <h4 className="font-heading text-lg font-bold text-text-dark">
            {meta.title}
          </h4>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onShare}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-text-dark hover:border-deep-teal/40"
          >
            <Link2 className="h-3.5 w-3.5" />
            {copied ? "Zkopírováno" : "Sdílet"}
          </button>
          {exportRows && exportRows.length > 0 && (
            <button
              type="button"
              onClick={onExport}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-text-dark hover:border-deep-teal/40"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5">{children}</div>

      <div className="space-y-2 border-t border-border bg-[#f7f8f7] px-4 py-3 text-xs text-muted-foreground sm:px-5">
        <p className="inline-flex items-start gap-1.5">
          <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0 text-deep-teal" />
          <span>
            <strong className="text-text-dark">Metodika:</strong> {meta.methodology}
          </span>
        </p>
        <p>
          <strong className="text-text-dark">Zdroj:</strong> {meta.source}
          {meta.sourceUrl && (
            <>
              {" · "}
              <a
                href={meta.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-deep-teal underline-offset-2 hover:underline"
              >
                odkaz
              </a>
            </>
          )}
        </p>
        <p>{meta.statusNote}</p>
        {assumptions && assumptions.length > 0 && (
          <details className="pt-1">
            <summary className="cursor-pointer font-semibold text-deep-teal">
              Assumptions
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {assumptions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
