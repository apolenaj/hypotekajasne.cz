"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import {
  PRACTICE_GUIDES,
  practiceGuidePath,
  practiceHubPath,
  searchPracticeGuides,
  type PracticeGuide,
  type PracticeSearchHit,
} from "@/lib/academy/practice";
import { PRACTICE_TAG_LABELS } from "@/lib/academy/practice/types";

const FALLBACK_TOPICS = PRACTICE_GUIDES.slice(0, 4).map((g) => ({
  title: g.title,
  href: practiceGuidePath(g.slug),
  blurb: g.cardBlurb,
}));

export function PracticeSearch({
  guides = PRACTICE_GUIDES,
  autoFocus = false,
}: {
  guides?: PracticeGuide[];
  autoFocus?: boolean;
}) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const hits = useMemo(
    () => searchPracticeGuides(guides, deferred, 10),
    [guides, deferred]
  );
  const showEmpty = deferred.trim().length >= 2 && hits.length === 0;

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
      <label htmlFor="practice-search" className="sr-only">
        Na co se chcete zeptat?
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          id="practice-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={autoFocus}
          placeholder="Na co se chcete zeptat?"
          className="h-12 w-full rounded-xl border border-border bg-[#f7f8f7] pl-10 pr-3 text-sm text-text-dark placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal"
          autoComplete="off"
        />
      </div>

      {hits.length > 0 ? (
        <ul className="mt-3 divide-y divide-border" role="listbox" aria-label="Výsledky hledání">
          {hits.map((hit) => (
            <SearchHitRow key={`${hit.guideSlug}-${hit.answerId}`} hit={hit} />
          ))}
        </ul>
      ) : null}

      {showEmpty ? (
        <div className="mt-4 rounded-xl bg-[#f7f8f7] p-4 text-sm">
          <p className="font-semibold text-text-dark">
            Nic přesného jsme nenašli.
          </p>
          <p className="mt-1 text-muted-foreground">
            Zkuste jiná slova, nebo otevřete související témata:
          </p>
          <ul className="mt-3 space-y-2">
            {FALLBACK_TOPICS.map((t) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className="font-medium text-deep-teal hover:underline"
                >
                  {t.title}
                </Link>
                <span className="block text-xs text-muted-foreground">
                  {t.blurb}
                </span>
              </li>
            ))}
            <li>
              <Link
                href={practiceHubPath()}
                className="text-sm font-medium text-deep-teal hover:underline"
              >
                Zobrazit všechna témata
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function SearchHitRow({ hit }: { hit: PracticeSearchHit }) {
  return (
    <li>
      <Link
        href={hit.href}
        className="block rounded-lg py-3 transition hover:bg-[#f7f8f7] hover:px-2"
      >
        <p className="text-sm font-semibold text-text-dark">{hit.question}</p>
        <p className="mt-0.5 text-xs text-deep-teal">{hit.guideTitle}</p>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {hit.snippet}
        </p>
      </Link>
    </li>
  );
}

export function PracticeTagFilter({
  active,
  onChange,
}: {
  active: string | null;
  onChange: (tag: string | null) => void;
}) {
  const tags = Object.entries(PRACTICE_TAG_LABELS);
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filtr podle situace"
    >
      <button
        type="button"
        onClick={() => onChange(null)}
        className={
          active == null
            ? "rounded-lg bg-deep-teal px-3 py-1.5 text-xs font-semibold text-white"
            : "rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-text-dark hover:border-deep-teal/40"
        }
      >
        Vše
      </button>
      {tags.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(active === id ? null : id)}
          className={
            active === id
              ? "rounded-lg bg-deep-teal px-3 py-1.5 text-xs font-semibold text-white"
              : "rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-text-dark hover:border-deep-teal/40"
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
