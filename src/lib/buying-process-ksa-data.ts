import type { BuyingProcessStep } from "@/lib/buying-process-cz-data";

export const buyingProcessKsaData: BuyingProcessStep[] = [
  {
    step: 1,
    title: "Povolení k nákupu (Premium Residency)",
    description: "Cizinci potřebují povolení ke koupi nemovitosti v KSA.",
    details: [
      "Nejčastější cestou je získání 'Premium Residency' (zlaté vízum).",
      "Nákup je povolen pouze ve vybraných zónách a projektech.",
    ],
    warning:
      "Před jakoukoli platbou si nechte písemně potvrdit, že jako cizinec máte v daném projektu právo na vlastnictví.",
  },
  {
    step: 2,
    title: "Ověření Sakk (Vlastnický list)",
    description:
      "Sakk je digitální vlastnický list, který musí být validován ministerstvem spravedlnosti.",
    details: [
      "Sakk obsahuje veškerou historii a právní stav.",
      "Ověřte pravost sakku v systému 'Najiz'.",
    ],
    warning:
      "V KSA existují i starší nedigitalizované sakky, které jsou vysoce rizikové. Trvejte výhradně na elektronickém sakku.",
  },
  {
    step: 3,
    title: "Rezervační smlouva a záloha",
    description: "Uzavření smlouvy o koupi s developerem.",
    details: [
      "Smlouva se obvykle řídí saúdským právem.",
      "Platby probíhají na schválené escrow účty projektů.",
    ],
    warning:
      "Pozor na platební termíny – prodlení může vést k okamžitému stornu smlouvy ze strany developera bez náhrady.",
  },
  {
    step: 4,
    title: "Due Diligence",
    description: "Prověření souladu s vládními standardy.",
    details: [
      "Prověření, zda je nemovitost v 'Freehold' zóně (povolené pro cizince).",
      "Ověření technického dozoru vládními orgány.",
    ],
    warning:
      "V KSA je státní dozor nad developery silný, ale vždy ověřte licenci developera na portálu Wafi.",
  },
  {
    step: 5,
    title: "Podpis kupní smlouvy (Notář/Soud)",
    description: "Finální podpis smlouvy, často v elektronické podobě přes portál Najiz.",
    details: [
      "Smlouva je propojena s vaším ID a bankovním účtem.",
      "Probíhá zápis do systému Real Estate Registry.",
    ],
    warning:
      "Všechny dokumenty musí být v arabštině (oficiální verze), zajistěte si certifikovaný překlad.",
  },
  {
    step: 6,
    title: "Přepis vlastnictví",
    description: "Aktualizace vlastnictví v systému Real Estate Registry.",
    details: [
      "Obdržíte elektronické potvrzení o vlastnictví.",
      "Registrace k úhradě poplatků a služeb (utility).",
    ],
    warning:
      "Pravidelně kontrolujte svůj stav na portálu Najiz, zda jsou všechny údaje o nemovitosti správné.",
  },
];
