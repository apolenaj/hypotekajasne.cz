const fs = require("fs");
const https = require("https");
const sharp = require("sharp");
const { tmpdir } = require("os");
const { join } = require("path");

function fetchBuffer(url, ua) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: { "User-Agent": ua || "facebookexternalhit/1.1" },
        timeout: 30000,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks),
            url,
          });
        });
      }
    );
    req.on("error", reject);
  });
}

function extractMetas(html) {
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  const interesting = metas.filter((t) =>
    /og:|twitter:|name=["']description["']/i.test(t)
  );
  const get = (prop) => {
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
    const re4 = new RegExp(
      `content=["']([^"']+)["'][^>]*name=["']${prop}["']`,
      "i"
    );
    return (
      html.match(re1)?.[1] ||
      html.match(re2)?.[1] ||
      html.match(re3)?.[1] ||
      html.match(re4)?.[1] ||
      null
    );
  };
  const ogImages = [];
  for (const m of html.matchAll(
    /property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["']/gi
  )) {
    ogImages.push(m[1]);
  }
  for (const m of html.matchAll(
    /content=["']([^"']+)["'][^>]*property=["']og:image(?::secure_url)?["']/gi
  )) {
    ogImages.push(m[1]);
  }
  const canonical =
    html.match(/rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ||
    html.match(/href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)?.[1] ||
    null;
  return { interesting, get, ogImages: [...new Set(ogImages)], canonical };
}

(async () => {
  const home = await fetchBuffer(
    "https://www.hypotekajasne.cz/",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
  );
  const html = home.body.toString("utf8");
  const { interesting, get, ogImages, canonical } = extractMetas(html);
  console.log(
    JSON.stringify(
      {
        homeStatus: home.status,
        contentType: home.headers["content-type"],
        htmlBytes: home.body.length,
        canonical,
        og: {
          title: get("og:title"),
          description: get("og:description")?.slice(0, 120),
          url: get("og:url"),
          type: get("og:type"),
          site_name: get("og:site_name"),
          locale: get("og:locale"),
          image: get("og:image"),
          imageWidth: get("og:image:width"),
          imageHeight: get("og:image:height"),
          imageType: get("og:image:type"),
          imageAlt: get("og:image:alt"),
        },
        twitter: {
          card: get("twitter:card"),
          title: get("twitter:title"),
          image: get("twitter:image"),
        },
        allOgImages: ogImages,
        opengraphRoutePresent: /opengraph-image/.test(html),
        interestingCount: interesting.length,
      },
      null,
      2
    )
  );
  console.log("--- raw interesting metas ---");
  interesting.forEach((m) => console.log(m));

  const imgUrl = get("og:image");
  if (imgUrl) {
    const img = await fetchBuffer(imgUrl, "facebookexternalhit/1.1");
    const magic = img.body.subarray(0, 4).toString("hex");
    let meta = null;
    try {
      meta = await sharp(img.body).metadata();
    } catch (e) {
      meta = { error: e.message };
    }
    console.log(
      JSON.stringify(
        {
          imgUrl,
          imgStatus: img.status,
          imgContentType: img.headers["content-type"],
          imgBytes: img.body.length,
          magic,
          sharp: meta,
        },
        null,
        2
      )
    );
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
