"use client";

import { getLegalDevIncompleteNotice } from "@/config/legal";

/**
 * Development-only banner when legal identity is incomplete.
 * Never rendered meaningfully in production builds (returns null).
 */
export function LegalDevIncompleteBanner() {
  const notice = getLegalDevIncompleteNotice();
  if (!notice) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-300 bg-amber-100 px-3 py-2 text-center text-[11px] font-medium text-amber-950"
    >
      {notice}
    </div>
  );
}
