import https from "https";
import fs from "fs";

function get(url, extraHeaders = {}) {
  return new Promise((res, rej) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            ...extraHeaders,
          },
        },
        (r) => {
          let d = "";
          r.setEncoding("utf8");
          r.on("data", (c) => (d += c));
          r.on("end", () =>
            res({ status: r.statusCode, headers: r.headers, body: d }),
          );
        },
      )
      .on("error", rej);
  });
}

const base =
  "https://www.hypotekajasne.cz/sazby?purpose=purchase&fixationMonths=36&propertyValueCzk=8000000&loanAmountCzk=6000000";

const html = await get(base);
fs.writeFileSync("tmp/prod-sazby.html", html.body, "utf8");

// Also try RSC / Next flight
const rsc = await get(base, {
  Accept: "text/x-component",
  RSC: "1",
  "Next-Router-State-Tree":
    '%5B%22%22%2C%7B%22children%22%3A%5B%22sazby%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
});
fs.writeFileSync("tmp/prod-sazby.rsc", rsc.body, "utf8");

function count(body, n) {
  let c = 0,
    from = 0;
  while (true) {
    const i = body.indexOf(n, from);
    if (i < 0) break;
    c++;
    from = i + n.length;
  }
  return c;
}

for (const [label, body] of [
  ["HTML", html.body],
  ["RSC", rsc.body],
]) {
  console.log("\n===", label, "len", body.length, "===");
  for (const n of [
    "9. 8. 2026",
    "21. 9. 2026",
    "2026-08-09",
    "2026-09-21",
    "4,79",
    "4,89",
    "4,99",
    "5,09",
    "5,19",
    "5,24",
    "5,49",
    "5,69",
    "4.79",
    "4.89",
    "4.99",
    "5.09",
    "5.19",
    "5.24",
    "5.49",
    "Air Bank",
    "air-bank",
    "unicredit",
    "UniCredit",
    "MONETA",
    "moneta",
    "kb",
    "Komerční banka",
    "ceska-sporitelna",
    "csob",
    "raiffeisen",
    "Poslední ověření",
    "Posledni overeni",
    "ověřeno",
    "verifiedAt",
  ]) {
    console.log(n, count(body, n));
  }
}

// Extract visible text-ish: strip tags roughly and find rate lines
const text = html.body
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ")
  .replace(/\s+/g, " ");
fs.writeFileSync("tmp/prod-sazby-text.txt", text, "utf8");

const bankHints = [
  "Air",
  "UniCredit",
  "MONETA",
  "Komer",
  "spořitelna",
  "ČSOB",
  "Raiffeisen",
  "mBank",
  "Oberbank",
];
for (const b of bankHints) {
  const i = text.indexOf(b);
  console.log("TEXT bank", b, i);
  if (i >= 0) console.log("  ", text.slice(Math.max(0, i - 30), i + 200));
}

// Show all percentage-like tokens near insurance wording
const re =
  /(?:s pojištěním|bez pojištění|Poslední ověření|ověřeno|od )[^.]{0,40}?(\d,\d{2})\s*%/gi;
let m;
const found = [];
while ((m = re.exec(text))) {
  found.push(m[0].slice(0, 80));
}
console.log("\nRATE PHRASES", found.slice(0, 40));

// Find all "X,XX %" occurrences with 40 chars context
const re2 = /(\d,\d{2})\s*%/g;
const rates = [];
while ((m = re2.exec(text))) {
  rates.push({
    rate: m[1],
    ctx: text.slice(Math.max(0, m.index - 60), m.index + 40),
  });
}
console.log("\nALL RATES COUNT", rates.length);
for (const r of rates.slice(0, 60)) {
  console.log(JSON.stringify(r));
}
