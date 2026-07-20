import Link from "next/link";
import { routes } from "@/lib/routes";

/**
 * @deprecated Learning hub je na `/akademie`.
 * Ponecháno jen jako bezpečný fallback import.
 */
export function MortgageAcademyView() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-heading text-2xl font-bold text-text-dark">
        Hypoteční akademie se přesunula
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Nový learning hub se SEO URL je na{" "}
        <Link href={routes.akademie} className="font-semibold text-deep-teal underline">
          /akademie
        </Link>
        .
      </p>
    </div>
  );
}
