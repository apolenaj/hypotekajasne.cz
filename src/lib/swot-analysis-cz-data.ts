export type SwotSectionColor = "emerald" | "orange" | "blue" | "red";

export type SwotSectionIcon =
  | "ShieldCheck"
  | "TrendingDown"
  | "Lightbulb"
  | "AlertOctagon";

export interface SwotAnalysisItem {
  subtitle: string;
  text: string;
}

export interface SwotAnalysisSection {
  id: string;
  title: string;
  icon: SwotSectionIcon;
  color: SwotSectionColor;
  items: SwotAnalysisItem[];
}

export const swotAnalysisCzData: SwotAnalysisSection[] = [
  {
    id: "strengths",
    title: "Silné stránky (Strengths)",
    icon: "ShieldCheck",
    color: "emerald",
    items: [
      {
        subtitle: "Právní jistota a stabilita",
        text: "Extrémně bezpečný systém evidence v Katastru nemovitostí. Historicky prověřená ochrana vlastnických práv.",
      },
      {
        subtitle: "Vysoká poptávka po nájmech",
        text: "Růst úrokových sazeb vyhnal část střední třídy z vlastnického do nájemního bydlení, což drží obsazenost bytů na maximu.",
      },
      {
        subtitle: "Nízká daň z nemovitosti",
        text: "Oproti západní Evropě je v ČR daň z nemovitosti stále paušální a neodvíjí se od tržní hodnoty majetku (nepohlcuje výnos).",
      },
    ],
  },
  {
    id: "weaknesses",
    title: "Slabé stránky (Weaknesses)",
    icon: "TrendingDown",
    color: "orange",
    items: [
      {
        subtitle: "Pomalé stavební řízení",
        text: "Dlouhé povolování nových staveb drasticky omezuje nabídku, což sice drží ceny nahoře, ale brzdí dynamiku trhu.",
      },
      {
        subtitle: "Nízké hrubé výnosy (Yields)",
        text: "Základní výnos z nájmu v Praze a Brně se pohybuje jen kolem 3,5–4 % p.a., což často ani nepokryje úrok hypotéky.",
      },
      {
        subtitle: "Nejhorší dostupnost v Evropě",
        text: "Poměr průměrné mzdy k ceně nemovitosti je v ČR jeden z nejhorších v EU, což omezuje likviditu (méně kupců dosáhne na úvěr).",
      },
    ],
  },
  {
    id: "opportunities",
    title: "Příležitosti (Opportunities)",
    icon: "Lightbulb",
    color: "blue",
    items: [
      {
        subtitle: "Energetické renovace (Flipping)",
        text: "Nákup starých, energeticky neefektivních domů (třída G), jejich zateplení za využití dotací (Nová zelená úsporám 2026+) a následný prodej se ziskem.",
      },
      {
        subtitle: "Infrastrukturní projekty",
        text: "Růst hodnoty pozemků a nemovitostí v regionech budoucích tras vysokorychlostních tratí (VRT) a nových dálničních obchvatů.",
      },
      {
        subtitle: "Rozdělování na menší jednotky",
        text: "Kvůli nedostupnosti bydlení roste poptávka po mikro-apartmánech. Zisková je konverze velkých bytů (4+1) na více malých investičních jednotek.",
      },
    ],
  },
  {
    id: "threats",
    title: "Rizika (Threats)",
    icon: "AlertOctagon",
    color: "red",
    items: [
      {
        subtitle: "Zpřísnění limitů ČNB",
        text: "Od dubna 2026 platí pro investiční hypotéky přísný limit max 70 % LTV a DTI 7, což výrazně omezuje pákový efekt pro menší investory.",
      },
      {
        subtitle: "Úrokové a refixační riziko",
        text: "Mnoho investorů narazí na cash-flow problém v momentě, kdy jim skončí stará fixace (např. 2 % p.a.) a přejdou na aktuální tržní sazby.",
      },
      {
        subtitle: "Regulace nájemného",
        text: "S rostoucí krizí bydlení se na politické scéně objevují tlaky na ochranu nájemníků a případné cenové stropy po vzoru některých západních zemí.",
      },
    ],
  },
];
