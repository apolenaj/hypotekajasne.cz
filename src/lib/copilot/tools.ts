import { calculateAnnuityPayment } from "@/lib/calculators";
import {
  calculateReadiness,
  maxLoanFromPayment,
  type ReadinessAnswers,
  type ReadinessResult,
} from "@/lib/mortgage-readiness";
import { matchMarkets, type PassportFormData } from "@/lib/market-matching/score";
import { getCountryDossier } from "@/lib/country-dossier";
import {
  decisionCitation,
  marketMatchCitation,
  methodologyCitation,
  rateCitation,
  readinessCitation,
} from "@/lib/copilot/citations";
import { prependRateNotice } from "@/lib/copilot/response-meta";
import type {
  ClaimKind,
  CopilotCitation,
  CopilotPropertyDraft,
  CopilotSessionContext,
  CopilotToolCall,
  CopilotUsedInput,
} from "@/lib/copilot/types";
import { routes } from "@/lib/routes";
import { MODEL_FALLBACK_RATE_PERCENT } from "@/lib/rates/model-fallback";

export type ToolBundle = {
  markdown: string;
  tools: CopilotToolCall[];
  citations: CopilotCitation[];
  usedInputs: CopilotUsedInput[];
  dataKeys: string[];
  cta: { label: string; href: string }[];
  modelAssumptions?: string[];
  unknowns?: string[];
};

function fmtCzk(n: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(n);
}

function needProfile(context: CopilotSessionContext): ToolBundle | null {
  if (context.hasReadinessProfile) return null;
  return {
    markdown:
      "**Nejdřív potřebuji váš profil připravenosti.**\n\n" +
      "Bez uložených odpovědí z Hypoteční připravenosti neumím spočítat bezpečnou dostupnost z vašich čísel — " +
      "a nevymýšlím příjem ani vlastní zdroje.\n\n" +
      `Otevřete [Hypoteční připravenost](${routes.navrhNaMiru}), dokončete kroky (uloží se lokálně v prohlížeči) a vraťte se sem.`,
    tools: [{ toolId: "permission_gate", ok: false, summary: "missing_readiness_profile" }],
    citations: [readinessCitation(), methodologyCitation()],
    usedInputs: [],
    dataKeys: [],
    unknowns: [
      "Příjem",
      "Vlastní zdroje",
      "Záměr financování",
      "Závazky a limity DSTI",
    ],
    cta: [
      { label: "Vyplnit připravenost", href: routes.navrhNaMiru },
      { label: "Kalkulačky", href: routes.kalkulacky.root },
    ],
  };
}

function rateClaimFromContext(context: CopilotSessionContext): ClaimKind {
  if (context.rateLayer === "LIVE" && context.modelRateClaimKind === "DATA") {
    return "DATA";
  }
  if (context.rateLayer === "STALE") {
    return "NEOVERENO";
  }
  return "MODEL";
}

function runReadiness(
  answers: ReadinessAnswers,
  context: CopilotSessionContext
): { result: ReadinessResult; rateUsed: number; claim: ClaimKind } {
  const rate = context.modelRatePercent;
  const rateUsed =
    rate != null && rate > 0 ? rate : MODEL_FALLBACK_RATE_PERCENT;
  return {
    result: calculateReadiness(answers, rateUsed),
    rateUsed,
    claim: rateClaimFromContext(context),
  };
}

function rateAssumptions(
  context: CopilotSessionContext,
  rateUsed: number,
  claim: ClaimKind
): string[] {
  const assumptions: string[] = [
    `Úroková sazba ${rateUsed.toFixed(2)} % p.a. (${claim === "DATA" ? "FACT / živá vrstva" : claim === "NEOVERENO" ? "zastaralá / neověřená vrstva" : "MODEL"})`,
    "Anuitní splátka a limity LTV/DSTI dle modelu Hypoteční připravenosti — ne dle interní metodiky konkrétní banky.",
  ];
  if (context.rateLayer !== "LIVE") {
    assumptions.push(
      "Živá bankovní nabídka není použita jako závazný vstup — výsledek je orientační."
    );
  }
  return assumptions;
}

