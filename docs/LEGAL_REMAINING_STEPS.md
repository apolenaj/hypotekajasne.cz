# Zbývající externí právní kroky

Stav k 2026-07-20. Veřejné UI už **nezobrazuje** TODO / „Legal review required“ / názvy env. Níže jsou kroky, které musí dokončit provozovatel + právník **mimo** produktový kód.

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

## GDPR / cookies (soulad s implementací)

Implementace dnes:

- analytika i marketing cookies **jen po souhlasu** (banner + `ConsentGatedScripts`)
- preference v **localStorage** prohlížeče
- formulářové souhlasy: vyřízení žádosti / předání partnerovi / marketing — oddělené checkboxy

Zbývá externě:

4. **Doba uchování** poptávek a marketingových souhlasů — potvrdit právníkem (veřejný text je záměrně opatrný).
5. **Seznam zpracovatelů** (hosting, databáze, e-mail) — doplnit konkrétní subjekty a DPA smlouvy; veřejný text dnes říká „doplní provozovatel“.
6. **Meta Pixel / GA** — pokud se zapnou ID v env, ověřit že policy + banner pokrývají skutečné cookies (marketing je zatím tenčí než plný pixel stack).
7. **Serverový audit trail cookie souhlasů** (volitelné) — dnes jen client storage; právník rozhodne, zda stačí.

## Partneři / regulace

8. **Ověření partnerů v JERRS / ČNB** a zveřejnění odkazu na `/partneri` (stav „Čeká na ověření“).
9. Potvrdit, že web **není** zprostředkovatel dle z. č. 257/2016 Sb. — text regulovaných hranic už je ve veřejném UI; právník zkontroluje formulaci.

## Editorial / YMYL

10. Finální review GDPR, smluv, zásad a cookies kvalifikovaným českým právníkem.
11. Review textů Akademie / Magazín u YMYL tvrzení (autor + odborná kontrola už v šabloně).

## Co záměrně nevymýšlíme

- IČO / DIČ / obchodní jméno bez ověření
- falešné licence partnerů
- detailní odstoupení u digitálního obsahu před právním textem
- doby uchování „jako by byly finální“, dokud nejsou potvrzené

Interní engineering SoT: `docs/internal/metodika.md`.
