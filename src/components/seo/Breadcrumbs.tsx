import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/seo/json-ld";
import { breadcrumbListJsonLd } from "@/lib/seo/json-ld";
import { JsonLdScript } from "@/components/seo/JsonLdScript";

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Drobečková navigace" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.path}-${i}`} className="flex items-center gap-1.5">
              {i > 0 ? (
                <span aria-hidden className="text-border">
                  /
                </span>
              ) : null}
              {last ? (
                <span className="font-medium text-text-dark" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="hover:text-deep-teal hover:underline"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <JsonLdScript data={breadcrumbListJsonLd(items)} />
    </nav>
  );
}
