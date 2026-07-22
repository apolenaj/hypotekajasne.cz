import type {
  CopilotIntentId,
  CopilotQuickActionId,
} from "@/lib/copilot/types";

const INTENT_PATTERNS: { intent: CopilotIntentId; patterns: RegExp[] }[] = [
  {
    intent: "affordability",
    patterns: [
      /kolik\s+(si\s+)?(můžeme|můžu|muzeme|muzu)\s+(bezpečně\s+)?dovolit/i,
      /dostupnost|kolik\s+(si\s+)?půjčit|max(imální)?\s+(úvěr|uver|rozpočet)/i,
      /bezpečn[ěe]\s+dovolit/i,
    ],
  },
  {
    intent: "explain_score",
    patterns: [
      /proč\s+(mi\s+)?(vyšlo|je)\s+sk[oó]re/i,
      /vysvětl.*(sk[oó]re|v[yý]sledek)/i,
      /sk[oó]re\s+\d+/i,
      /jen\s+\d+\s*\/\s*100/i,
    ],
  },
  {
    intent: "reach_target",
    patterns: [
      /dosáhnout\s+na/i,
      /abych\s+(dosáhl|dosáhla|se\s+dostal)/i,
      /na\s+\d+([.,]\d+)?\s*(mil|mili[oó]n)/i,
      /změnit.*\d+\s*(mil|000)/i,
    ],
  },
  {
    intent: "property_safe",
    patterns: [
      /je\s+(tento|ta|ten)\s+(byt|dům|nemovitost).*(bezpečn|vhodn|pro\s+mě)/i,
      /byt\s+za\s+\d/i,
      /nemovitost\s+za\s+\d/i,
      /bezpečn[ýá]\s+(koupě|byt)/i,
    ],
  },
  {
    intent: "compare_properties",
    patterns: [
      /porovnej|srovnej|porovnat/i,
      /kter(ý|á)\s+(byt|nemovitost)\s+(je\s+)?lepš/i,
      /mezi\s+(těmito|těma)\s+(byt|nemovit)/i,
    ],
  },
  {
    intent: "rate_stress",
    patterns: [
      /refixac/i,
      /sazba.*(vzrost|stoup|o\s*\+?\s*2|o\s+2)/i,
      /stress|zátěžov/i,
      /co\s+se\s+stane.*sazb/i,
    ],
  },
  {
    intent: "market_compare",
    patterns: [
      /praha\s+nebo\s+dubaj|dubaj\s+nebo\s+praha/i,
      /větší\s+smysl.*(praha|dubaj|španěl|chorvat)/i,
      /porovnej.*(trh|zem[ěe]|destin)/i,
      /(praha|čr|dubaj|španělsko).*(nebo|vs\.?|versus)/i,
    ],
  },
  {
    intent: "missing_documents",
    patterns: [
      /dokumenty|doklady|co\s+(ještě\s+)?chybí/i,
      /papíry|přílohy\s+k\s+hypotéce/i,
    ],
  },
  {
    intent: "next_step",
    patterns: [
      /další\s+krok|co\s+(mám|máme)\s+dělat/i,
      /kam\s+dál|next\s+step/i,
    ],
  },
  {
    intent: "action_plan",
    patterns: [/akční\s+plán|plán\s+kroků|action\s+plan/i],
  },
  {
    intent: "risk_analysis",
    patterns: [/analyzuj\s+rizik|rizikov|jaká\s+jsou\s+rizik/i],
  },
  {
    intent: "contact_specialist",
    patterns: [
      /kontaktovat\s+specialist/i,
      /chci\s+(mluvit|hovořit)\s+s/i,
      /specialista|poradce/i,
    ],
  },
];

const QUICK_ACTION_INTENT: Record<CopilotQuickActionId, CopilotIntentId> = {
  affordability: "affordability",
  compare_properties: "compare_properties",
  risk_analysis: "risk_analysis",
  action_plan: "action_plan",
  explain_score: "explain_score",
  contact_specialist: "contact_specialist",
};

export function intentFromQuickAction(
  action: CopilotQuickActionId
): CopilotIntentId {
  return QUICK_ACTION_INTENT[action];
}

/**
 * Deterministic Czech intent detection — no LLM.
 * Returns clarify when confidence is low.
 */
export function detectIntent(
  message: string,
  quickAction?: CopilotQuickActionId
): { intent: CopilotIntentId; confidence: number } {
  if (quickAction) {
    return { intent: intentFromQuickAction(quickAction), confidence: 1 };
  }

  const text = message.trim();
  if (!text) return { intent: "clarify", confidence: 0 };

  // Out-of-scope: legal advice, tax tricks, approval/yield guarantees
  if (
    /garance\s+schválení|slibte\s+že\s+(mi\s+)?schvál|obejít\s+(banku|daň)|obejděte\s+daň/i.test(
      text
    ) ||
    /garant(ujte|ovat|ujeme)?\s+(mi\s+)?(hypoték|schválení|výnos)/i.test(text) ||
    /právní\s+rad[au]/i.test(text) ||
    /jistotu\s+schválení/i.test(text)
  ) {
    return { intent: "out_of_scope", confidence: 0.9 };
  }

  let best: { intent: CopilotIntentId; score: number } | null = null;
  for (const row of INTENT_PATTERNS) {
    let hits = 0;
    for (const re of row.patterns) {
      if (re.test(text)) hits += 1;
    }
    if (hits > 0 && (!best || hits > best.score)) {
      best = { intent: row.intent, score: hits };
    }
  }

  if (!best) return { intent: "clarify", confidence: 0.2 };
  return {
    intent: best.intent,
    confidence: Math.min(1, 0.45 + best.score * 0.25),
  };
}

export function extractTargetMillion(message: string): number | null {
  const mil = message.match(/(\d+[.,]?\d*)\s*(mil|mili[oó]n)/i);
  if (mil) {
    const n = Number(mil[1]!.replace(",", "."));
    if (Number.isFinite(n) && n > 0) return Math.round(n * 1_000_000);
  }
  const raw = message.match(/(\d{1,3}(?:[\s\u00a0]\d{3})+|\d{7,})/);
  if (raw) {
    const n = Number(raw[1]!.replace(/[\s\u00a0]/g, ""));
    if (Number.isFinite(n) && n >= 1_000_000) return n;
  }
  return null;
}

export function extractPropertyPrice(message: string): number | null {
  const mil = message.match(
    /(?:byt|dům|nemovitost|za)\s+(?:za\s+)?(\d+[.,]?\d*)\s*(mil|mili[oó]n)/i
  );
  if (mil) {
    const n = Number(mil[1]!.replace(",", "."));
    if (Number.isFinite(n) && n > 0) return Math.round(n * 1_000_000);
  }
  return extractTargetMillion(message);
}
