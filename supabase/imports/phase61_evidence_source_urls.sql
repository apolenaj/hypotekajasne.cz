-- Phase 6.1 — attach verified primary source URLs to mortgage_source_evidence.
-- Safe UPDATE only; does not invent rates.
-- IDs = stableUuid from import generator (cz-2026-08-09).

begin;

update public.mortgage_source_evidence
set
  source_url = 'https://www.airbank.cz/co-vas-nejvic-zajima/urokove-sazby-u-hypoteky/',
  source_type = 'official_lender_web'
where id = '2f7deb25-4be2-5763-854e-826c4bbda866';

update public.mortgage_source_evidence
set
  source_url = 'https://www.moneta.cz/dokumenty-ke-stazeni/sazebniky',
  source_type = 'official_lender_web'
where id = '6186cf87-157c-5912-85ea-9de81f9aaa3d';

update public.mortgage_source_evidence
set
  source_url = 'https://www.moneta.cz/hypoteky/hypoteka',
  source_type = 'official_lender_web'
where id = '7ba4ea56-eb7a-5c7a-be47-564c78de33a6';

update public.mortgage_source_evidence
set
  source_url = 'https://www.unicreditbank.cz/cs/obcane/hypoteky/hypoteka-nove-penize.html',
  source_type = 'official_lender_web'
where id = '4642db37-5575-5296-a827-889cce9805e6';

update public.mortgage_source_evidence
set
  source_url = 'https://www.rb.cz/osobni/hypoteky',
  source_type = 'official_lender_web'
where id = '4c39a68d-cecf-52a2-9678-084f2d94aac4';

update public.mortgage_source_evidence
set
  source_url = 'https://www.rb.cz/osobni/hypoteky/nabidka-hypotek/hypoteka-s-nizsi-splatkou',
  source_type = 'official_lender_web'
where id = '4538e3aa-c077-58aa-9f30-a9cd2f058e10';

commit;
