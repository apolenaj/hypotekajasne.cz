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

const r = await get("https://www.hypotekajasne.cz/");
console.log("status", r.status);
console.log("vercel-cache", r.headers["x-vercel-cache"]);
console.log("html", r.body.match(/<html[^>]*>/)?.[0]);
console.log("has h-full class token", /\bh-full\b/.test(r.body.match(/<html[^>]*>/)?.[0] || ""));
console.log("has min-h-full", /\bmin-h-full\b/.test(r.body.match(/<html[^>]*>/)?.[0] || ""));

// Check if CSS contains our overflow-y:auto on html from base layer
const cssHref = [...r.body.matchAll(/href="([^"]+\.css)"/g)].map((m) => m[1]);
for (const href of cssHref.slice(0, 3)) {
  const url = href.startsWith("http") ? href : `https://www.hypotekajasne.cz${href}`;
  const css = await get(url);
  const hasHtmlOverflow = /html\{[^}]*overflow-y:auto/.test(css.body);
  const hasHtmlHfullUtil = /\.h-full\{height:100%\}/.test(css.body);
  console.log(
    "css",
    url.slice(-40),
    "htmlOverflowYAutoRule",
    hasHtmlOverflow,
    "len",
    css.body.length,
  );
}
