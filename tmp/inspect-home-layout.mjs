import https from "https";
import fs from "fs";

function get(url) {
  return new Promise((res, rej) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Cache-Control": "no-cache",
          },
        },
        (r) => {
          let d = "";
          r.setEncoding("utf8");
          r.on("data", (c) => (d += c));
          r.on("end", () => res(d));
        },
      )
      .on("error", rej);
  });
}

const d = await get("https://www.hypotekajasne.cz/");
fs.writeFileSync("tmp/home-prod.html", d);
console.log("html", d.match(/<html[^>]*>/)?.[0]);
console.log("body", d.match(/<body[^>]*>/)?.[0]);
console.log("main", d.match(/<main[^>]*>/)?.[0]);
console.log("header", d.match(/<header[^>]*>/)?.[0]);

for (const m of d.matchAll(/<section[^>]*class="([^"]+)"/g)) {
  console.log("SECTION", m[1]);
}

const interesting = [
  "overflow-hidden",
  "h-screen",
  "max-h-screen",
  "min-h-screen",
  "h-full",
  "max-h-",
  "100vh",
  "100dvh",
];
for (const term of interesting) {
  let c = 0;
  let from = 0;
  while (true) {
    const i = d.indexOf(term, from);
    if (i < 0) break;
    c++;
    if (c <= 5) {
      console.log("HIT", term, JSON.stringify(d.slice(Math.max(0, i - 60), i + 80)));
    }
    from = i + term.length;
  }
  console.log("COUNT", term, c);
}
