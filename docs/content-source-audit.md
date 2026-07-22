# Content source audit (PROMPT 3 + PROMPT 12)

Audit faktických tvrzení Hypotéka Jasně — zaměření na české hypotéky, LTV/DTI/DSTI, daně, katastr, poplatky a náklady koupě + claim-level evidence pro všechny podporované země.

**SoT:** `src/lib/sources/fact-claims.ts` (+ `fact-claims-jurisdictions.ts`)  
**UI:** `ClaimSourceBadge` → klik na badge **Ověřeno** / status otevře `SourceEvidenceDrawer`  
**Evidence kontrakt:** `src/lib/sources/source-evidence.ts`  
**Datum auditu:** 2026-07-21

## Opravené chyby

| Před | Po | Důkaz |
|------|-----|--------|
| „Daň z nabytí — od 2016 neplatí kupující“ (`cz.ts`) | „Daň z nabytí nemovitých věcí byla zrušena v roce 2020.“ | [Finanční správa](https://financnisprava.gov.cz/cs/dane/dane/dan-z-nabyti-nemovitych-veci/informace-stanoviska-a-sdeleni/zruseni-dane-z-nabyti-nemovitych-veci) (z. č. 386/2020 Sb.) |
| „Katastrální poplatky — řádově stovky až tisíce Kč“ | **2 000 Kč** správní poplatek za návrh na vklad + `verifiedAt` | [ČÚZK sazebník](https://www.cuzk.gov.cz/Katastr-nemovitosti/Poplatky/Sazby-spravnich-poplatku.aspx) (položka 120a) |

Poznámka: rok 2016 se týkal změny poplatníka daně (historie), **nikoli** zrušení daně. Zrušení = 2020. Bez další právní interpretace nad rámec FS.

## Katalog claimů (CZ)

| ID | Claim (zkráceně) | Value | Status | Primární zdroj |
|----|------------------|-------|--------|----------------|
| `cz.cnb.ltv.owner_standard` | LTV vlastní bydlení standard | 80 | VERIFIED | ČNB makroobezřetnost |
| `cz.cnb.ltv.owner_young` | LTV do 36 let | 90 | VERIFIED | ČNB |
| `cz.cnb.dti_dsti.owner_deactivated` | DTI/DSTI u vlastního bydlení deaktivované | deaktivováno | VERIFIED | ČNB |
| `cz.cnb.ltv.investment` | LTV investiční | 70 | VERIFIED | ČNB (od 2026-04-01) |
| `cz.cnb.dti.investment` | DTI investiční | 7 | VERIFIED | ČNB |
| `cz.model.dsti.warning_threshold` | UX práh DSTI 40 % | 40 | MODEL | Interní model (ne ČNB) |
| `cz.tax.acquisition.abolished_2020` | Daň z nabytí zrušena 2020 | zrušena (2020) | VERIFIED | Finanční správa |
| `cz.cadastre.title_transfer` | Převod zápisem do katastru | zápis do katastru | VERIFIED | ČÚZK |
| `cz.cadastre.vklad_fee` | Poplatek návrh na vklad | 2000 Kč | VERIFIED | ČÚZK |
| `cz.tax.property_annual` | Daň z nemovitých věcí — obecní | — | ESTIMATE | MF (obecný rámec) |
| `cz.fees.legal_escrow_band` | Právní + úschova | 10–25 tis.+ | MODEL | Tržní praxe |
| `cz.tax.vat_new_build` | DPH u nových nemovitostí | — | NEEDS_UPDATE | FS (bez citace sazeb) |
| `cz.tax.rental_income` | Daň z příjmu z nájmu | — | NEEDS_UPDATE | FS |
| `cz.tax.capital_gains_time_test` | Osvobození prodeje FO | — | NEEDS_UPDATE | FS / ZDP |
| `cz.ownership.freehold_katastr` | Vznik práva zápisem | zápis = vznik | VERIFIED | ČÚZK |

## Další povrchy (stav)

| Povrch | Stav | Poznámka |
|--------|------|----------|
| CZ country dossier (`cz.ts`) | Opraveno | Cost lines z FactClaim |
| Country info tabs ČR | Opraveno | Taxes → `factClaimId` + badge |
| `/zdroje` CRITICAL_PROVENANCE | Doplněno | daň 2020 + poplatek 2000 Kč |
| CNB limity (`cnb-limits.ts`) | OK | Napojeno přes FactClaim / REGULATORY_RECORDS |
| Zahraniční daňové řádky (Dubaj, ES, …) | NEEDS_UPDATE / UNVERIFIED | Převod na FactClaim (PROMPT 12); badge + drawer |
| Buying-process / SWOT copy | Částečně | Procesní texty; bez falešné CZ daně z nabytí 2016 |
| Blog / magazín | Mimo scope SoT | Nesmí být primární zdroj při existenci regulátora |

## PROMPT 12 — claim-level sourcing (všechny země)

Každý významný claim může v draweru ukázat:

| Pole | FactClaim / SourceEvidence |
|------|----------------------------|
| Tvrzení | `claim` / `statement` |
| Hodnota | `value` |
| Jurisdikce | `jurisdiction` |
| Zdroj | `sourceName` |
| Konkrétní URL | `sourceUrl` (null = ruční ověření) |
| Datum ověření | `verifiedAt` |
| Platnost | `validFrom` / `validTo` |
| Status | `VERIFIED` \| `UNVERIFIED` \| `NEEDS_UPDATE` \| `MODEL` \| `ESTIMATE` |
| Poznámka | `notes` (+ `MANUAL_VERIFICATION_NOTE` kde chybí research) |

### Datový audit jurisdikcí (2026-07-21)

| Jurisdikce | ID | Stav katalogu | VERIFIED sazby? |
|------------|-----|---------------|-----------------|
| ČR | `cz` | Primární citace ČNB / FS / ČÚZK | Ano (LTV, daň 2020, vklad 2000 Kč…) |
| Slovensko | `slovakia` | FactClaim + NBS homepage | Ne — NEEDS_UPDATE / UNVERIFIED |
| Chorvatsko | `croatia` | FactClaim + HNB homepage | Ne |
| Itálie | `italy` | FactClaim + Banca d'Italia | Ne |
| Španělsko | `spain` | FactClaim + Banco de España | Ne |
| UAE / Dubaj | `dubai` | FactClaim + DLD / CBUAE homepage | Ne — DLD 4 % = NEEDS_UPDATE |
| Saúdská Arábie | `saudi` | FactClaim + REGA / SAMA | Ne |
| Bali / IDN | `bali` | FactClaim + Bank Indonesia | Ne |

**Pravidlo:** Bez ověřeného deep-linku nevydáváme `VERIFIED`. Homepage autority z `AUTHORITY_REGISTRY` smíme uvést jako vstupní bod, ale status zůstává `NEEDS_UPDATE` / `UNVERIFIED`. URL nevymýšlíme.

### UI

1. Klik na status badge (např. **Ověřeno**) → `SourceEvidenceDrawer`
2. Country info taxes všech 8 trhů → `factClaimId`
3. Country dossier `ClaimMeta` → stejný drawer

## Pravidla (enforcement)

1. Veřejný silný claim = záznam v `FACT_CLAIMS` (ne obcházení v komponentě).
2. `VERIFIED` vyžaduje `https` URL autority (`central_bank` / `tax_authority` / `land_authority` / …).
3. Zakázané fráze: `FORBIDDEN_FACT_PHRASES` — test `src/lib/sources/fact-claims.test.ts`.
4. UI label: **Zdroj a ověření** (`ClaimSourceBadge`, dossier `ClaimMeta`).

## Doporučené další kroky

1. Doplnit primární citace DPH / ZDP (sazby, časové testy) a přepnout `NEEDS_UPDATE` → `VERIFIED`.
2. Postupně převést zahraniční `country-info-data` taxes na FactClaim per jurisdikce.
3. Periodický `verifiedAt` refresh (ČNB limity, ČÚZK sazebník).
