import { KalkulackyView } from "@/components/pages/KalkulackyView";
import { getStaticPageSeo } from "@/lib/seo/pages";

export const metadata = getStaticPageSeo("/kalkulacky/koupe-vs-najem");

export default function KoupeVsNajemPage() {
  return (
    <>
      <h1 className="sr-only">
        Koupě vs. nájem — vlastní bydlení, nebo platit nájem majiteli
      </h1>
      <KalkulackyView />
    </>
  );
}
