import type { DealRoomStore } from "@/lib/deal-room/types";
import { DEAL_ROOM_STORAGE_KEY, emptyDealRoomStore } from "@/lib/deal-room/types";

export function loadDealRoomStore(): DealRoomStore {
  if (typeof window === "undefined") return emptyDealRoomStore();
  try {
    const raw = localStorage.getItem(DEAL_ROOM_STORAGE_KEY);
    if (!raw) return emptyDealRoomStore();
    const parsed = JSON.parse(raw) as DealRoomStore;
    if (parsed?.version === 1) {
      return { ...emptyDealRoomStore(), ...parsed };
    }
  } catch {
    /* empty */
  }
  return emptyDealRoomStore();
}

export function saveDealRoomStore(store: DealRoomStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    DEAL_ROOM_STORAGE_KEY,
    JSON.stringify({
      ...store,
      version: 1,
      workspaces: store.workspaces.slice(0, 10),
    })
  );
}

export function getWorkspaceById(
  store: DealRoomStore,
  id: string
): DealRoomStore["workspaces"][number] | null {
  return store.workspaces.find((w) => w.id === id) ?? null;
}

export function upsertWorkspace(
  store: DealRoomStore,
  workspace: DealRoomStore["workspaces"][number]
): DealRoomStore {
  const idx = store.workspaces.findIndex((w) => w.id === workspace.id);
  const workspaces =
    idx >= 0
      ? store.workspaces.map((w, i) => (i === idx ? workspace : w))
      : [...store.workspaces, workspace];
  return {
    ...store,
    workspaces,
    activeWorkspaceId: workspace.id,
  };
}
