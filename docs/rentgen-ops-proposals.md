# Investiční rentgen — provozní návrhy k rozhodnutí

Stav: **návrh** (ne schválený závazek vůči zákazníkovi).  
Související produkt: digitální model 999 Kč · individuální rozbor 4 990 Kč.

## 1. Dodání a termín

| Varianta | Návrh | Poznámka |
|---|---|---|
| 999 Kč | Dodání PDF po úhradě a kompletních vstupech, typicky do 1 pracovního dne (automat) | Termín potvrdit až po ověření platební brány |
| 4 990 Kč | Termín potvrdit po kontrole rozsahu a podkladů (návrh: 5–10 pracovních dnů) | Nevyhlašovat SLA ve veřejném textu, dokud není `NEXT_PUBLIC_RENTGEN_PREMIUM_SLA_*` |

## 2. Oprava chybných vstupů

- Zjevné chyby (překlep v ceně/ploše/nájmu) — 1 bezplatná oprava a regenerace PDF v rámci objednávky.
- Změna předpokladů (jiná sazba, jiné LTV, jiná nemovitost) — nová objednávka / doplatek dle dohody.

## 3. Následné dotazy

- 999 Kč: stručné vysvětlení výsledků modelu e-mailem (návrh: do 2 odpovědí).
- 4 990 Kč: odpovědi v dohodnutém rozsahu po dodání (návrh: 1 kolo do 5 pracovních dnů).
- Nezahrnuje: právní posudek, bankovní zprostředkování, neomezené přepočty, konzultaci zdarma.

## 4. Platební brána

Online prodej je připravován (Stripe checkout route existuje). Do spuštění zůstává CTA **Poptat**. Nezapínat platby jen kvůli demu.

## 5. Co schválit před prodejem

1. Finální SLA texty a env hodnoty.
2. Rozsah „1 kola dotazů“ vs. hodinová konzultace (placená).
3. Checklist povinných podkladů pro 4 990 Kč.
4. Zapnutí plateb vs. ponechání poptávky.
5. Odpovědnost za syntetické vs. dohledané srovnání u placeného individuálního rozboru.
