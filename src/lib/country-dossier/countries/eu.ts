import {
  assemble,
  ctaSection,
  modelledClaim,
  narrative,
  reviewClaim,
  sectionTitle,
  sourcesSection,
} from "@/lib/country-dossier/build";
import { LEGAL_REVIEW_AS_OF } from "@/lib/country-dossier/shared";
import type { CountryDossier, FinancingLane } from "@/lib/country-dossier/types";

function euFinancingLanes(maxLtvNote: string): FinancingLane[] {
  return [
    {
      audience: "non_resident",
      title: "Lokální hypotéka (nerezident)",
      summary: maxLtvNote,
      linkedOptions: ["LOCAL_MORTGAGE"],
      claim: modelledClaim(maxLtvNote, "EU non-resident mortgage practice"),
    },
    {
      audience: "both",
      title: "České zajištěné financování",
      summary: "Americká hypotéka v CZK — oddělená od lokální EUR hypotéky.",
      linkedOptions: ["CZECH_EQUITY_LOAN"],
    },
    { audience: "both", title: "Hotovost", summary: "Bez lokálního úvěru.", linkedOptions: ["CASH"] },
  ];
}

function euBase(
  id: "spain" | "italy" | "croatia" | "slovakia",
  name: string,
  tagline: string,
  ownershipNote: string,
  ltvNote: string,
  includeLocalMortgage: boolean,
  extras: {
    shortRent: string;
    timelineHint: string;
    txCosts: string;
    taxNote: string;
  }
) {
  const ownershipClaim = reviewClaim(ownershipNote, `${name} — vlastnický režim EU`, null);
  const lanes = includeLocalMortgage
    ? euFinancingLanes(ltvNote)
    : [
        {
          audience: "both" as const,
          title: "Lokální financování",
          summary: "Lokální financování individuálně ověřujeme — v datech nemáme ověřenou sazbu.",
          linkedOptions: ["UNAVAILABLE" as const],
        },
        {
          audience: "both" as const,
          title: "České zajištěné financování",
          summary: "Americká hypotéka v CZK.",
          linkedOptions: ["CZECH_EQUITY_LOAN" as const],
        },
        {
          audience: "both" as const,
          title: "Hotovost",
          summary: "Častá cesta u nerezidentů.",
          linkedOptions: ["CASH" as const],
        },
      ];

  return assemble(id, name, tagline, [
    narrative("executive_summary", tagline, [
      { text: ownershipClaim.text, claim: ownershipClaim },
      { text: "Transakční náklady a daně mohou výrazně zvýšit vstup nad kupní cenu." },
    ]),
    narrative("suitability", "Pro koho", [
      { text: "Investoři s EUR likviditou nebo zajištěním FX rizika." },
      { text: "Nerezidenti připravení na nižší LTV a delší proces než v ČR." },
    ]),
    {
      id: "ownership",
      kind: "ownership",
      title: sectionTitle("ownership"),
      summary: ownershipNote,
      modelLabel: "Freehold (obecně) / lokální výjimky",
      bullets: [{ text: ownershipClaim.text, claim: ownershipClaim }],
    },
    {
      id: "financing",
      kind: "financing",
      title: sectionTitle("financing"),
      summary: "Rezident vs. nerezident — jiné LTV a dokumentace. Bez hardcoded univerzální sazby.",
      lanes,
    },
    {
      id: "transaction_costs",
      kind: "costs",
      title: sectionTitle("transaction_costs"),
      summary: extras.txCosts,
      lines: [
        {
          label: "Daně + notář/právník + zápis",
          range: extras.txCosts,
          claim: modelledClaim(extras.txCosts, `${name} transaction cost band`),
        },
      ],
    },
    {
      id: "holding_costs",
      kind: "costs",
      title: sectionTitle("holding_costs"),
      summary: "IBI / lokalita, společenství, pojištění — ověřte u správce.",
      lines: [
        {
          label: "Roční daně + správa",
          range: "lokálně individuální",
          claim: modelledClaim(
            "Průběžné roční náklady závisí na obci a společenství vlastníků.",
            name
          ),
        },
      ],
    },
    narrative("rental_tax", extras.taxNote, [
      {
        text: extras.taxNote,
        claim: modelledClaim(extras.taxNote, `${name} rental tax — verify locally`),
      },
    ]),
    narrative("exit", "Prodej přes notáře/registr; čas na prodej závisí na lokalitě.", [
      { text: "Kapitalové zisky a withholding u nerezidentů ověřte u daňového poradce." },
    ]),
    narrative("inheritance", "EU dědické nařízení může pomoci, ale nemovitost se řídí i lex rei sitae.", [
      {
        text: "Přeshraniční dědictví plánujte — není automaticky „jako v ČR“.",
        claim: modelledClaim("Cross-border succession needs advice.", "EU Succession Regulation context"),
      },
    ]),
    narrative("fx_risk", "EUR vs. CZK — kurz ovlivňuje výnos i splátku CZK úvěru.", [
      { text: "Měnový mismatch při CZK financování zahraničního EUR aktiva." },
    ]),
    narrative("developer_risk", "Novostavby: delay, bankovní záruky, licence.", [
      { text: "U off-plan vyžadujte právní kontrolu developera a platebního plánu." },
    ]),
    narrative("short_term_rentals", extras.shortRent, [
      {
        text: extras.shortRent,
        claim: modelledClaim(extras.shortRent, `${name} STR rules`),
      },
    ]),
    {
      id: "purchase_timeline",
      kind: "timeline",
      title: sectionTitle("purchase_timeline"),
      summary: extras.timelineHint,
      steps: [
        { order: 1, title: "Due diligence", detail: "Katastr, dluhy, stavební stav.", durationHint: "2–4 týdny" },
        { order: 2, title: "Rezervace / předběžná smlouva", detail: "Depozit dle místní praxe.", durationHint: "1–2 týdny" },
        { order: 3, title: "Financování", detail: "Lokální banka nebo CZK equity / cash.", durationHint: "3–8 týdnů" },
        { order: 4, title: "Notář / převod", detail: "Podpis a zápis vlastnictví.", durationHint: "1–4 týdny" },
      ],
    },
    {
      id: "red_flags",
      kind: "flags",
      title: sectionTitle("red_flags"),
      summary: "Kritická rizika.",
      flags: [
        { severity: "high", text: "Platba mimo úschovu / mimo notářský převod." },
        { severity: "high", text: "Předpoklad 80 % LTV pro nerezidenta bez ověření banky." },
        { severity: "medium", text: "Ignorování turistických licencí u short-term." },
      ],
    },
    sourcesSection(
      {
        text: `Poslední právní review: ${LEGAL_REVIEW_AS_OF}`,
        source: "Editorial HypotékaJasně.cz (po kontrole)",
        sourceUrl: null,
        asOf: LEGAL_REVIEW_AS_OF,
        status: "VERIFIED",
      },
      [ownershipClaim]
    ),
    ctaSection(id),
  ]);
}

