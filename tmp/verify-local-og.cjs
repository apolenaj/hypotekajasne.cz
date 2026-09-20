const http = require("http");
const sharp = require("sharp");

function fetch(url, ua) {
  return new Promise((resolve, reject) => {
    http
      .get(url, { headers: { "User-Agent": ua || "facebookexternalhit/1.1" } }, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks),
          })
        );
      })
      .on("error", reject);
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
  const home = await fetch(
    "http://127.0.0.1:3000/",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
  );
  const html = home.body.toString("utf8");
  const meta = {
    title: get(html, "og:title"),
    description: get(html, "og:description")?.slice(0, 100),
    url: get(html, "og:url"),
    type: get(html, "og:type"),
    site_name: get(html, "og:site_name"),
    locale: get(html, "og:locale"),
    image: get(html, "og:image"),
    imageWidth: get(html, "og:image:width"),
    imageHeight: get(html, "og:image:height"),
    imageType: get(html, "og:image:type"),
    imageAlt: get(html, "og:image:alt"),
    twitterCard: get(html, "twitter:card"),
    twitterImage: get(html, "twitter:image"),
  };
  console.log(JSON.stringify({ homeStatus: home.status, meta }, null, 2));

  const imgPath = meta.image?.replace("https://www.hypotekajasne.cz", "http://127.0.0.1:3000");
  const img = await fetch(imgPath, "facebookexternalhit/1.1");
  const sharpMeta = await sharp(img.body).metadata();
  console.log(
    JSON.stringify(
      {
        imgUrl: imgPath,
        imgStatus: img.status,
        contentType: img.headers["content-type"],
        bytes: img.body.length,
        sharp: {
          format: sharpMeta.format,
          width: sharpMeta.width,
          height: sharpMeta.height,
          isProgressive: sharpMeta.isProgressive ?? false,
        },
      },
      null,
      2
    )
  );

  const required = [
    meta.title === "HypotékaJasně | Hypotéky, bydlení a investice",
    meta.site_name === "HypotékaJasně",
    meta.type === "website",
    meta.locale === "cs_CZ",
    meta.image?.endsWith("/og/hypotekajasne-share-v3.png"),
    meta.imageWidth === "1200",
    meta.imageHeight === "630",
    meta.imageType === "image/png",
    meta.twitterCard === "summary_large_image",
    img.status === 200,
    sharpMeta.width === 1200 && sharpMeta.height === 630,
    sharpMeta.format === "png",
    !(sharpMeta.isProgressive ?? false),
  ];
  if (required.some((x) => !x)) {
    console.error("LOCAL VERIFY FAILED", required);
    process.exit(1);
  }
  console.log("LOCAL VERIFY OK");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
