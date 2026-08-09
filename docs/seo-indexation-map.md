# SEO indexation map (Phase 5)

Internal reference. Code SoT: `src/lib/seo/pages.ts`, `src/lib/seo/indexation.ts`.

**Canonical host:** `https://www.hypotekajasne.cz`  
(Apex `https://hypotekajasne.cz` must redirect 301/308 → www; matches current Vercel primary.)

## INDEX (sitemap YES)

| Route | Canonical | Reason |
|-------|-----------|--------|
| `/` | `/` | Homepage — calculator, rates, comparison intent |
| `/sazby` | `/sazby` | Verified published bank rates hub |
| `/kalkulacky` | `/kalkulacky` | Calculator hub |
| `/kalkulacky/hypotecni` | `/kalkulacky/hypotecni` | Primary mortgage calculator |
| `/kalkulacky/koupe-vs-najem` | same | Editorial calculator |
| `/kalkulacky/historicky-vyvoj` | same | Editorial calculator |
| `/kalkulacky/potencialni-vyvoj` | same | Editorial calculator |
| `/faq` | `/faq` | FAQ with crawlable answers + FAQPage |
| `/o-nas` | `/o-nas` | Trust / operator identity |
| `/kontakt` | `/kontakt` | Contact |
| `/en` | `/en` | Published English overview |
| `/temata`, `/temata/*` | same | Curated SEO landings |
| `/clanky`, `/clanky/*` | same | Magazine |
| `/akademie`, lessons, cesty | same | Education |
| `/pruvodce-investora`, countries | same | Country guides |
| `/investicni-rentgen` | same | Public product landing + FAQ |
| Trust/legal: `/duvera`, `/metodika`, `/zdroje`, `/editorial-policy`, `/jak-vydelavame`, `/partneri`, `/opravy-a-aktualizace`, `/o-majetio`, `/pravni/*` | same | YMYL / legal transparency |

Query variants of `/sazby` and calculators **canonicalize to the base path** (not separate INDEX docs).

## NOINDEX (sitemap NO)

| Route | Reason |
|-------|--------|
| `/dashboard` | User-state overview |
| `/moje-moznosti` | Local wizard / diagnostics |
| `/dekujeme` | Post-lead thank-you |
| `/financni-pas` | Personal profile tool |
| `/portfolio`, `/sledovani`, `/alerty` | User-state tools |
| `/reporty`, `/reporty/sdilet/*` | Export / private share |
| `/dokumentovy-trezor` | Private documents |
| `/transakce`, `/transakce/[id]` | Deal-room beta / workspace |
| `/profesionalni-portal` | B2B beta |
| `/copilot`, `/navrh-na-miru` | Thin interactive tools |
| `/refinancovani-radar`, `/globalni-financovani`, `/strategie-nabidky`, `/proverka-nemovitosti`, `/trhovy-puls` | App shells without standalone search value |
| `/investicni-pas`, `/investicni-rentgen/modelar`, `/investicni-rentgen/porovnani` | Tool/result surfaces |
| Preview / `SEO_FORCE_NOINDEX=1` | Entire site noindex |

## REDIRECT

| From | To | Type |
|------|-----|------|
| `/prověrka-nemovitosti` | `/proverka-nemovitosti` | 308 permanent (`next.config`) |
| `/hypotecni-akademie` | `/akademie` | app redirect |
| Trailing slash (non-root) | stripped path | 308 (`middleware`) |
| `https://hypotekajasne.cz/*` | `https://www.hypotekajasne.cz/*` | Vercel domain redirect |

## REMOVED / NOT PUBLIC

| Surface | Notes |
|---------|-------|
| `/api/*` | Disallow in robots; not marketing pages |
| `*.vercel.app` previews | noindex + robots disallow `/` |

## Parameter policy

`/sazby?fixationMonths=&ltv=&purpose=&loan=&property=` → canonical `/sazby`  
Calculator UI state → canonical base calculator URL  
Do not add query URLs to sitemap.
