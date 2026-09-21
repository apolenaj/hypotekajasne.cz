import https from "https";
import fs from "fs";

function get(url) {
  return new Promise((res, rej) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
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

const urls = [
  "https://www.hypotekajasne.cz/sazby",
  "https://www.hypotekajasne.cz/sazby?purpose=purchase&fixationMonths=36&property=8000000&loan=6000000",
  "https://www.hypotekajasne.cz/sazby?purpose=refinance&fixationMonths=36&property=8000000&loan=6000000",
];

for (const url of urls) {
  const { status, headers, body } = await get(url);
  const text = body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");

  console.log("\n==========", url);
  console.log(
    "status",
    status,
    "vercel",
    headers["x-vercel-cache"],
    "len",
    body.length,
  );
  for (const n of [
    "9. 8. 2026",
    "21. 9. 2026",
    "Air Bank",
    "UniCredit",
    "MONETA",
    "Komerční banka",
    "Česká spořitelna",
    "ČSOB",
    "Raiffeisenbank",
    "4,79",
    "4,89",
    "4,99",
    "5,09",
    "5,19",
    "5,24",
    "5,49",
    "5,69",
    "Poslední ověření",
    "neplatné parametry",
  ]) {
    let c = 0,
      from = 0;
    while (true) {
      const i = body.indexOf(n, from);
      if (i < 0) break;
      c++;
      from = i + n.length;
    }
    console.log(n, c);
  }

  // Extract offer-like chunks: bank name near rate
  const banks = [
    "Air Bank",
    "UniCredit Bank",
    "MONETA Money Bank",
    "Komerční banka",
    "Česká spořitelna",
    "ČSOB",
    "Raiffeisenbank",
  ];
  for (const b of banks) {
    let from = 0;
    let shown = 0;
    while (shown < 2) {
      const i = text.indexOf(b, from);
      if (i < 0) break;
      console.log("BANKCTX", b, text.slice(i, i + 220));
      from = i + b.length;
      shown++;
    }
  }

  const slug = url.includes("refinance")
    ? "refi"
    : url.includes("property=")
      ? "purchase"
      : "default";
  fs.writeFileSync(`tmp/prod-sazby-${slug}.txt`, text, "utf8");
}
