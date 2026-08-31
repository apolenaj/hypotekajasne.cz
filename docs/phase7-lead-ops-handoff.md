# Phase 7 — Lead operations handoff (Josef → Michal)

## Current delivery

1. User submits form → DB insert (`lifecycle_status=new`)  
2. E-mail to **Josef** (`LEAD_OPS_RECIPIENT_EMAIL`) from `leady@notify.hypotekajasne.cz`  
3. Josef triages qualified leads internally (manual; no third-party auto-forward)  
4. Do **not** auto-CC Michal

## Attribution on the lead row

Stored (sanitized): `page_intent`, UTMs, `landing_path`, `lifecycle_status`, revenue fields default NULL/`unknown`.

## Josef checklist per lead

1. Confirm not synthetic (`PHASE62` / `phase_6_2_*` markers)  
2. Note source campaign from UTMs if present  
3. Contact attempt → ops lifecycle `contacted` (via authenticated ops API when used)  
4. If qualified → `qualified` + forward to Michal  
5. Michal updates later stages (`appointment` → … → `funded` / `lost`)  
6. Revenue: set `expected_revenue_amount` / `realized_revenue_amount` only with real basis; otherwise leave NULL

## Reporting metrics (ops report + Sheets if needed)

Visits, CTA rate, form view rate, lead conversion, valid leads, contacted, qualified, funded, CPL, cost/qualified, realized revenue, campaign ROI.

Unknown economics → leave NULL / unknown — never invent.

## Synthetic tests

Marker `phase_6_2_*` or clear PHASE62 name/email; delete after verification; confirm 0 remaining by id/marker.
