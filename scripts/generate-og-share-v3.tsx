/**
 * Generates public/og/hypotekajasne-share-v3.png (1200×630).
 * Baseline PNG for social scrapers (avoids progressive JPEG issues with Meta).
 * Run: npx tsx --tsconfig tsconfig.json scripts/generate-og-share-v3.tsx
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { OG_SHARE_V3 } from "../src/lib/seo/og-share-v3";

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

function buildCanvas() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: "#1b4d3e",
        fontFamily: "Inter",
      }}
    >
      {/* Soft emerald depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background:
            "linear-gradient(135deg, #14382e 0%, #1b4d3e 42%, #246b55 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -40,
          width: 520,
          height: 520,
          borderRadius: 999,
          backgroundColor: "rgba(197,160,89,0.12)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -120,
          left: -60,
          width: 420,
          height: 420,
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.06)",
          display: "flex",
        }}
      />

      {/* Left copy */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 700,
          height: "100%",
          padding: "56px 40px 52px 64px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#1b4d3e",
                letterSpacing: "-0.04em",
              }}
            >
              HJ
            </div>
          </div>
          <div
            style={{
              fontFamily: "Playfair Display",
              fontSize: 38,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            HypotékaJasně
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Playfair Display",
              fontSize: 48,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>„Jasno v hypotéce.</span>
            <span>Jistota v rozhodování.“</span>
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 24,
              fontWeight: 500,
              color: "#d7e8e0",
              lineHeight: 1.4,
              maxWidth: 560,
            }}
          >
            „Hypoteční kalkulačky a analýzy nemovitostí.“
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 18,
              fontWeight: 600,
              color: "#f3efe4",
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
              marginTop: 12,
              fontSize: 16,
              fontWeight: 500,
              color: "#a8c4b8",
              letterSpacing: "0.04em",
            }}
          >
            www.hypotekajasne.cz
          </div>
        </div>
      </div>

      {/* Right property panel placeholder — filled by sharp composite */}
      <div
        style={{
          position: "absolute",
          top: 36,
          right: 36,
          bottom: 36,
          width: 420,
          borderRadius: 28,
          overflow: "hidden",
          display: "flex",
          backgroundColor: "#12352c",
          border: "1px solid rgba(255,255,255,0.14)",
        }}
      />
    </div>
  );
}

async function main() {
  const glyphText =
    "HypotékaJasně Jasno v hypotéce Jistota v rozhodování Hypoteční kalkulačky a analýzy nemovitostí Hypotéky Bydlení Investice HJ www.hypotekajasne.cz „ “";

  const [playfair, inter, interSemi] = await Promise.all([
    loadGoogleFont("Playfair Display", 700, glyphText),
    loadGoogleFont("Inter", 500, glyphText),
    loadGoogleFont("Inter", 600, glyphText),
  ]);

  const w = OG_SHARE_V3.width;
  const h = OG_SHARE_V3.height;

  const baseResponse = new ImageResponse(buildCanvas(), {
    width: w,
    height: h,
    fonts: [
      { name: "Playfair Display", data: playfair, weight: 700, style: "normal" },
      { name: "Inter", data: inter, weight: 500, style: "normal" },
      { name: "Inter", data: interSemi, weight: 600, style: "normal" },
    ],
  });
  const basePng = Buffer.from(await baseResponse.arrayBuffer());

  const archPath = join(root, "public/og/sources/architecture-panel.png");
  const panelW = 420;
  const panelH = h - 72;
  const archPanel = await sharp(readFileSync(archPath))
    .resize(panelW, panelH, { fit: "cover", position: "right" })
    .modulate({ brightness: 0.88, saturation: 0.9 })
    .png()
    .toBuffer();

  const wash = await sharp({
    create: {
      width: panelW,
      height: panelH,
      channels: 4,
      background: { r: 16, g: 48, b: 40, alpha: 0.28 },
    },
  })
    .png()
    .toBuffer();

  const roundedMask = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${panelW}" height="${panelH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${panelW}" height="${panelH}" rx="28" ry="28" fill="#fff"/>
</svg>`);

  const maskedPanel = await sharp(archPanel)
    .composite([{ input: wash, blend: "over" }])
    .png()
    .toBuffer();

  const maskPng = await sharp(roundedMask).png().toBuffer();
  const propertyRounded = await sharp(maskedPanel)
    .composite([{ input: maskPng, blend: "dest-in" }])
    .png()
    .toBuffer();

  const outDir = join(root, "public/og");
  mkdirSync(outDir, { recursive: true });
  const outRel = OG_SHARE_V3.path.replace(/^\//, "");
  const outPath = join(root, "public", outRel);

  const finalPng = await sharp(basePng)
    .composite([{ input: propertyRounded, left: w - 36 - panelW, top: 36 }])
    .png({ compressionLevel: 9, progressive: false })
    .toBuffer();

  // Baseline JPEG archive (explicitly non-progressive; avoid mozjpeg progressive default)
  const finalJpg = await sharp(finalPng)
    .jpeg({ quality: 88, progressive: false, mozjpeg: false })
    .toBuffer();

  writeFileSync(outPath, finalPng);
  writeFileSync(outPath.replace(/\.png$/i, ".jpg"), finalJpg);

  await sharp(finalPng)
    .resize(375, 197, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(join(outDir, "hypotekajasne-share-v3-preview-375.png"));

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
    .toFile(join(outDir, "hypotekajasne-share-v3-card-mock.png"));

  const meta = await sharp(finalPng).metadata();
  console.log(
    JSON.stringify(
      {
        outPath: OG_SHARE_V3.path,
        bytes: finalPng.length,
        kb: Math.round(finalPng.length / 1024),
        jpgBytes: finalJpg.length,
        preview: "public/og/hypotekajasne-share-v3-preview-375.png",
        cardMock: "public/og/hypotekajasne-share-v3-card-mock.png",
        width: meta.width,
        height: meta.height,
        format: meta.format,
        isProgressive: meta.isProgressive ?? false,
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
