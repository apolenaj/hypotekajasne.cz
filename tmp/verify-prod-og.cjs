const https = require("https");
const sharp = require("sharp");

function fetchBuffer(url, ua, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: { "User-Agent": ua || "facebookexternalhit/1.1" },
        timeout: 30000,
      },
      (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location &&
          maxRedirects > 0
        ) {
          const next = new URL(res.headers.location, url).toString();
          res.resume();
          return resolve(fetchBuffer(next, ua, maxRedirects - 1));
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks),
            finalUrl: url,
          });
        });
      }
    );
    req.on("error", reject);
  });
}

function get(html, prop) {
  const re1 = new RegExp(
    `property=["']${prop}["'][^>]*content=["']([^"']+)["']`,
    "i"
  );
  const re2 = new RegExp(
    `content=["']([^"']+)["'][^>]*property=["']${prop}["']`,
    "i"
  );
  const re3 = new RegExp(
    `name=["']${prop}["'][^>]*content=["']([^"']+)["']`,
    "i"
  );
  return html.match(re1)?.[1] || html.match(re2)?.[1] || html.match(re3)?.[1] || null;
}

(async () => {
  const probes = [
    ["www", "https://www.hypotekajasne.cz/", "facebookexternalhit/1.1"],
    ["www-facebot", "https://www.hypotekajasne.cz/", "Facebot"],
    ["www-browser", "https://www.hypotekajasne.cz/", "Mozilla/5.0"],
  ];
  for (const [name, url, ua] of probes) {
    const r = await fetchBuffer(url, ua);
    const html = r.body.toString("utf8");
    console.log(
      JSON.stringify({
        name,
        status: r.status,
        finalUrl: r.finalUrl,
        ogImage: get(html, "og:image"),
        ogTitle: get(html, "og:title"),
        siteName: get(html, "og:site_name"),
        hasV3: /hypotekajasne-share-v3\.png/.test(html),
        hasV2: /hypotekajasne-share-v2/.test(html),
      })
    );
  }

  // redirect chain checks without auto-follow for first hop
  for (const url of [
    "https://hypotekajasne.cz/",
  ]) {
    const r = await new Promise((resolve, reject) => {
      https
        .get(url, { headers: { "User-Agent": "facebookexternalhit/1.1" } }, (res) => {
          resolve({ status: res.statusCode, location: res.headers.location });
          res.resume();
        })
        .on("error", reject);
    });
    console.log(JSON.stringify({ redirectProbe: url, ...r }));
  }

  const imgUrl = "https://www.hypotekajasne.cz/og/hypotekajasne-share-v3.png";
  const img = await fetchBuffer(imgUrl, "facebookexternalhit/1.1");
  const meta = await sharp(img.body).metadata();
  console.log(
    JSON.stringify({
      imgUrl,
      imgStatus: img.status,
      contentType: img.headers["content-type"],
      bytes: img.body.length,
      format: meta.format,
      width: meta.width,
      height: meta.height,
      isProgressive: meta.isProgressive ?? false,
      magic: img.body.subarray(0, 8).toString("hex"),
    })
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
