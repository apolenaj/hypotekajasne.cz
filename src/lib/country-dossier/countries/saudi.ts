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

const REGA_LAW = reviewClaim(
  "Law on Real Estate Ownership by Non-Saudis (Royal Decree M/14) vstoupil v účinnost 22. 1. 2026. Nahrazuje dřívější fragmentovaný režim založený převážně na individuálních povoleních a zavádí zónový rámec vlastnictví/práv k nemovitostem pro nesaúdské osoby.",
  "REGA — Non-Saudi Property Ownership System",
  "https://rega.gov.sa/en/media-center/news-announcements/rega-non-saudi-property-ownership-system-enters-into-force-as-of-today/"
);

const ZONE_CLAIM = reviewClaim(
  "Dostupnost vlastnictví závisí na geografické zóně a kategorii nabyvatele (rezident / nerezident / právnická osoba). Umístění v povolené zóně samo o sobě neznamená automatickou způsobilost kupujícího.",
  "REGA / Geographic Scope — Non-Saudi ownership",
  "https://saudiproperties.rega.gov.sa"
);

const PREMIUM_RESIDENCY_CLAIM = reviewClaim(
  "Program Premium Residency zůstává samostatnou migrační/resi cestou a není jedinou podmínkou vlastnictví pod novým zákonem. Nový režim doplňuje — nenahrazuje — Premium Residency; podmínky a limity ověřujte aktuálně.",
  "Premium Residency + Law on Non-Saudi Real Estate Ownership (2026)",
  "https://rega.gov.sa/en/media-center/news-announcements/rega-non-saudi-property-ownership-system-enters-into-force-as-of-today/"
);

const HOLY_CITIES = reviewClaim(
  "Mekka a Medina podléhají zpřísněným omezením; vlastnictví je výrazně limitované (mj. náboženské a zónové podmínky).",
  "Non-Saudi ownership rules — Makkah / Madinah",
  "https://rega.gov.sa/"
);

