/**
 * Generates public/og/hypotekajasne-share-v2.png (1200×630).
 * Left typography via next/og; architecture + cards via sharp.
 * Run: npx tsx --tsconfig tsconfig.json scripts/generate-og-share-v2.ts
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { OG_SHARE_V2 } from "../src/lib/seo/og-share-v2";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

async function loadGoogleFont(
  family: string,
  weight: number,
  text: string
): Promise<ArrayBuffer> {
  const familyParam = family.replace(/ /g, "+");
  const cssUrl = `https://fonts.googleapis.com/css2?family=${familyParam}:wght@${weight}&text=${encodeURIComponent(text)}&display=swap`;
  const css = await fetch(cssUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    },
  }).then((r) => {
    if (!r.ok) throw new Error(`Font CSS ${family} ${weight}: ${r.status}`);
    return r.text();
  });

  const urlMatch = css.match(
    /src:\s*url\(([^)]+)\)\s*format\('(?:opentype|truetype)'\)/
  );
  let fontUrl = urlMatch?.[1]?.replace(/['"]/g, "");
  if (!fontUrl) {
    const any = [...css.matchAll(/src:\s*url\(([^)]+)\)/g)].map((m) =>
      m[1]!.replace(/['"]/g, "")
    );
    fontUrl = any.find((u) => /\.(ttf|otf)(\?|$)/i.test(u));
  }
  if (!fontUrl) {
    throw new Error(
      `Could not parse TTF/OTF for ${family} ${weight}. CSS: ${css.slice(0, 280)}`
    );
  }
  const fontRes = await fetch(fontUrl);
  if (!fontRes.ok) throw new Error(`Font download failed: ${fontUrl}`);
  return fontRes.arrayBuffer();
}

function buildLeftPanel() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px 48px 56px 60px",
        background:
          "linear-gradient(160deg, #fafaf7 0%, #f3f6f4 55%, #e8efeb 100%)",
        fontFamily: "Inter",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: "#1b4d3e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#ffffff",
              fontFamily: "Inter",
              letterSpacing: "-0.04em",
            }}
          >
            HJ
          </div>
        </div>
        <div
          style={{
            fontFamily: "Playfair Display",
            fontSize: 30,
            fontWeight: 700,
            color: "#1b4d3e",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Hypotéka Jasně
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontFamily: "Playfair Display",
            fontSize: 52,
            fontWeight: 700,
            color: "#142f28",
            lineHeight: 1.12,
            letterSpacing: "-0.03em",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Jasno v hypotéce.</span>
          <span>Jistota v rozhodování.</span>
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 23,
            fontWeight: 500,
            color: "#3d524a",
            lineHeight: 1.35,
            maxWidth: 560,
          }}
        >
          Hypoteční kalkulačky a analýzy nemovitostí.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 18,
            fontWeight: 600,
            color: "#1b4d3e",
            letterSpacing: "0.02em",
          }}
        >
          <span>Hypotéky</span>
          <span style={{ margin: "0 12px", color: "#c5a059" }}>•</span>
          <span>Bydlení</span>
          <span style={{ margin: "0 12px", color: "#c5a059" }}>•</span>
          <span>Investice</span>
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 16,
            fontWeight: 500,
            color: "#6b7c74",
            letterSpacing: "0.04em",
          }}
        >
          hypotekajasne.cz
        </div>
      </div>
    </div>
  );
}

function cardsSvg(width: number, height: number): Buffer {
  // Czech text in SVG — embed as UTF-8; sharp/librsvg handles it with default fonts.
  // Prefer Inter if available on system; otherwise fall back.
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-8%" y="-8%" width="116%" height="130%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#0f2f28" flood-opacity="0.28"/>
    </filter>
  </defs>
  <g filter="url(#shadow)">
    <rect x="36" y="${height - 200}" width="${width - 72}" height="72" rx="16" fill="#fffffff2"/>
    <rect x="54" y="${height - 184}" width="40" height="40" rx="10" fill="#e8efeb"/>
    <rect x="64" y="${height - 158}" width="5" height="8" rx="1" fill="#1b4d3e"/>
    <rect x="72" y="${height - 164}" width="5" height="14" rx="1" fill="#2a6b58"/>
    <rect x="80" y="${height - 168}" width="5" height="18" rx="1" fill="#c5a059"/>
    <text x="110" y="${height - 156}" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="600" fill="#142f28">Splátka hypotéky</text>

    <rect x="36" y="${height - 114}" width="${width - 72}" height="72" rx="16" fill="#fffffff2"/>
    <rect x="54" y="${height - 98}" width="40" height="40" rx="10" fill="#e8efeb"/>
    <path d="M64 ${height - 72} L74 ${height - 82} L82 ${height - 76} L90 ${height - 88}" fill="none" stroke="#1b4d3e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="110" y="${height - 70}" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="600" fill="#142f28">Investiční analýza</text>
  </g>
</svg>`;
  return Buffer.from(svg);
}

async function main() {
  const glyphText =
    "Hypotéka Jasně Jasno v hypotéce Jistota v rozhodování kalkulačky analýzy nemovitostí Hypotéky Bydlení Investice Splátka Investiční HJ hypotekajasne.cz";

  const [playfair, inter, interSemi] = await Promise.all([
    loadGoogleFont("Playfair Display", 700, glyphText),
    loadGoogleFont("Inter", 500, glyphText),
    loadGoogleFont("Inter", 600, glyphText),
  ]);

  const leftW = 720;
  const rightW = 480;
  const h = OG_SHARE_V2.height;

  const leftResponse = new ImageResponse(buildLeftPanel(), {
    width: leftW,
    height: h,
    fonts: [
      { name: "Playfair Display", data: playfair, weight: 700, style: "normal" },
      { name: "Inter", data: inter, weight: 500, style: "normal" },
      { name: "Inter", data: interSemi, weight: 600, style: "normal" },
    ],
  });
  const leftPng = Buffer.from(await leftResponse.arrayBuffer());

  const archPath = join(root, "public/og/sources/architecture-panel.png");
  const archPanel = await sharp(readFileSync(archPath))
    .resize(rightW, h, { fit: "cover", position: "right" })
    .modulate({ brightness: 0.9, saturation: 0.92 })
    .png()
    .toBuffer();

  const wash = await sharp({
    create: {
      width: rightW,
      height: h,
      channels: 4,
      background: { r: 20, g: 47, b: 40, alpha: 0.38 },
    },
  })
    .png()
    .toBuffer();

  const cards = await sharp(cardsSvg(rightW, h)).png().toBuffer();

  const rightPanel = await sharp(archPanel)
    .composite([
      { input: wash, blend: "over" },
      { input: cards, blend: "over" },
    ])
    .png()
    .toBuffer();

  const outDir = join(root, "public/og");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(root, "public", OG_SHARE_V2.path.replace(/^\//, ""));

  const finalPng = await sharp({
    create: {
      width: OG_SHARE_V2.width,
      height: h,
      channels: 3,
      background: "#f7f8f7",
    },
  })
    .composite([
      { input: leftPng, left: 0, top: 0 },
      { input: rightPanel, left: leftW, top: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();

  // Prefer JPEG for social scrapers (photo panel) — keep PNG as editable archive.
  const finalJpg = await sharp(finalPng)
    .jpeg({ quality: 84, mozjpeg: true })
    .toBuffer();

  writeFileSync(outPath.replace(/\.jpg$/i, ".png"), finalPng);
  writeFileSync(outPath, finalJpg);

  await sharp(finalPng)
    .resize(375, 197, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(join(outDir, "hypotekajasne-share-v2-preview-375.png"));

  // Simulated Messenger/Facebook share card mock for visual QA
  const cardMock = await sharp({
    create: {
      width: 420,
      height: 360,
      channels: 3,
      background: "#ffffff",
    },
  })
    .composite([
      {
        input: await sharp(finalPng).resize(420, 220, { fit: "cover" }).png().toBuffer(),
        top: 0,
        left: 0,
      },
      {
        input: Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="420" height="140" xmlns="http://www.w3.org/2000/svg">
  <rect width="420" height="140" fill="#ffffff"/>
  <text x="20" y="36" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#65676b">HYPOTÉKAJASNE.CZ</text>
  <text x="20" y="68" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="700" fill="#050505">HypotékaJasně | Hypotéky, bydlení a investice</text>
  <foreignObject x="20" y="82" width="380" height="48">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Segoe UI,Arial,sans-serif;font-size:14px;color:#65676b;line-height:1.35">
      Spočítejte si hypotéku, porovnejte vlastní bydlení s nájmem a prověřte investiční nemovitost.
    </div>
  </foreignObject>
</svg>`),
        top: 220,
        left: 0,
      },
    ])
    .png()
    .toBuffer();

  // Simpler text strip without foreignObject (librsvg may not support it)
  const titleStrip = await sharp({
    create: {
      width: 420,
      height: 140,
      channels: 3,
      background: "#ffffff",
    },
  })
    .composite([
      {
        input: Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="420" height="140" xmlns="http://www.w3.org/2000/svg">
  <rect width="420" height="140" fill="#ffffff"/>
  <text x="20" y="32" font-family="Segoe UI, Arial, sans-serif" font-size="12" fill="#65676b">HYPOTÉKAJASNE.CZ</text>
  <text x="20" y="62" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="700" fill="#050505">HypotékaJasně | Hypotéky, bydlení a investice</text>
  <text x="20" y="92" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#65676b">Spočítejte si hypotéku, porovnejte vlastní bydlení</text>
  <text x="20" y="112" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#65676b">s nájmem a prověřte investiční nemovitost.</text>
</svg>`),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 420,
      height: 360,
      channels: 3,
      background: "#e4e6eb",
    },
  })
    .composite([
      {
        input: await sharp({
          create: {
            width: 420,
            height: 360,
            channels: 3,
            background: "#ffffff",
          },
        })
          .composite([
            {
              input: await sharp(finalPng)
                .resize(420, 220, { fit: "cover" })
                .png()
                .toBuffer(),
              top: 0,
              left: 0,
            },
            { input: titleStrip, top: 220, left: 0 },
          ])
          .png()
          .toBuffer(),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toFile(join(outDir, "hypotekajasne-share-v2-card-mock.png"));

  void cardMock;

  console.log(
    JSON.stringify(
      {
        outPath: OG_SHARE_V2.path,
        bytes: finalJpg.length,
        kb: Math.round(finalJpg.length / 1024),
        pngArchiveBytes: finalPng.length,
        preview: "public/og/hypotekajasne-share-v2-preview-375.png",
        cardMock: "public/og/hypotekajasne-share-v2-card-mock.png",
        width: OG_SHARE_V2.width,
        height: OG_SHARE_V2.height,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
