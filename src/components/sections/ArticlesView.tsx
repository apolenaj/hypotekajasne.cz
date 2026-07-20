import Link from "next/link";
import { routes } from "@/lib/routes";

/**
 * @deprecated Magazín je SSR na `/clanky` a `/clanky/[slug]`.
 */
export function ArticlesView() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="text-sm text-muted-foreground">
        Magazín najdete na{" "}
        <Link href={routes.clanky} className="font-semibold text-deep-teal underline">
          /clanky
        </Link>
        .
      </p>
    </div>
  );
}
