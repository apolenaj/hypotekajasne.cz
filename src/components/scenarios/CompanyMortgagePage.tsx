"use client";

import { useCallback, useState } from "react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { CompanyFinanceCalculator } from "@/components/scenarios/CompanyFinanceCalculator";
import { ScenarioShell } from "@/components/scenarios/ScenarioShell";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { SEO_LANDING_HUB } from "@/lib/seo/landings";
import { scenarioRoutes, SCENARIO_SOURCES } from "@/lib/scenarios/sources";
import { getLandingPath } from "@/lib/seo/landings";
import { routes } from "@/lib/routes";

export function CompanyMortgagePage({
  mode = "topic",
}: {
  mode?: "topic" | "calculator";
}) {
  const [summary, setSummary] = useState<Record<string, unknown>>({});
  const onSummary = useCallback((s: Record<string, unknown>) => {
    setSummary(s);
  }, []);

  const path = scenarioRoutes.companyTopic;
  const calcOnly = mode === "calculator";

  return (
    <>
      <div className="border-b border-border bg-[#f7f8f7]">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={crumbs(
              calcOnly
                ? { name: "Kalkulačky", path: routes.kalkulacky.root }
                : { name: "Témata", path: SEO_LANDING_HUB.path },
              {
                name: calcOnly
                  ? "Kalkulačka financování firmy"
                  : "Hypotéka na firmu",
                path: calcOnly ? scenarioRoutes.companyCalc : path,
              }
            )}
          />
        </div>
      </div>

      <ScenarioShell
        eyebrow="Účel financování · právnická osoba"
        h1="Hypotéka na firmu: jak financovat nemovitost přes s.r.o."
        lead="Většinou nejde o klasickou spotřebitelskou hypotéku, ale o podnikatelský nebo investiční úvěr zajištěný nemovitostí. Dlužníkem a kupujícím je společnost — to je jiný příběh než hypotéka fyzické osoby s příjmy z OSVČ."
        primaryCta={{
          label: "Prověřit financování firmy",
          href: "#poptavka",
        }}
        secondaryCta={{
          label: calcOnly ? "Celý průvodce" : "Přejít na výpočet",
          href: calcOnly ? path : "#kalkulacka",
        }}
        toc={[
          { id: "prehled", label: "Přehled" },
          { id: "odliseni", label: "Odlišení" },
          { id: "kalkulacka", label: "Kalkulačka" },
          { id: "postup", label: "Postup" },
          { id: "doklady", label: "Doklady" },
          { id: "srovnani", label: "Srovnání" },
          { id: "faq", label: "FAQ" },
          { id: "poptavka", label: "Poptávka" },
        ]}
        keyCards={[
          {
            title: "Kdo je dlužník",
            text: "U firemního úvěru je dlužníkem společnost. Osobní hypotéka OSVČ zůstává úvěrem fyzické osoby.",
          },
          {
            title: "Co banka sleduje",
            text: "Hospodaření, peněžní tok, závazky, vlastní kapitál, účel, zajištění a proveditelnost projektu.",
          },
          {
            title: "Sazba",
            text: "Veřejná sazba „od“ u firem často chybí. Počítejte s modelovou sazbou a individuálním posouzením.",
          },
        ]}
        faq={[
          {
            question: "Je hypotéka na firmu totéž co hypotéka pro OSVČ?",
            answer:
              "Ne. OSVČ žádá jako fyzická osoba. Firma je samostatný dlužník s účetnictvím a jinými podklady. Pro OSVČ použijte samostatný průvodce.",
          },
          {
            question: "Musí majitel vždy ručit?",
            answer:
              "Ne vždy. Banka ale může požadovat ručení vlastníků nebo další zástavu. Záleží na kapitálu firmy, projektu a riziku — není to univerzální povinnost.",
          },
          {
            question: "Znamená koupě přes s.r.o. daňovou výhodu?",
            answer:
              "Automaticky ne. Ani odpočet DPH, ani ochrana osobního majetku při osobním ručení nejsou zaručené. Daňové dopady řešte s poradcem.",
          },
        ]}
        sources={[
          SCENARIO_SOURCES.kbCorporateRe,
          SCENARIO_SOURCES.rbHypoteky,
          SCENARIO_SOURCES.cnbInvestmentLimits,
        ]}
        leadTitle="Prověřit financování firmy"
        leadNotes={`Scénář: hypotéka na firmu. Souhrn modelu: ${JSON.stringify(summary)}`}
        leadMetadata={{
          page_intent: "company_mortgage",
          calculatorType: "company_finance",
          sourcePage: calcOnly
            ? scenarioRoutes.companyCalc
            : scenarioRoutes.companyTopic,
          ...summary,
        }}
      >
        <section id="odliseni" className="mt-10 scroll-mt-28">
          <h2 className="font-heading text-2xl font-bold text-text-dark">
            Tři různé situace, které se často pletou
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-text-dark">Soukromá hypotéka s příjmy z podnikání</strong>{" "}
              — dlužníkem jste vy; viz{" "}
              <a
                className="text-deep-teal hover:underline"
                href={getLandingPath("hypoteka-osvc")}
              >
                Hypotéka pro OSVČ
              </a>
              .
            </li>
            <li>
              <strong className="text-text-dark">Úvěr, kde kupuje a dluží společnost</strong>{" "}
              — tento průvodce.
            </li>
            <li>
              <strong className="text-text-dark">Developerské financování projektu</strong>{" "}
              — výnos z prodeje a etapizace stavby vyžadují individuální model, ne běžnou anuitu z nájmu.
            </li>
          </ul>
        </section>

        <section id="kalkulacka" className="mt-10 scroll-mt-28">
          <CompanyFinanceCalculator onSummary={onSummary} />
        </section>

        <section id="postup" className="mt-10 scroll-mt-28">
          <h2 className="font-heading text-2xl font-bold text-text-dark">
            Praktický postup
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Upřesněte účel: vlastní provoz, pronájem, nebo výstavba k prodeji.</li>
            <li>Spočítejte orientační splátku a LTV z odhadnuté hodnoty zástavy.</li>
            <li>Připravte účetní a vlastnické podklady — obrat není zisk ani volné peníze na splátky.</li>
            <li>Oddělte splatnost (jak dlouho splácíte), amortizaci (jak klesá jistina) a fixaci (jak dlouho drží sazba).</li>
            <li>Ověřte podmínky předčasného splacení a průběžné povinnosti ve firemní smlouvě.</li>
          </ol>
        </section>

        <section id="doklady" className="mt-10 scroll-mt-28">
          <h2 className="font-heading text-2xl font-bold text-text-dark">
            Banka může požadovat
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>identifikaci společnosti, vlastnickou strukturu a skutečného majitele;</li>
            <li>účetní závěrky, daňová přiznání a aktuální výsledky;</li>
            <li>výpisy a přehled závazků;</li>
            <li>podnikatelský záměr a finanční plán;</li>
            <li>kupní dokumentaci, ocenění a údaje o nemovitosti;</li>
            <li>nájemní smlouvy nebo podklady k plánovanému pronájmu;</li>
            <li>zdroj vlastních prostředků;</li>
            <li>podklady k zajištění a případným ručitelům.</li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Počet účetních období není univerzální pravidlo — liší se banka od banky.
          </p>
        </section>

        <section id="srovnani" className="mt-10 scroll-mt-28">
          <h2 className="font-heading text-2xl font-bold text-text-dark">
            Srovnání žadatelů
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="py-2 pr-3">Hledisko</th>
                  <th className="py-2 pr-3">Fyzická osoba</th>
                  <th className="py-2 pr-3">OSVČ</th>
                  <th className="py-2">Společnost</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-2 pr-3 text-text-dark">Dlužník</td>
                  <td className="py-2 pr-3">Člověk</td>
                  <td className="py-2 pr-3">Člověk podnikatel</td>
                  <td className="py-2">Právnická osoba</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-3 text-text-dark">Příjmy</td>
                  <td className="py-2 pr-3">Mzda / jiné</td>
                  <td className="py-2 pr-3">Daňový základ / metodika banky</td>
                  <td className="py-2">Hospodářský výsledek a cash flow</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-3 text-text-dark">Podklady</td>
                  <td className="py-2 pr-3">Potvrzení o příjmu</td>
                  <td className="py-2 pr-3">DP, výpisy</td>
                  <td className="py-2">Účetnictví, struktura, plán</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 text-text-dark">Posouzení</td>
                  <td className="py-2 pr-3">Spotřebitelský rámec</td>
                  <td className="py-2 pr-3">Underwriting OSVČ</td>
                  <td className="py-2">Firemní / investiční úvěr</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Tabulka neříká, která forma je daňově nejlepší.
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-border p-5 text-sm text-muted-foreground">
          <h2 className="font-heading text-lg font-semibold text-text-dark">
            Modelový příklad
          </h2>
          <p className="mt-2">
            Firma kupuje nemovitost za 8&nbsp;000&nbsp;000&nbsp;Kč, má
            2&nbsp;500&nbsp;000&nbsp;Kč vlastních peněz a modelovou sazbu
            5,5&nbsp;% p.&nbsp;a. na 20 let. Kalkulačka ukáže potřebu úvěru,
            splátku a LTV jen pokud zadáte hodnotu zástavy. Bez zástavy uvidíte
            „LTV nelze určit“, ne nulu.
          </p>
        </section>
      </ScenarioShell>
    </>
  );
}
