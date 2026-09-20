import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { crumbs } from "@/lib/seo/breadcrumbs";
import {
  PRACTICAL_GROUPS,
  PRACTICAL_TOPICS,
  topicsInGroup,
} from "@/lib/practical-situations/catalog";
import { routes } from "@/lib/routes";

export function PracticalSituationsHub() {
  return (
    <div className="bg-white">
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={crumbs({
              name: "Praktické situace",
              path: routes.pruvodce.praktickeSituace,
            })}
          />
        </div>
        <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
            Průvodce
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-dark sm:text-4xl">
            Praktické hypoteční situace
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Jak řešit konkrétní konstelaci žadatelů, nemovitosti a rozpočtu.
            Každé téma má krátkou odpověď, postup, podklady a odkaz na relevantní
            kalkulačku. Nejde o právní jistotu ani o schválení bankou.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={routes.kalkulacky.rodinnyRozpocet}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-deep-teal px-5 text-sm font-semibold text-white hover:bg-deep-teal-light"
            >
              Rodinný rozpočet
            </Link>
            <Link
              href={routes.kalkulacky.odhadVersusKupniCena}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-white px-5 text-sm font-semibold text-text-dark hover:border-deep-teal/40"
            >
              Odhad versus kupní cena
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
        {PRACTICAL_GROUPS.map((group) => {
          const topics = topicsInGroup(group.id);
          return (
            <section key={group.id} aria-labelledby={`group-${group.id}`}>
              <h2
                id={`group-${group.id}`}
                className="font-heading text-2xl font-bold text-text-dark"
              >
                {group.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {group.description}
              </p>
              <ul className="mt-5 space-y-3">
                {topics.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={`${routes.temata}/${t.slug}`}
                      className="block rounded-xl border border-border px-5 py-4 transition-colors hover:border-deep-teal/40"
                    >
                      <span className="font-heading text-lg font-semibold text-text-dark">
                        {t.title}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {t.lead}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <p className="text-xs text-muted-foreground">
          Celkem {PRACTICAL_TOPICS.length} témat. Obsah navazuje na scénáře
          firmy, nájmu a výstavby — duplicitní „mega stránku“ nevytváříme.
        </p>
      </div>
    </div>
  );
}
