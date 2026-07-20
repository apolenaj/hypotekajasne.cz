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
  "UAE / Dubai Land Department — designated freehold areas",
  "https://dubailand.gov.ae/"
);

export const dubaiDossier: CountryDossier = assemble(
  "dubai",
  "SAE (Dubaj)",
  "Freehold v designovaných zónách, developer payment plans a oddělená non-resident hypotéka.",
  [
    narrative("executive_summary", "Likvidní off-plan i secondary trh s důrazem na due diligence developera a zóny vlastnictví.", [
      { text: FREEHOLD_ZONES.text, claim: FREEHOLD_ZONES },
      { text: "Developer payment plan ≠ bankovní hypotéka — jde o schedule plateb." },
      { text: "Daň z příjmu fyzických osob z nájmu často nízká/nulová v lokálním režimu — ověřte aktuální federal/emirate pravidla a domovskou rezidenci." },
    ]),
    narrative("suitability", "Vhodné pro investory s kapitálem na vyšší vstup a tolerancí k FX (AED) a developer riziku.", [
      { text: "Méně vhodné bez rezervy na service charges a bez právní kontroly SPA." },
    ]),
    {
      id: "ownership",
      kind: "ownership",
      title: sectionTitle("ownership"),
      summary: "Freehold / leasehold dle zóny a projektu.",
      modelLabel: "Freehold (designated) / jinak omezeno",
      bullets: [{ text: FREEHOLD_ZONES.text, claim: FREEHOLD_ZONES }],
    },
    {
      id: "financing",
      kind: "financing",
      title: sectionTitle("financing"),
      summary: "Tři oddělené produkty: developer plan, non-resident mortgage (LTV typicky nižší), české zajištění.",
      lanes: [
        {
          audience: "both",
          title: "Developer payment plan",
          summary: "Booking → výstavba → handover → post-handover. Bez anuitní sazby banky.",
          linkedOptions: ["DEVELOPER_PAYMENT_PLAN"],
        },
        {
          audience: "non_resident",
          title: "Non-resident hypotéka",
          summary: "Lokální bankovní produkt — v modelu max LTV 50 %, sazbu individuálně ověřujeme.",
          linkedOptions: ["LOCAL_MORTGAGE"],
          claim: modelledClaim(
            "Nerezidentní LTV bývá přísnější než u rezidentů; 80 % LTV zde nepoužíváme.",
            "UAE non-resident mortgage practice"
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
      summary: "DLD poplatky, agent, převod.",
      lines: [
        {
          label: "DLD transfer fee",
          range: "orientačně kolem 4 % + admin",
          claim: modelledClaim("Sazby se mohou měnit — ověřte u DLD / právníka.", "Dubai Land Department"),
        },
      ],
    },
    {
      id: "holding_costs",
      kind: "costs",
      title: sectionTitle("holding_costs"),
      summary: "Service charges jsou často významná roční položka.",
      lines: [
        {
          label: "Service charges",
          range: "AED / sq.ft — projektově",
          claim: modelledClaim("Liší se věží a správcem.", "RERA / community"),
        },
      ],
    },
    narrative("rental_tax", "Lokální daň z příjmu FO z nájmu bývá omezená; rozhoduje i daňová rezidence v ČR.", [
      {
        text: "Neuvádíme „absolutní 0 % daň“ jako univerzální tvrzení — ověřte federal/emirate pravidla a české zdanění zahraničních příjmů.",
        claim: modelledClaim("Tax outcome depends on residency and structure.", "UAE + CZ tax interaction"),
      },
    ]),
    narrative("exit", "Secondary trh je likvidnější u etablovaných lokalit; off-plan exit závisí na developerovi a fázi.", [
      { text: "Čas na prodej není garantovaný." },
    ]),
    narrative("inheritance", "Sharia-influenced default rules mohou platit bez testamentární struktury — plánujte dopředu.", [
      {
        text: "Will / DIFC-ADGM struktury řešte s UAE právníkem.",
        claim: modelledClaim("Bez plánování může dědictví probíhat jinak, než očekává EU rezident.", "UAE succession practice"),
      },
    ]),
    narrative("fx_risk", "AED (navázané na USD) vs. CZK — kurzové riziko výnosu i jistiny.", [
      { text: "CZK úvěr + AED aktivum = měnový mismatch." },
    ]),
    narrative("developer_risk", "Off-plan: delay, změna layoutu, escrow kvalita.", [
      { text: "Preferujte RERA registraci a ověřený escrow — značka nestačí." },
    ]),
    narrative("short_term_rentals", "Holiday homes licence / DTCM pravidla.", [
      {
        text: "Krátkodobý pronájem obvykle vyžaduje povolení — ne počítejte s neomezeným Airbnb režimem.",
        claim: modelledClaim("Licensing required for holiday homes in Dubai.", "DTCM / Dubai tourism rules"),
      },
    ]),
    {
      id: "purchase_timeline",
      kind: "timeline",
      title: sectionTitle("purchase_timeline"),
      summary: "Od rezervace po title deed.",
      steps: [
        { order: 1, title: "Výběr + due diligence", detail: "Zóna, developer, Oqood/title.", durationHint: "1–3 týdny" },
        { order: 2, title: "SPA / booking", detail: "Rezervační platba dle plánu.", durationHint: "1 týden" },
        { order: 3, title: "Financování / schedule", detail: "Bankovní NOC nebo developer schedule.", durationHint: "2–6 týdnů" },
        { order: 4, title: "Transfer / handover", detail: "DLD, title deed.", durationHint: "dle projektu" },
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
        source: "HypotékaJasně.cz editorial legal review",
        sourceUrl: null,
        asOf: LEGAL_REVIEW_AS_OF,
        status: "VERIFIED",
      },
      [FREEHOLD_ZONES]
    ),
    ctaSection("dubai"),
  ]
);