export const spainDossier = euBase(
  "spain",
  "Španělsko",
  "EU freehold trh; nerezidenti typicky s nižším LTV a vyššími transakčními náklady.",
  "Cizinci mohou nabývat freehold; transakce probíhá u notáře se zápisem do registru.",
  "Pro nerezidenty typicky LTV do cca 60–70 % — neautomaticky 80 %.",
  true,
  {
    shortRent:
      "VUT / turistické licence — řada obcí (vč. Baleár, částí pobřeží) reguluje nebo omezuje krátkodobé nájmy.",
    timelineHint: "Od rezervace po zápis často 6–12+ týdnů.",
    txCosts: "Orientace 10–13 % nad cenou (ITP/IVA, notář, právní).",
    taxNote:
      "Nerezidenti zdaňují příjem z nájmu v ES; domovská rezidence v ČR řeší zápočet — ověřte u poradce.",
  }
);

export const italyDossier = euBase(
  "italy",
  "Itálie",
  "Freehold s notářským převodem; nerezidentní LTV často přísnější.",
  "Vlastnictví freehold; klíčový je italský notář (notaio) a zápis.",
  "Pro nerezidenty často LTV kolem 60 % — bez ověřené sazby v našich datech.",
  false,
  {
    shortRent: "Regione / comune mohou vyžadovat CIN a omezovat short-term.",
    timelineHint: "Compromesso → rogito — počítejte s měsíci, ne dny.",
    txCosts: "Daně z převodu + notář — často vysoké jednotky % (typ nemovitosti rozhoduje).",
    taxNote: "Cedolare secca / IRPEF režimy — neplatí univerzálně pro každého nerezidenta.",
  }
);

export const croatiaDossier = euBase(
  "croatia",
  "Chorvatsko",
  "EU trh po vstupu; nerezidenti řeší zápis a případná omezení u zemědělské půdy.",
  "Občané EU nabývají nemovitosti volněji; stále ověřte typ pozemku a zápis v katastru/ZK.",
  "Nerezidentní LTV orientačně do ~70 % — sazbu individuálně ověřujeme.",
  false,
  {
    shortRent: "Turistické licence a kategorizace objektů — bez licence riskujete sankce.",
    timelineHint: "Prověrka ZK + převod — týdny až měsíce.",
    txCosts: "Převodní daň/poplatky + právní — ověřte aktuální sazby.",
    taxNote: "Příjem z nájmu zdaňujte dle chorvatských a českých pravidel rezidence.",
  }
);

export const slovakiaDossier = euBase(
  "slovakia",
  "Slovensko",
  "Blízký EU trh v EUR; financování často přes SK banky nebo CZK zajištění.",
  "Freehold se zápisem do katastra; proces podobný ČR, ale právní detaily se liší.",
  "EU rezidenti často až k vyšším LTV — bez hardcoded sazby v našich datech.",
  false,
  {
    shortRent: "Short-term může podléhat obecní regulaci a daňové evidenci.",
    timelineHint: "Podobné ČR — úschova + návrh na vklad.",
    txCosts: "Poplatky + právní služby — nižší než ES/IT typicky, stále ne nulové.",
    taxNote: "Nájem a daň z nemovitosti řešte dle SK předpisů a české rezidence.",
  }
);
