import type { Metadata } from "next";
import { DealRoomView } from "@/components/deal-room/DealRoomView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { routes } from "@/lib/routes";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return buildPageMetadata({
    title: "Transakční místnost — transakce",
    description: "Workspace pro konkrétní transakci s nemovitostí.",
    path: `${routes.dealRoom}/${id}`,
    noIndex: true,
  });
}

export default async function DealRoomWorkspacePage({ params }: Props) {
  const { id } = await params;
  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <Breadcrumbs
            items={[
              ...crumbs({ name: "Transakční místnost", path: routes.dealRoom }),
              { name: "Workspace", path: `${routes.dealRoom}/${id}` },
            ]}
          />
        </div>
      </div>
      <DealRoomView workspaceId={id} />
    </>
  );
}
