# Phase 6 — Commercial intent / cannibalization map

**Status:** Wave 1 SoT  
**Canonical host:** `https://www.hypotekajasne.cz`  
**NO FIRST-PARTY SEARCH QUERY DATA YET** (Search Console evaluation plan: `docs/phase6-search-measurement.md`)

One primary commercial winner per intent. Supporting pages must not target the same primary head term.

| Intent | Primary canonical | Secondary / supporting | Cannibalization risk | Conversion destination |
|--------|-------------------|------------------------|----------------------|------------------------|
| **A. Generic mortgage** (`hypotéka`) | `/` | `/temata`, `/faq`, academy hubs | Avoid second “hypotéka” root landing | `/sazby`, `/kalkulacky/hypotecni`, lead |
| **B. Calculator** (`hypoteční kalkulačka`) | `/kalkulacky/hypotecni` | Other `/kalkulacky/*` | No duplicate calc landings | Lead from calculator |
| **C. Rates** (`sazby hypoték`) | `/sazby` | `/clanky/urokove-sazby-hypotek-2026` | Query variants canonicalize to `/sazby` (Phase 5) | Lead on `/sazby` |
| **D. Refinance** | `/temata/refinancovani` | `/clanky/refinancovani-po-fixaci-checklist`, `/akademie/cesty/refinance`, `/refinancovani-radar` (**noindex**) | Do not let `/sazby?purpose=refinance` become the commercial landing | Landing → `/sazby?purpose=refinance` + calc + lead (`intent=refinance`) |
| **E. OSVČ** | `/temata/hypoteka-osvc` | `/akademie/cesty/osvc_mortgage` | No separate “paušální daň” commercial URL in Wave 1 | Landing → `/moje-moznosti` (income hint) + lead (`intent=osvc`) |
| **F. Foreign income** | `/temata/hypoteka-ze-zahranicniho-prijmu` | `/temata/hypoteka-v-zahranici` (**buy abroad** — different intent) | Do not merge with foreign purchase hub | Landing → lead (`intent=foreign_income`) + `/moje-moznosti` |
| **G. Investment mortgage** | `/temata/investicni-hypoteka` | `/investicni-rentgen` (tool), `/clanky/regulace-investicni-hypoteky-cr`, `/akademie/cesty/first_investment` | Rentgen = model tool, not underwriting SEO twin | Landing → Rentgen + lead (`intent=investment`) |
| **H. American mortgage** | `/temata/americka-hypoteka` | `/akademie/americka-hypoteka` (education) | Do not use `/sazby?purpose=purchase&note=american` as product landing | Landing → calc/lead (`intent=american`); rates only if product-verified |

## Homepage “Co právě řešíte?”

| Situation | Target (Wave 1) |
|-----------|-----------------|
| Kupuji bydlení | `/sazby?purpose=purchase` (rates tool — OK) |
| Refinancuji | `/temata/refinancovani` |
| Investiční nemovitost | `/temata/investicni-hypoteka` |
| Jsem OSVČ | `/temata/hypoteka-osvc` |
| Příjem ze zahraničí | `/temata/hypoteka-ze-zahranicniho-prijmu` |
| Americká hypotéka | `/temata/americka-hypoteka` |

## Internal link rules

- Each commercial landing links to `/sazby` and/or `/kalkulacky/hypotecni` where relevant.
- Supporting articles/academy link **up** to the commercial canonical.
- `/moje-moznosti` and `/refinancovani-radar` remain **noindex**.
- No footer link farms.
