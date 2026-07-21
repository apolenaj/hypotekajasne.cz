/**
 * B2B Professional Portal — přehled vrstev pro partnery (klientský jazyk).
 */

export const B2B_ARCHITECTURE_LAYERS = [
  {
    id: "identity",
    name: "Organizace a role",
    description:
      "Účty firem, členové týmu a přepínání mezi organizacemi. Přihlášení a správa přístupů postupně rozšiřujeme.",
  },
  {
    id: "catalog",
    name: "Nemovitosti a projekty",
    description:
      "Evidence poptávek makléřů a developerských projektů včetně jednotek a dokumentů.",
  },
  {
    id: "analysis_engine",
    name: "Analýza (oddělené skóre)",
    description:
      "Investiční ukazatele spočítáme z nezávislých a modelových údajů ještě před platbou. Platba odemyká doručení reportu, skóre nemění.",
  },
  {
    id: "billing",
    name: "Fakturace",
    description:
      "Návrhy faktur, ceníkové položky a daňové údaje. Napojení platební brány připravujeme.",
  },
  {
    id: "report_delivery",
    name: "Doručení reportů",
    description:
      "Stažení reportu, tisk do PDF a časově omezené odkazy ke sdílení.",
  },
  {
    id: "engagement",
    name: "Anonymní sledování zájmu",
    description:
      "Počítáme zobrazení a stažení sdílených odkazů bez osobních údajů v analytice.",
  },
  {
    id: "leads",
    name: "Kvalifikovaný zájem (se souhlasem)",
    description:
      "Kontakty ukládáme jen po výslovném souhlasu a s auditním záznamem.",
  },
  {
    id: "audit",
    name: "Auditní záznam",
    description:
      "Přehled důležitých akcí v organizaci — objednávky, sdílení, fakturace a souhlasy.",
  },
] as const;

export const B2B_SCORE_ISOLATION_RULES = [
  "Investiční skóre se spočítá při vytvoření objednávky jen z nezávislých dat a modelových odhadů.",
  "Údaje od partnera zobrazujeme odděleně a do skóre nevstupují.",
  "Stav platby (čeká na platbu → zaplaceno) skóre znovu nepočítá.",
  "Sponzorované pozice jsou jen vizuální sloty — skóre nemění.",
  "Označení Majetio Property Intelligence je attribution doručení, ne úprava skóre.",
] as const;

export const B2B_API_SURFACE = [
  { method: "GET", path: "/api/bridge/b2b/analysis/order", status: "contract" },
  { method: "POST", path: "/api/bridge/b2b/analysis/order", status: "BETA" },
  { method: "POST", path: "/api/bridge/b2b/engagement", status: "BETA" },
  { method: "GET", path: "/api/bridge/b2b/organizations", status: "COMING_SOON" },
] as const;

export const B2B_FUTURE_SUBSCRIPTION_NOTE =
  "Firemní předplatné připravujeme — zatím je k dispozici evidence jednotlivých analýz.";
