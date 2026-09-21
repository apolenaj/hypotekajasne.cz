import https from "https";

function get(url) {
  return new Promise((res, rej) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        },
        (r) => {
          let d = "";
          r.on("data", (c) => (d += c));
          r.on("end", () =>
            res({ status: r.statusCode, headers: r.headers, body: d }),
          );
        },
      )
      .on("error", rej);
  });
}

const url =
  "https://www.hypotekajasne.cz/sazby?purpose=purchase&fixationMonths=36&propertyValueCzk=8000000&loanAmountCzk=6000000";

const { status, headers, body } = await get(url);
console.log(
  "status",
  status,
  "len",
  body.length,
  "cache",
  headers["cache-control"],
  "age",
  headers["age"],
  "x-vercel-cache",
  headers["x-vercel-cache"],
);

const needles = [
  "9. 8. 2026",
  "21. 9. 2026",
  "4,79",
  "4,89",
  "4,99",
  "5,09",
  "5,19",
  "5,24",
  "5,49",
  "5,69",
  "Air Bank",
  "UniCredit",
  "MONETA",
  "Komerční",
  "Česká spořitelna",
  "ČSOB",
  "Raiffeisen",
];

for (const n of needles) {
  let count = 0;
  let from = 0;
  while (true) {
    const i = body.indexOf(n, from);
    if (i < 0) break;
    count++;
    from = i + n.length;
  }
  console.log(JSON.stringify(n), count);
}

for (const t of [
  "4,99",
  "5,19",
  "5,09",
  "5,49",
  "4,79",
  "4,89",
  "21. 9",
  "9. 8",
  "Air Bank",
  "UniCredit",
]) {
  let from = 0;
  let c = 0;
  while (c < 4) {
    const i = body.indexOf(t, from);
    if (i < 0) break;
    console.log("CTX", t, JSON.stringify(body.slice(Math.max(0, i - 100), i + 120)));
    from = i + t.length;
    c++;
  }
}
