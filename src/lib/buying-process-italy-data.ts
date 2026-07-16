import type { BuyingProcessStep } from "@/lib/buying-process-cz-data";

export const buyingProcessItalyData: BuyingProcessStep[] = [
  {
    step: 1,
    title: "Codice Fiscale a bankovní účet",
    description:
      "Bez italského daňového kódu (Codice Fiscale) nemůžete v Itálii koupit ani kávu v realitní kanceláři.",
    details: [
      "Codice Fiscale vyřídíte na italském konzulátu nebo finančním úřadě (Agenzia delle Entrate).",
      "Otevření italského účtu je nutné pro platby energií a daní.",
    ],
    warning: "Bez Codice Fiscale neuzavřete žádnou smlouvu. Nezačínejte proces bez něj.",
  },
  {
    step: 2,
    title: "Proposta d'Acquisto (Nabídka)",
    description: "Předběžná nabídka ceny doprovázená malou zálohou (caparra).",
    details: [
      "Podpisem nabídky se zavazujete ke koupi za danou cenu.",
      "Prodávající má lhůtu na přijetí.",
    ],
    warning:
      "Pozor na doložky v 'Proposta'. Po jejím přijetí prodávajícím se stává závaznou smlouvou.",
  },
  {
    step: 3,
    title: "Compromesso (Předběžná smlouva)",
    description: "Závazná smlouva, kde skládáte hlavní zálohu (obvykle 10–20 %).",
    details: [
      "Zde se definují finální podmínky a termín převodu.",
      "Pokud prodávající odstoupí, musí vám vrátit dvojnásobek zálohy.",
    ],
    warning:
      "Zde musí proběhnout hloubková prověrka (due diligence). Prověřte, zda nemovitost nemá 'abuso edilizio' (černé stavby).",
  },
  {
    step: 4,
    title: "Role Notáře (Notaio)",
    description:
      "Italský notář je nezávislý úředník, který provádí finální právní prověrku.",
    details: [
      "Notář prověřuje vlastnictví, exekuce a legálnost stavby.",
      "Notář je placen kupujícím, ale je neutrální stranou.",
    ],
    warning:
      "Notář neprovádí technickou inspekci. To je na vás! Najměte si technika (geometra).",
  },
  {
    step: 5,
    title: "Atto di Vendita (Kupní smlouva)",
    description: "Podpis finální smlouvy před notářem a úhrada doplatku.",
    details: [
      "Notář přečte smlouvu, podepisuje se, probíhá úhrada daně (Imposta di Registro) a odměny notáře.",
      "Penězi z prodeje se uhradí případné hypotéky prodávajícího.",
    ],
    warning:
      "Ujistěte se, že všechny poplatky (spese condominiali) jsou vypořádány do dne podpisu.",
  },
  {
    step: 6,
    title: "Registrace a daně",
    description: "Notář zajistí přepis v katastru (Conservatoria).",
    details: [
      "Přepis energií na nového majitele (voltura).",
      "Přihlášení k místní dani TARI (odpad).",
    ],
    warning:
      "Důsledně hlídejte platbu daně z převodu. V Itálii jsou postihy za pozdní podání vysoké.",
  },
];
