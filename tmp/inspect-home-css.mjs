import https from "https";

function get(url) {
  return new Promise((res, rej) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (r) => {
        let d = "";
        r.setEncoding("utf8");
        r.on("data", (c) => (d += c));
        r.on("end", () => res(d));
      })
      .on("error", rej);
  });
}

const html = await get("https://www.hypotekajasne.cz/");
const cssUrls = [
  ...html.matchAll(/href="([^"]+_next\/static\/[^"]+\.css)"/g),
].map((m) => m[1]);
const abs = [
  ...new Set(
    cssUrls.map((u) => (u.startsWith("http") ? u : `https://www.hypotekajasne.cz${u}`)),
  ),
];
console.log("css files", abs.length, abs);

let all = "";
for (const u of abs.slice(0, 10)) {
  try {
    const body = await get(u);
    all += body;
    console.log("got", u.slice(-50), body.length);
  } catch (e) {
    console.log("fail", u, e.message);
  }
}

function dump(re, label) {
  const m = [...all.matchAll(re)];
  console.log("\n===", label, m.length);
  for (const x of m.slice(0, 8)) console.log(x[0].slice(0, 220));
}

dump(/html,?[^,{]*\{[^}]{0,250}\}/g, "html rules");
dump(/body,?[^,{]*\{[^}]{0,350}\}/g, "body rules");
dump(/overflow-y:\s*hidden/g, "overflow-y hidden");
dump(/overflow:\s*hidden/g, "overflow hidden count sample");
console.log("100vh count", (all.match(/100vh/g) || []).length);
console.log("100dvh count", (all.match(/100dvh/g) || []).length);
console.log("overflow-x:hidden count", (all.match(/overflow-x:\s*hidden/g) || []).length);
