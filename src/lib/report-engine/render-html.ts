import { REPORT_VERSION } from "@/lib/report-engine/types";
import type { ReportBlock, ReportDocument, WhiteLabelConfig } from "@/lib/report-engine/types";

export type ReportHtmlMode = "web" | "print" | "pdf";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function claimTag(kind?: string): string {
  if (!kind) return "";
  return `<span class="claim claim-${kind.toLowerCase()}">${esc(kind)}</span>`;
}

function renderKvItems(items: ReportBlock["items"]): string {
  return items
    .map(
      (item) => `
      <div class="kv-row">
        <dt>${esc(item.label)}</dt>
        <dd>${esc(item.value)} ${claimTag(item.claimKind)}</dd>
      </div>`
    )
    .join("");
}

function renderBlock(block: ReportBlock): string {
  const tables = (block.tables ?? [])
    .map(
      (t) => `
      <table class="data-table">
        <thead><tr>${t.headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
        <tbody>
          ${t.rows.map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>`
    )
    .join("");

  const prose = (block.prose ?? [])
    .map((p) => `<p class="prose">${esc(p)}</p>`)
    .join("");

  return `
    <section class="report-section" id="${esc(block.id)}">
      <h2>${esc(block.title)}</h2>
      <dl class="kv-grid">${renderKvItems(block.items)}</dl>
      ${prose}
      ${tables}
    </section>`;
}

function reportStyles(mode: ReportHtmlMode): string {
  const pageSize = mode === "pdf" ? "@page { size: A4; margin: 18mm 14mm; }" : "";
  return `
    ${pageSize}
    :root {
      --ink: #0f172a;
      --muted: #64748b;
      --teal: #0d4f4f;
      --gold: #c4a35a;
      --line: #e2e8f0;
      --panel: #f8fafc;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", system-ui, sans-serif;
      color: var(--ink);
      background: ${mode === "web" ? "linear-gradient(180deg,#eef3f1 0%,#fff 240px)" : "#fff"};
      line-height: 1.45;
      font-size: 14px;
    }
    .report-shell { max-width: 920px; margin: 0 auto; padding: 24px 20px 48px; }
    .report-header {
      background: linear-gradient(135deg, var(--teal) 0%, #145454 100%);
      color: #fff;
      border-radius: ${mode === "print" || mode === "pdf" ? "0" : "16px"};
      padding: 28px 32px;
      margin-bottom: 24px;
    }
    .report-header.print-light {
      background: #fff;
      color: var(--ink);
      border: 1px solid var(--line);
    }
    .eyebrow {
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--gold);
      font-weight: 700;
    }
    h1 { margin: 8px 0 4px; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
    .meta { font-size: 12px; opacity: 0.9; }
    .highlights {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
      margin: 20px 0 8px;
    }
    .highlight {
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 12px;
      padding: 12px 14px;
    }
    .print-light .highlight {
      background: var(--panel);
      border-color: var(--line);
    }
    .highlight-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.85; }
    .highlight-value { font-size: 20px; font-weight: 800; margin-top: 4px; }
    .highlight-sub { font-size: 11px; opacity: 0.8; margin-top: 2px; }
    .wl-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 18px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: #fff;
      margin-bottom: 16px;
    }
    .wl-logo { max-height: 40px; max-width: 120px; object-fit: contain; }
    .attribution {
      margin-top: 8px;
      font-size: 11px;
      color: var(--muted);
      border-top: 1px dashed var(--line);
      padding-top: 8px;
    }
    .report-section {
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 14px;
      break-inside: avoid;
    }
    .report-section h2 {
      margin: 0 0 12px;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--teal);
    }
    .kv-grid { margin: 0; }
    .kv-row {
      display: grid;
      grid-template-columns: minmax(140px, 34%) 1fr;
      gap: 8px 16px;
      padding: 8px 0;
      border-bottom: 1px solid var(--line);
    }
    .kv-row:last-child { border-bottom: none; }
    .kv-row dt { margin: 0; font-weight: 600; color: var(--muted); font-size: 12px; }
    .kv-row dd { margin: 0; font-weight: 600; }
    .prose { margin: 10px 0 0; font-size: 13px; color: var(--muted); }
    .data-table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    .data-table th, .data-table td { border: 1px solid var(--line); padding: 8px 10px; text-align: left; }
    .data-table th { background: var(--panel); font-size: 11px; text-transform: uppercase; }
    .claim {
      display: inline-block;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 6px;
      vertical-align: middle;
    }
    .claim-data { background: #dcfce7; color: #166534; }
    .claim-model { background: #dbeafe; color: #1e40af; }
    .claim-odhad { background: #fef3c7; color: #92400e; }
    .claim-neovereno { background: #f1f5f9; color: #475569; }
    .footer-note {
      margin-top: 24px;
      font-size: 11px;
      color: var(--muted);
      text-align: center;
    }
    @media print {
      body { background: #fff; }
      .report-header { background: #fff !important; color: var(--ink) !important; border: 1px solid var(--line); }
      .highlight { background: var(--panel) !important; border-color: var(--line) !important; }
      .no-print { display: none !important; }
    }
  `;
}

