import Link from "next/link";
import { TEAM_MEMBERS } from "@/lib/trust";
import { routes } from "@/lib/routes";

/**
 * Tým — jen reálná jména ze SoT; bez falešných fotek / LinkedIn.
 */
export function HomeTeamStrip() {
  return (
    <section
      aria-labelledby="home-team-heading"
      className="border-b border-border bg-[#f7f8f7]"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-deep-teal">
              Tým
            </p>
            <h2
              id="home-team-heading"
              className="mt-2 font-heading text-2xl font-bold text-text-dark"
            >
              Kdo za platformou stojí
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Zobrazujeme jen ověřené údaje. Fotografie a LinkedIn neuvádíme,
              dokud nejsou dodané.
            </p>
          </div>
          <Link
            href={routes.oNas}
            className="text-sm font-semibold text-deep-teal underline-offset-4 hover:underline"
          >
            Více o nás →
          </Link>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {TEAM_MEMBERS.map((m) => (
            <li
              key={m.id}
              className="flex gap-4 rounded-xl border border-border bg-white p-4 sm:p-5"
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-deep-teal/10 font-heading text-sm font-bold text-deep-teal"
                aria-hidden
              >
                {m.initials}
              </span>
              <div className="min-w-0">
                <p className="font-heading text-lg font-semibold text-text-dark">
                  {m.name}
                </p>
                <p className="mt-0.5 text-sm font-medium text-deep-teal">
                  {m.role}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {m.contentResponsibility}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
