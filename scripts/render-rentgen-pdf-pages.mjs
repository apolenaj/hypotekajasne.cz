/**
 * Render sample Rentgen PDFs to PNG pages via Playwright + PDF.js (no native canvas).
 * Usage: node scripts/render-rentgen-pdf-pages.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "tmp", "rentgen-pdf-pages");
const PUBLIC_PREVIEWS = path.join(ROOT, "public", "rentgen-sample-previews");

const JOBS = [
  {
    pdf: path.join(ROOT, "tmp", "rentgen-pdfs", "digital-999.pdf"),
    prefix: "digital",
    previewPages: [1, 2, 4, 6],
  },
  {
    pdf: path.join(ROOT, "tmp", "rentgen-pdfs", "premium-4990.pdf"),
    prefix: "premium",
    previewPages: [2, 10, 15, 20],
  },
];

async function renderPdf(browser, pdfPath, prefix, previewPages) {
  const bytes = fs.readFileSync(pdfPath);
  const b64 = bytes.toString("base64");
  const dir = path.join(OUT, prefix);
  fs.mkdirSync(dir, { recursive: true });

  const page = await browser.newPage({
    viewport: { width: 900, height: 1280 },
  });

  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;background:#ddd">
<canvas id="c"></canvas>
<script type="module">
import * as pdfjs from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs';
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
const raw = atob('${b64}');
const data = new Uint8Array(raw.length);
for (let i = 0; i < raw.length; i++) data[i] = raw.charCodeAt(i);
window.__pdf = await pdfjs.getDocument({ data }).promise;
window.__ready = true;
</script></body></html>`);

  await page.waitForFunction(() => window.__ready === true, null, {
    timeout: 120_000,
  });

  const numPages = await page.evaluate(() => window.__pdf.numPages);
  console.log(`${prefix}: ${numPages} pages`);

  for (let i = 1; i <= numPages; i++) {
    await page.evaluate(async (n) => {
      const pdf = window.__pdf;
      const page = await pdf.getPage(n);
      const scale = 1.6;
      const viewport = page.getViewport({ scale });
      const canvas = document.getElementById("c");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      document.title = `page-${n}`;
    }, i);

    const canvas = page.locator("#c");
    const file = path.join(dir, `page-${String(i).padStart(2, "0")}.png`);
    await canvas.screenshot({ path: file, type: "png" });
  }

  fs.mkdirSync(PUBLIC_PREVIEWS, { recursive: true });
  for (const n of previewPages) {
    const src = path.join(dir, `page-${String(n).padStart(2, "0")}.png`);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(
      PUBLIC_PREVIEWS,
      `${prefix}-p${String(n).padStart(2, "0")}.png`
    );
    fs.copyFileSync(src, dest);
  }

  await page.close();
  return numPages;
}

const browser = await chromium.launch({ headless: true });
try {
  for (const job of JOBS) {
    if (!fs.existsSync(job.pdf)) {
      console.error("missing", job.pdf);
      process.exitCode = 1;
      continue;
    }
    await renderPdf(browser, job.pdf, job.prefix, job.previewPages);
  }
} finally {
  await browser.close();
}
