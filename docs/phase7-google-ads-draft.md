# Phase 7 — Google Ads DRAFT (do not activate without spend approval)

**Status: DRAFT — PAID CAMPAIGNS ACTIVATED: NO**

Primary conversion: `lead_success` only.  
Recipient of leads: Josef (`LEAD_OPS_RECIPIENT_EMAIL`); Michal receives qualified handoffs manually.

## Launch order (recommended)

1. Brand protection — Hypotéka Jasně  
2. Refinancování  
3. OSVČ  
4. Zahraniční příjem  
5. Investiční hypotéka  
6. Americká hypotéka  

Rationale: brand + refinance typically higher commercial intent and clearer query match; specialty funnels need tighter negatives and sales capacity. Reorder only with Search Console / Keyword Planner volume evidence (manual access required).

## Shared negatives (seed — refine after search terms)

Informational / jobs / education (examples, Czech + EN stems):

`prace`, `volne misto`, `brigada`, `skola`, `skolni`, `definice`, `wikipedia`, `referat`, `seminar`, `kurz zdarma`, `pdf ke stazeni`, `vtip`, `meme`

Do **not** blanket-exclude `osvc`, `zahranicni`, `investicni`, `americka` — those are commercial intents.

## Shared settings (hypothesis ranges — not guarantees)

| Item | Hypothesis |
|------|------------|
| Network | Search only (start) |
| Location | Czechia |
| Language | Czech |
| Conversion | GA4 `lead_success` import (manual setup in Ads) |
| Optimize on | `lead_success` only |
| Daily budget (per campaign, validation) | see budget doc |
| Max CPC (manual CPC / target) | CZK 8–35 depending on funnel competition (hypothesis) |

---

## 1) Brand — `hj_cz_brand_search`

- Intent: brand  
- Landing: `https://www.hypotekajasne.cz/`  
- Keywords (exact/phrase): `[hypotéka jasně]`, `[hypoteka jasne]`, `"hypotéka jasně"`, `"hypotekajasne"`  
- Negatives: generic mortgage info already covered by shared list  
- Headlines (sample): Hypotéka Jasně | Srovnání sazeb a kalkulačka | Nezávazná poptávka | Transparentní metodika | Refinancování i OSVČ | Oficiální web  
- Descriptions: Informace a nástroje bez slibu schválení. Poptávku přijímá provozovatel platformy.  
- Sitelinks: Sazby, Refinancování, OSVČ, Kontakt  
- Callouts: Nezávazně · Transparentní sazby · Metodika dat  
- Snippets: Typy → Refinancování, OSVČ, Zahraniční příjem, Investice  
- UTM: `utm_source=google&utm_medium=cpc&utm_campaign=cz_brand_google_search`  
- Budget hyp.: CZK 100–200/day  
- Status: **DRAFT**

## 2) Refinance — `hj_cz_refinance_search`

- Landing: `/temata/refinancovani`  
- Keywords: refinancování hypotéky, refixace vs refinancování, konec fixace hypotéka, převod hypotéky  
- Headlines: Refinancování hypotéky | Porovnejte scénáře | Sazby pro refinancování | Bez slibu úspory | Nezávazná poptávka | Checklist před koncem fixace  
- Descriptions: Průvodce náklady a načasováním. Zveřejněné sazby nejsou nabídkou banky.  
- UTM: `cz_refinance_google_search`  
- Risk: informational “co je refinancování” clicks → tighten RSA + negatives after 7 days  
- Status: **DRAFT**

## 3) OSVČ — `hj_cz_osvc_search`

- Landing: `/temata/hypoteka-osvc`  
- Keywords: hypotéka pro OSVČ, hypotéka OSVČ paušál (careful — do not force regime), dokládání příjmu OSVČ hypotéka  
- Headlines: Hypotéka pro OSVČ | Dokládání příjmů | Diagnostika možností | Nezávazná poptávka  
- UTM: `cz_osvc_google_search`  
- Status: **DRAFT**

## 4) Foreign income — `hj_cz_foreign_income_search`

- Landing: `/temata/hypoteka-ze-zahranicniho-prijmu`  
- Keywords: hypotéka zahraniční příjem, hypotéka práce v zahraničí (CZ property), příjem v EUR hypotéka  
- Negatives: buy-abroad tourism (`nemovitost v chorvatsku`, `koupě v zahraničí` when intent ≠ CZ mortgage)  
- UTM: `cz_foreign_income_google_search`  
- Status: **DRAFT**

## 5) Investment — `hj_cz_investment_search`

- Landing: `/temata/investicni-hypoteka`  
- Keywords: investiční hypotéka, hypotéka na pronájem, hypotéka na investiční byt  
- Avoid absolute ČNB limit claims in ads  
- UTM: `cz_investment_google_search`  
- Status: **DRAFT**

## 6) American mortgage — `hj_cz_american_search`

- Landing: `/temata/americka-hypoteka`  
- Keywords: americká hypotéka, neúčelová hypotéka, hypotéka bez účelu  
- UTM: `cz_american_google_search`  
- Status: **DRAFT**

---

## RSA assets (fill in Ads UI)

For each campaign prepare **10–15 headlines / 4 descriptions** from the samples above; expand with brand-safe variants without guarantees (“schválíme”, “nejlevnější”, “do 24 hodin”).

## Manual Ads account steps (Josef / Ads admin)

1. Link GA4 property → Google Ads.  
2. Import **only** `lead_success` as primary conversion.  
3. Mark secondary events as secondary / observation.  
4. Create campaigns in **Paused** / DRAFT state.  
5. Await budget approval before Enable.

Missing access = campaigns remain DRAFT; preparation can still be PASS.
