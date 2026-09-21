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
].map((m) => (m[1].startsWith("http") ? m[1] : `https://www.hypotekajasne.cz${m[1]}`));

let all = "";
for (const u of [...new Set(cssUrls)]) all += await get(u);

let from = 0;
let n = 0;
while (n < 20) {
  const i = all.indexOf("100vh", from);
  if (i < 0) break;
  console.log("100vh CTX", JSON.stringify(all.slice(Math.max(0, i - 80), i + 40)));
  from = i + 5;
  n++;
}

from = 0;
n = 0;
while (n < 15) {
  const i = all.indexOf("overflow:hidden", from);
  if (i < 0) break;
  console.log("OH CTX", JSON.stringify(all.slice(Math.max(0, i - 100), i + 30)));
  from = i + 15;
  n++;
}

// Check height utilities used by layout
for (const term of [
  ".h-full{",
  ".min-h-full{",
  ".overflow-hidden{",
  ".overflow-x-hidden{",
  ".overflow-y-hidden{",
  ".overflow-y-auto{",
  ".overflow-y-visible{",
]) {
  const i = all.indexOf(term);
  console.log(term, i >= 0 ? all.slice(i, i + term.length + 40) : "MISSING");
}
