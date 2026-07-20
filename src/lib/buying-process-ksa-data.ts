import type { BuyingProcessStep } from "@/lib/buying-process-cz-data";

export const buyingProcessKsaData: BuyingProcessStep[] = [
  {
    step: 1,
    title: "Ověření zóny a způsobilosti (Non-Saudi Ownership 2026)",
    description:
      "Od ledna 2026 platí Law on Real Estate Ownership by Non-Saudis — zónový rámec místo čistě povolovacího režimu.",
    details: [
      "Ověřte, že nemovitost leží v povolené geografické zóně (Saudi Properties / REGA).",
      "Premium Residency zůstává samostatnou cestou, ale není jedinou podmínkou vlastnictví pod novým zákonem.",
      "Mekka a Medina podléhají zpřísněným omezením.",
    ],
    warning:
      "Umístění v zóně neznamená automatickou způsobilost kupujícího — ověřte kategorii nabyvatele před platbou.",
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
