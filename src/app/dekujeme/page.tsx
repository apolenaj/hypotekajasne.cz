import { ThankYouView } from "@/components/forms/ThankYouView";
import { getStaticPageSeo } from "@/lib/seo/pages";
import { routes } from "@/lib/routes";

export const metadata = getStaticPageSeo(routes.dekujeme);

type PageProps = {
  searchParams: Promise<{ source?: string }>;
};

export default async function DekujemePage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <ThankYouView sourceParam={params.source ?? null} />;
}
