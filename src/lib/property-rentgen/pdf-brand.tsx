/**
 * Shared PDF brand, fonts, and chart primitives for Rentgen sample reports.
 */

import path from "node:path";
import {
  Font,
  StyleSheet,
  Svg,
  Rect,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatModelCzk } from "@/lib/property-rentgen/control-model";

const FONT_DIR = path.join(process.cwd(), "src/lib/property-rentgen/fonts");

let fontsRegistered = false;

export function ensureRentgenPdfFonts(): void {
  if (fontsRegistered) return;
  Font.register({
    family: "NotoSans",
    fonts: [
      { src: path.join(FONT_DIR, "NotoSans-Regular.ttf"), fontWeight: 400 },
      { src: path.join(FONT_DIR, "NotoSans-Bold.ttf"), fontWeight: 700 },
    ],
  });
  fontsRegistered = true;
}

export const PDF_BRAND = {
  teal: "#1b4d3e",
  gold: "#c5a059",
  ink: "#1a1a1a",
  muted: "#6b7280",
  line: "#e5e7eb",
  soft: "#f4f7f6",
  red: "#b91c1c",
  green: "#047857",
};

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 52,
    paddingBottom: 48,
    paddingHorizontal: 38,
    fontSize: 9,
    fontFamily: "NotoSans",
    color: PDF_BRAND.ink,
  },
  header: {
    position: "absolute",
    top: 16,
    left: 38,
    right: 38,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: PDF_BRAND.line,
    paddingBottom: 5,
  },
  headerBrand: {
    fontSize: 7.5,
    color: PDF_BRAND.teal,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  headerMeta: { fontSize: 7.5, color: PDF_BRAND.muted },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 38,
    right: 38,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: PDF_BRAND.line,
    paddingTop: 5,
  },
  footerText: { fontSize: 7, color: PDF_BRAND.muted },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: PDF_BRAND.gold,
    color: PDF_BRAND.ink,
    fontSize: 7.5,
    fontWeight: 700,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginBottom: 8,
  },
  h1: {
    fontSize: 15,
    fontWeight: 700,
    color: PDF_BRAND.teal,
    marginBottom: 6,
  },
  h2: {
    fontSize: 11,
    fontWeight: 700,
    color: PDF_BRAND.teal,
    marginBottom: 5,
    marginTop: 8,
  },
  h3: {
    fontSize: 9.5,
    fontWeight: 700,
    color: PDF_BRAND.ink,
    marginBottom: 4,
    marginTop: 6,
  },
  lead: { fontSize: 9, lineHeight: 1.4, marginBottom: 6 },
  body: { fontSize: 8.5, lineHeight: 1.4, marginBottom: 4 },
  muted: { fontSize: 7.5, color: PDF_BRAND.muted, lineHeight: 1.35, marginBottom: 4 },
  cardRow: { flexDirection: "row", gap: 6, marginBottom: 8 },
  card: {
    flex: 1,
    backgroundColor: PDF_BRAND.soft,
    borderWidth: 1,
    borderColor: PDF_BRAND.line,
    borderRadius: 3,
    padding: 6,
  },
  cardLabel: {
    fontSize: 6.5,
    color: PDF_BRAND.muted,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  cardValue: { fontSize: 10, fontWeight: 700 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: PDF_BRAND.line,
    paddingVertical: 2.5,
  },
  rowLabel: { fontSize: 8, color: PDF_BRAND.muted, flex: 1, paddingRight: 6 },
  rowValue: { fontSize: 8, fontWeight: 700, textAlign: "right" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: PDF_BRAND.teal,
    paddingVertical: 3,
    paddingHorizontal: 3,
  },
  tableHeaderCell: { color: "#fff", fontSize: 7, fontWeight: 700 },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: PDF_BRAND.line,
    paddingVertical: 2.5,
    paddingHorizontal: 3,
  },
  cell: { fontSize: 7.5 },
  finding: {
    borderWidth: 1,
    borderColor: PDF_BRAND.line,
    borderRadius: 3,
    padding: 6,
    marginBottom: 5,
    backgroundColor: "#fafbfa",
  },
  findingLabel: { fontSize: 7, fontWeight: 700, color: PDF_BRAND.teal },
});

export function PdfHeader({ subtitle }: { subtitle: string }) {
  return (
    <View style={pdfStyles.header} fixed>
      <Text style={pdfStyles.headerBrand}>
        Hypotéka Jasně · Investiční rentgen
      </Text>
      <Text style={pdfStyles.headerMeta}>{subtitle}</Text>
    </View>
  );
}

