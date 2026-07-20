/**
 * User-facing labely — čeština (produkční locale).
 * Interní enum klíče zůstávají v kódu; do UI jen přes tyto mapy.
 * Anglické labely: viz `ui-en.ts` (budoucí /en — nesmíš míchat do CS produkce).
 */

/** Statusy dat (DataStatus) — badge text */
export const DATA_STATUS_LABELS_CS = {
  LIVE: "Aktuální data",
  VERIFIED: "Ověřeno",
  MODELLED: "Modelový výpočet",
  PARTNER_QUOTE: "Nabídka partnera",
  STALE: "Čeká na aktualizaci",
} as const;

/** Statusy funkcí (FeatureStatus) */
export const FEATURE_STATUS_LABELS_CS = {
  LIVE: "Dostupné",
  BETA: "Beta",
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
  howCalculated: "Jak se to počítá",
  bankOrInvestor: "Co na to banka / investor",
  commonMistake: "Nejčastější chyba",
  miniCalculator: "Interaktivní mini kalkulačka",
  video: "Video (30–60 s)",
  moreTerms: "Další pojmy",
  learningPaths: "Vzdělávací cesty",
  badges: "Odznaky",
  educationToTool: "Vzdělávání → nástroj → váš výsledek",
  whatNext: "Co dál?",
  reusePipeline: "Další formáty obsahu",
  reusePipelineLead:
    "Jeden kanonický obsah → článek · video · krátké video · audio · e-book · newsletter.",
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
