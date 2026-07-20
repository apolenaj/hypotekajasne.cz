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

/**
 * useSyncExternalStore requires a stable getSnapshot reference when data
 * hasn't changed. Caching by raw localStorage string prevents infinite
 * re-renders after Accept all (JSON.parse always returns a new object).
 */
let cachedRaw: string | null | undefined;
let cachedRecord: CookieConsentRecord | null = null;

function parseConsentRaw(raw: string | null): CookieConsentRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CookieConsentRecord;
    if (!parsed?.categories || !parsed.decidedAt) return null;
    if (parsed.policyVersion !== COOKIE_POLICY_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function readStored(): CookieConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (raw === cachedRaw) return cachedRecord;
    cachedRaw = raw;
    cachedRecord = parseConsentRaw(raw);
    return cachedRecord;
  } catch {
    cachedRaw = null;
    cachedRecord = null;
    return null;
  }
}

function writeStored(record: CookieConsentRecord) {
  try {
    const raw = JSON.stringify(record);
    localStorage.setItem(COOKIE_STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedRecord = record;
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: record }));
  } catch (err) {
    console.warn("[cookie-consent] failed to persist consent", err);
  }
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
