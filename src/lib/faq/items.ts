import { legalOperator, withSentencePeriod } from "@/config/legal";
import {
  buildLeadFormIntakeDisclosure,
  buildRegulatoryPlatformBlock,
  getCooperationWordingNeutral,
  rt,
  CALCULATOR_DISCLAIMER,
} from "@/lib/legal/regulatory-texts";

export const FAQ_ITEMS = [
  {
    q: "Poskytujete přímo hypotéky nebo finanční poradenství?",
    a: `${buildRegulatoryPlatformBlock("cs").platformLine} Provozovatelem je ${withSentencePeriod(legalOperator.companyName)} ${getCooperationWordingNeutral("cs")} Schválení úvěru vždy provádí banka po vlastním posouzení. Role jsou popsány v Centru důvěry (/duvera) a na /partneri.`,
  },
  {
    q: "Jsou vaše kalkulace a investiční skóre závazné?",
    a: rt("cs", CALCULATOR_DISCLAIMER),
  },
  {
    q: "Platím něco za využívání kalkulaček?",
    a: "Používání nástrojů na webu je pro vás zdarma. Můžeme získat odměnu od partnera, pokud přes nás dojde k realizaci. Detail: /jak-vydelavame.",
  },
  {
    q: "Komu předáváte mé kontakty?",
    a: `${buildLeadFormIntakeDisclosure("cs")} Předání dalším subjektům jen se souhlasem dle GDPR. Majetio, makléř nebo developer jsou oddělené role.`,
  },
] as const;
