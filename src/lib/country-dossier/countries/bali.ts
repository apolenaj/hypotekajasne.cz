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

const LEASEHOLD = reviewClaim(
  "Cizinci standardně nenabývají freehold půdy jako v EU; běžné jsou leasehold / právo stavby přes PT PMA / lokalní struktury. Konkrétní struktura musí projít indonéským právníkem.",
  "Indonesia foreign property ownership practice",
  null
);

export const baliDossier: CountryDossier = assemble(
  "bali",
  "Bali (Indonésie)",
  "Vysoký výnosový potenciál při omezeném bankovním financování pro cizince a důrazu na právní strukturu.",
  [
    narrative("executive_summary", "Trh je atraktivní výnosově, ale vlastnictví a enforcement jsou jiné než v EU.", [
      { text: LEASEHOLD.text, claim: LEASEHOLD },
      { text: "Standardní bankovní hypotéka pro cizince v datech není — neukazujeme generických 80 % LTV." },
    ]),
    narrative("suitability", "Pro zkušenější investory s právní rezervou a hotovostí / developer schedule.", [
      { text: "Nevhodné jako „snadný pasivní příjem“ bez lokálního partnera a kontroly licence." },
    ]),
    {
      id: "ownership",
      kind: "ownership",
      title: sectionTitle("ownership"),
      summary: "Leasehold / nominace / PT — freehold pro cizince není default.",
      modelLabel: "Leasehold / korporátní struktury",
      bullets: [{ text: LEASEHOLD.text, claim: LEASEHOLD }],
    },
    {
      id: "financing",
      kind: "financing",
      title: sectionTitle("financing"),
      summary: "Bez ověřeného bankovního produktu pro cizince v našich datech.",
      lanes: [
        {
          audience: "both",
          title: "Platební plán developera",
          summary: "Fázované platby — harmonogram, ne anuita. LTV se nepoužívá.",
          linkedOptions: ["DEVELOPER_PAYMENT_PLAN"],
        },
        {
          audience: "both",
          title: "České zajištěné financování",
          summary: "Americká hypotéka v CZK jako oddělený produkt.",
          linkedOptions: ["CZECH_EQUITY_LOAN"],
        },
        { audience: "both", title: "Hotovost", summary: "Nejběžnější cesta.", linkedOptions: ["CASH"] },
      ],
    },
    {
      id: "transaction_costs",
      kind: "costs",
      title: sectionTitle("transaction_costs"),
      summary: "Notář, právní struktura, daně z převodu — projektově.",
      lines: [
        {
          label: "Právní + převod",
          range: "jednotky % + fixed fees",
          claim: modelledClaim("Záleží na lease term a struktuře.", "Bali transaction practice"),
        },
      ],
    },
    {
      id: "holding_costs",
      kind: "costs",
      title: sectionTitle("holding_costs"),
      summary: "Správa vily, staff, údržba bazénu — často vyšší než EU byt.",
      lines: [
        {
          label: "Provoz + správa",
          range: "významná měsíční položka",
          claim: modelledClaim("Operating costs can erase headline yield.", "Villa ops Bali"),
        },
      ],
    },
    narrative("rental_tax", "Daň a licence na turistický pronájem ověřte lokálně.", [
      {
        text: "Bez správné licence a daňové registrace hrozí sankce — výnos v inzerci ≠ čistý výnos.",
        claim: modelledClaim("STR tax/licensing must be verified.", "Bali tourism compliance"),
      },
    ]),
    narrative("exit", "Likvidita leasehold závisí na zbývající době nájmu a kvalitě smlouvy.", [
      { text: "Prodej nominace / PT share má právní i praktická omezení." },
    ]),
    narrative("inheritance", "Lease a korporátní podíly dědí se jinak než EU freehold — nutný plán.", [
      { text: LEASEHOLD.text, claim: LEASEHOLD },
    ]),
    narrative("fx_risk", "IDR/USD vs. CZK — vysoká volatilita možné.", [
      { text: "USD denominace neeliminuje riziko vůči CZK cash-flow." },
    ]),
    narrative("developer_risk", "Slabší enforcement a variabilní kvalita developerů.", [
      { text: "Bez escrow a právní kontroly je riziko ztráty kapitálu vyšší než v EU." },
    ]),
    narrative("short_term_rentals", "Turistický pronájem vyžaduje compliance (licence, zónování).", [
      {
        text: "Ne všechny zóny dovolují komerční short-stay.",
        claim: modelledClaim("Zoning and licences vary by kabupaten.", "Bali STR rules"),
      },
    ]),
    {
      id: "purchase_timeline",
      kind: "timeline",
      title: sectionTitle("purchase_timeline"),
      summary: "Právní struktura často trvá déle než „rezervace vily“.",
      steps: [
        { order: 1, title: "Právní struktura", detail: "Lease / PT / due diligence pozemku.", durationHint: "3–8 týdnů" },
        { order: 2, title: "Smlouva + platby", detail: "Schedule developera nebo cash.", durationHint: "dle projektu" },
        { order: 3, title: "Zápisy / notář", detail: "Lokální registrace práv.", durationHint: "2–6 týdnů" },
        { order: 4, title: "Provozní setup", detail: "Licence, správa, pojištění.", durationHint: "2–4 týdny" },
      ],
    },
    {
      id: "red_flags",
      kind: "flags",
      title: sectionTitle("red_flags"),
      summary: "Kritická rizika Bali.",
      flags: [
        { severity: "high", text: "Slib freehold pro cizince bez právní opory.", claim: LEASEHOLD },
        { severity: "high", text: "Generická „80 % hypotéka pro cizince“ bez bankovního produktu." },
        { severity: "high", text: "Platby developerovi bez escrow / právní kontroly." },
        { severity: "medium", text: "Výnos 12 %+ v inzerci bez očištění o provoz a daně." },
      ],
    },
    sourcesSection(
      {
        text: `Poslední právní review dossieru Bali: ${LEGAL_REVIEW_AS_OF}`,
        source: "Editorial HypotékaJasně.cz (po kontrole)",
        sourceUrl: null,
        asOf: LEGAL_REVIEW_AS_OF,
        status: "VERIFIED",
      },
      [LEASEHOLD]
    ),
    ctaSection("bali"),
  ]
);