export const saudiDossier: CountryDossier = assemble(
  "saudi",
  "Saúdská Arábie",
  "Od ledna 2026 platí Non-Saudi Property Ownership — zónový rámec, ne jen Premium Residency.",
  [
    narrative(
      "executive_summary",
      "Od 22. 1. 2026 platí jednotný zákon o vlastnictví nemovitostí nesaúdskými osobami. Hlavní otázka už není jen „máte Premium Residency?“, ale zda nemovitost leží v povolené geografické zóně a splňujete kategorii nabyvatele.",
      [
        { text: REGA_LAW.text, claim: REGA_LAW },
        { text: ZONE_CLAIM.text, claim: ZONE_CLAIM },
        { text: PREMIUM_RESIDENCY_CLAIM.text, claim: PREMIUM_RESIDENCY_CLAIM },
        { text: HOLY_CITIES.text, claim: HOLY_CITIES },
      ]
    ),
    narrative("suitability", "Pro koho dává KSA smysl po reformě 2026", [
      { text: "Investoři připravení ověřit zónu na oficiálním portálu Saudi Properties a absolvovat digitální identifikaci." },
      { text: "Rezidenti s Iqama i nerezidenti — cesty se liší (digitální identita přes zastupitelství u nerezidentů)." },
      { text: "Nevhodné bez tolerance k regulatorní změně, poplatkům za dispozici a omezením v posvátných městech." },
    ]),
    {
      id: "ownership",
      kind: "ownership",
      title: sectionTitle("ownership"),
      summary: "Title / věcná práva v povolených zónách — registrace v národním registru.",
      modelLabel: "Zone-based freehold / in-rem rights (od 1/2026)",
      bullets: [
        { text: REGA_LAW.text, claim: REGA_LAW },
        { text: ZONE_CLAIM.text, claim: ZONE_CLAIM },
        {
          text: "Starší formulace „vlastnictví jen přes Premium Residency a několik projektů“ je po lednu 2026 neúplná — Premium Residency zůstává relevantní, ale není jediná cesta.",
          claim: PREMIUM_RESIDENCY_CLAIM,
        },
      ],
    },
    {
      id: "financing",
      kind: "financing",
      title: sectionTitle("financing"),
      summary: "Lokální sazby v datech nemáme — individuálně ověřujeme. Dostupné je české zajištění a hotovost.",
      lanes: [
        {
          audience: "both",
          title: "Lokální bankovní produkt",
          summary: "Lokální financování individuálně ověřujeme — bez live sazby v našich datech produkt nepočítáme.",
          linkedOptions: ["UNAVAILABLE"],
        },
        {
          audience: "non_resident",
          title: "České zajištěné financování",
          summary: "Americká hypotéka v CZK se zástavou v ČR — oddělená od lokální KSA hypotéky.",
          linkedOptions: ["CZECH_EQUITY_LOAN"],
        },
        {
          audience: "both",
          title: "Hotovost",
          summary: "Častá cesta při omezené dostupnosti lokálního úvěru.",
          linkedOptions: ["CASH"],
        },
      ],
    },
    {
      id: "transaction_costs",
      kind: "costs",
      title: sectionTitle("transaction_costs"),
      summary: "Počítat s disposition fee a transakčními náklady dle lokality.",
      lines: [
        {
          label: "Disposition / převodní poplatky",
          range: "až jednotky % — dle regulace a města",
          claim: modelledClaim(
            "REGA může stanovit disposition fee; konkrétní sazby ověřte v prováděcích předpisech a u poradce.",
            "REGA implementing framework",
            "2026-01-22"
          ),
        },
        {
          label: "Právní a registrační náklady",
          range: "individuálně",
          claim: modelledClaim("Závisí na typu nabyvatele a zóně.", "Tržní praxe KSA"),
        },
      ],
    },
    {
      id: "holding_costs",
      kind: "costs",
      title: sectionTitle("holding_costs"),
      summary: "Správa, service charges a pojištění — projekt od projektu.",
      lines: [
        {
          label: "Service / community fees",
          range: "projektově",
          claim: modelledClaim("U master-planned komunit často významná položka.", "Pravidla developera / komunity"),
        },
      ],
    },
    narrative("rental_tax", "Daňový režim nájmu a VAT ověřte u lokálního daňového poradce — není univerzální „0 % pro všechny“.", [
      {
        text: "RETT / VAT a daň z příjmu se liší podle struktury (fyzická osoba vs. entita) a typu transakce.",
        claim: modelledClaim(
          "Daňové dopady nejsou v tomto dossieru tvrzeny jako absolutní.",
          "KSA tax practice — ověřit"
        ),
      },
    ]),
    narrative("exit", "Prodej podléhá registraci a zónovým/eligibilitním pravidlům nabyvatele.", [
      { text: "Likvidita mimo klíčová města může být nižší." },
      { text: ZONE_CLAIM.text, claim: ZONE_CLAIM },
    ]),
    narrative("inheritance", "Dědění s cizím prvkem vyžaduje plánování; právo KSA a právo domovského státu se mohou střetávat.", [
      {
        text: "Přeshraniční dědictví řešte předem s právníkem obou jurisdikcí.",
        claim: modelledClaim(
          "Není univerzální pasportizace dědictví ve stylu EU.",
          "Praxe přeshraničního dědictví"
        ),
      },
    ]),
    narrative("fx_risk", "SAR vs. CZK/EUR — kurzové riziko u výnosu i při exit.", [
      { text: "Financování v CZK (americká hypotéka) vytváří měnový mismatch vůči SAR aktivu." },
    ]),
    narrative("developer_risk", "Off-plan a nové čtvrti nesou riziko zpoždění a změny masterplanu.", [
      { text: "Ověřte registraci projektu, escrow a track record developera — Vision 2030 není záruka konkrétního projektu." },
    ]),
    narrative("short_term_rentals", "Krátkodobé pronájmy mohou podléhat licencím a hotelovým pravidlům.", [
      {
        text: "Provoz krátkodobého pronájmu ověřte u regulátora a v pravidlech komunity — nepočítáme s absolutní volností.",
        claim: modelledClaim(
          "Regulace se vyvíjí s turismem a Vision 2030.",
          "Licence pro pohostinství v KSA"
        ),
      },
    ]),
    {
      id: "purchase_timeline",
      kind: "timeline",
      title: sectionTitle("purchase_timeline"),
      summary: "Digitální cesta přes Saudi Properties — liší se u rezidenta a nerezidenta.",
      steps: [
        {
          order: 1,
          title: "Ověření zóny a způsobilosti",
          detail: "Kontrola Geographic Scope a kategorie kupujícího na oficiálním portálu.",
          durationHint: "1–2 týdny",
          claim: ZONE_CLAIM,
        },
        {
          order: 2,
          title: "Identita / registrace",
          detail: "Rezident: Iqama. Nerezident: digitální identita přes zastupitelství. Firmy: Invest Saudi / Unified Number dle pravidel.",
          durationHint: "2–8 týdnů",
          claim: REGA_LAW,
        },
        { order: 3, title: "Due diligence nemovitosti", detail: "Title, zástavy, developer, service fees.", durationHint: "2–4 týdny" },
        { order: 4, title: "Smlouva + úhrada", detail: "Escrow / smluvní struktura dle projektu.", durationHint: "1–3 týdny" },
        { order: 5, title: "Registrace v registru", detail: "Účinnost vlastnictví/práv po zápisu.", durationHint: "dle úřadu" },
      ],
    },
    {
      id: "red_flags",
      kind: "flags",
      title: sectionTitle("red_flags"),
      summary: "Co zastavit dřív, než pošlete peníze.",
      flags: [
        { severity: "high", text: "Nákup mimo ověřenou zónu nebo bez registrace na Saudi Properties.", claim: ZONE_CLAIM },
        { severity: "high", text: "Předpoklad, že Premium Residency = automatický freehold kdekoli.", claim: PREMIUM_RESIDENCY_CLAIM },
        { severity: "high", text: "Mekka/Medina bez splnění zpřísněných podmínek.", claim: HOLY_CITIES },
        { severity: "medium", text: "Off-plan bez escrow a ověřeného developera." },
      ],
    },
    sourcesSection(
      {
        text: `Poslední právní review dossieru KSA: ${LEGAL_REVIEW_AS_OF} (režim od 22. 1. 2026)`,
        source: "HypotékaJasně.cz (redakční review)",
        sourceUrl: null,
        asOf: LEGAL_REVIEW_AS_OF,
        status: "ESTIMATE",
      },
      [REGA_LAW, ZONE_CLAIM, PREMIUM_RESIDENCY_CLAIM, HOLY_CITIES]
    ),
    ctaSection("saudi"),
  ]
);
