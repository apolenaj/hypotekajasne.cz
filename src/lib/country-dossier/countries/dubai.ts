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
import type { CountryDossier } from "@/lib/country-dossier/types";

const FREEHOLD_ZONES = reviewClaim(
  "Freehold pro cizince je dostupný ve vymezených designovaných zónách (např. vybrané oblasti Dubaje); mimo ně platí jiný režim.",
  "SAE / Dubai Land Department (DLD) — designované freehold zóny",
  "https://dubailand.gov.ae/"
);

export const dubaiDossier: CountryDossier = assemble(
  "dubai",
  "SAE (Dubaj)",
  "Volné vlastnictví v designovaných zónách, platební plány developera a oddělená hypotéka pro nerezidenty.",
  [
    narrative("executive_summary", "Likvidní trh na sekundárním trhu i u projektů ve výstavbě (off-plan) s důrazem na due diligence developera a zóny vlastnictví.", [
      { text: FREEHOLD_ZONES.text, claim: FREEHOLD_ZONES },
      { text: "Platební plán developera ≠ bankovní hypotéka — jde o rozvrh plateb." },
      { text: "Daň z příjmu fyzických osob z nájmu často nízká/nulová v lokálním režimu — ověřte aktuální federální/emirátová pravidla a domovskou rezidenci." },
    ]),
    narrative("suitability", "Vhodné pro investory s kapitálem na vyšší vstup a tolerancí k FX (AED) a riziku developera.", [
      { text: "Méně vhodné bez rezervy na provozní poplatky (service charges) a bez právní kontroly kupní smlouvy." },
    ]),
    {
      id: "ownership",
      kind: "ownership",
      title: sectionTitle("ownership"),
      summary: "Volné vlastnictví / nájemní právo dle zóny a projektu.",
      modelLabel: "Volné vlastnictví (designované zóny) / jinak omezeno",
      bullets: [{ text: FREEHOLD_ZONES.text, claim: FREEHOLD_ZONES }],
    },
    {
      id: "financing",
      kind: "financing",
      title: sectionTitle("financing"),
      summary: "Tři oddělené produkty: platební plán developera, hypotéka pro nerezidenty (LTV typicky nižší), české zajištění.",
      lanes: [
        {
          audience: "both",
          title: "Platební plán developera",
          summary: "Rezervace → výstavba → předání → po předání. Bez anuitní sazby banky. LTV se nepoužívá.",
          linkedOptions: ["DEVELOPER_PAYMENT_PLAN"],
        },
        {
          audience: "non_resident",
          title: "Hypotéka pro nerezidenty",
          summary: "Lokální bankovní produkt — v modelu max LTV 50 %, sazbu individuálně ověřujeme.",
          linkedOptions: ["LOCAL_MORTGAGE"],
          claim: modelledClaim(
            "Nerezidentní LTV bývá přísnější než u rezidentů; 80 % LTV zde nepoužíváme.",
            "Praxe hypoték pro nerezidenty v SAE"
          ),
        },
        {
          audience: "both",
          title: "České zajištěné financování",
          summary: "Americká hypotéka v CZK — oddělená od AED produktu.",
          linkedOptions: ["CZECH_EQUITY_LOAN"],
        },
        { audience: "both", title: "Hotovost", summary: "Bez úvěru.", linkedOptions: ["CASH"] },
      ],
    },
    {
      id: "transaction_costs",
      kind: "costs",
      title: sectionTitle("transaction_costs"),
      summary: "Poplatky DLD, agent, převod.",
      lines: [
        {
          label: "Poplatek za převod (DLD)",
          range: "orientačně kolem 4 % + admin",
          claim: modelledClaim("Sazby se mohou měnit — ověřte u DLD / právníka.", "Dubai Land Department (DLD)"),
        },
      ],
    },
    {
      id: "holding_costs",
      kind: "costs",
      title: sectionTitle("holding_costs"),
      summary: "Provozní poplatky (service charges) jsou často významná roční položka.",
      lines: [
        {
          label: "Provozní poplatky",
          range: "AED / sq.ft — projektově",
          claim: modelledClaim("Liší se věží a správcem.", "RERA / pravidla komunity"),
        },
      ],
    },
    narrative("rental_tax", "Lokální daň z příjmu FO z nájmu bývá omezená; rozhoduje i daňová rezidence v ČR.", [
      {
        text: "Neuvádíme „absolutní 0 % daň“ jako univerzální tvrzení — ověřte federální/emirátová pravidla a české zdanění zahraničních příjmů.",
        claim: modelledClaim(
          "Daňový výsledek závisí na rezidenci a struktuře vlastnictví.",
          "Interakce daňových režimů SAE a ČR"
        ),
      },
    ]),
    narrative("exit", "Sekundární trh je likvidnější u etablovaných lokalit; prodej off-plan projektu závisí na developerovi a fázi.", [
      { text: "Čas na prodej není garantovaný." },
    ]),
    narrative("inheritance", "Výchozí pravidla ovlivněná šaríou mohou platit bez testamentární struktury — plánujte dopředu.", [
      {
        text: "Závěť / struktury v DIFC-ADGM řešte s právníkem v SAE.",
        claim: modelledClaim(
          "Bez plánování může dědictví probíhat jinak, než očekává rezident EU.",
          "Praxe dědictví v SAE"
        ),
      },
    ]),
    narrative("fx_risk", "AED (navázané na USD) vs. CZK — kurzové riziko výnosu i jistiny.", [
      { text: "CZK úvěr + AED aktivum = měnový nesoulad." },
    ]),
    narrative("developer_risk", "Off-plan: zpoždění, změna dispozice, kvalita escrow.", [
      { text: "Preferujte RERA registraci a ověřený escrow — značka nestačí." },
    ]),
    narrative("short_term_rentals", "Licence pro rekreační domy / pravidla DTCM (Department of Tourism and Commerce Marketing).", [
      {
        text: "Krátkodobý pronájem obvykle vyžaduje povolení — ne počítejte s neomezeným režimem Airbnb.",
        claim: modelledClaim(
          "Pro rekreační domy v Dubaji je vyžadována licence.",
          "DTCM / pravidla cestovního ruchu v Dubaji"
        ),
      },
    ]),
    {
      id: "purchase_timeline",
      kind: "timeline",
      title: sectionTitle("purchase_timeline"),
      summary: "Od rezervace po list vlastnictví (title deed).",
      steps: [
        { order: 1, title: "Výběr + due diligence", detail: "Zóna, developer, Oqood / list vlastnictví.", durationHint: "1–3 týdny" },
        { order: 2, title: "Kupní smlouva / rezervace", detail: "Rezervační platba dle plánu.", durationHint: "1 týden" },
        { order: 3, title: "Financování / harmonogram", detail: "Bankovní NOC nebo platební plán developera.", durationHint: "2–6 týdnů" },
        { order: 4, title: "Převod / předání", detail: "DLD, list vlastnictví.", durationHint: "dle projektu" },
      ],
    },
    {
      id: "red_flags",
      kind: "flags",
      title: sectionTitle("red_flags"),
      summary: "Zastavit transakci.",
      flags: [
        { severity: "high", text: "Projekt bez ověřené RERA / escrow." },
        { severity: "high", text: "Záměna developer plánu za „schválenou hypotéku“." },
        { severity: "medium", text: "Service charges výrazně nad trhem bez vysvětlení." },
      ],
    },
    sourcesSection(
      {
        text: `Poslední právní review dossieru Dubaj: ${LEGAL_REVIEW_AS_OF}`,
        source: "HypotékaJasně.cz (redakční review)",
        sourceUrl: null,
        asOf: LEGAL_REVIEW_AS_OF,
        status: "ESTIMATE",
      },
      [FREEHOLD_ZONES]
    ),
    ctaSection("dubai"),
  ]
);
