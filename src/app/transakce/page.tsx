import type { Metadata } from "next";
import { DealRoomLandingView } from "@/components/deal-room/DealRoomView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Transakční místnost — společný prostor pro transakci",
  description:
    "Jeden přehled místo WhatsAppu a PDF: časová osa, dokumenty s oprávněními, kontakty a úkoly. Vznikne po „Mám vážný zájem“.",
  path: routes.dealRoom,
});

export default function DealRoomLandingPage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Breadcrumbs
            items={crumbs({ name: "Transakční místnost", path: routes.dealRoom })}
          />
        </div>
      </div>
      <DealRoomLandingView />
    </>
  );
}
