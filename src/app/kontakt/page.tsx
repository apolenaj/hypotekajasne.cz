import { getStaticPageSeo } from "@/lib/seo/pages";
import { ContactView } from "@/components/sections/ContactView";

export const metadata = getStaticPageSeo("/kontakt");

export default function KontaktPage() {
  return <ContactView />;
}
