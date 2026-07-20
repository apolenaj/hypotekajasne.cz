"use client";

import Link from "next/link";
import { useState } from "react";
import { useCookieConsent } from "@/components/consent/CookieConsentProvider";
import { COOKIE_POLICY_VERSION } from "@/lib/legal/consent-versions";
import type { CookieConsentRecord } from "@/lib/consent/records";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const btnBase =
  "inline-flex min-h-11 flex-1 items-center justify-center rounded-full px-4 py-2.5 text-sm font-bold transition sm:flex-none sm:min-w-[9.5rem]";

function CookieSettingsPanel({
  record,
  onSave,
}: {
  record: CookieConsentRecord | null;
  onSave: (analytics: boolean, marketing: boolean) => void;
}) {
  const [analytics, setAnalytics] = useState(
    () => record?.categories.analytics ?? false
  );
  const [marketing, setMarketing] = useState(
    () => record?.categories.marketing ?? false
  );

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm">
      <label className="flex items-start gap-3">
        <input type="checkbox" checked disabled className="mt-1" />
        <span>
          <strong>Nezbytné</strong> — vždy aktivní (relace, bezpečnost,
          preference souhlasu).
        </span>
      </label>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1"
          checked={analytics}
          onChange={(e) => setAnalytics(e.target.checked)}
        />
        <span>
          <strong>Analytické</strong> — měření návštěvnosti až po souhlasu.
        </span>
      </label>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
        />
        <span>
          <strong>Marketingové</strong> — reklama / remarketing až po souhlasu.
        </span>
      </label>
      <button
        type="button"
        onClick={() => onSave(analytics, marketing)}
        className={cn(btnBase, "w-full bg-deep-teal text-white hover:opacity-95")}
      >
        Uložit nastavení
      </button>
    </div>
  );
}

export function CookieConsentBanner() {
  const {
    ready,
    openBanner,
    openSettings,
    setOpenSettings,
    acceptAll,
    rejectOptional,
    saveSettings,
    record,
  } = useCookieConsent();

  if (!ready || !openBanner) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-modal="false"
      className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-5"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-white p-4 shadow-2xl shadow-black/15 sm:p-6">
        <p
          id="cookie-consent-title"
          className="font-heading text-lg font-bold text-text-dark"
        >
          Cookies a soukromí
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Nezbytné cookies potřebujeme pro fungování webu. Analytiku a marketing
          spouštíme{" "}
          <strong className="font-semibold text-text-dark">
            jen po vašem souhlasu
          </strong>{" "}
          (ne na základě oprávněného zájmu). Verze zásad: {COOKIE_POLICY_VERSION}.{" "}
          <Link
            href={routes.legal.cookies}
            className="font-semibold text-deep-teal underline"
          >
            Cookie policy
          </Link>
          {" · "}
          <Link
            href={routes.legal.gdpr}
            className="font-semibold text-deep-teal underline"
          >
            GDPR
          </Link>
        </p>

        {openSettings ? (
          <CookieSettingsPanel
            key={record?.decidedAt ?? "unset"}
            record={record}
            onSave={saveSettings}
          />
        ) : null}

        {/* Stejná UX prominence — tři rovnocenné akce */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => {
              try {
                acceptAll();
              } catch (err) {
                console.warn("[cookie-consent] acceptAll failed", err);
              }
            }}
            className={cn(btnBase, "bg-deep-teal text-white hover:opacity-95")}
          >
            Accept all
          </button>
          <button
            type="button"
            onClick={() => {
              try {
                rejectOptional();
              } catch (err) {
                console.warn("[cookie-consent] rejectOptional failed", err);
              }
            }}
            className={cn(
              btnBase,
              "border-2 border-deep-teal bg-white text-deep-teal hover:bg-deep-teal/5"
            )}
          >
            Reject optional
          </button>
          <button
            type="button"
            onClick={() => setOpenSettings(true)}
            className={cn(
              btnBase,
              "border-2 border-border bg-white text-text-dark hover:bg-slate-50"
            )}
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}
