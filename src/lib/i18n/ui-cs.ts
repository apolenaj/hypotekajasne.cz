/**
 * User-facing labely — čeština (produkční locale).
 * Interní enum klíče zůstávají v kódu; do UI jen přes tyto mapy.
 * Anglické labely: viz `ui-en.ts` (budoucí /en — nesmíš míchat do CS produkce).
 */

/** Statusy dat (DataStatus) — badge text (sjednoceno s Metodikou 2.0) */
export const DATA_STATUS_LABELS_CS = {
  LIVE: "LIVE",
  VERIFIED: "VERIFIED",
  MODEL: "MODEL",
  ESTIMATE: "ESTIMATE",
  UNVERIFIED: "UNVERIFIED",
  PARTNER_QUOTE: "PARTNER OFFER",
  STALE: "NEEDS UPDATE",
} as const;

/** Statusy funkcí (FeatureStatus) */
export const FEATURE_STATUS_LABELS_CS = {
  LIVE: "Dostupné",
  BETA: "Veřejná zkušební verze",
  COMING_SOON: "Připravujeme",
} as const;

/** Media / content pipeline statusy (Akademie) */
export const MEDIA_STATUS_LABELS_CS = {
  LIVE: "Dostupné",
  PLANNED: "Připravujeme",
  PROCESSING: "Zpracováváme",
  MISSING: "Chybí",
  DRAFT: "Koncept",
} as const;

/** Kanály opětovného využití obsahu */
export const CONTENT_CHANNEL_LABELS_CS = {
  seo_article: "Článek / lekce",
  video: "Video",
  short: "Krátké video",
  audio: "Audio",
  ebook: "E-book",
  newsletter: "Novinky e-mailem",
} as const;

/** Kroky vzdělávacích cest */
export const LEARNING_STEP_KIND_LABELS_CS = {
  lesson: "Lekce",
  quiz: "Kvíz",
  calculator: "Kalkulačka",
  practical_task: "Praktický úkol",
} as const;

/** Akademie — UI chrome */
export const ACADEMY_UI_CS = {
  hubEyebrow: "Vzdělávací centrum",
  hubTitle: "Hypoteční akademie",
  quiz: "Kvíz",
  course: "Kurz",
  lesson: "Lekce",
  progress: "Průběh",
  completed: "Dokončeno",
  quizEmpty: "Kvíz připravujeme.",
  quizSubmit: "Vyhodnotit kvíz",
  quizResult: "Výsledek",
  faq: "Časté otázky",
  sources: "Zdroje",
  relatedTools: "Související nástroje",
  nextStep: "Další krok",
  simplySaid: "Jednoduše řečeno",
  realExample: "Reálný příklad",
  howCalculated: "Jak jsme to spočítali",
  bankOrInvestor: "Co na to banka / investor",
  commonMistake: "Nejčastější chyba",
  miniCalculator: "Interaktivní mini kalkulačka",
  video: "Video (30–60 s)",
  moreTerms: "Další pojmy",
  learningPaths: "Vzdělávací cesty",
  badges: "Odznaky",
  educationToTool: "Vzdělávání → nástroj → váš výsledek",
  whatNext: "Co mám udělat dál?",
  reusePipeline: "Další formáty obsahu",
  reusePipelineLead:
    "Stejné téma můžete najít i jako článek, video, audio nebo e-mailové shrnutí.",
} as const;

/** Magazín — UI chrome */
export const MAGAZINE_UI_CS = {
  hubEyebrow: "Magazín",
  hubTitle: "Články a analýzy",
  hubLead:
    "Každý článek má vlastní stránku, autora, odbornou kontrolu, data publikace a aktualizace, zdroje a související nástroje.",
  featured: "Doporučeno",
  author: "Autor",
  expertReview: "Odborná kontrola",
  published: "Publikováno",
  updated: "Aktualizace",
  factCheck: "Ověření faktů",
  readingMinutes: "min čtení",
  sources: "Zdroje",
  relatedCalculators: "Související kalkulačky a nástroje",
  relatedArticles: "Související články",
  nextArticle: "Další článek",
  contents: "Obsah",
  topics: "Témata",
  all: "Vše",
  emptyCluster: "V tomto tématu zatím nejsou články — připravujeme.",
} as const;

/** Názvy produktů / nástrojů v navigaci a H1 */
export const PRODUCT_NAMES_CS = {
  myDashboard: "Můj přehled",
  financialPassport: "Finanční pas",
  financialProfile: "Finanční profil",
  nextBestAction: "Doporučený další krok",
  propertyWatchlist: "Sledované nemovitosti",
  portfolioOs: "Moje portfolio",
  refinanceRadar: "Hlídač refinancování",
  digitalTwin: "Digitální karta nemovitosti",
  globalFinancing: "Mapa globálního financování",
  documentVault: "Dokumentový trezor",
  dealRoom: "Transakční místnost",
  offerStrategy: "Strategie nabídky",
  dueDiligence: "Prověrka nemovitosti",
  marketPulse: "Tržní puls",
  alertCenter: "Centrum upozornění",
  reportEngine: "Reporty a export",
  b2bPortal: "Profesionální portál",
  aiCopilot: "Finanční AI průvodce",
  decisionLab: "Laboratoř rozhodnutí",
  trustCenter: "Centrum důvěry",
  editorialPolicy: "Redakční zásady",
  investmentRentgen: "Investiční rentgen",
  investmentPassport: "Investiční pas",
  learningHub: "Vzdělávací centrum",
  learningPaths: "Vzdělávací cesty",
  magazine: "Magazín",
  academy: "Akademie",
} as const;

