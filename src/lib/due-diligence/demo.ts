import { defaultDueDiligenceInput } from "@/lib/due-diligence/types";

/** Demo: byt s mixem stavů — ukazuje že unknown ≠ green */
export const DEMO_DD_INPUT = defaultDueDiligenceInput({
  propertyType: "apartment",
  propertyLabel: "Byt 3+kk — Vinohrady",
  country: "cz",
  itemOverrides: {
    legal_clean_title: {
      status: "GREEN",
      evidence: "LV bez záznamu — výpis z 6/2025",
      source: "katastr.cuzk.cz",
    },
    ownership_seller_id: {
      status: "GREEN",
      evidence: "OP prodávajícího shodný s LV",
      source: "právník — kontrola",
    },
    encumbrances_mortgage: {
      status: "AMBER",
      evidence: "Zástavní právo banky — k vyplacení při převodu",
      source: "LV",
    },
    svj_finances: {
      status: "RED",
      evidence: "SVJ dluh 890 000 Kč dle informace správce",
      source: "email správce SVJ — NEOVERENO",
    },
    financial_price_alignment: {
      status: "AMBER",
      evidence: "Cena 5 % nad mediánem v ulici (MODEL rentgen)",
      source: "investiční rentgen",
    },
  },
});

export const DEMO_DD_OFF_PLAN = defaultDueDiligenceInput({
  propertyType: "off_plan",
  propertyLabel: "Off-plan — Dubai Marina",
  country: "dubai",
  itemOverrides: {
    developer_track_record: { status: "AMBER", evidence: "Developer X — 3 projekty", source: "web developera" },
  },
});