export function toolAffordability(
  context: CopilotSessionContext,
  answers: ReadinessAnswers | null
): ToolBundle {
  const gate = needProfile(context);
  if (gate) return gate;
  if (!answers) return needProfile({ ...context, hasReadinessProfile: false })!;

  const { result, rateUsed, claim } = runReadiness(answers, context);
  const high = result.financingRange?.high ?? 0;
  const low = result.financingRange?.low ?? 0;
  const safeProperty =
    high > 0 ? high + Math.max(0, answers.ownFunds) : null;
  const rateLabel =
    claim === "DATA"
      ? "živá / ověřená sazba"
      : claim === "NEOVERENO"
        ? "poslední dostupná (neaktuální) sazba"
        : "modelová sazba";

  const md = prependRateNotice(
    [
      "## Orientační dostupnost",
      "",
      `Podle **vašeho lokálního profilu** a ${rateLabel} **${rateUsed.toFixed(2)} % p.a.**:`,
      "",
      `- Orientační pásmo úvěru: **${fmtCzk(low)} – ${fmtCzk(high)}**`,
      safeProperty
        ? `- S vlastními zdroji to odpovídá nemovitosti kolem **${fmtCzk(safeProperty)}** (hrubý strop, ne nabídka banky)`
        : null,
      `- Skóre připravenosti: **${result.score}/100** (MODEL)`,
      "",
      "### Evidence",
      `- Sazba: **${claim === "DATA" ? "FACT" : claim === "NEOVERENO" ? "UNKNOWN / zastaralé" : "MODEL"}**`,
      "- Pásmo úvěru a skóre: **MODEL** (algoritmus připravenosti)",
      "- Neznámé: interní limity konkrétní banky, odhad nemovitosti, scoring",
      "",
      "### Co to Není",
      "- Není to schválení úvěru ani závazná nabídka banky.",
      "- Bezpečná dostupnost zde znamená modelový strop z DSTI/LTV rámce nástroje, ne životní komfort.",
      "",
      result.ownFundsNote ? `> ${result.ownFundsNote}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    context
  );

  return {
    markdown: md,
    tools: [
      {
        toolId: "mortgage_readiness.calculateReadiness",
        ok: true,
        summary: `score=${result.score}; range=${low}-${high}`,
      },
    ],
    citations: [
      readinessCitation(),
      rateCitation(context.modelRateUpdatedAt, claim),
      methodologyCitation(),
    ],
    usedInputs: [
      {
        key: "intent",
        label: "Záměr",
        display: context.intentLabel ?? "—",
        claimKind: "DATA",
      },
      {
        key: "own_funds_band",
        label: "Vlastní zdroje (pásmo)",
        display: context.ownFundsBand ?? "—",
        claimKind: "DATA",
      },
      {
        key: "rate",
        label: claim === "DATA" ? "Sazba (živá vrstva)" : "Sazba (model / ne živá)",
        display: `${rateUsed.toFixed(2)} %`,
        claimKind: claim,
      },
    ],
    dataKeys: ["readiness.answers", "rate"],
    modelAssumptions: rateAssumptions(context, rateUsed, claim),
    unknowns: [
      "Schválení konkrétní bankou",
      "Odhad ceny nemovitosti bankou",
      "Interní výjimky a scoring banky",
    ],
    cta: [
      { label: "Upravit profil", href: routes.navrhNaMiru },
      { label: "Detailní kalkulačka", href: routes.kalkulacky.root },
    ],
  };
}

export function toolExplainScore(
  context: CopilotSessionContext,
  answers: ReadinessAnswers | null
): ToolBundle {
  const gate = needProfile(context);
  if (gate) return gate;
  if (!answers) return needProfile({ ...context, hasReadinessProfile: false })!;

  const { result, rateUsed } = runReadiness(answers, context);

  const md = [
    `## Proč skóre ${result.score}/100`,
    "",
    "Skóre je **vážený součet faktorů** v nástroji Hypoteční připravenost (ne rating banky).",
    "",
    result.strengths.length
      ? ["### Silné stránky", ...result.strengths.map((s) => `- ${s}`), ""].join(
          "\n"
        )
      : null,
    result.obstacles.length
      ? ["### Překážky", ...result.obstacles.map((s) => `- ${s}`), ""].join("\n")
      : null,
    result.improvements.length
      ? [
          "### Co zlepšit",
          ...result.improvements.map((s) => `- ${s}`),
          "",
        ].join("\n")
      : null,
    `Modelová sazba použitá v rozsahu financování: **${rateUsed.toFixed(2)} %** (${context.modelRatePercent != null ? "z dat platformy / fallback" : "konzervativní fallback 5 %"}).`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    markdown: md,
    tools: [
      {
        toolId: "mortgage_readiness.calculateReadiness",
        ok: true,
        summary: `explain score=${result.score}`,
      },
    ],
    citations: [readinessCitation(), methodologyCitation()],
    usedInputs: [
      {
        key: "score",
        label: "Skóre",
        display: `${result.score}/100`,
        claimKind: "MODEL",
      },
    ],
    dataKeys: ["readiness.result"],
    cta: [{ label: "Upravit odpovědi", href: routes.navrhNaMiru }],
  };
}

export function toolReachTarget(
  context: CopilotSessionContext,
  answers: ReadinessAnswers | null,
  targetLoanOrPrice: number
): ToolBundle {
  const gate = needProfile(context);
  if (gate) return gate;
  if (!answers) return needProfile({ ...context, hasReadinessProfile: false })!;

  const { result, rateUsed } = runReadiness(answers, context);
  const high = result.financingRange?.high ?? 0;
  const gap = Math.max(0, targetLoanOrPrice - high);
  const ownFunds = Math.max(0, answers.ownFunds);
  const extraEquityHint = Math.ceil(gap / 4 / 10_000) * 10_000;

  const md = [
    `## Cíl kolem ${fmtCzk(targetLoanOrPrice)}`,
    "",
    `Váš modelový strop úvěru je teď **${fmtCzk(high)}** (sazba ${rateUsed.toFixed(2)} %).`,
    gap > 0
      ? `Do cíle chybí přibližně **${fmtCzk(gap)}** na straně úvěrové kapacity.`
      : "Cíl je v rámci aktuálního modelového pásma — stále platí kontrola banky.",
    "",
    "### Co model navrhuje zvážit (ne příkaz)",
    gap > 0
      ? [
          `- Zvýšit vlastní zdroje / doplatek (orientačně řádově +${fmtCzk(extraEquityHint)} může posunout LTV rámec — ověřte v kalkulačce).`,
          "- Snížit ostatní splátky a kreditní limity.",
          "- Prodloužit dobu splatnosti v mezích věku (model max. do ~65).",
          "- Zvážit spolužadatele (pokud je reálný).",
          `- Aktuální vlastní zdroje v profilu: pásmo **${context.ownFundsBand ?? "nevyplněno"}** (hodnota ${fmtCzk(ownFunds)} zůstává lokálně).`,
        ].join("\n")
      : "- Přesto spusťte zátěžový test sazby a konzultaci se specialistou před rezervací.",
    "",
    "Žádná úprava v Copilotu **nezaručuje** schválení.",
  ].join("\n");

  return {
    markdown: md,
    tools: [
      {
        toolId: "mortgage_readiness.gap_analysis",
        ok: true,
        summary: `target=${targetLoanOrPrice}; high=${high}; gap=${gap}`,
      },
    ],
    citations: [readinessCitation(), decisionCitation(), methodologyCitation()],
    usedInputs: [
      {
        key: "target",
        label: "Cílová částka",
        display: fmtCzk(targetLoanOrPrice),
        claimKind: "ODHAD",
      },
      {
        key: "financing_high",
        label: "Modelový strop",
        display: fmtCzk(high),
        claimKind: "MODEL",
      },
    ],
    dataKeys: ["readiness.result", "user.target"],
    cta: [
      { label: "Kalkulačka CZ", href: routes.kalkulacky.root },
      { label: "Kontaktovat specialistu", href: routes.navrhNaMiru },
    ],
  };
}

export function toolPropertySafe(
  context: CopilotSessionContext,
  answers: ReadinessAnswers | null,
  price: number,
  label?: string
): ToolBundle {
  const gate = needProfile(context);
  if (gate) return gate;
  if (!answers) return needProfile({ ...context, hasReadinessProfile: false })!;

  const { result, rateUsed } = runReadiness(answers, context);
  const high = result.financingRange?.high ?? 0;
  const capacity = high + Math.max(0, answers.ownFunds);
  const loanNeeded = Math.max(0, price - Math.max(0, answers.ownFunds));
  const ratio = capacity > 0 ? price / capacity : Infinity;
  const status =
    ratio <= 0.85 ? "v rámci konzervativního pásma" : ratio <= 1 ? "na hraně modelového stropu" : "nad modelovým stropem";

  const md = [
    `## ${label ? label : "Nemovitost"} za ${fmtCzk(price)}`,
    "",
    `- Potřebný úvěr při vašich zdrojích: **${fmtCzk(loanNeeded)}**`,
    `- Modelová kapacita (úvěr + zdroje): **${fmtCzk(capacity)}**`,
    `- Hodnocení vůči modelu: **${status}**`,
    `- Použitá sazba: **${rateUsed.toFixed(2)} %**`,
    "",
    "„Bezpečný“ zde znamená **soulad s modelovým stropem**, ne jistotu schválení, právního stavu bytu ani výnosu.",
    result.riskFactors.length
      ? ["", "### Rizikové faktory z profilu", ...result.riskFactors.map((r) => `- ${r}`)].join(
          "\n"
        )
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    markdown: md,
    tools: [
      {
        toolId: "property.affordability_fit",
        ok: true,
        summary: `price=${price}; status=${status}`,
      },
    ],
    citations: [readinessCitation(), methodologyCitation()],
    usedInputs: [
      {
        key: "property_price",
        label: "Cena",
        display: fmtCzk(price),
        claimKind: "ODHAD",
      },
    ],
    dataKeys: ["readiness.result", "property.price"],
    cta: [
      { label: "Investiční rentgen", href: routes.investicniRentgen },
      { label: "Upravit profil", href: routes.navrhNaMiru },
    ],
  };
}

export function toolCompareProperties(
  context: CopilotSessionContext,
  answers: ReadinessAnswers | null,
  properties: CopilotPropertyDraft[]
): ToolBundle {
  if (properties.length < 2) {
    return {
      markdown:
        "## Porovnání nemovitostí\n\nPřidejte alespoň **dvě nemovitosti** (cena + pojmenování) v panelu vlevo, nebo napište např. „porovnej byt za 6,2 mil a 7,1 mil“.\n\nCopilot neprohledává inzeráty — pracuje jen s tím, co zadáte.",
      tools: [
        {
          toolId: "property.compare",
          ok: false,
          summary: "need_two_properties",
        },
      ],
      citations: [methodologyCitation()],
      usedInputs: [],
      dataKeys: [],
    cta: [
      { label: "Profesionální srovnání", href: routes.investicniRentgenPorovnani },
      { label: "Rentgen nemovitosti", href: routes.investicniRentgen },
    ],
    };
  }

  const gate = needProfile(context);
  const { result } =
    answers && context.hasReadinessProfile
      ? runReadiness(answers, context)
      : { result: null };
  const capacity =
    result && answers
      ? (result.financingRange?.high ?? 0) + Math.max(0, answers.ownFunds)
      : null;

  const rows = properties.slice(0, 4).map((p) => {
    const fit =
      capacity == null
        ? "profil chybí"
        : p.priceCzk <= capacity * 0.85
          ? "konzervativní fit"
          : p.priceCzk <= capacity
            ? "hraniční fit"
            : "nad stropem";
    return `| ${p.label} | ${fmtCzk(p.priceCzk)} | ${fit} |`;
  });

  const md = [
    "## Porovnání zadaných nemovitostí",
    "",
    "| Nemovitost | Cena | Shoda s modelem |",
    "|---|---|---|",
    ...rows,
    "",
    capacity != null
      ? `Referenční modelová kapacita: **${fmtCzk(capacity)}**.`
      : "Bez profilu připravenosti hodnotím jen ceny vůči sobě — otevřete připravenost pro fit.",
    "",
    "Srovnání **neřeší** lokalitu, právní vady, HOA ani výnos — k tomu použijte Rentgen / specialistu.",
  ].join("\n");

  return {
    markdown: md,
    tools: [
      {
        toolId: "property.compare",
        ok: true,
        summary: `n=${properties.length}`,
      },
      ...(gate
        ? []
        : [
            {
              toolId: "mortgage_readiness.calculateReadiness",
              ok: true,
              summary: "capacity_for_fit",
            },
          ]),
    ],
    citations: [readinessCitation(), methodologyCitation()],
    usedInputs: properties.slice(0, 4).map((p) => ({
      key: `property:${p.id}`,
      label: p.label,
      display: fmtCzk(p.priceCzk),
      claimKind: "ODHAD" as ClaimKind,
    })),
    dataKeys: ["copilot.properties", "readiness.result"],
    cta: [
      { label: "Profesionální srovnání", href: routes.investicniRentgenPorovnani },
      { label: "Rentgen", href: routes.investicniRentgen },
      { label: "Připravenost", href: routes.navrhNaMiru },
    ],
  };
}

export function toolRateStress(
  context: CopilotSessionContext,
  answers: ReadinessAnswers | null,
  bumpPp = 2
): ToolBundle {
  const gate = needProfile(context);
  if (gate) return gate;
  if (!answers) return needProfile({ ...context, hasReadinessProfile: false })!;

  const { result, rateUsed, claim } = runReadiness(answers, context);
  const loan = result.financingRange?.high ?? 0;
  const age = answers.age ?? 40;
  const termYears = Math.min(30, Math.max(5, 65 - age));
  const basePay =
    loan > 0 ? calculateAnnuityPayment(loan, rateUsed, termYears) : 0;
  const stressPay =
    loan > 0
      ? calculateAnnuityPayment(loan, rateUsed + bumpPp, termYears)
      : 0;
  const delta = stressPay - basePay;

  const md = prependRateNotice(
    [
      `## Zátěžový test: sazba +${bumpPp} p.b. při refixaci`,
      "",
      `Model na úvěru **${fmtCzk(loan)}**, splatnost **${termYears} let** (evidence: **MODEL**):`,
      "",
      `| Scénář | Sazba | Měsíční splátka |`,
      `|---|---|---|`,
      `| Základ | ${rateUsed.toFixed(2)} % | ${fmtCzk(basePay)} |`,
      `| Stress | ${(rateUsed + bumpPp).toFixed(2)} % | ${fmtCzk(stressPay)} |`,
      `| Rozdíl | +${bumpPp} p.b. | **+${fmtCzk(delta)}** |`,
      "",
      "Jde o **anuitní model** Hypotéka Jasně, ne o konkrétní produkt banky po refixaci. Nejde o garanci splátky.",
    ].join("\n"),
    context
  );

  return {
    markdown: md,
    tools: [
      {
        toolId: "calculators.calculateAnnuityPayment",
        ok: true,
        summary: `bump=+${bumpPp}; delta=${Math.round(delta)}`,
      },
    ],
    citations: [
      decisionCitation(),
      rateCitation(context.modelRateUpdatedAt, claim),
      methodologyCitation(),
    ],
    usedInputs: [
      {
        key: "loan_model",
        label: "Modelový úvěr",
        display: fmtCzk(loan),
        claimKind: "MODEL",
      },
      {
        key: "rate",
        label: "Sazba ve scénáři",
        display: `${rateUsed.toFixed(2)} %`,
        claimKind: claim,
      },
      {
        key: "stress_bump",
        label: "Nárůst sazby",
        display: `+${bumpPp} p.b.`,
        claimKind: "MODEL",
      },
    ],
    dataKeys: ["readiness.financingRange", "rate"],
    modelAssumptions: [
      ...rateAssumptions(context, rateUsed, claim),
      `Stress scénář: +${bumpPp} p.b. k sazbě (hypotetický, ne predikce trhu).`,
    ],
    unknowns: [
      "Skutečná sazba banky po refixaci",
      "Poplatky a pojištění nové smlouvy",
    ],
    cta: [{ label: "Kalkulačka", href: routes.kalkulacky.root }],
  };
}

export function toolMarketCompare(
  context: CopilotSessionContext,
  message: string
): ToolBundle {
  const wantsDubai = /dubaj|uae|sae/i.test(message);
  const wantsPraha = /praha|čr|cesk/i.test(message);

  const dossierCz = getCountryDossier("cz");
  const dossierAe = getCountryDossier("dubai");

  // Lightweight passport defaults — no PII
  const form: PassportFormData = {
    capital: "2000000",
    financing: "partial",
    purpose: wantsDubai && !wantsPraha ? "yield_max" : "conservative",
    horizon: "1_year",
    region:
      wantsDubai && !wantsPraha
        ? "exotic_high_yield"
        : wantsPraha && !wantsDubai
          ? "czech_slovak"
          : "eu_stability",
    name: "",
    email: "",
    phone: "",
  };

  const matching = matchMarkets(form);
  const top = matching.topMarkets.slice(0, 3);

  const md = [
    "## Srovnání trhů (model matching)",
    "",
    "Copilot **neslibuje vyšší výnos** v Dubaji ani jistotu v Praze. Níže je organické skóre Investičního pasu + odkazy na dossier.",
    "",
    "### Top shody podle váženého modelu",
    ...top.map(
      (m, i) =>
        `${i + 1}. **${m.name}** — skóre ${Math.round(m.overallMatch)}/100 (${m.dataFreshness.status})`
    ),
    "",
    `**ČR:** ${dossierCz.tagline}`,
    `**Dubaj / SAE:** ${dossierAe.tagline}`,
    "",
    context.hasReadinessProfile
      ? `Váš záměr v profilu: **${context.intentLabel}**.`
      : "Pro personalizaci dokončete Investiční pas nebo připravenost.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    markdown: md,
    tools: [
      {
        toolId: "market_matching.matchMarkets",
        ok: true,
        summary: `top=${top.map((t) => t.marketId).join(",")}`,
      },
    ],
    citations: [
      marketMatchCitation(),
      methodologyCitation(),
      {
        id: "dossier:cz",
        label: "Průvodce investora — Česká republika",
        source: "Průvodce investora",
        updatedAt: null,
        claimKind: "MODEL",
        href: routes.pruvodceInvestora + "/ceska-republika",
      },
      {
        id: "dossier:dubai",
        label: "Průvodce investora — Dubaj",
        source: "Průvodce investora",
        updatedAt: null,
        claimKind: "MODEL",
        href: routes.pruvodceInvestora + "/dubaj",
      },
    ],
    usedInputs: [
      {
        key: "matching_region",
        label: "Region preference (odvozeno z dotazu)",
        display: form.region || "—",
        claimKind: "ODHAD",
      },
    ],
    dataKeys: ["market_matching", "country_dossier"],
    cta: [
      { label: "Investiční pas", href: routes.investicniPas },
      { label: "Průvodce investora", href: routes.pruvodceInvestora },
    ],
  };
}

/** Document checklist — editorial MODEL, not bank-specific. */
export function toolMissingDocuments(
  context: CopilotSessionContext,
  answers: ReadinessAnswers | null
): ToolBundle {
  const items: string[] = [
    "Občanský průkaz / doklad totožnosti",
    "Doklady o příjmu (výplatní pásky / daňové přiznání OSVČ / výkazy s.r.o. dle typu příjmu)",
    "Výpisy z účtu (obvykle 3–6 měsíců — vyžaduje konkrétní banka)",
    "Potvrzení o vlastních zdrojích / darovací smlouva pokud relevantní",
  ];

  if (answers?.intent === "refinance") {
    items.push("Stávající úvěrová smlouva a zůstatek jistiny");
    items.push("Informace o zbývající fixaci");
  }
  if (answers?.intent === "foreign_purchase") {
    items.push("Podklady k zahraniční nemovitosti / rezervační smlouva (pokud existuje)");
    items.push("Doklady k českému zajištění, pokud financujete přes ČR");
  }
  if (answers?.coApplicant) {
    items.push("Stejné doklady pro spolužadatele");
  }
  if (answers?.noRecentDefaults === false) {
    items.push("Vysvětlení negativní historie — banka posoudí individuálně");
  }

  const md = [
    "## Orientační checklist dokumentů",
    "",
    "Seznam je **edukativní MODEL** Hypotéka Jasně — každá banka má vlastní seznam.",
    "",
    ...items.map((i) => `- [ ] ${i}`),
    "",
    context.hasReadinessProfile
      ? `Záměr v profilu: **${context.intentLabel}**.`
      : "Doplňte připravenost pro přesnější checklist podle záměru.",
  ].join("\n");

  return {
    markdown: md,
    tools: [
      {
        toolId: "checklist.documents",
        ok: true,
        summary: `items=${items.length}`,
      },
    ],
    citations: [
      readinessCitation(),
      methodologyCitation(),
      {
        id: "academy:process",
        label: "Hypoteční akademie",
        source: "editorial",
        updatedAt: null,
        claimKind: "MODEL",
        href: routes.akademie,
      },
    ],
    usedInputs: [
      {
        key: "intent",
        label: "Záměr",
        display: context.intentLabel ?? "nevyplněno",
        claimKind: "DATA",
      },
    ],
    dataKeys: ["readiness.intent", "editorial.checklist"],
    cta: [
      { label: "Akademie", href: routes.akademie },
      { label: "Specialista", href: routes.navrhNaMiru },
    ],
  };
}

export function toolActionPlan(
  context: CopilotSessionContext,
  answers: ReadinessAnswers | null
): ToolBundle {
  const gate = needProfile(context);
  if (gate) return gate;
  if (!answers) return needProfile({ ...context, hasReadinessProfile: false })!;

  const { result } = runReadiness(answers, context);
  const plan = result.actionPlan;

  const md = [
    "## Akční plán (z modelu připravenosti)",
    "",
    "### 30 dní",
    ...plan.days30.map((s) => `- ${s}`),
    "",
    "### 3 měsíce",
    ...plan.months3.map((s) => `- ${s}`),
    "",
    "### 6–12 měsíců",
    ...plan.months6to12.map((s) => `- ${s}`),
    "",
    "### Další kroky nástroje",
    ...result.nextSteps.map((s) => `- ${s}`),
  ].join("\n");

  return {
    markdown: md,
    tools: [
      {
        toolId: "mortgage_readiness.actionPlan",
        ok: true,
        summary: `score=${result.score}`,
      },
    ],
    citations: [readinessCitation(), methodologyCitation()],
    usedInputs: [
      {
        key: "score",
        label: "Skóre",
        display: `${result.score}/100`,
        claimKind: "MODEL",
      },
    ],
    dataKeys: ["readiness.actionPlan"],
    cta: [
      { label: "Otevřít připravenost", href: routes.navrhNaMiru },
      { label: "Majetio (discovery)", href: routes.oMajetio },
    ],
  };
}

export function toolRiskAnalysis(
  context: CopilotSessionContext,
  answers: ReadinessAnswers | null
): ToolBundle {
  const gate = needProfile(context);
  if (gate) return gate;
  if (!answers) return needProfile({ ...context, hasReadinessProfile: false })!;

  const { result, rateUsed } = runReadiness(answers, context);
  const stress = toolRateStress(context, answers, 2);

  const md = [
    "## Analýza rizika (model)",
    "",
    `Skóre **${result.score}/100**, modelová sazba **${rateUsed.toFixed(2)} %**.`,
    "",
    "### Rizikové faktory z profilu",
    ...(result.riskFactors.length
      ? result.riskFactors.map((r) => `- ${r}`)
      : ["- Model nevypíchnul specifický rizikový flag — neznamená nulové riziko."]),
    "",
    "### Překážky",
    ...result.obstacles.map((o) => `- ${o}`),
    "",
    "### Ukázka citlivosti na sazbu",
    stress.markdown.split("\n").slice(3).join("\n"),
  ].join("\n");

  return {
    markdown: md,
    tools: [
      {
        toolId: "mortgage_readiness.risk",
        ok: true,
        summary: `risks=${result.riskFactors.length}`,
      },
      ...stress.tools,
    ],
    citations: [...stress.citations],
    usedInputs: [
      {
        key: "score",
        label: "Skóre",
        display: `${result.score}/100`,
        claimKind: "MODEL",
      },
    ],
    dataKeys: ["readiness.riskFactors", "stress"],
    cta: [
      { label: "Stress v kalkulačce", href: routes.kalkulacky.root },
      { label: "Specialista", href: routes.navrhNaMiru },
    ],
  };
}

export function toolNextStep(
  context: CopilotSessionContext,
  answers: ReadinessAnswers | null
): ToolBundle {
  if (!context.hasReadinessProfile || !answers) {
    return {
      markdown:
        "## Doporučený další krok\n\n1. Vyplňte **Hypoteční připravenost** (lokální profil).\n2. Spočítejte dostupnost v Copilotu.\n3. Až budete chtít individualizaci, kontaktujte specialistu s explicitním souhlasem.",
      tools: [{ toolId: "routing.next_step", ok: true, summary: "onboard" }],
      citations: [methodologyCitation()],
      usedInputs: [],
      dataKeys: [],
      cta: [{ label: "Spustit připravenost", href: routes.navrhNaMiru }],
    };
  }

  const { result } = runReadiness(answers, context);
  const primary = result.nextSteps[0] ?? "Zkontrolujte profil a zátěžový test sazby.";

  const md = [
    "## Váš další krok",
    "",
    `**Teď:** ${primary}`,
    "",
    "Pak:",
    ...result.nextSteps.slice(1, 4).map((s, i) => `${i + 2}. ${s}`),
    "",
    "Copilot vás **nesměřuje** k nákupu ani ke konkrétní bance — jen k ověřeným nástrojům platformy.",
  ].join("\n");

  return {
    markdown: md,
    tools: [
      {
        toolId: "routing.next_step",
        ok: true,
        summary: `score=${result.score}`,
      },
    ],
    citations: [readinessCitation()],
    usedInputs: [],
    dataKeys: ["readiness.nextSteps"],
    cta: [
      { label: "Akční plán", href: routes.navrhNaMiru },
      { label: "Kontakt", href: routes.kontakt },
    ],
  };
}

export function toolContactSpecialist(): ToolBundle {
  return {
    markdown: [
      "## Kontaktovat specialistu",
      "",
      "Předání kontaktu partnerovi probíhá **jen se souhlasem** (oddělený od marketingu) a jen pokud je identita partnera ověřena.",
      "",
      "1. Dokončete / zkontrolujte [Hypoteční připravenost](" +
        routes.navrhNaMiru +
        ") — odeslání leadu je na konci s checkboxy.",
      "2. Stav partnera a role: [/partneri](" +
        routes.partneri +
        ") — předání specialistovi jen se souhlasem a jen pokud je identita partnera zveřejněna.",
      "3. My nejsme banka a neschvalujeme úvěr. Konzultace je nezávazná.",
    ].join("\n"),
    tools: [
      {
        toolId: "handoff.specialist",
        ok: true,
        summary: "route_to_consent_form",
      },
    ],
    citations: [
      {
        id: "legal:roles",
        label: "Role v ekosystému",
        source: "Centrum důvěry",
        updatedAt: null,
        claimKind: "DATA",
        href: routes.duvera,
      },
      {
        id: "partners",
        label: "Partneři",
        source: "/partneri",
        updatedAt: null,
        claimKind: "DATA",
        href: routes.partneri,
      },
    ],
    usedInputs: [],
    dataKeys: [],
    cta: [
      { label: "Připravenost + specialista", href: routes.navrhNaMiru },
      { label: "Partneři", href: routes.partneri },
    ],
  };
}

export function toolClarify(): ToolBundle {
  return {
    markdown: [
      "## Upřesněte prosím dotaz",
      "",
      "Umím pracovat s těmito záměry (pouze nad daty platformy):",
      "- Kolik si bezpečně dovolit",
      "- Vysvětlit skóre připravenosti",
      "- Cílová částka (např. 7 milionů)",
      "- Bezpečnost konkrétní ceny bytu",
      "- Porovnat nemovitosti",
      "- Zátěžový test sazby +2 %",
      "- Praha vs Dubaj (model matching)",
      "- Chybějící dokumenty / další krok",
      "",
      "Nepište citlivé údaje do chatu, pokud nemusíte — profil beru z lokální připravenosti.",
    ].join("\n"),
    tools: [{ toolId: "intent.clarify", ok: true, summary: "ask_clarify" }],
    citations: [methodologyCitation()],
    usedInputs: [],
    dataKeys: [],
    cta: [
      { label: "Spočítat dostupnost", href: "#quick-affordability" },
      { label: "Připravenost", href: routes.navrhNaMiru },
    ],
  };
}

export function toolOutOfScope(): ToolBundle {
  return {
    markdown: [
      "## Mimo působnost Copilota",
      "",
      "Neposkytuji příslib schválení, daňové optimalizace „obejitím“ ani právní zastoupení.",
      "",
      "Mohu: spočítat modelovou dostupnost, vysvětlit skóre, zátěžový test, checklist a nasměrovat na specialistu.",
      "",
      "Evidence: požadavek spadá do **UNKNOWN / mimo SoT** — neodpovídám spekulací.",
    ].join("\n"),
    tools: [{ toolId: "guardrail.out_of_scope", ok: true, summary: "refused" }],
    citations: [methodologyCitation()],
    usedInputs: [],
    dataKeys: [],
    unknowns: [
      "Schválení bankou",
      "Individuální právní/daňová rada",
      "Garantovaný výnos",
    ],
    cta: [{ label: "Otevřít připravenost", href: routes.navrhNaMiru }],
  };
}

/** Parse "6,2 mil a 7,1 mil" style pairs into property drafts. */
export function parsePricesFromMessage(message: string): CopilotPropertyDraft[] {
  const re = /(\d+[.,]?\d*)\s*(mil|mili[oó]n)/gi;
  const found: CopilotPropertyDraft[] = [];
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(message)) && i < 4) {
    const n = Number(m[1]!.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) continue;
    i += 1;
    found.push({
      id: `msg_${i}_${Math.round(n * 1e6)}`,
      label: `Varianta ${i}`,
      priceCzk: Math.round(n * 1_000_000),
    });
  }
  return found;
}

export { maxLoanFromPayment };
