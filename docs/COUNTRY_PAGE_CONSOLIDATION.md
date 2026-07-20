# Konsolidace country pages — HypotékaJasně.cz

**Datum:** 2026-07-20  
**Stav:** jedna generace obsahu na `/pruvodce-investora/[stat]`

## Co se změnilo

| Před | Po |
|------|-----|
| `CountryInvestmentHub` + `CountryDossierView` + `CountryGuide` + články | Pouze **Premium Data Dossier** + Decision Lab |
| Dvě sticky navigace (Hub broken anchors) | Jedna sticky TOC (desktop) + select (mobil) |
| EN sekční názvy v copy | České labely (Rychlý přehled, Vlastnictví, …) |
| Raw `DEVELOPER_PAYMENT_PLAN` v UI | `FINANCING_OPTION_LABELS` |
| LTV u developer plánu | **Skryté** — není bankovní úvěr |
| Orphan `country-detail-data.ts` | Smazáno |

## Struktura stránky (1–13)

1. Hero  
2. Rychlý přehled  
3. Klíčová čísla  
4. Pro koho je trh vhodný  
5. Vlastnictví  
6. Proces koupě  
7. Financování  
8. Náklady a daně (transakční + průběžné + daň z nájmu)  
9. Výnos a investiční model  
10. Rizika (FX, developer, STR, prodej, dědictví, rizikové faktory)  
11. Decision Lab / kalkulačky (`#decision-lab`)  
12. Zdroje a metodika  
13. Majetio CTA  

Mapování: `src/lib/country-dossier/page-structure.ts`  
UI: `CountryDossierView` + `InvestorGuidePage`

## UX

- **Desktop:** sticky levá navigace  
- **Mobil:** sticky `<select>` + accordion (první 2 sekce otevřené, zbytek progressive disclosure; na `lg+` vždy rozbaleno)

## Financování — povinná pole u produktu

Typ · Měna · Pro koho · Vlastní zdroje · Dostupnost · Zdroj  
(viz `ForeignFinancingTool`)

## Měny

Částky se formátují přes `formatMoney` / `formatCurrency` v **měně produktu** (CZK→Kč, AED, EUR, SAR, USD).  
**Žádná tichá konverze** jen výměnou symbolu.

Chybějící ověřená data → „Data ověřujeme“ / `LOCAL_FINANCING_UNVERIFIED_MESSAGE`.

## Legacy (už se nerenderuje)

- `CountryInvestmentHub.tsx`, `CountryInfoTabs.tsx`, `CountryGuide.tsx`  
- `country-hub-data.ts`, `country-info-data.ts`, `country-guides.ts`  

Lze smazat v další fázi, pokud je nic jiného neimportuje.

## Ověření

```bash
npm run test:financing
npm run typecheck
```

Manuálně: `/pruvodce-investora/dubaj`, `/pruvodce-investora/spanelsko`, mobilní šířka.
