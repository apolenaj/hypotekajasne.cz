"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  appendAuditLog,
  buildSessionContext,
  CLAIM_KIND_HINT,
  CLAIM_KIND_SHORT_CS,
  clearAuditLog,
  COPILOT_QUICK_ACTIONS,
  COPILOT_SYSTEM_DISCLAIMER,
  EVIDENCE_KIND_LABEL_CS,
  loadAuditLog,
  loadCopilotProperties,
  orchestrateCopilot,
  saveCopilotProperties,
  upsertCopilotProperty,
  type CopilotAuditEntry,
  type CopilotMessage,
  type CopilotPropertyDraft,
  type CopilotQuickActionId,
  type CopilotRateLayer,
  type CopilotResponseMeta,
} from "@/lib/copilot";
import { categorizeCopilotPrompt, track } from "@/lib/analytics";
import { useMortgageRateEngine } from "@/lib/rates";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { addPropertyWatch, removeWatchTarget } from "@/lib/watchlist";
import {
  Bot,
  ClipboardList,
  Send,
  ShieldAlert,
  Sparkles,
  Trash2,
} from "lucide-react";

function SimpleMarkdown({ text }: { text: string }) {
  const blocks = text.split("\n");
  return (
    <div className="space-y-1 text-sm leading-relaxed text-text-dark">
      {blocks.map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h3 key={i} className="pt-2 font-heading text-lg font-bold">
              {line.slice(3)}
            </h3>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h4 key={i} className="pt-1 text-sm font-bold text-deep-teal">
              {line.slice(4)}
            </h4>
          );
        }
        if (line.startsWith("|")) {
          return (
            <pre
              key={i}
              className="overflow-x-auto font-mono text-[11px] text-muted-foreground"
            >
              {line}
            </pre>
          );
        }
        if (line.startsWith("- ")) {
          const inner = line.slice(2).replace(
            /\*\*(.+?)\*\*/g,
            "<strong>$1</strong>"
          );
          return (
            <li
              key={i}
              className="ml-4 list-disc"
              dangerouslySetInnerHTML={{ __html: inner }}
            />
          );
        }
        if (line.startsWith("> ")) {
          return (
            <p
              key={i}
              className="border-l-2 border-muted-gold/60 pl-3 text-muted-foreground"
            >
              {line.slice(2).replace(/\*\*(.+?)\*\*/g, "$1")}
            </p>
          );
        }
        if (line.startsWith("—") || line.startsWith("---")) {
          return <hr key={i} className="my-3 border-border" />;
        }
        if (!line.trim()) return <div key={i} className="h-2" />;
        const html = line
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/_(.+?)_/g, "<em>$1</em>")
          .replace(
            /\[(.+?)\]\((.+?)\)/g,
            '<a class="font-semibold text-deep-teal underline" href="$2">$1</a>'
          );
        return (
          <p key={i} dangerouslySetInnerHTML={{ __html: html }} />
        );
      })}
    </div>
  );
}

