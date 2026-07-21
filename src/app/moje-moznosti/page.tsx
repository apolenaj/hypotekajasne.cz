import type { Metadata } from "next";
import { MojeMoznostiWizard } from "@/components/moje-moznosti/MojeMoznostiWizard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Zjistit moje možnosti — diagnostika a dashboard",
  description:
    "Jedna diagnostika: orientační budget, připravenost, market match a další kroky. Údaje jen lokálně v prohlížeči — ne schválení banky.",
  path: routes.mojeMoznosti,
  noIndex: true,
});

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
