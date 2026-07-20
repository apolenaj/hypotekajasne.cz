import type { OfferStrategyInput, OfferTextDraft } from "@/lib/offer-strategy/types";
import { formatOfferCzk } from "@/lib/offer-strategy/calculate";

const FORBIDDEN_PHRASES = [
  /falešn/i,
  /lž/i,
  /nepravdiv/i,
  /manipul/i,
  /ultimát/i,
  /jen dnes/i,
  /nikdo jiný nechce/i,
  /poslední šance/i,
];

export function assertEthicalOfferText(text: string): void {
  for (const p of FORBIDDEN_PHRASES) {
    if (p.test(text)) {
      throw new Error(
        "Návrh textu nesmí obsahovat manipulativní nebo neetické formulace."
      );
    }
  }
}

export function buildOfferTextDraft(input: {
  strategyInput: OfferStrategyInput;
  openingPriceCzk: number;
  targetPriceCzk: number;
  propertyLabel: string;
}): OfferTextDraft {
  const body = [
    "Vážený/á prodávající,",
    "",
    `děkuji za možnost projednat koupi nemovitosti ${input.propertyLabel}.`,
    "",
    `Po prostudování dostupných informací a srovnání s trhem (MODEL HypotékaJasně, ne znalecký posudek) `,
    `Vám předkládám nezávazný návrh kupní ceny ve výši ${formatOfferCzk(input.openingPriceCzk)}.`,
    "",
    `Můj cíl je dohodnout se na férové ceně blízké ${formatOfferCzk(input.targetPriceCzk)}, `,
    `s ohledem na stav nemovitosti, délku inzerce a připravenost financování.`,
    "",
    "Financování mám připravené / v procesu ověření u banky (doplňte dle skutečnosti).",
    "Termín předání a další podmínky jsem ochoten/na projednat.",
    "",
    "Děkuji za odpověď.",
    "",
    "S pozdravem",
    "[Vaše jméno]",
  ].join("\n");

  assertEthicalOfferText(body);

  return {
    subject: `Návrh kupní ceny — ${input.propertyLabel}`,
    body,
    claimKind: "MODEL",
    ethicsNote:
      "NÁVRH TEXTU — upravte podle skutečnosti. Nepoužívejte neověřené informace o konkurenci ani falešné termíny.",
  };
}
