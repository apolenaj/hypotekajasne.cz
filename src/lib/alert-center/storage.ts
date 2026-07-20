import {
  ALERT_CENTER_STORAGE_KEY,
  defaultAlertCenterStore,
  type AlertCenterStore,
} from "@/lib/alert-center/types";

export function loadAlertCenterStore(): AlertCenterStore {
  if (typeof window === "undefined") return defaultAlertCenterStore();
  try {
    const raw = localStorage.getItem(ALERT_CENTER_STORAGE_KEY);
    if (!raw) return defaultAlertCenterStore();
    const parsed = JSON.parse(raw) as Partial<AlertCenterStore>;
    return {
      ...defaultAlertCenterStore(),
      ...parsed,
      preferences: {
        ...defaultAlertCenterStore().preferences,
        ...parsed.preferences,
        channels: {
          ...defaultAlertCenterStore().preferences.channels,
          ...parsed.preferences?.channels,
        },
        byType: parsed.preferences?.byType ?? {},
      },
    };
  } catch {
    return defaultAlertCenterStore();
  }
}

export function saveAlertCenterStore(store: AlertCenterStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ALERT_CENTER_STORAGE_KEY, JSON.stringify(store));
}

export function markAlertRead(store: AlertCenterStore, alertId: string): AlertCenterStore {
  if (store.readAlertIds.includes(alertId)) return store;
  return {
    ...store,
    readAlertIds: [...store.readAlertIds, alertId].slice(-200),
  };
}

export function dismissAlert(store: AlertCenterStore, alertId: string): AlertCenterStore {
  return {
    ...store,
    dismissedAlertIds: [...store.dismissedAlertIds, alertId].slice(-200),
  };
}
