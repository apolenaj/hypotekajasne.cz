"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { COOKIE_POLICY_VERSION } from "@/lib/legal/consent-versions";
import {
  COOKIE_STORAGE_KEY,
  type CookieConsentCategories,
  type CookieConsentRecord,
} from "@/lib/consent/records";

type CookieConsentContextValue = {
  ready: boolean;
  record: CookieConsentRecord | null;
  openBanner: boolean;
  openSettings: boolean;
  setOpenSettings: (v: boolean) => void;
  acceptAll: () => void;
  rejectOptional: () => void;
  saveSettings: (analytics: boolean, marketing: boolean) => void;
  reopenPreferences: () => void;
  analyticsAllowed: boolean;
  marketingAllowed: boolean;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null
);

const CONSENT_EVENT = "hj:cookie-consent";

function readStored(): CookieConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentRecord;
    if (!parsed?.categories || !parsed.decidedAt) return null;
    if (parsed.policyVersion !== COOKIE_POLICY_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(record: CookieConsentRecord) {
  localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(record));
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: record }));
}

function subscribeConsent(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(CONSENT_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(CONSENT_EVENT, handler);
  };
}

/** Client-only flag without setState-in-effect (hydration-safe). */
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function useStoredConsent() {
  return useSyncExternalStore(subscribeConsent, readStored, () => null);
}

function makeRecord(
  analytics: boolean,
  marketing: boolean
): CookieConsentRecord {
  const categories: CookieConsentCategories = {
    necessary: true,
    analytics,
    marketing,
  };
  return {
    policyVersion: COOKIE_POLICY_VERSION,
    categories,
    decidedAt: new Date().toISOString(),
  };
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const ready = useIsClient();
  const record = useStoredConsent();
  const [openSettings, setOpenSettings] = useState(false);
  const [forceBanner, setForceBanner] = useState(false);

  const openBanner = ready && (!record || forceBanner);

  const persist = useCallback((next: CookieConsentRecord) => {
    writeStored(next);
    setForceBanner(false);
    setOpenSettings(false);
  }, []);

  const acceptAll = useCallback(() => {
    persist(makeRecord(true, true));
  }, [persist]);

  const rejectOptional = useCallback(() => {
    persist(makeRecord(false, false));
  }, [persist]);

  const saveSettings = useCallback(
    (analytics: boolean, marketing: boolean) => {
      persist(makeRecord(analytics, marketing));
    },
    [persist]
  );

  const reopenPreferences = useCallback(() => {
    setOpenSettings(true);
    setForceBanner(true);
  }, []);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      ready,
      record,
      openBanner,
      openSettings,
      setOpenSettings,
      acceptAll,
      rejectOptional,
      saveSettings,
      reopenPreferences,
      analyticsAllowed: Boolean(record?.categories.analytics),
      marketingAllowed: Boolean(record?.categories.marketing),
    }),
    [
      ready,
      record,
      openBanner,
      openSettings,
      acceptAll,
      rejectOptional,
      saveSettings,
      reopenPreferences,
    ]
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return ctx;
}
