import { financialPartner, legalOperator } from "@/config/legal";

export const FAQ_ITEMS = [
  {
    q: "Poskytujete přímo hypotéky nebo finanční poradenství?",
    a: `${legalOperator.brand} je digitální platforma provozovaná společností ${legalOperator.companyName} Nejsme banka. ${financialPartner.cooperationWording} Schválení úvěru vždy provádí banka po vlastním posouzení. Role jsou popsány v Centru důvěry (/duvera) a na /partneri.`,
  },
  {
    q: "Jsou vaše kalkulace a investiční skóre závazné?",
    a: "Ne. Výpočty na webu jsou modelové a orientační. Skutečné sazby, poplatky a výnosy se liší. Závaznou nabídku vydává banka.",
  },
  {
    q: "Platím něco za využívání kalkulaček?",
    a: "Používání nástrojů na webu je pro vás zdarma. Můžeme získat odměnu od partnera, pokud přes nás dojde k realizaci. Detail: /jak-vydelavame.",
  },
  {
    q: "Komu předáváte mé kontakty?",
    a: `Údaje přijímá provozovatel platformy ${legalOperator.companyName} (správce) pro nezávaznou konzultaci. Předání dalším subjektům jen se souhlasem dle GDPR. Majetio, makléř nebo developer jsou oddělené role. ${legalOperator.brand} není banka.`,
  },
] as const;
