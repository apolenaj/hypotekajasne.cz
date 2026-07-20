import type { Metadata } from "next";
import { ReportEngineView } from "@/components/report-engine/ReportEngineView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Profesionální reporty — export a sdílení",
  description:
    "Připravenost na hypotéku, analýza nemovitosti, porovnání, investiční pas, riziko portfolia, refinancování — web, tisk, HTML připravené pro PDF. Časově omezený token, volitelné heslo, maskování citlivých dat.",
  path: routes.reportEngine,
});

export default function ReportEnginePage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7] print:hidden">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <Breadcrumbs
            items={crumbs({ name: "Profesionální reporty", path: routes.reportEngine })}
          />
        </div>
      </div>
      <ReportEngineView />
    </>
  );
}
