import type { BuyingProcessStep } from "@/lib/buying-process-cz-data";

export const buyingProcessUaeData: BuyingProcessStep[] = [
  {
    step: 1,
    title: "Prověření developera a projektu (RERA)",
    description:
      "Před podpisem čehokoliv ověřte, zda má projekt platnou registraci u RERA (Real Estate Regulatory Agency).",
    details: [
      "Prověřte projekt v aplikaci Dubai REST.",
      "Ověřte, zda je pozemek volný od právních vad.",
    ],
    warning:
      "Nikdy neposílejte peníze developerovi, pokud projekt nemá registrovaný Escrow účet u dubajské banky!",
  },
  {
    step: 2,
    title: "Rezervační smlouva (MOU)",
    description: "Podpis Memorandum of Understanding (MOU).",
    details: [
      "Uvádí cenu, platební podmínky a termín předání.",
      "Skládá se rezervační poplatek (typicky 5–10 %).",
    ],
    warning:
      "MOU je právně závazný dokument. Po jeho podpisu jste vázáni ke koupi, pokud nesplníte odkládací podmínky.",
  },
  {
    step: 3,
    title: "Sales & Purchase Agreement (SPA)",
    description: "Hlavní kupní smlouva mezi vámi a developerem.",
    details: [
      "Definuje přesné specifikace bytu (plánky, materiály).",
      "Obsahuje sankce za zpoždění výstavby.",
    ],
    warning:
      "Čtěte pozorně doložky o změně dispozic – developeři si často vyhrazují právo na drobné úpravy plánků.",
  },
  {
    step: 4,
    title: "Registrace na DLD (4 % daň)",
    description: "Povinná registrace nemovitosti na Dubai Land Department (DLD).",
    details: [
      "Platí se 4 % z ceny nemovitosti + administrativní poplatek.",
      "Registrace musí proběhnout co nejdříve po podpisu SPA.",
    ],
    warning:
      "Prodlení s registrací na DLD může vést ke stornování transakce ze strany developera.",
  },
  {
    step: 5,
    title: "Platební milníky (Escrow)",
    description: "U off-plan projektů platíte podle výstavby.",
    details: [
      "Plaťte pouze na bankovní účet projektu (Escrow), nikdy ne na osobní účet makléře.",
      "Sledujte progres v Dubai REST.",
    ],
    warning:
      "Plaťte pouze v souladu se splátkovým kalendářem v SPA. Předčasné platby bez dohody vám nedávají žádnou výhodu.",
  },
  {
    step: 6,
    title: "Handover a Title Deed",
    description: "Dokončení výstavby a přepis na vaše jméno.",
    details: [
      "Prohlídka (snagging) – kontrola vad a nedodělků.",
      "Vydání Title Deed (list vlastnictví) po doplacení ceny.",
    ],
    warning:
      "Při předání trvejte na opravě všech vad před podpisem protokolu o převzetí. Poté je reklamace mnohem složitější.",
  },
];
