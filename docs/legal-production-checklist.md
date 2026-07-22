# Legal production checklist — Hypotéka Jasně

**Účel:** Doplnit ověřené právní údaje před produkčním sběrem osobních / finančních leadů.  
**Zásada:** Nevymýšlet jméno, IČO, sídlo ani registraci. Tento dokument není právní rada.

Centrální SoT v kódu: `src/config/legal.ts`  
CI / build gate: `npm run check:legal` (součást `npm run build`)

---

## 1. Povinné env (provozovatel)

Nastavte ve Vercel Production (a zrcadlete `NEXT_PUBLIC_*` pro klientské formuláře):

| Env | Pole v config | Poznámka |
|-----|---------------|----------|
| `LEGAL_OPERATOR_LEGAL_NAME` (+ `NEXT_PUBLIC_…`) | `legalName` / `dataControllerName` | Obchodní jméno z rejstříku |
| `LEGAL_OPERATOR_ICO` (+ `NEXT_PUBLIC_…`) | `companyId` | IČO |
| `LEGAL_OPERATOR_REGISTER_URL` (+ `NEXT_PUBLIC_…`) | `registryUrl` | ARES / justice výpis |
| `LEGAL_OPERATOR_STREET` + `CITY` + `ZIP` **nebo** `LEGAL_OPERATOR_REGISTERED_OFFICE` | `registeredOffice` | Explicitní sídlo — kontaktní fallback se **nepočítá** jako kompletní |
| `LEGAL_OPERATOR_EMAIL` (volitelné, jinak kontaktní fallback) | `contactEmail` | |
| `LEGAL_OPERATOR_PRIVACY_EMAIL` (volitelné) | `privacyEmail` | Default = contactEmail |

Volitelné:

| Env | Pole |
|-----|------|
| `LEGAL_OPERATOR_DIC` | DIČ |
| `LEGAL_OPERATOR_REGISTRY_NAME` | Název registru |
| `LEGAL_OPERATOR_PHONE` | Telefon |
| `LEGAL_OPERATOR_DPO_CONTACT` | DPO / pověřenec |
| `LEGAL_LAST_REVIEW_DATE` | Datum review textů (ISO / YYYY-MM-DD) |
| `LEGAL_REVIEWED_BY` | Jméno / kancelář právníka |

Bez `LEGAL_REVIEWED_BY` + `LEGAL_LAST_REVIEW_DATE` web **nesmí** tvrdit, že texty jsou právně zkontrolované (UI to výslovně neříká).

---

## 2. Production gate (leady)

Na **Vercel Production** (`VERCEL_ENV=production`) build **selže**, pokud `isLegalIdentityComplete()` = false.

| Flag | Význam |
|------|--------|
| `LEGAL_STRICT_PRODUCTION=true` | Tvrdý gate vždy (i partner handoff) |
| `LEGAL_REQUIRE_OPERATOR_FOR_LEADS=true` | Vynutit identitu pro leady |
| `LEGAL_ALLOW_INCOMPLETE_FOR_LEADS=true` | **Nouzový** bypass — dokumentujte důvod |

Runtime:

- `POST /api/leads` → **503** s bezpečnou CS zprávou, pokud gate aktivní a identita nekompletní.
- Lead formuláře: safety guard + disabled submit ve stejném případě (klient potřebuje `NEXT_PUBLIC_*` mirror).

---

## 3. Partner handoff (odděleně)

| Env | Účel |
|-----|------|
| `LEGAL_PARTNER_LEGAL_NAME` / `ICO` / `JERRS_URL` (+ `NEXT_PUBLIC_*`) | Veřejná identita specialisty |

Bez toho: formuláře = provozovatel-only, žádný falešný partner souhlas.

---

## 4. Kontrolní seznam před marketing scale

- [ ] Vyplněna povinná operator env (sekce 1)  
- [ ] `npm run check:legal` na CI s `VERCEL_ENV=production` (nebo po deploy preview simulaci)  
- [ ] GDPR / cookies / smlouvy / formulářové souhlasy zobrazují správce z configu  
- [ ] Žádné TODO / „Legal review required“ ve veřejném UI  
- [ ] Review právníka → `LEGAL_REVIEWED_BY` + `LEGAL_LAST_REVIEW_DATE`  
- [ ] Partner env jen s ověřenými údaji  
- [ ] Test odeslání leadu na staging s kompletní identitou  
- [ ] Test 503 / blokace při záměrně nekompletní identitě  

---

## 5. Ověření

```bash
npm run check:legal
npm run test:legal
npm run typecheck
npm run build
```

Lokálně (bez `VERCEL_ENV=production`) je check soft (warnings).  
Na Vercel Production musí být operator env doplněné, jinak deploy build padne.
