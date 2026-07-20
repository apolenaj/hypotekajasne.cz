import type {
  DDChecklistItemTemplate,
  PropertyType,
} from "@/lib/due-diligence/types";

function item(
  id: string,
  category: DDChecklistItemTemplate["category"],
  label: string,
  description: string,
  responsibleParty: DDChecklistItemTemplate["responsibleParty"],
  defaultSeverity: DDChecklistItemTemplate["defaultSeverity"],
  appliesTo: PropertyType[] | "all" = "all"
): DDChecklistItemTemplate {
  return {
    id,
    category,
    label,
    description,
    responsibleParty,
    defaultSeverity,
    appliesTo,
  };
}

const BASE_ITEMS: DDChecklistItemTemplate[] = [
  item(
    "legal_clean_title",
    "LEGAL",
    "Právní čistota titulu",
    "List vlastnictví bez sporných záznamů — vyžaduje právníka.",
    "lawyer",
    "critical"
  ),
  item(
    "ownership_seller_id",
    "OWNERSHIP",
    "Identita prodávajícího",
    "Shoda prodávajícího s LV a plná moc (pokud jedná zástupce).",
    "lawyer",
    "high"
  ),
  item(
    "encumbrances_mortgage",
    "ENCUMBRANCES",
    "Zástavní práva a exekuce",
    "Věcná břemena, zástavní právo, předkupní právo.",
    "lawyer",
    "critical"
  ),
  item(
    "building_permit",
    "BUILDING",
    "Stavební soulad",
    "Black / grey stavba, přestavby, certifikace — dle typu.",
    "surveyor",
    "high",
    ["house", "commercial", "off_plan"]
  ),
  item(
    "technical_inspection",
    "TECHNICAL",
    "Technický stav",
    "Revize (elektro, plyn), vlhkost, střecha, okna.",
    "surveyor",
    "medium",
    ["apartment", "house", "commercial"]
  ),
  item(
    "svj_finances",
    "SVJ_HOA",
    "Finance SVJ / HOA",
    "Fond oprav, dluhy SVJ, plán oprav, schůze.",
    "lawyer",
    "high",
    ["apartment", "off_plan"]
  ),
  item(
    "financial_price_alignment",
    "FINANCIAL",
    "Cena vs. trh",
    "Srovnání s comparables — MODEL, ne znalecký posudek.",
    "user",
    "medium"
  ),
  item(
    "rental_tenant_status",
    "RENTAL",
    "Nájemní vztahy",
    "Existující nájem, výpovědní lhůty, nájemní smlouvy.",
    "lawyer",
    "high",
    ["apartment", "house", "commercial"]
  ),
  item(
    "location_risks",
    "LOCATION",
    "Lokalita a rizika",
    "Hluk, záplavové zóny, plánovaná výstavba v okolí.",
    "user",
    "medium"
  ),
  item(
    "tax_implications",
    "TAX",
    "Daňové dopady",
    "Daň z nabytí, DPFO u pronájmu, DPH u komerčního.",
    "tax_advisor",
    "medium"
  ),
  item(
    "insurance_insurability",
    "INSURANCE",
    "Pojistitelnost",
    "Pojistná hodnota, povinné pojištění u hypotéky.",
    "mortgage_specialist",
    "medium"
  ),
  item(
    "exit_liquidity",
    "EXIT",
    "Exit a likvidita",
    "Prodejnost, segment poptávky, holding period.",
    "user",
    "low"
  ),
];

const APARTMENT_ITEMS: DDChecklistItemTemplate[] = [
  item(
    "svj_statutes",
    "SVJ_HOA",
    "Stanovy SVJ",
    "Pravidla pronájmu, hlasování, poplatky.",
    "lawyer",
    "medium",
    ["apartment"]
  ),
  item(
    "building_unit_share",
    "OWNERSHIP",
    "Spoluvlastnický podíl na domě",
    "Podíl na společných částech domu a pozemku.",
    "lawyer",
    "high",
    ["apartment"]
  ),
];

