"use client";

import { useCallback, useState } from "react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ConstructionFinanceCalculator } from "@/components/scenarios/ConstructionFinanceCalculator";
import { ScenarioShell } from "@/components/scenarios/ScenarioShell";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { SEO_LANDING_HUB } from "@/lib/seo/landings";
import { scenarioRoutes, SCENARIO_SOURCES } from "@/lib/scenarios/sources";
import { routes } from "@/lib/routes";

export function ConstructionMortgagePage({
  mode = "topic",
}: {
  mode?: "topic" | "calculator";
}) {
  const [summary, setSummary] = useState<Record<string, unknown>>({});
  const onSummary = useCallback((s: Record<string, unknown>) => {
    setSummary(s);
  }, []);
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
                  ? "Kalkulačka výstavby"
                  : "Výstavba a novostavba",
                path: calcOnly
                  ? scenarioRoutes.constructionCalc
                  : scenarioRoutes.constructionTopic,
              }
            )}
          />
        </div>
      </div>

      <ScenarioShell
        eyebrow="Účel financování"
        h1="Hypotéka na výstavbu a novostavbu: od pozemku po nastěhování"
        lead="Stavba a koupě novostavby mají jiné etapy než hotový byt z druhé ruky. Schválení úvěru ještě neznamená, že smíte čerpat — a náklady stavby nemusí odpovídat budoucí bankovní hodnotě."
        primaryCta={{
          label: "Prověřit financování výstavby",
          href: "#poptavka",
        }}
        secondaryCta={{
          label: calcOnly ? "Celý průvodce" : "Přejít na výpočet",
          href: calcOnly
            ? scenarioRoutes.constructionTopic
            : "#kalkulacka",
        }}
        toc={[
          { id: "prehled", label: "Přehled" },
          { id: "varianty", label: "Varianty" },
          { id: "kalkulacka", label: "Kalkulačka" },
          { id: "postup", label: "Postup" },
          { id: "rozpocet", label: "Rozpočet" },
          { id: "developer", label: "Developer" },
          { id: "faq", label: "FAQ" },
          { id: "poptavka", label: "Poptávka" },
        ]}
        keyCards={[
          {
            title: "Pozemek ≠ hotovost",
            text: "Vlastní pozemek může pomoci se zajištěním, ale neplatí faktury za stavbu.",
          },
          {
            title: "Schválení ≠ čerpání",
            text: "Po schválení musíte splnit podmínky jednotlivých čerpání.",
          },
          {
            title: "Úroky během stavby",
            text: "U odpovídajícího produktu se často platí úroky z vyčerpané částky — režim stanoví smlouva.",
          },
        ]}
        faq={[
          {
            question: "Co je zálohové čerpání?",
            answer:
              "U některých produktů banka uvolňuje peníze podle schváleného rozpočtu a harmonogramu. Neznamená to volné použití bez podmínek — obvykle následuje kontrola postupu.",
          },
          {
            question: "Kdy začíná fixace?",
            answer:
              "Nemusí začínat až nastěhováním. Termín stanoví smlouva — ověřte ho před podpisem.",
          },
          {
            question: "Stačí levnější rozpočet než budoucí hodnota?",
            answer:
              "Náklady stavby a bankovní hodnota se mohou lišit. Nedostatečná hodnota zástavy nebo zdražení mohou vytvořit potřebu dalších vlastních peněz.",
          },
        ]}
        sources={[
          SCENARIO_SOURCES.kbConstruction,
          SCENARIO_SOURCES.kbDeveloper,
          SCENARIO_SOURCES.csasConstruction,
        ]}
        leadTitle="Prověřit financování výstavby"
        leadNotes={`Scénář: výstavba / novostavba. Souhrn: ${JSON.stringify(summary)}`}
        leadMetadata={{
          page_intent: "construction_mortgage",
          calculatorType: "construction_finance",
          sourcePage: calcOnly
            ? scenarioRoutes.constructionCalc
            : scenarioRoutes.constructionTopic,
          ...summary,
        }}
      >
        <section id="varianty" className="mt-10 scroll-mt-28">
          <h2 className="font-heading text-2xl font-bold text-text-dark">
            Zvolte variantu
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Kalkulačka umí koupi pozemku se stavbou, vlastní pozemek, rozestavěnou
            novostavbu od developera i hotovou novostavbu. U hotové novostavby
            nepotřebujete vyplňovat rozpočet hrubé stavby.
          </p>
        </section>

        <section id="kalkulacka" className="mt-10 scroll-mt-28">
          <ConstructionFinanceCalculator onSummary={onSummary} />
        </section>

        <section id="postup" className="mt-10 scroll-mt-28">
          <h2 className="font-heading text-2xl font-bold text-text-dark">
            Postup u vlastní výstavby
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Prověření pozemku: výstavba, přístup, sítě, omezení, právní stav.</li>
            <li>Předběžné posouzení rozpočtu a financování před nevratnými závazky.</li>
            <li>Projekt, průzkumy a potřebná povolení.</li>
            <li>Položkový rozpočet, harmonogram a rezerva.</li>
            <li>Ocenění současné i budoucí hodnoty.</li>
            <li>Posouzení klienta, zástavy a proveditelnosti stavby.</li>
            <li>Smlouva a podmínky jednotlivých čerpání.</li>
            <li>Postupné čerpání a kontrola postupu.</li>
            <li>Dokončení, doklady a přechod na pravidelné splácení.</li>
          </ol>
        </section>

        <section id="rozpocet" className="mt-10 scroll-mt-28">
          <h2 className="font-heading text-2xl font-bold text-text-dark">
            Co patří do rozpočtu
          </h2>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>pozemek, pokud se teprve kupuje;</li>
            <li>projekt, průzkumy, povolení, přípojky;</li>
            <li>stavba, technologie, dokončení a venkovní úpravy;</li>
            <li>vybavení domácnosti (nemusí být celé v účelové hypotéce);</li>
            <li>rezerva a financování během výstavby;</li>
            <li>současný nájem nebo jiné souběžné bydlení.</li>
          </ul>
        </section>

        <section id="developer" className="mt-10 scroll-mt-28">
          <h2 className="font-heading text-2xl font-bold text-text-dark">
            Novostavba od developera
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>rezervace, zálohy a smlouva o smlouvě budoucí;</li>
            <li>platební kalendář a možnost zřízení zástavy;</li>
            <li>koordinace s bankou financující developera;</li>
            <li>termín dokončení, předání a důsledky zpoždění;</li>
            <li>platnost podmínek hypotéky a kontrola kupní dokumentace.</li>
          </ul>
        </section>
      </ScenarioShell>
    </>
  );
}
