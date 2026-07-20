import { routes } from "@/lib/routes";
import type { MagazineArticle } from "@/lib/magazine/types";

export const article: MagazineArticle = {
  slug: "spanelsko-apartmany-rizika-vynosy",
  title: "Apartmány ve Španělsku: transakční náklady, rizika a reálné výnosy",
  description:
    "NIE, ITP, nerezidentské financování a proč hrubý yield z prospektu není čistý výnos — kvalifikovaný pohled bez bulváru.",
  category: "Zahraniční financování",
  clusters: ["spanelsko", "zahranicni-financovani", "investicni-analyza"],
  authorId: "redakce-hj",
  reviewerId: "reviewer-compliance",
  publishedAt: "2026-07-08",
  updatedAt: "2026-07-08",
  factCheckedAt: "2026-07-08",
  country: "Španělsko",
  financialTopics: ["NIE", "ITP", "nerezident", "yield", "Airbnb regulace"],
  featured: false,
  readingMinutes: 12,
  hero: {
    src: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    alt: "Španělská architektura — ilustrace",
  },
  body: [
    {
      type: "p",
      text: "Španělsko láká celoroční využitelností a hlubším trhem než řada sezónních destinací. Nákup však není „chata na Slapech“ — jde o přeshraniční transakci s daněmi, AML a lokální regulací pronájmů.",
    },
    {
      type: "h2",
      id: "nie-itp",
      text: "NIE, účet a transakční náklady",
    },
    {
      type: "p",
      text: "Bez NIE (Número de Identidad de Extranjero) prakticky nekoupíte. Počítejte s časem na lokální účet kvůli AML. Nad rámec kupní ceny často připočítejte řádově 10–13 % (ITP u starších, IVA u nových, notář, právní zastoupení) — ověřte aktuální sazby u lokálního právníka.",
    },
    {
      type: "h2",
      id: "okupas",
      text: "„Okupas“ — kontext, ne panika",
    },
    {
      type: "p",
      text: "Nelegální obsazení je reálné právní téma ve Španělsku, ale riziko silně závisí na lokalitě, typu objektu a správě. Prémiové urbanizace s ostrahou nejsou totéž co opuštěné bankovní jednotky ve vnitrozemí. Due diligence a pojištění správy patří do checklistu — nejde o důvod k plošnému strachu z marketingu.",
    },
    {
      type: "h2",
      id: "vynosy",
      text: "Hrubý vs. čistý výnos",
    },
    {
      type: "p",
      text: "Slibované „10 % z Airbnb“ často ignoruje regulaci licencí, správu (často desítky % z obratu), community fees a daně. Orientujte se na modelovaný čistý výnos a scénář bez sezóny — viz Investiční rentgen / Decision Lab.",
    },
    {
      type: "callout",
      tone: "warn",
      text: "Právní a daňové informace jsou editorial. Před koupí ověřte lokálního právníka a daňového poradce.",
    },
  ],
  sources: [
    { label: "Dossier země — Španělsko", url: `${routes.pruvodceInvestora}/spanelsko` },
    { label: "Metodika výnosů (modelový výpočet)", url: routes.metodika },
  ],
  relatedTools: [
    { label: "Průvodce investora — Španělsko", href: `${routes.pruvodceInvestora}/spanelsko` },
    { label: "Investiční rentgen", href: routes.investicniRentgen },
    { label: "Akademie: Freehold vs leasehold", href: "/akademie/freehold-vs-leasehold" },
  ],
  relatedArticleSlugs: [
    "zahranicni-financovani-ceske-zajisteni",
    "dubaj-flipping-off-plan-realita",
  ],
};