function ResponseMetaBar({ meta }: { meta: CopilotResponseMeta }) {
  return (
    <div className="mt-3 space-y-2 border-t border-border/70 pt-3">
      <div className="flex flex-wrap gap-1.5">
        {meta.summaryChips.map((chip) => (
          <span
            key={chip.id}
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
              chip.id === "confidence" && meta.confidence === "HIGH"
                ? "bg-emerald-100 text-emerald-900"
                : chip.id === "confidence" && meta.confidence === "LOW"
                  ? "bg-amber-100 text-amber-950"
                  : chip.id === "rate"
                    ? "bg-orange-100 text-orange-950"
                    : "bg-white text-deep-teal ring-1 ring-deep-teal/20"
            )}
          >
            {chip.label}
          </span>
        ))}
      </div>
      {meta.evidenceKinds.length > 0 ? (
        <p className="text-[11px] text-muted-foreground">
          Evidence:{" "}
          {meta.evidenceKinds
            .map((k) => EVIDENCE_KIND_LABEL_CS[k])
            .join(" · ")}
        </p>
      ) : null}
      {meta.modelAssumptions.length > 0 ? (
        <details className="text-[11px] text-muted-foreground">
          <summary className="cursor-pointer font-semibold text-text-dark">
            Modelové předpoklady ({meta.modelAssumptions.length})
          </summary>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {meta.modelAssumptions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </details>
      ) : null}
      {meta.unknowns.length > 0 ? (
        <details className="text-[11px] text-muted-foreground">
          <summary className="cursor-pointer font-semibold text-text-dark">
            Neznámé / chybějící ({meta.unknowns.length})
          </summary>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {meta.unknowns.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function CitationChips({
  citations,
}: {
  citations: NonNullable<CopilotMessage["citations"]>;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {citations.map((c) => (
        <Link
          key={c.id}
          href={c.href ?? routes.zdroje}
          onClick={() =>
            track("source_opened", {
              tool_id: "ai_copilot",
              source_id: c.id,
            })
          }
          className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-white px-2.5 py-1 text-[11px] font-semibold text-deep-teal hover:border-deep-teal/40"
          title={CLAIM_KIND_HINT[c.claimKind]}
        >
          <span className="rounded bg-slate-100 px-1 py-0.5 text-[9px] uppercase tracking-wide text-slate-700">
            {CLAIM_KIND_SHORT_CS[c.claimKind]}
          </span>
          <span className="truncate">{c.label}</span>
        </Link>
      ))}
    </div>
  );
}

function layerFromResolved(uiKind: string): CopilotRateLayer {
  if (uiKind === "LIVE") return "LIVE";
  if (uiKind === "STALE" || uiKind === "OVĚŘENO") return "STALE";
  return "MODEL";
}

const WELCOME: CopilotMessage = {
  id: "welcome",
  role: "assistant",
  content: [
    "## Finanční AI průvodce",
    "",
    "Nejsem obecné ChatGPT. Odpovídám jen z **ověřených nástrojů a dat** Hypotéka Jasně.",
    "",
    "Každá odpověď interně rozlišuje **FACT / MODEL / ESTIMATE / UNKNOWN** a ukáže důvěru + čerstvost zdrojů.",
    "",
    "Zkuste rychlou akci níže, nebo se zeptejte např. na dostupnost, skóre, zátěžový test sazby nebo Praha vs Dubaj.",
    "",
    "—",
    COPILOT_SYSTEM_DISCLAIMER,
  ].join("\n"),
  createdAt: new Date().toISOString(),
};

export function CopilotView() {
  const { rates, resolved } = useMortgageRateEngine(true);
  const rateLayer = layerFromResolved(resolved.uiKind);
  const modelRate = resolved.ratePercent;

  const [messages, setMessages] = useState<CopilotMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [audit, setAudit] = useState<CopilotAuditEntry[]>(() =>
    typeof window !== "undefined" ? loadAuditLog() : []
  );
  const [properties, setProperties] = useState<CopilotPropertyDraft[]>(() =>
    typeof window !== "undefined" ? loadCopilotProperties() : []
  );
  const [draftLabel, setDraftLabel] = useState("");
  const [draftPrice, setDraftPrice] = useState("");

  useEffect(() => {
    track("copilot_opened", { tool_id: "ai_copilot" });
  }, []);

  const run = useCallback(
    (message: string, quickAction?: CopilotQuickActionId) => {
      const text = message.trim();
      if (!text || busy) return;
      setBusy(true);

      const userMsg: CopilotMessage = {
        id: `u_${Date.now()}`,
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, userMsg]);
      setInput("");

      const claimKind =
        rateLayer === "LIVE"
          ? ("DATA" as const)
          : rateLayer === "STALE"
            ? ("NEOVERENO" as const)
            : ("MODEL" as const);

      const { context, answers } = buildSessionContext({
        modelRatePercent: modelRate,
        modelRateUpdatedAt:
          resolved.lastVerifiedAt ?? rates?.updatedAt ?? null,
        modelRateClaimKind: claimKind,
        rateLayer,
        properties,
      });

      const result = orchestrateCopilot({
        message: text,
        quickAction,
        context,
        readinessAnswers: answers,
      });

      appendAuditLog(result.audit);
      setAudit(loadAuditLog());
      setMessages((m) => [...m, result.message]);
      track("copilot_question_submitted", {
        tool_id: "ai_copilot",
        question_category: categorizeCopilotPrompt(text),
        intent_id: result.message.intent,
      });
      setBusy(false);
    },
    [
      busy,
      modelRate,
      rateLayer,
      resolved.lastVerifiedAt,
      rates?.updatedAt,
      properties,
    ]
  );

  const addProperty = () => {
    const price = Number(draftPrice.replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(price) || price < 100_000) return;
    const item: CopilotPropertyDraft = {
      id: `p_${Date.now()}`,
      label: draftLabel.trim() || `Nemovitost ${properties.length + 1}`,
      priceCzk: Math.round(price),
    };
    upsertCopilotProperty(item);
    addPropertyWatch({
      id: item.id,
      label: item.label,
      priceCzk: item.priceCzk,
    });
    const next = loadCopilotProperties();
    setProperties(next);
    setDraftLabel("");
    setDraftPrice("");
  };

  const removeProperty = (id: string) => {
    const next = properties.filter((p) => p.id !== id);
    saveCopilotProperties(next);
    removeWatchTarget(id);
    setProperties(next);
  };

  const lastAssistant = useMemo(
    () => [...messages].reverse().find((m) => m.role === "assistant"),
    [messages]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef3f1] via-white to-[#f7f5ef]">
      <section className="border-b border-border bg-deep-teal text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="flex items-center gap-2 text-muted-gold">
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Finanční AI průvodce
            </span>
          </div>
          <h1 className="mt-3 font-heading text-3xl font-black md:text-5xl">
            Finanční AI průvodce
          </h1>
          <p className="mt-3 max-w-2xl text-base text-emerald-50/90 md:text-lg">
            Inteligentní vrstva nad kalkulačkami a daty — s důvěrou odpovědi,
            čerstvostí zdrojů a bez příslibu schválení úvěru.
          </p>
          <p className="mt-2 text-xs text-emerald-100/80">
            Sazba ve výpočtech: {resolved.uiKind} ·{" "}
            {modelRate.toFixed(2).replace(".", ",")} % p.a.
            {resolved.isModelFallback ? " (modelový fallback)" : ""}
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[280px_1fr_300px]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Kontext
            </p>
            <p className="mt-2 text-sm text-text-dark">
              Profil připravenosti se načítá{" "}
              <strong>lokálně z prohlížeče</strong>. Citlivá data neodesíláme do
              LLM API.
            </p>
            <Link
              href={routes.navrhNaMiru}
              className="mt-3 inline-flex text-sm font-semibold text-deep-teal underline"
            >
              Otevřít / upravit připravenost
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Uložené nemovitosti (session)
            </p>
            <ul className="mt-3 space-y-2">
              {properties.length === 0 ? (
                <li className="text-sm text-muted-foreground">
                  Zatím žádné — přidejte pro porovnání.
                </li>
              ) : (
                properties.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span>
                      {p.label}
                      <span className="block text-xs text-muted-foreground">
                        {p.priceCzk.toLocaleString("cs-CZ")} Kč
                      </span>
                    </span>
                    <button
                      type="button"
                      className="text-xs text-red-700 underline"
                      onClick={() => removeProperty(p.id)}
                    >
                      Odebrat
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="mt-3 space-y-2">
              <input
                className="h-10 w-full rounded-lg border border-border px-3 text-sm"
                placeholder="Název"
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
              />
              <input
                className="h-10 w-full rounded-lg border border-border px-3 text-sm"
                placeholder="Cena Kč"
                inputMode="numeric"
                value={draftPrice}
                onChange={(e) => setDraftPrice(e.target.value)}
              />
              <button
                type="button"
                onClick={addProperty}
                className="h-10 w-full rounded-full bg-deep-teal text-sm font-bold text-white"
              >
                Přidat nemovitost
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-h-[70vh] flex-col rounded-2xl border border-border bg-white shadow-sm">
          <div
            id="copilot-quick"
            className="flex flex-wrap gap-2 border-b border-border p-3"
          >
            {COPILOT_QUICK_ACTIONS.map((a) => (
              <button
                key={a.id}
                id={a.id === "affordability" ? "quick-affordability" : undefined}
                type="button"
                disabled={busy}
                onClick={() => run(a.prompt, a.id)}
                className="inline-flex min-h-11 items-center rounded-full border border-border bg-[#f7f8f7] px-3 py-2 text-xs font-semibold text-text-dark hover:border-deep-teal/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal disabled:opacity-50"
              >
                {a.label}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[95%] rounded-2xl px-4 py-3",
                  m.role === "user"
                    ? "ml-auto bg-deep-teal text-white"
                    : "bg-[#f4f7f6] text-text-dark"
                )}
              >
                {m.role === "assistant" ? (
                  <>
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-deep-teal">
                      <Bot className="h-3.5 w-3.5" />
                      Finanční AI průvodce
                      {m.intent ? (
                        <span className="font-normal text-muted-foreground">
                          · {m.intent}
                        </span>
                      ) : null}
                    </div>
                    <SimpleMarkdown text={m.content} />
                    {m.citations && m.citations.length > 0 ? (
                      <CitationChips citations={m.citations} />
                    ) : null}
                    {m.responseMeta ? (
                      <ResponseMetaBar meta={m.responseMeta} />
                    ) : null}
                    {m.cta && m.cta.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {m.cta.map((c) => (
                          <Link
                            key={c.href + c.label}
                            href={c.href}
                            className="rounded-full border border-deep-teal/30 bg-white px-3 py-1 text-xs font-semibold text-deep-teal"
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            ))}
            {busy ? (
              <p className="text-sm text-muted-foreground">Počítám z nástrojů…</p>
            ) : null}
          </div>

          <form
            className="flex gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              run(input);
            }}
          >
            <input
              className="h-12 flex-1 rounded-full border border-border px-4 text-sm"
              placeholder="Např. Co se stane, když sazba vzroste o 2 %?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
              aria-label="Zpráva pro Finanční AI průvodce"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-deep-teal text-white disabled:opacity-40"
              aria-label="Odeslat"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <ShieldAlert className="h-3.5 w-3.5" />
              Použité vstupy & zdroje
            </p>
            {lastAssistant?.responseMeta ? (
              <div className="mt-3 space-y-1 text-sm">
                <p>
                  Důvěra:{" "}
                  <strong>{lastAssistant.responseMeta.confidenceLabelCs}</strong>
                </p>
                <p className="text-muted-foreground">
                  Zdroje: {lastAssistant.responseMeta.sourcesUsed} · čerstvé:{" "}
                  {lastAssistant.responseMeta.freshSources} · zastaralé:{" "}
                  {lastAssistant.responseMeta.staleSources}
                </p>
              </div>
            ) : null}
            {lastAssistant?.usedInputs && lastAssistant.usedInputs.length > 0 ? (
              <ul className="mt-3 space-y-2 text-sm">
                {lastAssistant.usedInputs.map((u) => (
                  <li key={u.key} className="border-b border-border/60 pb-2">
                    <span className="font-semibold">{u.label}</span>
                    <span className="mt-0.5 block text-muted-foreground">
                      {u.display}
                    </span>
                    <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                      {CLAIM_KIND_SHORT_CS[u.claimKind]}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Po odpovědi se zde zobrazí vstupy.
              </p>
            )}
            {lastAssistant?.citations && lastAssistant.citations.length > 0 ? (
              <ul className="mt-4 space-y-2 text-sm">
                {lastAssistant.citations.map((c) => (
                  <li key={c.id}>
                    <span className="font-semibold">{c.label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {c.source}
                      {c.updatedAt ? ` · ${c.updatedAt}` : ""}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-deep-teal">
                      {CLAIM_KIND_SHORT_CS[c.claimKind]} —{" "}
                      {CLAIM_KIND_HINT[c.claimKind]}
                    </span>
                    {c.href ? (
                      <Link
                        href={c.href}
                        className="mt-0.5 block text-xs text-deep-teal underline"
                        onClick={() =>
                          track("source_opened", {
                            tool_id: "ai_copilot",
                            source_id: c.id,
                          })
                        }
                      >
                        Zdroj
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <ClipboardList className="h-3.5 w-3.5" />
                Historie odpovědí
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground underline"
                onClick={() => {
                  clearAuditLog();
                  setAudit([]);
                }}
              >
                <Trash2 className="h-3 w-3" />
                Vymazat
              </button>
            </div>
            <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-xs">
              {audit.length === 0 ? (
                <li className="text-muted-foreground">Zatím prázdné.</li>
              ) : (
                audit.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-lg border border-border/70 bg-[#fafafa] p-2"
                  >
                    <div className="font-semibold">{a.intent}</div>
                    <div className="text-muted-foreground">
                      {new Date(a.at).toLocaleString("cs-CZ")}
                    </div>
                    <div className="mt-1 text-muted-foreground">
                      Nástroje: {a.tools.length || "—"} · Zdroje:{" "}
                      {(a.sourcesUsed ?? a.citationIds.length) || "—"}
                      {a.confidence ? ` · Důvěra: ${a.confidence}` : ""}
                      {a.guardrailFlags.length
                        ? ` · Ochrana: ${a.guardrailFlags.length}`
                        : ""}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
