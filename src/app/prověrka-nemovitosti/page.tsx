import type { Metadata } from "next";
import { DueDiligenceView } from "@/components/due-diligence/DueDiligenceView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Due Diligence Engine — prověrka nemovitosti",
  description:
    "Personalizovaný checklist LEGAL–EXIT dle typu nemovitosti. Traffic light GREY default — unknown není green. Human-expert escalation.",
  path: routes.dueDiligence,
});

export default function DueDiligencePage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Breadcrumbs
            items={crumbs({ name: "Due Diligence", path: routes.dueDiligence })}
          />
        </div>
      </div>
      <DueDiligenceView />
    </>
  );
}
