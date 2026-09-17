import { getStaticPageSeo } from "@/lib/seo/pages";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { RentgenUkazkaView } from "@/components/property-rentgen/RentgenUkazkaView";
import { routes } from "@/lib/routes";

export const metadata = getStaticPageSeo(routes.investicniRentgenUkazka);

export default function InvesticniRentgenUkazkaPage() {
  return (
    <div className="overflow-x-hidden bg-white">
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={crumbs(
            {
              name: "Investiční rentgen",
              path: routes.investicniRentgen,
            },
            {
              name: "Ukázka",
              path: routes.investicniRentgenUkazka,
            }
          )}
        />
      </div>
      <RentgenUkazkaView />
    </div>
  );
}
