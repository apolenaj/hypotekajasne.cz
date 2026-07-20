# Czech Localization Audit — HypotékaJasně.cz

**Datum:** 20. 7. 2026  
**Cíl:** Česká verze webu 100 % česky (user-facing).  
**Locale slovník:** `src/lib/i18n/ui-cs.ts` (+ rozšířené `messages.ts`, `display.ts`, `FEATURE_STATUS_LABELS`).

---

## Shrnutí

Provedena systematická lokalizace user-facing angličtiny napříč homepage, navigací, trust, nástroji, akademií, reporty, B2B a legal. Interní enum klíče (`LIVE`, `BETA`…) zůstávají v kódu; do UI jdou jen české labely.

`/en` hub záměrně ponechán anglicky.

---

## Centralizované mapy (prevence návratu EN)

| Klíč | Soubor | České labely |
|------|--------|--------------|
| DataStatus badges | `src/lib/data/display.ts` → `statusBadgeLabel` | AKTUÁLNÍ DATA, OVĚŘENO, MODELOVÝ VÝPOČET, NABÍDKA PARTNERA, DATA ČEKAJÍ NA AKTUALIZACI |
| FeatureStatus | `src/lib/majetio/types.ts` | V PROVOZU, TESTOVACÍ VERZE, JIŽ BRZY |
| UI dictionary | `src/lib/i18n/ui-cs.ts` | produktové názvy, metriky, cookie CTA |
| Formát čísel | `display.ts` `formatDataValue` | `cs-CZ` + desetinná čárka + `% p. a.` |

---

## Odstraněné / nahrazené anglické texty (výběr)

### Cookie & home
| Bylo | Je |
|------|-----|
| Accept all | Přijmout vše |
| Reject optional | Odmítnout volitelné |
| Settings | Nastavení |
| Cookie policy | Zásady cookies |
| Decision cockpit… | Centrum pro rozhodování o bydlení a investicích… |

### Status badges
| Bylo | Je |
|------|-----|
| LIVE | AKTUÁLNÍ DATA |
| VERIFIED | OVĚŘENO |
| MODEL / MODELLED | MODELOVÝ VÝPOČET |
| PARTNER QUOTE | NABÍDKA PARTNERA |
| STALE | DATA ČEKAJÍ NA AKTUALIZACI |
| COMING SOON | JIŽ BRZY |
| BETA (feature) | TESTOVACÍ VERZE |

### Navigace / produkty
| Bylo | Je |
|------|-----|
| Financial Passport | Finanční pas |
| Portfolio OS | Správa portfolia |
| Refinance Radar | Radar refinancování |
| Global Financing Router | Mapa globálního financování |
| Document Vault | Dokumentový trezor |
| Deal Room | Transakční místnost |
| Offer Strategy | Strategie nabídky |
| Due Diligence | Prověrka nemovitosti |
| Market Pulse | Tržní puls |
| Alert Center | Centrum upozornění |
| Report Engine | Reporty a export |
| B2B Portal | Profesionální portál |
| AI Copilot | AI asistent |
| Decision Lab | Laboratoř rozhodnutí |
| Trust Center | Centrum důvěry |
| Editorial policy | Redakční zásady |

### Investiční metriky
| Bylo | Je |
|------|-----|
| Gross Yield | Hrubý výnos |
| Net Yield | Čistý výnos |
| Monthly Cash Flow | Měsíční peněžní tok |
| Cash-on-Cash Return | Výnos vloženého vlastního kapitálu |
| Break-even occupancy | Minimální potřebná obsazenost |
| Purchase price | Kupní cena |
| Equity build-up | Nárůst vlastního kapitálu |
| Exit proceeds | Výnos z prodeje |
| Total return | Celkový výnos |
| Cash flow waterfall | Rozklad peněžního toku |

### Dossier sekce
| Bylo | Je |
|------|-----|
| Executive summary | Rychlý přehled |
| Ownership model | Vlastnictví nemovitosti |
| Holding costs | Průběžné roční náklady |
| Exit / prodej | Prodej a ukončení investice |
| Red flags | Rizikové faktory |
| CTA — … | Další krok — … |

### Akademie / Rentgen / Offer / Reports / B2B / Legal
| Bylo | Je |
|------|-----|
| Learning hub / paths | Vzdělávací centrum / cesty |
| Sources / Related tools / Quiz / CTA | Zdroje / Související nástroje / Kvíz / Další krok |
| SSR first | Nejprve serverové HTML |
| Pricing & funnel | Ceník a postup objednávky |
| Free preview / Premium | Bezplatný náhled / Prémiové |
| List price / Fair value / … | Nabídková cena / Odhadovaná férová hodnota / … |
| Share / Export Engine | Sdílení a export |
| Professional Report | Profesionální report |
| Legal review required | Vyžadována právní kontrola |
| Scope / Delivery / Complaint | Rozsah / Dodání / Reklamace |
| Submit property + … | Odeslat nemovitost a objednat analýzu |
| Share link | Odkaz ke sdílení |
| productId ve UI | odstraněno z veřejného textu |

### Positioning
| Bylo | Je |
|------|-----|
| Náš specialista se vám ozve… | Licencovaný partner se vám ozve do 24 hodin. |

---

## Záměrně ponecháno

- **Akronymy:** LTV, DTI, DSTI, RPSN, IRR, XIRR, DSCR, NOI, GDPR, FAQ (s českým kontextem / tooltipem kde dává smysl)
- **Značky:** Majetio, názvy bank, HypotékaJasně
- **`/en` hub:** anglický curated overview
- **Interní enum klíče** v TypeScriptu a test assertionech na status kódy

---

## Formátování (cs-CZ)

- Částky: `toLocaleString("cs-CZ")` / stávající `formatCurrency` → např. `4 500 000 Kč`
- Procenta v `formatDataValue`: desetinná čárka + ` %` / ` % p. a.`
- Datum/čas: `formatDate` / `formatDateTime` v `src/lib/i18n/format.ts` (cs-CZ)

---

## Hlavní změněné oblasti (soubory)

- `src/lib/i18n/ui-cs.ts` (nový)
- `src/lib/data/display.ts`, `src/lib/majetio/{types,features}.ts`
- `src/lib/mock-data.ts` (nav)
- Cookie, CockpitHero, HomeDashboard, AboutUs, Trust/SEO pages
- Investment engine, Decision Lab, Rentgen, Compare, Offer Strategy
- Portfolio, Refinance, Global financing, Vault, Deal Room, Alerts, Market Pulse
- Academy, Report Engine, B2B portal, LegalView, Country dossier
- Alert copy / collect CTA labely, academy paths

---

## Ověření

- [x] typecheck — OK  
- [x] tests — OK  
- [x] production build — OK (105/105 stránek)  
- [ ] lint — 21 pre-existing errors (`set-state-in-effect`, `prefer-const`); nezpůsobeno lokalizací  

---

## Zbývající EN (nízká priorita / ne-UI)

- Komentáře v kódu, architecture notes, API `note` stringy v bridge routes (ne hlavní UI)
- Některé magazine články mohou zmínit anglické produktové názvy v editorial copy — zkontrolovat redakčně
- Chart axis tick formattery v Recharts — ověřit `cs-CZ` na všech grafech v další vlně
