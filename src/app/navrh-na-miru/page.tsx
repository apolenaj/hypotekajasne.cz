import { getStaticPageSeo } from "@/lib/seo/pages";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { MortgageReadinessWizard } from "@/components/mortgage-readiness/MortgageReadinessWizard";
import { routes } from "@/lib/routes";

export const metadata = getStaticPageSeo("/navrh-na-miru");

export default function NavrhNaMiruPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <Breadcrumbs
          items={crumbs({
            name: "Hypoteční připravenost",
            path: routes.navrhNaMiru,
          })}
        />
      </div>
      <MortgageReadinessWizard />
    </div>
  );
}
