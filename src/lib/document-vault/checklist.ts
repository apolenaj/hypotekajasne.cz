import type { IncomeTypeId, MortgageIntent } from "@/lib/mortgage-readiness/types";
import type {
  ChecklistItem,
  VaultDocumentCategory,
} from "@/lib/document-vault/types";

type ChecklistContext = {
  incomeType: IncomeTypeId | null;
  intent: MortgageIntent | null;
  coApplicant: boolean;
  hasProperty: boolean;
  isRefinance: boolean;
};

function item(
  id: string,
  category: VaultDocumentCategory,
  label: string,
  description: string,
  required = true
): ChecklistItem {
  return {
    id,
    category,
    label,
    description,
    required,
    documentId: null,
    done: false,
  };
}

const BASE_ITEMS: ChecklistItem[] = [
  item("id_doc", "contracts", "Doklad totožnosti", "Občanský průkaz nebo pas.", true),
  item(
    "statements",
    "bank_statements",
    "Výpisy z účtu (3–6 měs.)",
    "Obvykle 3–6 měsíců — konkrétní banka může požadovat jinak (NEOVERENO).",
    true
  ),
  item(
    "equity_proof",
    "contracts",
    "Doklad o vlastních zdrojích",
    "Výpis z účtu, darovací smlouva nebo jiný důkaz — dle situace.",
    true
  ),
];

const EMPLOYEE_ITEMS: ChecklistItem[] = [
  item(
    "employment_confirmation",
    "income_documents",
    "Potvrzení o zaměstnání",
    "Potvrzení zaměstnavatele o výši příjmu a délce pracovního poměru.",
    true
  ),
  item(
    "payslips",
    "income_documents",
    "Výplatní pásky (3 měsíce)",
    "Poslední 3 výplatní pásky — MODEL checklist, banka může chtít více.",
    true
  ),
];

const OSVC_PAUSAL_ITEMS: ChecklistItem[] = [
  item(
    "tax_return_osvc",
    "tax_returns",
    "Daňové přiznání (2 roky)",
    "DPFO za poslední 2 zdaňovací období.",
    true
  ),
  item(
    "osvc_registration",
    "income_documents",
    "Živnostenský list / výpis z OR",
    "Doklad o registraci OSVČ.",
    true
  ),
  item(
    "osvc_statements",
    "bank_statements",
    "Výpisy podnikatelského účtu",
    "Pohyby na účtu — banka posuzuje individuálně.",
    true
  ),
];

const OSVC_EVIDENCE_ITEMS: ChecklistItem[] = [
  ...OSVC_PAUSAL_ITEMS,
  item(
    "accounting_statements",
    "tax_returns",
    "Účetní závěrka / daňová evidence",
    "Pro OSVČ s daňovou evidencí — výkazy zisku.",
    true
  ),
];

const SRO_ITEMS: ChecklistItem[] = [
  item(
    "sro_financials",
    "tax_returns",
    "Účetní závěrka s.r.o.",
    "Základní údaje o hospodaření společnosti.",
    true
  ),
  item(
    "sro_extract",
    "contracts",
    "Výpis z obchodního rejstříku",
    "Aktuální výpis OR.",
    true
  ),
];

const REFINANCE_ITEMS: ChecklistItem[] = [
  item(
    "mortgage_contract",
    "mortgage_documents",
    "Stávající úvěrová smlouva",
    "Smlouva o úvěru včetně VOP.",
    true
  ),
  item(
    "mortgage_balance",
    "mortgage_documents",
    "Potvrzení o zůstatku jistiny",
    "Výpis z banky — aktuální zůstatek.",
    true
  ),
  item(
    "fixation_info",
    "mortgage_documents",
    "Informace o fixaci",
    "Datum konce fixace — pro Refinance Radar.",
    true
  ),
];

