# Zbývající externí právní kroky

Stav k 2026-07-21 (PROMPT 17E). Veřejné UI **nezobrazuje** staging fráze („doplníme“, „čeká na ověření“). Níže jsou kroky, které musí dokončit provozovatel + právník **mimo** produktový kód.

**Tento dokument neznamená právní compliance.** Finální review musí udělat kvalifikovaný český právník.

## Centrální SoT v kódu

| Oblast | Soubor / env |
|--------|----------------|
| Provozovatel | `src/lib/legal/operator.ts` — `LEGAL_OPERATOR_*` |
| Hypoteční partner | `src/lib/legal/partner-config.ts` — `LEGAL_PARTNER_*` |
| Souhlasy | `src/lib/legal/consent-versions.ts` (verze `2026-07-20.1`) |
| CI gate | `npm run check:legal` / `LEGAL_STRICT_PRODUCTION=true` |

Dokud chybí `LEGAL_PARTNER_LEGAL_NAME` + `LEGAL_PARTNER_ICO` + `LEGAL_PARTNER_JERRS_URL`, je **partner handoff vypnutý** (formuláře = provozovatel-only, nezávazná konzultace).

## Blokuje placené služby

1. **Doplnit identitu provozovatele** (env, ne fiktivní údaje):
   - `LEGAL_OPERATOR_LEGAL_NAME`
   - `LEGAL_OPERATOR_ICO`
   - `LEGAL_OPERATOR_REGISTER_URL` (ARES / justice)
   - potvrdit adresu (`LEGAL_OPERATOR_STREET` / CITY / ZIP) nebo kontaktní fallback
   - volitelně `LEGAL_OPERATOR_DIC`
2. **Spuštění checkoutu placené analýzy** až po právním textu:
   - nastavit `PAID_ANALYSIS_CHECKOUT_LIVE=true` (nebo `NEXT_PUBLIC_…`) **jen** když je provozovatel ready a platební brána live
   - do té doby UI: „Připravujeme“ / evidence zájmu, ne koupě
3. **Spotřebitelské podmínky digitální služby** (odstoupení, reklamace, dodání) — finální text českého právníka před zapnutím plateb.

## Blokuje produkční partner handoff

4. **Ověřit a vyplnit partnera** (veřejná data — nastavte i `NEXT_PUBLIC_…` varianty, aby client formuláře a API měly stejný stav):
   - `LEGAL_PARTNER_LEGAL_NAME` / `NEXT_PUBLIC_LEGAL_PARTNER_LEGAL_NAME`
   - `LEGAL_PARTNER_ICO` / `NEXT_PUBLIC_LEGAL_PARTNER_ICO`
   - `LEGAL_PARTNER_JERRS_URL` / `NEXT_PUBLIC_LEGAL_PARTNER_JERRS_URL`
   - volitelně role / licence summary / scope
5. Po vyplnění ověřit `/partneri` a že formuláře znovu vyžadují partner-transfer checkbox.
6. Pro hard CI gate: `LEGAL_STRICT_PRODUCTION=true`.

## GDPR / cookies (soulad s implementací)

Implementace dnes:

- analytika i marketing cookies **jen po souhlasu** (banner + `ConsentGatedScripts`)
- preference v **localStorage** prohlížeče
- formulářové souhlasy: vyřízení žádosti / předání partnerovi / marketing — oddělené checkboxy + shrnutí správce / účel / „nejde o banku“

Zbývá externě:

7. **Doba uchování** poptávek a marketingových souhlasů — potvrdit právníkem.
8. **Seznam zpracovatelů** (hosting, databáze, e-mail) — konkrétní subjekty a DPA.
9. **Meta Pixel / GA** — pokud se zapnou ID v env, ověřit policy + banner.
10. **Serverový audit trail cookie souhlasů** (volitelné).

## Editorial / YMYL

11. Finální review GDPR, smluv, zásad a cookies kvalifikovaným českým právníkem.
12. Review textů Akademie / Magazín u YMYL tvrzení.

## Co záměrně nevymýšlíme

- IČO / DIČ / obchodní jméno bez ověření
- falešné licence partnerů / JERRS odkazy
- detailní odstoupení u digitálního obsahu před právním textem
- doby uchování „jako by byly finální“, dokud nejsou potvrzené

Interní engineering SoT: `docs/internal/metodika.md`.
