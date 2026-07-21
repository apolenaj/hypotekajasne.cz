/**
 * User-facing English labels — curated for future /en only.
 * Do NOT import into Czech production UI. Wire only when PUBLISHED_EN_PATHS
 * includes the academy/magazine route and human EN copy exists.
 */

export const DATA_STATUS_LABELS_EN = {
  LIVE: "LIVE DATA",
  VERIFIED: "VERIFIED",
  MODEL: "MODEL",
  ESTIMATE: "ESTIMATE",
  UNVERIFIED: "UNVERIFIED",
  PARTNER_QUOTE: "PARTNER QUOTE",
  STALE: "AWAITING UPDATE",
} as const;

export const FEATURE_STATUS_LABELS_EN = {
  LIVE: "Available",
  BETA: "Beta",
  COMING_SOON: "Coming soon",
} as const;

export const MEDIA_STATUS_LABELS_EN = {
  LIVE: "Available",
  PLANNED: "Coming soon",
  PROCESSING: "Processing",
  MISSING: "Missing",
  DRAFT: "Draft",
} as const;

export const CONTENT_CHANNEL_LABELS_EN = {
  seo_article: "Article / lesson",
  video: "Video",
  short: "Short video",
  audio: "Audio",
  ebook: "E-book",
  newsletter: "Newsletter",
} as const;

export const LEARNING_STEP_KIND_LABELS_EN = {
  lesson: "Lesson",
  quiz: "Quiz",
  calculator: "Calculator",
  practical_task: "Practical task",
} as const;

export const ACADEMY_UI_EN = {
  hubEyebrow: "Learning hub",
  hubTitle: "Mortgage academy",
  quiz: "Quiz",
  course: "Course",
  lesson: "Lesson",
  progress: "Progress",
  completed: "Completed",
  quizEmpty: "Quiz coming soon.",
  quizSubmit: "Check quiz",
  quizResult: "Score",
  faq: "FAQ",
  sources: "Sources",
  relatedTools: "Related tools",
  nextStep: "Next step",
  simplySaid: "In simple terms",
  realExample: "Real example",
  howCalculated: "How it is calculated",
  bankOrInvestor: "What the bank / investor looks at",
  commonMistake: "Common mistake",
  miniCalculator: "Interactive mini calculator",
  video: "Video (30–60 s)",
  moreTerms: "More terms",
  learningPaths: "Learning paths",
  badges: "Badges",
  educationToTool: "Education → tool → your result",
  whatNext: "What’s next?",
  reusePipeline: "Other content formats",
  reusePipelineLead:
    "One canonical lesson → article · video · short · audio · e-book · newsletter.",
} as const;

export const MAGAZINE_UI_EN = {
  hubEyebrow: "Magazine",
  hubTitle: "Articles and analysis",
  hubLead:
    "Every article has its own page, author, expert review, publish and update dates, sources and related tools.",
  featured: "Featured",
  author: "Author",
  expertReview: "Expert review",
  published: "Published",
  updated: "Updated",
  factCheck: "Fact-checked",
  readingMinutes: "min read",
  sources: "Sources",
  relatedCalculators: "Related calculators and tools",
  relatedArticles: "Related articles",
  nextArticle: "Next article",
  contents: "Contents",
  topics: "Topics",
  all: "All",
  emptyCluster: "No articles in this topic yet — coming soon.",
} as const;

export const COMMON_UI_EN = {
  sources: "Sources",
  relatedTools: "Related tools",
  quiz: "Quiz",
  course: "Course",
  lesson: "Lesson",
  progress: "Progress",
  completed: "Completed",
  cta: "Next step",
  loading: "Loading…",
  empty: "Nothing here yet",
  error: "Something went wrong",
} as const;