const PROPERTY_ITEMS: ChecklistItem[] = [
  item(
    "purchase_contract",
    "contracts",
    "Kupní / rezervační smlouva",
    "Smlouva o koupi nebo rezervaci nemovitosti.",
    true
  ),
  item(
    "property_title",
    "property_documents",
    "List vlastnictví",
    "Výpis z katastru nemovitostí.",
    true
  ),
  item(
    "energy_cert",
    "energy_certificates",
    "Průkaz energetické náročnosti",
    "PENB — povinný při prodeji.",
    true
  ),
  item(
    "insurance_policy",
    "insurance",
    "Pojištění nemovitosti",
    "Pojistná smlouva — pokud již existuje.",
    false
  ),
  item(
    "svj_docs",
    "svj_documents",
    "Dokumenty SVJ",
    "Stanovy, plán oprav, zápisy z VH — pokud byt v SVJ.",
    false
  ),
  item(
    "valuation",
    "valuation_reports",
    "Znalecký posudek / odhad",
    "Banka nebo znalec — dle požadavku.",
    false
  ),
];

const CO_APPLICANT_ITEMS: ChecklistItem[] = [
  item(
    "co_id",
    "contracts",
    "Doklad totožnosti spolužadatele",
    "Stejné doklady jako u hlavního žadatele.",
    true
  ),
  item(
    "co_income",
    "income_documents",
    "Doklady o příjmu spolužadatele",
    "Dle typu příjmu spolužadatele.",
    true
  ),
];

export function buildDocumentChecklist(ctx: ChecklistContext): ChecklistItem[] {
  const items: ChecklistItem[] = [...BASE_ITEMS];

  switch (ctx.incomeType) {
    case "employee":
      items.push(...EMPLOYEE_ITEMS);
      break;
    case "osvc_pausal":
      items.push(...OSVC_PAUSAL_ITEMS);
      break;
    case "osvc_evidence":
      items.push(...OSVC_EVIDENCE_ITEMS);
      break;
    case "sro":
      items.push(...SRO_ITEMS);
      break;
    case "rental":
      items.push(
        item(
          "rental_income",
          "income_documents",
          "Doklad o příjmu z pronájmu",
          "Smlouvy o nájmu, daňové přiznání s příjmy z pronájmu.",
          true
        )
      );
      break;
    default:
      items.push(
        item(
          "income_generic",
          "income_documents",
          "Doklad o příjmu",
          "Dle typu příjmu — doplňte profil pro přesnější checklist.",
          true
        )
      );
  }

  if (ctx.isRefinance || ctx.intent === "refinance") {
    items.push(...REFINANCE_ITEMS);
  }

  if (
    ctx.hasProperty ||
    ctx.intent === "owner_occupied" ||
    ctx.intent === "investment" ||
    ctx.intent === "foreign_purchase"
  ) {
    items.push(...PROPERTY_ITEMS);
  }

  if (ctx.intent === "foreign_purchase") {
    items.push(
      item(
        "foreign_property",
        "property_documents",
        "Dokumenty k zahraniční nemovitosti",
        "Rezervace, developer SPA — dle země.",
        true
      )
    );
  }

  if (ctx.coApplicant) {
    items.push(...CO_APPLICANT_ITEMS);
  }

  return items;
}

export function mergeChecklistWithVault(
  checklist: ChecklistItem[],
  documents: { id: string; checklistItemId: string | null; category: VaultDocumentCategory }[]
): ChecklistItem[] {
  return checklist.map((item) => {
    const doc = documents.find(
      (d) => d.checklistItemId === item.id || d.category === item.category
    );
    return {
      ...item,
      documentId: doc?.id ?? null,
      done: doc != null,
    };
  });
}

export function checklistCompletionPercent(items: ChecklistItem[]): number {
  const required = items.filter((i) => i.required);
  if (required.length === 0) return 100;
  const done = required.filter((i) => i.done).length;
  return Math.round((done / required.length) * 100);
}
