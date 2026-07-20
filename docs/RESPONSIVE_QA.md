# Responsive QA — HypotékaJasně.cz

Datum: 2026-07-20  
Metoda: Playwright overflow scan (page `scrollWidth` vs `clientWidth`), DOM `scrollWidth` chain pro root cause, manuální kontrola navbar / cookie / charts / tables.  
**Zásada:** nepoužívat globální `overflow-x: hidden` na `html`/`body` jako „oprava“.

## Severity

| Level | Význam |
|-------|--------|
| **P0** | Horizontální scroll stránky na mobilu (≤430) nebo odříznutá navigace |
| **P1** | Horizontální scroll na tabletu/desktopu, cookie překrývá CTA, zoom/font layout break |
| **P2** | Lokální overflow v `overflow-x-auto` kontejneru, kosmetika, timeout load |
| **info** | Ověřeno OK / očekávané chování |

## Testovací viewporty

320×568 · 360×640 · 375×667 · 390×844 · 430×932 · 768×1024 · 820×1180 · 1024×768 · 1280×720 · 1366×768 · 1440×900 · 1536×864 · 1920×1080 · 2560×1440

Plná matice: `/`, `/investicni-rentgen`, `/investicni-pas`, `/dashboard`, `/portfolio`, `/kalkulacky`, `/navrh-na-miru`, `/pruvodce-investora/ceska-republika`.  
Ostatní veřejné route: priority viewporty (320 / 375 / 390 / 768 / 1024 / 1280 / 1920).

## Výsledek po opravách

**Žádná route nemá otevřený P0/P1 page-level horizontal scroll** (stav po retestu na production build).

Doplňkové testy:

| Test | Výsledek |
|------|----------|
| Zoom ≈200 % (layout viewport 640×360) | OK — bez page H-scroll |
| Font 150 % (`html { font-size: 150% }`) | OK |
| Keyboard Tab (25×) na `/` | OK — 25/25 interaktivních focusů |
| Cookie banner | `max-h` + scroll; `--cookie-banner-pad` na `main` |
| Modaly (`dialog.tsx`) | `max-h` + scrollovatelný body |
| Tabulky | localized `overflow-x-auto` + `min-w-*` |
| Charts (modelář) | `ResponsiveContainer` + `min-w-0` + `overflow-hidden` |

---

## Nalezené problémy a opravy

| Route | Viewport | Problem | Severity | Fix |
|-------|----------|---------|----------|-----|
| `/investicni-rentgen/modelar` | 1024×768 | Page H-scroll (+28px). KPI grid `lg:grid-cols-4` v úzkém `lg:col-span-8`; měny (`formatCzk`) nerozšiřitelné v buňce → `scrollWidth` propagace na `body`. | P1 → fixed | KPI: `xl:grid-cols-4`, `min-w-0`, `break-words` na částkách; grid columns `min-w-0`; chart wrapper `overflow-hidden` + užší YAxis |
| `/profesionalni-portal` | 320×568 | Page H-scroll (+44px). Tab `nav` s `-mx-1` + `overflow-x-auto` roztahoval document; header select bez `max-w-full`. | P0 → fixed | Inner-scroll nav bez negative margin; `min-w-0` / `max-w-full` na wrapper; select `max-w-full`; badge `break-words` |
| `/refinancovani-radar` | 375×667 | Page H-scroll (+5px). Řádky scénářů `flex justify-between` + ClaimBadge; table `overflow-x-auto` bez omezení šířky rodiče. | P0 → fixed | Scénáře: stack na mobile; table: `max-w-full min-w-0 overflow-x-auto` + `min-w-[36rem]` uvnitř |
| `/` (a globálně) | 1024–1279 / CSS zoom | Desktop navbar od `lg` přetékal při zoomu / úzkém desktopu. | P1 → fixed | Desktop nav + CTA až od **`xl` (1280+)**; pod tím hamburger |
| Kalkulačky | ≤375 | `grid-cols-2` KPI s dlouhými částkami | P1 (riziko) → fixed | `grid-cols-1 sm:grid-cols-2 md:grid-cols-4` + `break-words` |
| Cookie banner | mobil | Banner mohl překrývat spodní CTA | P1 → fixed | `max-h-[min(70vh,32rem)] overflow-y-auto`; CSS var `--cookie-banner-pad` → padding `main` |
| Footer | all | Interní review věta v produkčním footeru | P2 → fixed | Nahrazeno uživatelsky bezpečným disclaimerem |
| Layout shell | all | Chybějící `min-w-0` na flex children | P1 riziko → fixed | `body` / `main`: `min-w-0 max-w-full` (bez `overflow-x:hidden`) |
| Market / DD / Document / Offer KPI | mobil | `grid-cols-4` na úzkém viewportu | P1 → fixed (dříve) | `grid-cols-2` → `lg/sm` breakpoints |
| Dialogs | all | Modal bez max-height | P1 → fixed (dříve) | `max-h` + scroll body |

### Očekávané lokální overflow (P2 / info — ne page scroll)

| Route | Viewport | Problem | Severity | Fix / poznámka |
|-------|----------|---------|----------|----------------|
| `/portfolio`, `/investicni-pas`, `/investicni-rentgen/porovnani` | ≤768 | Table `min-w-[520–720px]` | info | Inner-scroll `overflow-x-auto` — **záměr**; page scroll = 0 |
| `/profesionalni-portal` | ≤430 | Tab strip širší než viewport | info | Localized horizontal scroll v `nav` |
| `/pruvodce-investora/*` | all | Sticky subnav `whitespace-nowrap` | info | Inner-scroll na subnav |
| Chart legends (Recharts) | úzké | `LEGEND` scrollWidth > client | info | Obsaženo v chart wrapperu |

---

## Checklist podle typu komponenty

| Oblast | Stav |
|--------|------|
| Navbar desktop / tablet / mobile | Desktop ≥1280; hamburger &lt;1280; drawer `max-w-sm` + scroll |
| Forms | Single-column na mobile (modelář, navrh, B2B) |
| Tables | Cards kde dává smysl **nebo** localized inner-scroll |
| Charts | `width/height 100%`, `minWidth={0}`, parent `min-w-0` |
| Modals | `max-h` + scroll |
| Cookie | Nezakrývá CTA (padding + max-height) |
| Footer | Bez overflow; disclaimer bez interních TODO |

---

## Skripty

```bash
# Production doporučeno (dev timeoutuje pod zátěží)
npm run build && npm run start

# Prioritní retest P0/P1
node scripts/responsive-retest.mjs

# Širší matice (delší běh)
node scripts/responsive-audit.mjs
```

Raw JSON: `docs/responsive-audit-raw.json`

---

## Retest log (production)

| Kolo | P0 | P1 | Poznámka |
|------|----|----|----------|
| 1 (dev, partial) | modelář 1024, B2B 320, refinance 375 | CSS zoom false-positive | Root causes identifikovány |
| 2 (prod + fixes) | 0 | 1 (CSS zoom) | B2B + refinance OK |
| 3 (zoom = 640 viewport) | **0** | **0** | Gate splněna |

**Gate:** žádná veřejná route nemá P0/P1 page-level responsive issue.
