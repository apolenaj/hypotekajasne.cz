import { CNB_LIMITS } from "@/lib/cnb-limits";
import { requireFactClaim } from "@/lib/sources/fact-claims";
import { formatFactClaimValue } from "@/lib/sources/fact-claims-display";

export interface CountryTaxItem {
  name: string;
  value: string;
  /** Odkaz na FactClaim id — pokud je, UI zobrazí Zdroj a ověření */
  factClaimId?: string;
}

export interface CountryInfoEntry {
  overview: string[];
  taxes: CountryTaxItem[];
}

function taxFromFact(id: string, nameOverride?: string): CountryTaxItem {
  const f = requireFactClaim(id);
  return {
    name: nameOverride ?? f.claim.slice(0, 80),
    value: formatFactClaimValue(f),
    factClaimId: id,
  };
}

export const COUNTRY_INFO_DATA: Record<string, CountryInfoEntry> = {
  "Česká republika": {
    overview: [
      "Konzervativní a vysoce stabilní trh s nulovým měnovým rizikem (pro lidi vydělávající v CZK).",
      `Silná právní ochrana; u vlastního bydlení LTV obvykle do ${CNB_LIMITS.ownerOccupied.ltvStandard} % (do 36 let až ${CNB_LIMITS.ownerOccupied.ltvYoungUnder36} %). U investičních hypoték ČNB od 4/2026 doporučuje LTV max. ${CNB_LIMITS.investment.ltvMax} % a DTI ${CNB_LIMITS.investment.dtiMax}.`,
      "Výnosy z dlouhodobého nájmu se pohybují kolem 3–5 % p.a. (v Praze méně, v regionech jako Ostrava/Ústí nad Labem více).",
      "Trh je ideální pro uchování hodnoty majetku a ochranu před inflací, méně pro agresivní cash-flow.",
    ],
    taxes: [
      taxFromFact(
        "cz.tax.acquisition.abolished_2020",
        "Daň z nabytí nemovitých věcí"
      ),
      taxFromFact("cz.cadastre.vklad_fee", "Katastr — poplatek za návrh na vklad"),
      taxFromFact("cz.fees.legal_escrow_band", "Právní služby / úschova"),
      taxFromFact("cz.tax.property_annual", "Daň z nemovitých věcí (roční)"),
      taxFromFact("cz.tax.vat_new_build", "DPH u nových nemovitostí"),
      taxFromFact("cz.tax.rental_income", "Daň z příjmu z pronájmu"),
      taxFromFact(
        "cz.tax.capital_gains_time_test",
        "Daň z prodeje (kapitálový zisk FO)"
      ),
    ],
  },
  "SAE (Dubaj)": {
    overview: [
      "Extrémně dynamický trh s daňovým rájem. Vysoký podíl zahraničních investorů a expatů.",
      "Vynikající ROI u krátkodobého i dlouhodobého pronájmu (často 6–9 % čistého p.a.).",
      "Obrovský trh s Off-plan projekty (nemovitosti ve výstavbě) s bezúročnými splátkovými kalendáři přímo od developerů.",
      "Měna (AED) je pevně vázána na americký dolar (USD), což přináší stabilitu, ale i měnové riziko vůči CZK/EUR.",
    ],
    taxes: [
      taxFromFact("dubai.tax.dld_transfer_fee", "DLD poplatek (převod)"),
      taxFromFact(
        "dubai.tax.personal_income_rental",
        "Daň z příjmu z pronájmu"
      ),
      taxFromFact("dubai.tax.annual_property", "Daň z nemovitosti (roční)"),
      taxFromFact("dubai.ownership.freehold_zones", "Freehold zóny"),
      taxFromFact(
        "dubai.financing.cbuae_framework",
        "Financování — rámec CBUAE"
      ),
    ],
  },
  Španělsko: {
    overview: [
      "Jeden z nejžádanějších trhů pro kombinaci vlastní dovolené a pronájmu v EU.",
      "Ceny jsou velmi závislé na regionu (Andalusie, Costa Blanca, Costa del Sol).",
      "Průměrný výnos 4–6 % z dlouhodobého a 7–10 % z krátkodobého nájmu.",
      "Silná ochrana nájemníků (problém tzv. Okupas), proto je klíčový výběr lokality a pojištění.",
    ],
    taxes: [
      taxFromFact("es.tax.itp", "ITP (převod starších)"),
      taxFromFact("es.tax.iva_new_build", "IVA + AJD (novostavby)"),
      taxFromFact(
        "es.tax.rental_nonresident_eu",
        "Daň z příjmu z pronájmu (EU nerezident)"
      ),
      taxFromFact("es.tax.ibi", "IBI (roční)"),
      taxFromFact("es.financing.bde_framework", "Financování — Banco de España"),
    ],
  },
  "Bali (Indonésie)": {
    overview: [
      "Trh zaměřený na maximalizaci ROI díky extrémně silnému celoročnímu turismu.",
      "Koupě probíhá většinou formou Leaseholdu (dlouhodobý pronájem na 25–30 let s opcí).",
      "Hrubé výnosy (ROI) často přesahují 12–18 % p.a. v populárních oblastech jako Canggu nebo Uluwatu.",
      "Vyžaduje zkušenou lokální správcovskou firmu (management fee se pohybuje kolem 15–20 % z obratu).",
    ],
    taxes: [
      taxFromFact("bali.tax.bphtb", "BPHTB (daň z nabytí)"),
      taxFromFact("bali.tax.ppn", "PPN (DPH)"),
      taxFromFact("bali.tax.pph_rental", "PPh (daň z příjmu / nájem)"),
      taxFromFact("bali.ownership.leasehold_practice", "Leasehold praxe"),
      taxFromFact("bali.financing.bi_framework", "Financování — Bank Indonesia"),
    ],
  },
  Chorvatsko: {
    overview: [
      "Adriatický trh s růstem poptávky po krátkodobém pronájmu a druhém bydlení z EU.",
      "Vstup do Schengenu a eurozóny zvýšil likviditu a zájem mezinárodních kupujících.",
      "Sezónní výnosy u apartmánů u moře bývají 5–8 % hrubého, mimo sezónu klesá obsazenost.",
      "Ideální pro kombinaci vlastní rekreace a pronájmu; klíčová je dostupnost autem z ČR/SK.",
    ],
    taxes: [
      taxFromFact("hr.tax.transfer", "Daň z převodu (starší)"),
      taxFromFact("hr.tax.vat_new_build", "DPH u novostaveb"),
      taxFromFact("hr.tax.short_term_rental", "Krátkodobý pronájem"),
      taxFromFact("hr.fees.notary_legal_band", "Notář a právní služby"),
      taxFromFact("hr.financing.hnb_framework", "Financování — HNB"),
    ],
  },
  Itálie: {
    overview: [
      "Trh dvou rychlostí: sever a turistické hotspots vs. levnější jih a menší města.",
      "Silná poptávka po druhém bydlení (Toskánsko, Lago di Garda, Ligurie) a po krátkodobém pronájmu ve městech umění.",
      "Dlouhodobé výnosy často 3–5 %; u dobře spravovaných Airbnb lokalit vyšší, ale s regulací.",
      "Freehold je standard; nákup vyžaduje codice fiscale a lokálního notáře (notaio).",
    ],
    taxes: [
      taxFromFact("it.tax.registro_iva", "Imposta di registro / IVA"),
      taxFromFact("it.tax.imu", "IMU (roční)"),
      taxFromFact("it.tax.cedolare_secca", "Cedolare secca (nájem)"),
      taxFromFact("it.fees.notaio_band", "Notářské poplatky"),
      taxFromFact(
        "it.financing.bancaditalia_framework",
        "Financování — Banca d'Italia"
      ),
    ],
  },
  Slovensko: {
    overview: [
      "Blízký eurový trh bez jazykové bariéry a s právním systémem podobným ČR.",
      "Bratislava a Košice tahají likviditu; výnosy z dlouhodobého nájmu typicky 4–6 %.",
      "Hypotéky pro rezidenty dobře dostupné; nerezidenti řeší limity LTV case-by-case.",
      "Vhodné jako „první zahraniční“ eurová nemovitost bez exotického rizika.",
    ],
    taxes: [
      taxFromFact("sk.tax.transfer.abolished", "Daň z nabytí / převodu"),
      taxFromFact("sk.tax.vat_new_build", "DPH u novostaveb"),
      taxFromFact("sk.tax.rental_income", "Daň z příjmu z pronájmu"),
      taxFromFact("sk.cadastre.fees_band", "Katastr a právní služby"),
      taxFromFact("sk.financing.nbs_framework", "Financování — NBS"),
    ],
  },
  "Saúdská Arábie": {
    overview: [
      "Trh ve fázi otevírání díky Vision 2030 — projekty giga-rozvoje a rostoucí turismus.",
      "Pro cizince je vlastnictví stále regulované a často vázané na schválené zóny / strukturu.",
      "Potenciál kapitálového zhodnocení u off-plan a nových distriktů, ale vyšší legislativní riziko.",
      "Měna (SAR) je vázaná na USD; cash-flow model vyžaduje lokálního právního a daňového partnera.",
    ],
    taxes: [
      taxFromFact("saudi.tax.rett", "RETT (transakční daň)"),
      taxFromFact("saudi.tax.vat", "VAT (DPH)"),
      taxFromFact(
        "saudi.ownership.foreign_restrictions",
        "Vlastnictví cizinců"
      ),
      taxFromFact("saudi.financing.sama_framework", "Financování — SAMA"),
    ],
  },
};

export function getCountryInfoData(
  countryName: string
): CountryInfoEntry | null {
  return COUNTRY_INFO_DATA[countryName] ?? null;
}