function renderWhiteLabel(wl: WhiteLabelConfig | null): string {
  if (!wl?.companyName) return "";
  const contact = [wl.contactEmail, wl.contactPhone].filter(Boolean).join(" · ");
  return `
    <div class="wl-bar">
      ${wl.agentLogoUrl ? `<img class="wl-logo" src="${esc(wl.agentLogoUrl)}" alt="" />` : ""}
      <div>
        <strong>${esc(wl.companyName)}</strong>
        ${contact ? `<div class="meta">${esc(contact)}</div>` : ""}
        <div class="attribution">
          Metodika, zdroje a claim typy: HypotékaJasně.cz / Majetio — transparentně uvedeny v reportu.
        </div>
      </div>
    </div>`;
}

export function renderReportHtml(
  doc: ReportDocument,
  mode: ReportHtmlMode = "web"
): string {
  const wl = doc.whiteLabel;
  const headerClass = mode === "print" || mode === "pdf" ? "report-header print-light" : "report-header";
  const highlights = doc.highlights
    .map(
      (h) => `
      <div class="highlight">
        <div class="highlight-label">${esc(h.label)}</div>
        <div class="highlight-value">${esc(h.value)}</div>
        ${h.sub ? `<div class="highlight-sub">${esc(h.sub)}</div>` : ""}
      </div>`
    )
    .join("");

  const sections = [
    doc.inputs,
    doc.outputs,
    doc.assumptions,
    doc.sources,
    doc.dataFreshness,
    doc.methodology,
    doc.disclaimers,
    doc.nextSteps,
  ]
    .map(renderBlock)
    .join("");

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(doc.title)} — HypotékaJasně</title>
  <style>${reportStyles(mode)}</style>
</head>
<body>
  <div class="report-shell">
    ${renderWhiteLabel(wl)}
    <header class="${headerClass}">
      <div class="eyebrow">Profesionální report · ${esc(doc.type.replace(/_/g, " "))}</div>
      <h1>${esc(doc.title)}</h1>
      <div class="meta">
        Vygenerováno ${esc(new Date(doc.generatedAt).toLocaleString("cs-CZ"))}
        · Verze ${esc(doc.version || REPORT_VERSION)}
        · ${doc.sensitivity === "private" ? "Soukromý report" : "Sdílená verze (maskovaná)"}
      </div>
      <div class="highlights">${highlights}</div>
    </header>
    ${sections}
    <p class="footer-note">
      HypotékaJasně.cz — informační platforma. Report engine ${esc(REPORT_VERSION)}.
      ${mode === "pdf" ? "HTML připravené pro PDF — tisk do PDF přes prohlížeč." : ""}
    </p>
  </div>
</body>
</html>`;
}

export function downloadReportHtml(doc: ReportDocument, mode: ReportHtmlMode = "pdf"): void {
  if (typeof window === "undefined") return;
  const html = renderReportHtml(doc, mode);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${doc.type}-${doc.id.slice(-8)}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
