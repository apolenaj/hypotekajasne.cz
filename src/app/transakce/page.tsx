import type { Metadata } from "next";
import { DealRoomLandingView } from "@/components/deal-room/DealRoomView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

export const metadata: Metadata = buildPageMetadata({
  title: "Property Deal Room — workspace pro transakci",
  description:
    "Jeden workspace místo WhatsAppu a PDF: timeline, dokumenty s permission modelem, kontakty a úkoly. Vznikne po „Mám vážný zájem“.",
  path: routes.dealRoom,
});

export default function DealRoomLandingPage() {
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Breadcrumbs
            items={crumbs({ name: "Deal Room", path: routes.dealRoom })}
          />
        </div>
      </div>
      <DealRoomLandingView />
    </>
  );
}
