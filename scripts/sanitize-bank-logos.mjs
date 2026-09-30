/**
 * Sanitize bank logo SVGs and copy into public/images/banks.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const PUB = join(process.cwd(), "public", "images", "banks");
mkdirSync(PUB, { recursive: true });

function sanitize(svg) {
  let s = svg.toString("utf8");
  s = s.replace(/<script[\s\S]*?<\/script>/gi, "");
  s = s.replace(/\son[a-zA-Z]+=("[^"]*"|'[^']*'|[^\s>]+)/g, "");
  s = s.replace(/\sxlink:href="https?:[^"]*"/gi, "");
  s = s.replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "");
  if (!s.includes("<svg")) throw new Error("not svg");
  return s;
}

const mapping = [
  {
    slug: "komercni-banka",
    src: "tmp/bank-logos/komercni-banka.src.svg",
    source:
      "Wikimedia Commons — extracted from official KB Results PDF (kb.cz)",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Komer%C4%8Dn%C3%AD_banka_logo.svg",
  },
  {
    slug: "csob",
    src: "tmp/bank-logos/csob-official.svg",
    source: "Official ČSOB website logo.svg",
    sourceUrl: "https://www.csob.cz/documents/10710/4049264/logo.svg?v2",
  },
  {
    slug: "ceska-sporitelna",
    src: "tmp/bank-logos/ceska-sporitelna.src.svg",
    source:
      "Wikimedia Commons — from official ČS PDF (colored mark for light UI; header SVG on csas.cz is white-only)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Ceska_Sporitelna.svg",
  },
  {
    slug: "mbank",
    src: "tmp/bank-logos/mbank.src.svg",
    source: "Wikimedia Commons (source www.mbank.pl)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Mbank_logo.svg",
  },
  {
    slug: "unicredit",
    src: "tmp/bank-logos/unicredit.src.svg",
    source: "Wikimedia Commons (UniCredit annual report logo)",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Unicredit_logo.svg",
  },
  {
    slug: "raiffeisenbank",
    src: "tmp/bank-logos/raiffeisenbank.src.svg",
    source: "Wikimedia Commons Raiffeisen Bank 2023 logo (Giebel brand)",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Raiffeisen_Bank_2023_logo.svg",
  },
  {
    slug: "oberbank",
    src: "tmp/bank-logos/oberbank.src.svg",
    source: "Wikimedia Commons Oberbank Logo.svg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Oberbank_Logo.svg",
  },
];

const sources = [];
for (const m of mapping) {
  const raw = readFileSync(m.src);
  const clean = sanitize(raw);
  const dest = join(PUB, `${m.slug}.svg`);
  writeFileSync(dest, clean, "utf8");
  const hasScript = /<script/i.test(clean);
  const hasExt = /xlink:href="https?:/i.test(clean);
  if (hasScript || hasExt) {
    throw new Error(`Unsafe content in ${m.slug}`);
  }
  console.log(m.slug, clean.length);
  sources.push({
    slug: m.slug,
    file: `/images/banks/${m.slug}.svg`,
    source: m.source,
    sourceUrl: m.sourceUrl,
    bytes: Buffer.byteLength(clean, "utf8"),
  });
}

writeFileSync(join(PUB, "SOURCES.json"), JSON.stringify(sources, null, 2));
console.log("OK", sources.length);
