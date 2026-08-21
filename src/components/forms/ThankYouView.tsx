"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CheckCircle2, Info } from "lucide-react";
import {
  isLeadSource,
  LEAD_SOURCE_LABELS,
  type LeadSource,
} from "@/lib/leads";
import { consumeLeadThankYouToken } from "@/lib/leads-idempotency";
import { getPartnerClaimLabels } from "@/lib/partners/verification";
import { routes } from "@/lib/routes";

type ThankYouViewProps = {
  /** Source from query string — display context only, not proof of submit */
  sourceParam?: string | null;
};

type ThanksSnapshot = {
  ready: boolean;
  confirmed: boolean;
  source?: string;
};

const SERVER_SNAPSHOT: ThanksSnapshot = {
  ready: false,
  confirmed: false,
};

function createThanksStore() {
  let snapshot: ThanksSnapshot = SERVER_SNAPSHOT;
  let started = false;
  const listeners = new Set<() => void>();

  const emit = () => {
    for (const listener of listeners) listener();
  };

  return {
    subscribe(onStoreChange: () => void) {
      listeners.add(onStoreChange);
      if (!started && typeof window !== "undefined") {
        started = true;
        const token = consumeLeadThankYouToken();
        snapshot = {
          ready: true,
          confirmed: token.confirmed,
          source: token.source,
        };
        queueMicrotask(emit);
      }
      return () => {
        listeners.delete(onStoreChange);
      };
    },
    getSnapshot(): ThanksSnapshot {
      return snapshot;
    },
    getServerSnapshot(): ThanksSnapshot {
      return SERVER_SNAPSHOT;
    },
  };
}

export function ThankYouView({ sourceParam }: ThankYouViewProps) {
  const [store] = useState(createThanksStore);
  const token = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );

  if (!token.ready) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-16">
        <p className="text-sm text-muted-foreground">Načítám…</p>
      </div>
    );
  }

  const fromQuery =
    sourceParam && isLeadSource(sourceParam) ? sourceParam : null;
  const fromToken =
    token.source && isLeadSource(token.source) ? token.source : null;
  const source: LeadSource | null = token.confirmed
    ? fromToken ?? fromQuery
    : fromQuery;
  const sourceLabel = source ? LEAD_SOURCE_LABELS[source] : null;
  const thankYouHandoff = getPartnerClaimLabels().thankYouHandoff;

  if (token.confirmed) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-16">
        <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="font-heading text-2xl font-bold text-gray-900 md:text-3xl">
            Poptávku jsme přijali
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed">
            {sourceLabel
              ? `Údaje z nástroje „${sourceLabel}“ jsme bezpečně přijali.`
              : "Vaše kontaktní údaje jsme bezpečně přijali."}{" "}
            {thankYouHandoff}
          </p>
          <ul className="mt-6 space-y-2 text-left text-sm text-gray-600">
            <li>• Ozveme se k nezávazné konzultaci vaší situace.</li>
            <li>• Nejde o schválení úvěru ani o závaznou sazbu banky.</li>
            <li>
              • Hypotéka Jasně není banka — konečné podmínky vždy stanoví banka.
            </li>
          </ul>
          <ThankYouActions />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <Info className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="font-heading text-2xl font-bold text-gray-900 md:text-3xl">
          Děkujeme za návštěvu
        </h1>
        <p className="mt-4 text-gray-600 leading-relaxed">
          Na této stránce nevidíme potvrzení aktivního odeslání poptávky. Pokud
          jste formulář právě odeslali a očekáváte potvrzení, vraťte se na
          formulář a odešlete jej znovu — nebo nám napište na kontakt.
        </p>
        <ul className="mt-6 space-y-2 text-left text-sm text-gray-600">
          <li>• Obnovení stránky nezakládá novou poptávku.</li>
          <li>• Přímé otevření této URL neznamená přijetí leadu.</li>
          <li>• Hypotéka Jasně není banka.</li>
        </ul>
        <ThankYouActions />
      </div>
    </div>
  );
}

function ThankYouActions() {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
      <Link
        href={routes.home}
        className="inline-flex items-center justify-center rounded-full bg-emerald-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
      >
        Zpět na úvod
      </Link>
      <Link
        href={routes.sazby}
        className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-800 transition hover:bg-gray-50"
      >
        Porovnat sazby
      </Link>
      <Link
        href={routes.kontakt}
        className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-800 transition hover:bg-gray-50"
      >
        Kontakt
      </Link>
    </div>
  );
}
