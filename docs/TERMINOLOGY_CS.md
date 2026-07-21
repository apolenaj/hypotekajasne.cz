# Terminologický slovník — HypotékaJasně.cz (CS)

Jednotný zdroj pravdy pro veřejnou češtinu. Implementace: `src/lib/i18n/ui-cs.ts`
(`PRODUCT_NAMES_CS`, `TERM_CS`, `ABBREV_GLOSS_CS`, status labely).

## Principy

1. **Klientská čeština** je hlavní jazyk UI.
2. **Odborná zkratka** (LTV, DTI…) zůstává, při prvním výskytu s českým glossem.
3. **Stejná funkce = stejný název** na všech stránkách (viz `PRODUCT_NAMES_CS`).
4. **Vykání:** `vy` / `váš` (malé písmeno mimo začátek věty).
5. Země-specifické právní názvy (DLD, RERA, DTCM…) **ponechat** + české vysvětlení.

## Produktové názvy

| Interní / EN | Veřejná čeština |
|---|---|
| Dashboard | Můj přehled |
| Financial Passport | Finanční pas |
| Next Best Action | Doporučený další krok |
| Watchlist | Sledované nemovitosti |
| Portfolio OS | Moje portfolio |
| Refinance Radar | Hlídač refinancování |
| Digital Twin | Digitální karta nemovitosti |
| Deal Room | Transakční místnost |
| Document Vault | Dokumentový trezor |
| Alert Center | Centrum upozornění |
| Market Pulse | Tržní puls |
| Opportunity Radar | Radar příležitostí |
| Decision Lab | Laboratoř rozhodnutí |
| AI Copilot | Finanční AI průvodce |
| Trust Center | Centrum důvěry |
| Investment X-ray | Investiční rentgen |
| Market matching | Přiřazení trhů |
| Overall Match | Celková shoda |
| Premium Data Dossier | Prémiový datový přehled země |

## Doménové termíny

| EN / hybrid | CS |
|---|---|
| affordability | dostupnost |
| financing fit / fit | shoda (financování / s profilem) |
| required capital | požadovaný kapitál |
| holding costs | průběžné náklady |
| equity | vlastní kapitál (equity) — gloss při prvním použití |
| stress test | zátěžový test |
| break-even | bod zvratu |
| cash flow | peněžní tok |
| developer schedule / payment plan | platební plán developera |
| off-plan | ve výstavbě (off-plan) |
| due diligence | právní a technická prověrka |
| handoff | předání (specialistovi) |
| digest | souhrn |
| in-app | v aplikaci |
| changelog | přehled změn / oprav |
| snapshot | přehledový snímek / roční přehled |
| Bear / Base / Bull | Pesimistický / Základní / Optimistický |
| trade-offs | kompromisy |
| Self-reported | Vámi uvedené |

## Statusy dat (badge)

| Enum | CS label |
|---|---|
| LIVE | Aktuální data |
| VERIFIED | Ověřeno |
| MODELLED | Modelový výpočet |
| PARTNER_QUOTE | Nabídka partnera |
| STALE | Údaj potřebuje aktualizaci |

## Statusy funkcí

| Enum | CS label |
|---|---|
| LIVE | Dostupné |
| BETA | Veřejná zkušební verze |
| COMING_SOON | Připravujeme |

## Ponechané anglické / mezinárodní

- **LTV, DTI, DSTI, RPSN, ROI, IRR, DSCR, NOI** — běžné odborné zkratky
- **Majetio**, **ČNB**, bankovní názvy
- **DLD, RERA, DTCM, DIFC, Oqood, freehold, leasehold** — jurisdikční pojmy s českým glossem
- **escrow** — běžný v realitní praxi; kde možné doplnit „notářská / bankovní úschova“
- **Beta** v historickém smyslu nahrazeno „Veřejná zkušební verze“
