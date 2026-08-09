import type { Metadata } from "next";
import { AboutUsView } from "@/components/sections/AboutUsView";
import { getStaticPageSeo } from "@/lib/seo/pages";
import { routes } from "@/lib/routes";

export const metadata: Metadata = getStaticPageSeo(routes.oNas);

export default function ONasPage() {
  return <AboutUsView />;
}
