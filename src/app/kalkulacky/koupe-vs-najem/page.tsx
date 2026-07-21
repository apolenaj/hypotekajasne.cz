import { getStaticPageSeo } from "@/lib/seo/pages";
import { BuyVsRentSection } from "@/components/sections/BuyVsRentSection";

export const metadata = getStaticPageSeo("/kalkulacky/koupe-vs-najem");

export default function KoupeVsNajemPage() {
  return <BuyVsRentSection />;
}
