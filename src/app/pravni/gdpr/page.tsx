import { getStaticPageSeo } from "@/lib/seo/pages";
import { LegalView } from "@/components/sections/LegalView";

export const metadata = getStaticPageSeo("/pravni/gdpr");

export default function GdprPage() {
  return <LegalView type="gdpr" />;
}
