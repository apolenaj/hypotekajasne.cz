# Stripe setup — Investiční rentgen

Bezpečný Checkout flow pro produkty **999 Kč** (Investiční rentgen) a **4 990 Kč** (Individuální rozbor).

Secrets **nikdy** necommitujte. Do dokumentace nepatří skutečné klíče.

## 1. Environment variables (Vercel)

Povinné:

```
STRIPE_SECRET_KEY=sk_test_…   # nebo sk_live_…
STRIPE_WEBHOOK_SECRET=whsec_…
NEXT_PUBLIC_SITE_URL=https://www.hypotekajasne.cz
NEXT_PUBLIC_BASE_URL=https://www.hypotekajasne.cz
NEXT_PUBLIC_SUPABASE_URL=…
SUPABASE_SERVICE_ROLE_KEY=…
```

Pro spuštění online nákupu (jinak zůstane režim poptávky):

```
PAID_ANALYSIS_CHECKOUT_LIVE=true
NEXT_PUBLIC_PAID_ANALYSIS_CHECKOUT_LIVE=true
```

Plus připravená právní identita provozovatele (`LEGAL_OPERATOR_*` — viz `isPaidAnalysisCommerciallyAvailable()`).

Volitelné Stripe Price IDs (doporučeno pro produkci):

```
STRIPE_PRICE_INVESTMENT_XRAY=price_…
STRIPE_PRICE_INDIVIDUAL_ANALYSIS=price_…
```

Pokud Price ID chybí, server použije `price_data` s kanonickou částkou **99900** / **499000** haléřů CZK. Klient **nemůže** částku přepsat.

E-mail po platbě:

```
RESEND_API_KEY=…
RESEND_EMAIL_DOMAIN=…
RENTGEN_AUDIT_FROM_EMAIL=…   # nebo LEAD_OPS_FROM_EMAIL
```

## 2. Stripe Products / Prices

V Stripe Dashboard → Products vytvořte:

| Produkt | productCode (metadata) | Částka | Env |
|--------|-------------------------|--------|-----|
| Investiční rentgen | `INVESTMENT_XRAY` | 999 CZK one-time | `STRIPE_PRICE_INVESTMENT_XRAY` |
| Individuální rozbor | `INDIVIDUAL_ANALYSIS` | 4 990 CZK one-time | `STRIPE_PRICE_INDIVIDUAL_ANALYSIS` |

Currency: **CZK**. Mode: **one-time**.

Nikdy nemíchejte test a live Price IDs ve stejném prostředí.

## 3. Databáze (Supabase)

Spusťte SQL:

`supabase/investment_analysis_orders.sql`

Tabulky:

- `investment_analysis_orders`
- `stripe_webhook_events` (idempotence podle `event_id`)

## 4. Webhook

URL (production):

```
https://www.hypotekajasne.cz/api/webhooks/stripe
```

Lokálně:

```
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Do Vercelu / `.env.local` vložte `STRIPE_WEBHOOK_SECRET` z CLI nebo Dashboardu.

### Eventy k povolení

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `charge.refunded` (ops log; stav REFUNDED dle potřeby)

Webhook **vždy** ověřuje podpis. Bez `STRIPE_WEBHOOK_SECRET` vrací 503.

## 5. API endpoints

| Method | Path | Účel |
|--------|------|------|
| POST | `/api/checkout/rentgen` | DRAFT order + Checkout Session |
| GET | `/api/checkout/rentgen/order` | Stav (session_id nebo order+access) |
| GET | `/api/checkout/rentgen/download` | PDF (order+access token) |
| POST | `/api/webhooks/stripe` | Fulfillment |

Success URL: `/investicni-rentgen/dekujeme?session_id={CHECKOUT_SESSION_ID}`  
Cancel URL: `/investicni-rentgen/objednavka?order=…&access=…&canceled=1`

Success page **sama** neoznačuje objednávku jako PAID — čeká na webhook.

## 6. Testovací platba

1. `STRIPE_SECRET_KEY` = test key, webhook přes `stripe listen`.
2. `PAID_ANALYSIS_CHECKOUT_LIVE=true` + připravený operator.
3. SQL tabulky nasazené.
4. Otevřete `/investicni-rentgen`, vyplňte náhled (cena, nájem, vlastní kapitál), kontakt.
5. CTA → Stripe Checkout.
6. Karta: `4242 4242 4242 4242`, libovolné datum/CVC.
7. Po redirectu na `/dekujeme` ověřte stav READY / AWAITING_DOCUMENTS.
8. V Supabase zkontrolujte řádek objednávky + `stripe_webhook_events`.

## 7. Live platba

1. Přepněte na `sk_live_…` a live webhook secret.
2. Nastavte live Price IDs.
3. Webhook endpoint na produkční URL + stejné eventy.
4. Ověřte `PAID_ANALYSIS_CHECKOUT_LIVE` a právní identitu.
5. Proveďte reálnou platbu 999 Kč (ne 1 Kč — ceny jsou kanonické; pro smoke test použijte Stripe test mode).

## 8. Refund

V Stripe Dashboard → Payments → Refund. Webhook `charge.refunded` se loguje; ručně ověřte stav u zákazníka a přístup k PDF dle interního procesu.

## 9. Checklist před deployem (Vercel)

- [ ] `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- [ ] Price IDs (nebo souhlas s price_data fallback)
- [ ] Supabase URL + service role
- [ ] SQL migrace orders
- [ ] Resend
- [ ] `PAID_ANALYSIS_CHECKOUT_LIVE` jen když je vše ready
- [ ] Webhook events v Dashboardu
- [ ] Test platba end-to-end

## 10. Bezpečnost (shrnutí)

- Cena jen ze server allowlistu (`products.ts`).
- Žádné ukládání karet.
- Webhook signature required.
- PDF jen s `publicId` + `access_token`.
- `session_id` nestačí jako dlouhodobá autorizace ke stažení.
- Idempotence: `stripe_webhook_events.event_id` unique + stav READY/AWAITING_DOCUMENTS short-circuit.
