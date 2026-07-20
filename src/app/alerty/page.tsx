import type { Metadata } from "next";
import { AlertCenterView } from "@/components/alert-center/AlertCenterView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Centrum upozornění — centrální upozornění",
  description:
    "Personalizované alerty: sazby (LTV kontext), fixace, dokumenty, regulace, transakční místnost. Deduplication, preference immediate/digest, notification channels s consent.",
  path: routes.alertCenter,
});

export default function AlertCenterPage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <Breadcrumbs
            items={crumbs({ name: "Centrum upozornění", path: routes.alertCenter })}
          />
        </div>
      </div>
      <AlertCenterView />
    </>
  );
}
