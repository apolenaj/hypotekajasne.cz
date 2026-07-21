import { getStaticPageSeo } from "@/lib/seo/pages";
import { LegalView } from "@/components/sections/LegalView";

export const metadata = getStaticPageSeo("/pravni/cookies");


export default function CookiesPage() {
  return <LegalView type="cookies" />;
}
