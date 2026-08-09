import type { Metadata } from "next";
import { ContactView } from "@/components/sections/ContactView";
import { getStaticPageSeo } from "@/lib/seo/pages";
import { routes } from "@/lib/routes";

export const metadata: Metadata = getStaticPageSeo(routes.kontakt);

export default function KontaktPage() {
  return <ContactView />;
}
