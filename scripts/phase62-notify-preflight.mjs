/**
 * Pre-test notification presence checks (no secret values printed).
 * Run: npx vercel env run -e production -- node scripts/phase62-notify-preflight.mjs
 */
function present(name) {
  return Boolean(process.env[name]?.trim());
}

function extractEmail(raw) {
  if (!raw) return null;
  const m = raw.match(/<([^>]+)>/);
  return (m?.[1] ?? raw).trim().toLowerCase();
}

const domain = (process.env.RESEND_EMAIL_DOMAIN || "").trim().toLowerCase();
const fromRaw = (process.env.LEAD_OPS_FROM_EMAIL || "").trim();
const fromAddr = extractEmail(fromRaw);
const recipient = (process.env.LEAD_OPS_RECIPIENT_EMAIL || "")
  .trim()
  .toLowerCase();

const report = {
  RESEND_API_KEY: present("RESEND_API_KEY"),
  RESEND_EMAIL_DOMAIN: present("RESEND_EMAIL_DOMAIN"),
  RESEND_EMAIL_DOMAIN_match: domain === "notify.hypotekajasne.cz",
  LEAD_OPS_FROM_EMAIL: present("LEAD_OPS_FROM_EMAIL"),
  sender_domain_ok: Boolean(
    fromAddr && domain && fromAddr.endsWith(`@${domain}`)
  ),
  sender_is_expected_mailbox: fromAddr === "leady@notify.hypotekajasne.cz",
  LEAD_OPS_RECIPIENT_EMAIL: present("LEAD_OPS_RECIPIENT_EMAIL"),
  recipient_is_josef: recipient === "josef.apolenar@gmail.com",
  CRON_SECRET: present("CRON_SECRET"),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: present("NEXT_PUBLIC_GA_MEASUREMENT_ID"),
};

const ok =
  report.RESEND_API_KEY &&
  report.RESEND_EMAIL_DOMAIN_match &&
  report.LEAD_OPS_FROM_EMAIL &&
  report.sender_domain_ok &&
  report.sender_is_expected_mailbox &&
  report.recipient_is_josef;

console.log(JSON.stringify({ ok, ...report }, null, 2));
process.exit(ok ? 0 : 2);