const HOUSE_ITEMS: DDChecklistItemTemplate[] = [
  item(
    "land_boundary",
    "OWNERSHIP",
    "Hranice pozemku",
    "Geometrický plán, sousední spory.",
    "lawyer",
    "high",
    ["house", "land"]
  ),
  item(
    "septic_utilities",
    "TECHNICAL",
    "Inženýrské sítě",
    "Voda, kanalizace, septik, elektřina.",
    "surveyor",
    "high",
    ["house", "land"]
  ),
];

const LAND_ITEMS: DDChecklistItemTemplate[] = [
  item(
    "land_use_plan",
    "LEGAL",
    "Územní plán a využití",
    "Zóna, ochrana přírody, limit stavby.",
    "lawyer",
    "critical",
    ["land"]
  ),
  item(
    "land_access",
    "LOCATION",
    "Přístupová cesta",
    "Věcné břemeno cesty vs. veřejná komunikace.",
    "lawyer",
    "critical",
    ["land"]
  ),
];

const COMMERCIAL_ITEMS: DDChecklistItemTemplate[] = [
  item(
    "commercial_tenant_lease",
    "RENTAL",
    "Nájemní smlouvy NNN",
    "Délka nájmu, indexace, break options.",
    "lawyer",
    "high",
    ["commercial"]
  ),
  item(
    "commercial_vat",
    "TAX",
    "DPH režim",
    "Plátce / neplátce, převod jako podnik.",
    "tax_advisor",
    "high",
    ["commercial"]
  ),
];

const OFF_PLAN_ITEMS: DDChecklistItemTemplate[] = [
  item(
    "developer_track_record",
    "DEVELOPER",
    "Track record developera",
    "Dokončené projekty, insolvence, reference.",
    "user",
    "critical",
    ["off_plan"]
  ),
  item(
    "escrow_structure",
    "DEVELOPER",
    "Escrow / platební kalendář",
    "Fáze plateb vs. stavební milníky.",
    "lawyer",
    "critical",
    ["off_plan"]
  ),
  item(
    "building_permit_offplan",
    "BUILDING",
    "Stavební povolení projektu",
    "Platné SP, změny projektu.",
    "lawyer",
    "critical",
    ["off_plan"]
  ),
];

const FOREIGN_ITEMS: DDChecklistItemTemplate[] = [
  item(
    "foreign_ownership_rules",
    "LEGAL",
    "Pravidla vlastnictví cizinců",
    "Rezidence, společnost, leasehold — dle země.",
    "lawyer",
    "critical",
    ["foreign_property"]
  ),
  item(
    "foreign_tax_residency",
    "TAX",
    "Daňová rezidence a DTA",
    "Dvojí zdanění, místní daně z nemovitosti.",
    "tax_advisor",
    "high",
    ["foreign_property"]
  ),
  item(
    "foreign_fx_risk",
    "FINANCIAL",
    "Měnové riziko",
    "Úvěr v CZK vs. aktivum v cizí měně.",
    "mortgage_specialist",
    "medium",
    ["foreign_property"]
  ),
];

export const ALL_DD_TEMPLATES: DDChecklistItemTemplate[] = [
  ...BASE_ITEMS,
  ...APARTMENT_ITEMS,
  ...HOUSE_ITEMS,
  ...LAND_ITEMS,
  ...COMMERCIAL_ITEMS,
  ...OFF_PLAN_ITEMS,
  ...FOREIGN_ITEMS,
];

export function templatesForPropertyType(
  propertyType: PropertyType
): DDChecklistItemTemplate[] {
  return ALL_DD_TEMPLATES.filter(
    (t) =>
      t.appliesTo === "all" ||
      (Array.isArray(t.appliesTo) && t.appliesTo.includes(propertyType))
  );
}