export function PdfFooter({
  generatedAt,
  version,
  variant,
}: {
  generatedAt: string;
  version: string;
  variant: string;
}) {
  return (
    <View style={pdfStyles.footer} fixed>
      <Text style={pdfStyles.footerText}>
        {variant} · Model {version} · {generatedAt} · modelový příklad
      </Text>
      <Text
        style={pdfStyles.footerText}
        render={({ pageNumber, totalPages }) =>
          `Strana ${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}

export function Kv({ label, value }: { label: string; value: string }) {
  return (
    <View style={pdfStyles.row} wrap={false}>
      <Text style={pdfStyles.rowLabel}>{label}</Text>
      <Text style={pdfStyles.rowValue}>{value}</Text>
    </View>
  );
}

/** True connected waterfall — floating deltas, total from zero. */
export function PdfWaterfallChart({
  steps,
}: {
  steps: Array<{
    key: string;
    label: string;
    deltaCzk: number;
    kind: "start" | "delta" | "total";
  }>;
}) {
  const width = 520;
  const height = 170;
  const padL = 8;
  const padT = 18;
  const padB = 36;
  const plotH = height - padT - padB;

  let running = 0;
  const bars: Array<{
    key: string;
    label: string;
    y0: number;
    y1: number;
    fill: string;
    value: number;
  }> = [];

  for (const step of steps) {
    if (step.kind === "start") {
      running = step.deltaCzk;
      bars.push({
        key: step.key,
        label: step.label,
        y0: 0,
        y1: step.deltaCzk,
        fill: PDF_BRAND.teal,
        value: step.deltaCzk,
      });
    } else if (step.kind === "total") {
      bars.push({
        key: step.key,
        label: step.label,
        y0: 0,
        y1: step.deltaCzk,
        fill: step.deltaCzk >= 0 ? PDF_BRAND.green : PDF_BRAND.red,
        value: step.deltaCzk,
      });
    } else {
      const prev = running;
      running += step.deltaCzk;
      bars.push({
        key: step.key,
        label: step.label,
        y0: prev,
        y1: running,
        fill: step.deltaCzk >= 0 ? PDF_BRAND.green : PDF_BRAND.red,
        value: step.deltaCzk,
      });
    }
  }

  const allY = bars.flatMap((b) => [b.y0, b.y1]);
  const minY = Math.min(0, ...allY);
  const maxY = Math.max(0, ...allY);
  const span = Math.max(maxY - minY, 1);
  const yScale = (v: number) => padT + ((maxY - v) / span) * plotH;
  const zeroY = yScale(0);
  const gap = 6;
  const barW = Math.min(42, (width - padL * 2 - gap * (bars.length - 1)) / bars.length);

  return (
    <View style={{ marginVertical: 4 }} wrap={false}>
      <Text style={pdfStyles.muted}>
        Vodopád (Kč/měs.): odečty navazují na mezisoučet; výsledek od nuly.
      </Text>
      <Svg width={width} height={height}>
        <Rect x={0} y={zeroY} width={width} height={1} fill={PDF_BRAND.ink} />
        {bars.map((b, i) => {
          const x = padL + i * (barW + gap);
          const top = yScale(Math.max(b.y0, b.y1));
          const bot = yScale(Math.min(b.y0, b.y1));
          const h = Math.max(bot - top, 1.5);
          return (
            <Rect
              key={b.key}
              x={x}
              y={top}
              width={barW}
              height={h}
              fill={b.fill}
            />
          );
        })}
      </Svg>
      <View style={{ flexDirection: "row", paddingLeft: padL }}>
        {bars.map((b) => (
          <View key={b.key} style={{ width: barW + gap }}>
            <Text style={{ fontSize: 6, textAlign: "center" }}>
              {b.label.length > 10 ? `${b.label.slice(0, 9)}…` : b.label}
            </Text>
            <Text style={{ fontSize: 6.5, textAlign: "center", fontWeight: 700 }}>
              {formatModelCzk(b.value, 0)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function PdfScenarioBars({
  values,
}: {
  values: Array<{ label: string; value: number; emphasize?: boolean }>;
}) {
  const maxAbs = Math.max(...values.map((v) => Math.abs(v.value)), 1);
  const midY = 55;
  const chartH = 110;
  const barH = 10;
  const rowGap = 22;
  const plotW = 280;
  const labelW = 90;

  return (
    <View style={{ marginVertical: 4 }} wrap={false}>
      <Text style={pdfStyles.muted}>
        Scénáře (Kč/měs.), společná nula. Základní scénář je zvýrazněn.
      </Text>
      <Svg width={500} height={chartH}>
        <Rect
          x={labelW}
          y={8}
          width={1}
          height={values.length * rowGap}
          fill={PDF_BRAND.ink}
        />
        {values.map((v, i) => {
          const y = 12 + i * rowGap;
          const w = (Math.abs(v.value) / maxAbs) * plotW;
          const x = v.value >= 0 ? labelW : labelW - w;
          return (
            <Rect
              key={v.label}
              x={x}
              y={y}
              width={Math.max(w, 1)}
              height={barH}
              fill={
                v.emphasize
                  ? PDF_BRAND.teal
                  : v.value >= 0
                    ? PDF_BRAND.green
                    : PDF_BRAND.red
              }
            />
          );
        })}
      </Svg>
      {values.map((v) => (
        <View
          key={v.label}
          style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}
        >
          <Text style={{ fontSize: 8, fontWeight: v.emphasize ? 700 : 400 }}>
            {v.label}
            {v.emphasize ? " (základ)" : ""}
          </Text>
          <Text style={{ fontSize: 8, fontWeight: 700 }}>
            {formatModelCzk(v.value, 0)} /měs.
          </Text>
        </View>
      ))}
    </View>
  );
}

export function FindingBox({
  podklad,
  zjisteni,
  dopad,
  overit,
}: {
  podklad: string;
  zjisteni: string;
  dopad: string;
  overit: string;
}) {
  return (
    <View style={pdfStyles.finding} wrap={false}>
      <Text style={pdfStyles.body}>
        <Text style={pdfStyles.findingLabel}>Podklad: </Text>
        {podklad}
      </Text>
      <Text style={pdfStyles.body}>
        <Text style={pdfStyles.findingLabel}>Zjištění: </Text>
        {zjisteni}
      </Text>
      <Text style={pdfStyles.body}>
        <Text style={pdfStyles.findingLabel}>Dopad: </Text>
        {dopad}
      </Text>
      <Text style={pdfStyles.body}>
        <Text style={pdfStyles.findingLabel}>Co ověřit: </Text>
        {overit}
      </Text>
    </View>
  );
}
