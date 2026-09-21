import https from "https";

function get(url) {
  return new Promise((res, rej) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent": "Mozilla/5.0",
            Accept: "application/json,text/html,*/*",
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

const apiUrl =
  "https://www.hypotekajasne.cz/api/mortgage-market/offers?country=CZ&purpose=purchase&fixationMonths=36&ltv=75&includeLtvUnspecified=1";

async function checkOnce() {
  const api = await get(apiUrl);
  let air = [];
  let kb = [];
  let uc = [];
  try {
    const j = JSON.parse(api.body);
    air = (j.offers || [])
      .filter((o) => o.lenderSlug === "air-bank")
      .map((o) => ({ rate: o.nominalInterestRate, checked: o.checkedAt }));
    kb = (j.offers || [])
      .filter((o) => o.lenderSlug === "komercni-banka")
      .map((o) => ({ rate: o.nominalInterestRate, checked: o.checkedAt }));
    uc = (j.offers || [])
      .filter((o) => o.lenderSlug === "unicredit")
      .map((o) => ({ rate: o.nominalInterestRate, checked: o.checkedAt }));
  } catch {
    /* ignore */
  }

  const page = await get("https://www.hypotekajasne.cz/sazby");
  const text = page.body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

  const airIdx = text.indexOf("Air Bank 3 roky · Koupě");
  const airCard = airIdx >= 0 ? text.slice(airIdx, airIdx + 220) : "(missing)";
  const kbIdx = text.indexOf("Komerční banka 3 roky · Koupě");
  const kbCard = kbIdx >= 0 ? text.slice(kbIdx, kbIdx + 180) : "(missing)";
  const ucIdx = text.indexOf("UniCredit Bank 3 roky · Koupě");
  const ucCard = ucIdx >= 0 ? text.slice(ucIdx, ucIdx + 180) : "(missing)";

  return {
    vercel: page.headers["x-vercel-cache"],
    has98: text.includes("9. 8. 2026"),
    has219: text.includes("21. 9. 2026"),
    airApi: air,
    kbApi: kb,
    ucApi: uc,
    airCard,
    kbCard,
    ucCard,
    apiLooksNew:
      air.some((a) => a.rate === 4.99) &&
      !air.some((a) => a.rate === 4.79) &&
      air.every((a) => String(a.checked).startsWith("2026-09-21")),
  };
}

const started = Date.now();
let last = null;
for (let i = 0; i < 24; i++) {
  last = await checkOnce();
  console.log(
    `try ${i}`,
    "apiNew=",
    last.apiLooksNew,
    "has98=",
    last.has98,
    "airApi=",
    JSON.stringify(last.airApi),
  );
  if (last.apiLooksNew && !last.has98) break;
  await new Promise((r) => setTimeout(r, 15000));
}

console.log("\n=== FINAL ===");
console.log("elapsed_s", Math.round((Date.now() - started) / 1000));
console.log("apiLooksNew", last.apiLooksNew);
console.log("has98", last.has98);
console.log("has219", last.has219);
console.log("AIR_CARD", last.airCard);
console.log("KB_CARD", last.kbCard);
console.log("UC_CARD", last.ucCard);
console.log("AIR_API", last.airApi);
console.log("KB_API", last.kbApi);
console.log("UC_API", last.ucApi);

// Second page fetch ~10s later to emulate "after hydration overwrite window"
await new Promise((r) => setTimeout(r, 10000));
const again = await checkOnce();
console.log("\n=== AFTER 10s PAGE RECHECK ===");
console.log("AIR_CARD", again.airCard);
console.log("has98", again.has98);
console.log("apiLooksNew", again.apiLooksNew);
console.log(
  "STABLE",
  last.airCard === again.airCard && !again.has98 && again.apiLooksNew,
);
