import type { Metadata } from "next";
import { MojeMoznostiWizard } from "@/components/moje-moznosti/MojeMoznostiWizard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { getStaticPageSeo } from "@/lib/seo/pages";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = getStaticPageSeo(routes.mojeMoznosti);

export default function MojeMoznostiPage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <Breadcrumbs
            items={crumbs({
              name: "Moje možnosti",
              path: routes.mojeMoznosti,
            })}
          />
        </div>
      </div>
      <MojeMoznostiWizard />
    </>
  );
}
