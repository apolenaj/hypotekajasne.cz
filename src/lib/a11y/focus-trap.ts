/**
 * Focus trap + body scroll lock for modal/drawer overlays.
 * Restores focus to the previously focused element on deactivate.
 */

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter((el) => {
    if (el.tabIndex < 0) return false;
    if (el.getAttribute("aria-hidden") === "true") return false;
    if (el.closest("[hidden]")) return false;
    const style = window.getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") return false;
    return true;
  });
}

export type UseFocusTrapOptions = {
  /** Called when Escape is pressed (trap still active). */
  onEscape?: () => void;
  /** Lock document.body overflow while active. Default true. */
  lockScroll?: boolean;
  /** Restore focus to opener on close. Default true. */
  restoreFocus?: boolean;
  /** Focus this element first; otherwise first focusable in container. */
  initialFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * When `active`, traps Tab within `containerRef` and optionally locks scroll.
 */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  options: UseFocusTrapOptions = {}
) {
  const {
    onEscape,
    lockScroll = true,
    restoreFocus = true,
    initialFocusRef,
  } = options;
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const focusInitial = () => {
      const preferred = initialFocusRef?.current;
      if (preferred && container.contains(preferred)) {
        preferred.focus();
        return;
      }
      const list = getFocusableElements(container);
      list[0]?.focus();
    };

    // Defer so portal content is mounted
    const t = window.setTimeout(focusInitial, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscapeRef.current?.();
        return;
      }
      if (e.key !== "Tab") return;
      const list = getFocusableElements(container);
      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const first = list[0]!;
      const last = list[list.length - 1]!;
      if (e.shiftKey) {
        if (
          document.activeElement === first ||
          !container.contains(document.activeElement)
        ) {
          e.preventDefault();
          last.focus();
        }
      } else if (
        document.activeElement === last ||
        !container.contains(document.activeElement)
      ) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    let prevOverflow = "";
    if (lockScroll) {
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
      if (lockScroll) {
        document.body.style.overflow = prevOverflow;
      }
      if (restoreFocus) {
        previousFocusRef.current?.focus?.();
      }
    };
  }, [active, containerRef, initialFocusRef, lockScroll, restoreFocus]);
}
