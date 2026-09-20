"use client";

import { useCallback, useState } from "react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FutureRentCalculator } from "@/components/scenarios/FutureRentCalculator";
import { ScenarioShell } from "@/components/scenarios/ScenarioShell";
import { crumbs } from "@/lib/seo/breadcrumbs";
import { getLandingPath, SEO_LANDING_HUB } from "@/lib/seo/landings";
import { scenarioRoutes, SCENARIO_SOURCES } from "@/lib/scenarios/sources";
import { routes } from "@/lib/routes";

export function FutureRentPage({
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
                  ? "Kalkulačka budoucího nájmu"
                  : "Budoucí příjem z nájmu",
                path: calcOnly
                  ? scenarioRoutes.rentCalc
                  : scenarioRoutes.rentTopic,
              }
            )}
          />
        </div>
      </div>

      <ScenarioShell
        eyebrow="Příjmy a žadatel"
        h1="Budoucí příjem z nájmu: může pomoci při žádosti o hypotéku?"
        lead="Nájem může vstoupit do posouzení bonity — ale jen v rozsahu, který konkrétní banka uzná. Oddělujeme modelově uznaný příjem od peněz, které vám po nákladech a splátce skutečně zůstanou."
        primaryCta={{
          label: "Prověřit započtení nájmu",
          href: "#poptavka",
        }}
        secondaryCta={{
          label: calcOnly ? "Celý průvodce" : "Přejít na výpočet",
          href: calcOnly ? scenarioRoutes.rentTopic : "#kalkulacka",
        }}
        toc={[
          { id: "prehled", label: "Přehled" },
          { id: "typy", label: "Typy nájmu" },
          { id: "kalkulacka", label: "Kalkulačka" },
          { id: "doklady", label: "Doklady" },
          { id: "cnb", label: "ČNB" },
          { id: "faq", label: "FAQ" },
          { id: "poptavka", label: "Poptávka" },
        ]}
        keyCards={[
          {
            title: "Uznání ≠ zisk",
            text: "Uznaný příjem pro bonitu není totéž co čistý zisk z pronájmu.",
          },
          {
            title: "Bez služeb",
            text: "Do modelu zadávejte nájemné bez záloh na energie a služby. Kauce není příjem.",
          },
          {
            title: "Model, ne banka",
            text: "Podíly 0–80 % jsou ilustrativní scénáře, ne metodika pojmenované banky.",
          },
        ]}
        faq={[
          {
            question: "Stačí budoucí nájemní smlouva?",
            answer:
              "Záleží na bance a produktu. Někdy pomůže smlouva nebo odhad obvyklého nájemného, jindy banka budoucí nájem neuzná vůbec.",
          },
          {
            question: "Platí limity ČNB i na firmu?",
            answer:
              "Doporučení ČNB k investičním hypotékám cílí na spotřebitelské úvěry na obytné nemovitosti. Na právnické osoby je nepřenášejte automaticky.",
          },
          {
            question: "Krátkodobé ubytování je totéž co nájem?",
            answer:
              "Ne. Krátkodobé ubytování nelze automaticky posoudit jako dlouhodobý nájem.",
          },
        ]}
        sources={[
          SCENARIO_SOURCES.cnbInvestmentLimits,
          SCENARIO_SOURCES.rbHypoteky,
        ]}
        leadTitle="Prověřit započtení nájmu"
        leadNotes={`Scénář: budoucí příjem z nájmu. Souhrn: ${JSON.stringify(summary)}`}
        leadMetadata={{
          page_intent: "future_rental_income",
          calculatorType: "future_rent",
          sourcePage: calcOnly
            ? scenarioRoutes.rentCalc
            : scenarioRoutes.rentTopic,
          ...summary,
        }}
      >
        <section id="typy" className="mt-10 scroll-mt-28">
          <h2 className="font-heading text-2xl font-bold text-text-dark">
            Jaký nájem řešíte?
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Již existující doložitelný nájem.</li>
            <li>Budoucí pronájem kupované nemovitosti.</li>
            <li>Budoucí pronájem již vlastněné nemovitosti.</li>
            <li>
              Krátkodobé ubytování — nelze automaticky brát jako dlouhodobý
              nájem.
            </li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            Související téma:{" "}
            <a
              href={getLandingPath("investicni-hypoteka")}
              className="text-deep-teal hover:underline"
            >
              investiční hypotéka
            </a>
            .
          </p>
        </section>

        <section id="kalkulacka" className="mt-10 scroll-mt-28">
          <FutureRentCalculator onSummary={onSummary} />
        </section>

        <section id="doklady" className="mt-10 scroll-mt-28">
          <h2 className="font-heading text-2xl font-bold text-text-dark">
            Možné podklady
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>nájemní nebo budoucí nájemní smlouva;</li>
            <li>odhad obvyklého nájemného;</li>
            <li>doklady k vlastnictví či zamýšlené koupi;</li>
            <li>u stávajícího nájmu výpisy a případně daňové podklady;</li>
            <li>další dokumenty podle konkrétní banky.</li>
          </ul>
        </section>

        <section id="cnb" className="mt-10 scroll-mt-28">
          <h2 className="font-heading text-2xl font-bold text-text-dark">
            Co říká ČNB o investičních hypotékách
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Bankovní rada ČNB 27.&nbsp;11.&nbsp;2025 doporučila u investičních
            hypoték obezřetnější LTV 70&nbsp;% a DTI 7 s platností od
            1.&nbsp;4.&nbsp;2026. Jde o <strong className="text-text-dark">doporučení</strong>,
            ne o automatický přenos na všechny produkty a právnické osoby.
            Investiční hypotékou ČNB rozumí úvěr na třetí a další obytnou
            nemovitost nebo na nemovitost určenou k pronájmu.
          </p>
        </section>
      </ScenarioShell>
    </>
  );
}
