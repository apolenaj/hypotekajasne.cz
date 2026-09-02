/**
 * Exclusive desktop nav disclosure state — pure helper for unit tests.
 * One open panel at a time; click toggles; Escape / outside close.
 */
export type DesktopNavDisclosureState = string | null;

export function toggleDesktopNavDisclosure(
  current: DesktopNavDisclosureState,
  groupId: string
): DesktopNavDisclosureState {
  return current === groupId ? null : groupId;
}

export function closeDesktopNavDisclosure(): DesktopNavDisclosureState {
  return null;
}
