"use client";

import { useMemo, useState } from "react";
import { DataStatusBadge } from "@/components/trust/DataStatusBadge";
import {
  AUTHORITY_KIND_LABELS_CS,
  AUTHORITY_REGISTRY,
  CRITICAL_PROVENANCE_CLAIMS,
  JURISDICTION_LABELS_CS,
  SOURCE_TOPIC_LABELS_CS,
  getAuthorityById,
  type AuthorityKind,
  type SourceTopic,
} from "@/lib/sources";
import { formatCzechDate } from "@/lib/data/freshness";
import { PUBLIC_STATUS_MEANINGS, publicFreshnessHint } from "@/lib/data/public-methodology";
import type { DataStatus } from "@/lib/data/types";

const QUALITY_STATUSES: DataStatus[] = [
  "LIVE",
  "VERIFIED",
  "MODEL",
  "ESTIMATE",
  "UNVERIFIED",
];

const JURISDICTION_OPTIONS = [
  "all",
  ...Array.from(
    new Set(AUTHORITY_REGISTRY.map((a) => String(a.jurisdiction)))
  ).sort(),
];

const TOPIC_OPTIONS: Array<"all" | SourceTopic> = [
  "all",
  ...(Object.keys(SOURCE_TOPIC_LABELS_CS) as SourceTopic[]),
];

const KIND_OPTIONS: Array<"all" | AuthorityKind> = [
  "all",
  ...(Object.keys(AUTHORITY_KIND_LABELS_CS) as AuthorityKind[]),
];

function jurisdictionLabel(code: string): string {
  return JURISDICTION_LABELS_CS[code] ?? code;
}

export function ZdrojeExplorer() {
  const [jurisdiction, setJurisdiction] = useState("all");
  const [topic, setTopic] = useState<"all" | SourceTopic>("all");
  const [kind, setKind] = useState<"all" | AuthorityKind>("all");

  const authorities = useMemo(() => {
    return AUTHORITY_REGISTRY.filter((a) => {
      if (
        jurisdiction !== "all" &&
        a.jurisdiction !== jurisdiction &&
        a.jurisdiction !== "multi"
      ) {
        return false;
      }
      if (topic !== "all" && !a.topics.includes(topic)) return false;
      if (kind !== "all" && a.kind !== kind) return false;
      return true;
    });
  }, [jurisdiction, topic, kind]);

  const claims = useMemo(() => {
    return CRITICAL_PROVENANCE_CLAIMS.filter((c) => {
      if (jurisdiction !== "all" && c.country !== jurisdiction) return false;
      if (topic !== "all") {
        const topics = c.authorityIds
          .map((id) => getAuthorityById(id))
          .filter(Boolean)
          .flatMap((a) => a!.topics);
        if (topics.length && !topics.includes(topic)) return false;
      }
      return true;
    });
  }, [jurisdiction, topic]);

  return (
    <div className="space-y-12">
      <section aria-labelledby="quality-heading" className="space-y-4">
        <h2
          id="quality-heading"
          className="font-heading text-xl font-semibold text-text-dark"
        >
          Jak poznat kvalitu údaje
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Interní soubor ani databázová tabulka není důkazem správnosti. Status
          Ověřeno vyžaduje odkaz na autoritu (regulátor, ministerstvo, centrální
          banka, katastr, daňová správa, oficiální statistika).
        </p>
        <ul className="space-y-3">
          {QUALITY_STATUSES.map((s) => (
            <li
              key={s}
              className="flex items-start gap-3 rounded-xl border border-border px-4 py-3"
            >
              <DataStatusBadge status={s} size="md" className="mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-text-dark">
                  {PUBLIC_STATUS_MEANINGS[s].label}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {PUBLIC_STATUS_MEANINGS[s].description}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {publicFreshnessHint(s)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="filters-heading" className="space-y-4">
        <h2
          id="filters-heading"
          className="font-heading text-xl font-semibold text-text-dark"
        >
          Autoritativní zdroje
        </h2>
        <div className="flex flex-wrap gap-3">
          <label className="text-xs font-medium text-muted-foreground">
            Země
            <select
              className="mt-1 block rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-dark"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
            >
              {JURISDICTION_OPTIONS.map((j) => (
                <option key={j} value={j}>
                  {j === "all" ? "Všechny" : jurisdictionLabel(j)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Téma
            <select
              className="mt-1 block rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-dark"
              value={topic}
              onChange={(e) =>
                setTopic(e.target.value as "all" | SourceTopic)
              }
            >
              {TOPIC_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t === "all" ? "Všechna" : SOURCE_TOPIC_LABELS_CS[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Typ autority
            <select
              className="mt-1 block rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-dark"
              value={kind}
              onChange={(e) =>
                setKind(e.target.value as "all" | AuthorityKind)
              }
            >
              {KIND_OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {k === "all" ? "Všechny" : AUTHORITY_KIND_LABELS_CS[k]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {authorities.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-border bg-white px-4 py-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-deep-teal">
                {AUTHORITY_KIND_LABELS_CS[a.kind]} ·{" "}
                {jurisdictionLabel(String(a.jurisdiction))}
              </p>
              <p className="mt-1 font-semibold text-text-dark">{a.title}</p>
              <p className="text-xs text-muted-foreground">{a.organization}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {a.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {a.topics.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"
                  >
                    {SOURCE_TOPIC_LABELS_CS[t]}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-deep-teal underline-offset-2 hover:underline"
                >
                  Otevřít zdroj →
                </a>
                <span className="tabular-nums text-muted-foreground">
                  Kontrola: {formatCzechDate(a.lastCheckedAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
        {authorities.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Pro zvolený filtr zatím nemáme autoritu v registru.
          </p>
        )}
      </section>

      <section aria-labelledby="claims-heading" className="space-y-4">
        <h2
          id="claims-heading"
          className="font-heading text-xl font-semibold text-text-dark"
        >
          Propojená tvrzení
        </h2>
        <p className="text-sm text-muted-foreground">
          Konkrétní údaje na webu s vazbou na autoritu. Interní úložiště slouží
          jen k auditu — není veřejným zdrojem.
        </p>
        <ul className="divide-y divide-border rounded-xl border border-border">
          {claims.map((c) => (
            <li key={c.id} className="px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-text-dark">{c.claimLabel}</p>
                <DataStatusBadge status={c.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {c.provenance.organization}
                {c.provenance.title ? ` — ${c.provenance.title}` : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                {c.provenance.url ? (
                  <a
                    href={c.provenance.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-deep-teal underline-offset-2 hover:underline"
                  >
                    Externí zdroj →
                  </a>
                ) : c.provenance.reference ? (
                  <span className="text-muted-foreground">
                    Ref: {c.provenance.reference}
                  </span>
                ) : null}
                <span className="tabular-nums text-muted-foreground">
                  Kontrola: {formatCzechDate(c.provenance.lastCheckedAt)}
                </span>
              </div>
              {c.notes ? (
                <p className="mt-1 text-xs text-muted-foreground">{c.notes}</p>
              ) : null}
            </li>
          ))}
        </ul>
        {claims.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Pro zvolený filtr nejsou kritická tvrzení.
          </p>
        )}
      </section>
    </div>
  );
}
