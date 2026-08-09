# Google Search Console — launch checklist

Canonical host in production metadata/sitemap: **`https://www.hypotekajasne.cz`**

Apex `hypotekajasne.cz` currently redirects to www (Vercel). Domain property still covers both.

## Steps for Josef

1. **Add Domain property** for `hypotekajasne.cz` in [Google Search Console](https://search.google.com/search-console).
2. **DNS verification** — add the TXT (or other) record Google shows at your DNS provider; wait until verified.
3. **Submit sitemap** — after production deploy of Phase 5:
   - Prefer sitemap index: `https://www.hypotekajasne.cz/sitemap.xml`
   - Or individual buckets listed in `/robots.txt`.
4. **URL Inspection — homepage** `https://www.hypotekajasne.cz/`
   - Confirm canonical, indexability, and rendered title/description.
5. **URL Inspection — rates** `https://www.hypotekajasne.cz/sazby`
6. **URL Inspection — calculator** `https://www.hypotekajasne.cz/kalkulacky/hypotecni`
7. **Request indexing** for those three URLs after launch if they are not yet discovered (optional; not required for every URL).
8. **Monitor Pages** (indexing) for coverage, soft 404s, excluded by `noindex`, crawled – currently not indexed.
9. **Monitor Core Web Vitals** (Experience) for mobile LCP/INP/CLS on key URLs.
10. **Monitor Performance** — queries, clicks, impressions for Czech mortgage intents.

## Notes

- Use the **Domain** property (not URL-prefix only) so apex + www are covered after verification.
- Do not submit preview `*.vercel.app` URLs.
- Parameterized `/sazby?...` should show canonical `/sazby` in inspection.
- Optional later: if you switch Vercel primary to apex, update `PRODUCTION_HOST` in `src/lib/seo/site.ts` and Search Console preferred host together — never leave mixed hosts.