/** Investiční metriky */
export const INVESTMENT_METRIC_LABELS_CS = {
  grossYield: "Hrubý výnos",
  netYield: "Čistý výnos",
  monthlyCashFlow: "Měsíční peněžní tok",
  annualCashFlow: "Roční peněžní tok",
  cashOnCashReturn: "Výnos vloženého vlastního kapitálu",
  breakEvenOccupancy: "Minimální potřebná obsazenost",
  purchasePrice: "Kupní cena",
  ownFunds: "Vlastní prostředky",
  loanAmount: "Výše úvěru",
  noi: "NOI (provozní výsledek)",
  equityBuildUp: "Nárůst vlastního kapitálu",
  remainingDebt: "Zůstatek dluhu",
  exitProceeds: "Výnos z prodeje",
  totalReturn: "Celkový výnos",
  holdingPeriod: "Doba držení",
  cashFlow: "Peněžní tok",
} as const;

/** Cookie banner */
export const COOKIE_LABELS_CS = {
  acceptAll: "Přijmout vše",
  rejectOptional: "Odmítnout volitelné",
  settings: "Nastavení",
  cookiePolicy: "Zásady cookies",
} as const;

/** Společné UI */
export const COMMON_UI_CS = {
  sources: "Zdroje",
  relatedTools: "Související nástroje",
  quiz: "Kvíz",
  course: "Kurz",
  lesson: "Lekce",
  progress: "Průběh",
  completed: "Dokončeno",
  cta: "Další krok",
  executiveSummary: "Rychlý přehled",
  ownership: "Vlastnictví nemovitosti",
  holdingCosts: "Průběžné náklady",
  exit: "Prodej a ukončení investice",
  redFlags: "Rizikové faktory",
  shareLink: "Odkaz ke sdílení",
  listPrice: "Nabídková cena",
  fairValue: "Odhadovaná férová hodnota",
  estimatedRange: "Odhadované pásmo",
  negotiationMargin: "Vyjednávací rezerva",
  breakEven: "Bod zvratu",
  freePreview: "Bezplatný náhled",
  premium: "Prémiové",
  loading: "Načítám…",
  empty: "Zatím tu nic není",
  error: "Něco se pokazilo",
} as const;

/**
 * Jednotný terminologický slovník (PROMPT 17B).
 * Primárně klientská čeština; odborná zkratka jen jako sekundární vysvětlení.
 * Vykání: vždy „vy / váš“ (malé písmeno mimo začátek věty).
 */
export const TERM_CS = {
  overallMatch: "Celková shoda",
  marketMatching: "Přiřazení trhů",
  marketMatch: "Shoda trhů",
  requiredCapital: "Požadovaný kapitál",
  financingFit: "Shoda financování",
  affordability: "Dostupnost",
  affordabilityFit: "Shoda dostupnosti",
  holdingCosts: "Průběžné náklady",
  equity: "Vlastní kapitál",
  equityFirst: "Vlastní kapitál (equity)",
  stressTest: "Zátěžový test",
  stressTests: "Zátěžové testy",
  breakEven: "Bod zvratu",
  opportunityRadar: "Radar příležitostí",
  regulatoryChangelog: "Regulační přehled změn",
  decisionLab: "Laboratoř rozhodnutí",
  premiumDataDossier: "Prémiový datový přehled země",
  propertyAnalysis: "Analýza nemovitosti",
  snapshot: "Přehledový snímek",
  developerSchedule: "Platební plán developera",
  offPlan: "Ve výstavbě (off-plan)",
  dueDiligence: "Právní a technická prověrka",
  cashFlow: "Peněžní tok",
  yieldMaximizer: "Maximalizace výnosu",
  lifestyleYield: "Bydlení + výnos",
  valueAddFlipping: "Zhodnocení / krátkodobý převrat",
  bestCashFlow: "Nejlepší peněžní tok",
  bestAppreciation: "Nejvyšší potenciál růstu hodnoty",
  lowestRisk: "Nejnižší riziko",
  lowestRequiredCapital: "Nejnižší požadovaný kapitál",
  bestUserFit: "Nejlepší shoda s profilem",
  scenarioBear: "Pesimistický",
  scenarioBase: "Základní",
  scenarioBull: "Optimistický",
  timeline: "Časová osa",
  vault: "Dokumentový trezor",
  digest: "Souhrn",
  inApp: "V aplikaci",
  readinessScore: "Skóre připravenosti",
  score: "Skóre",
  selfReported: "Vámi uvedené",
  tradeOffs: "Kompromisy",
  winnerByCategory: "Vítěz podle kategorie",
  stayVsRefinance: "Zůstat vs. refinancovat",
  safeBuyingPower: "Bezpečná kupní síla",
} as const;

/** Odborné zkratky — při prvním výskytu v delším textu použij gloss. */
export const ABBREV_GLOSS_CS = {
  LTV: "Poměr úvěru k hodnotě nemovitosti (LTV)",
  DTI: "Poměr dluhu k příjmu (DTI)",
  DSTI: "Podíl splátek na příjmu (DSTI)",
  RPSN: "Roční procentní sazba nákladů (RPSN)",
  ROI: "Návratnost investice (ROI)",
  IRR: "Vnitřní výnosové procento (IRR)",
  DSCR: "Krytí dluhové služby (DSCR)",
  NOI: "Provozní výsledek nemovitosti (NOI)",
} as const;

/** Statusy nabídek v transakční místnosti */
export const DEAL_OFFER_STATUS_LABELS_CS = {
  draft: "Koncept",
  submitted: "Odesláno",
  counter: "Protinabídka",
  accepted: "Přijato",
  rejected: "Odmítnuto",
} as const;

/** Statusy kroků časové osy */
export const TIMELINE_STATUS_LABELS_CS = {
  pending: "Čeká",
  in_progress: "Probíhá",
  waiting: "Čekáme",
  completed: "Hotovo",
  blocked: "Blokováno",
} as const;
