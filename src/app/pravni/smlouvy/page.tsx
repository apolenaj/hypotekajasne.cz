import { getStaticPageSeo } from "@/lib/seo/pages";
import { LegalView } from "@/components/sections/LegalView";

export const metadata = getStaticPageSeo("/pravni/smlouvy");

export default function SmlouvyPage() {
  return <LegalView type="smlouvy" />;
}
