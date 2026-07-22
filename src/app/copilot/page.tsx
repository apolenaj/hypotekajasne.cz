import type { Metadata } from "next";
import { CopilotView } from "@/components/copilot/CopilotView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Finanční AI průvodce",
  description:
    "Finanční AI průvodce nad ověřenými daty a kalkulačkami Hypotéka Jasně — citace, audit log, bez příslibu schválení.",
  path: routes.copilot,
});

export default function CopilotPage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Breadcrumbs
            items={crumbs({
              name: "Finanční AI průvodce",
              path: routes.copilot,
            })}
          />
        </div>
      </div>
      <CopilotView />
    </>
  );
}
