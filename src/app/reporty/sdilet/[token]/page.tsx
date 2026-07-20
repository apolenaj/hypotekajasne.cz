import type { Metadata } from "next";
import { ReportSharePageClient } from "@/components/report-engine/ReportSharePageClient";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  return buildPageMetadata({
    title: "Sdílený report",
    description: "Profesionální finančně-realitní report — HypotékaJasně.cz",
    path: `/reporty/sdilet/${token}`,
    noIndex: true,
  });
}

export default async function ReportSharePage({ params }: PageProps) {
  const { token } = await params;
  return <ReportSharePageClient token={token} />;
}
