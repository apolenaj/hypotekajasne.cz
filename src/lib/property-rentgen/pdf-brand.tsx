/**
 * Shared PDF brand, fonts, and chart primitives for Rentgen sample reports.
 */

import path from "node:path";
import { Fragment } from "react";
import {
  Font,
  StyleSheet,
  Svg,
  Rect,
  Line,
  Circle,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatModelCzk } from "@/lib/property-rentgen/control-model";
import type {
  BeforeAfterPanels,
  CashNeededStacked,
  ChartMeta,
  EquityDebtSeries,
  MarketScatterPoint,
  RefixTimeSeries,
  ReservePathSeries,
  SaleWaterfall,
  SettlementWaterfall,
  TornadoDeltas,
} from "@/lib/property-rentgen/chart-series";

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
              {b.label}
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

type PdfChartProps<T> = { data: T; meta?: ChartMeta };

function PdfChartCaption({ meta }: { meta?: ChartMeta }) {
  if (!meta) return null;
  return (
    <View style={{ marginTop: 3 }}>
      <Text style={{ fontSize: 7.5, fontWeight: 700 }}>{meta.questionCs}</Text>
      <Text style={{ fontSize: 6.5, color: PDF_BRAND.muted }}>
        {meta.periodCs} · {meta.interpretationCs}
      </Text>
    </View>
  );
}

function pdfSignedCzk(value: number): string {
  return `${value > 0 ? "+" : ""}${formatModelCzk(value, 0)}`;
}

function PdfSeriesLines({
  points,
  color,
  width = 2,
  dashed = false,
}: {
  points: Array<{ x: number; y: number }>;
  color: string;
  width?: number;
  dashed?: boolean;
}) {
  return (
    <>
      {points.slice(1).map((point, index) => {
        const previous = points[index]!;
        return (
          <Line
            key={`${previous.x}-${point.x}-${index}`}
            x1={previous.x}
            y1={previous.y}
            x2={point.x}
            y2={point.y}
            stroke={color}
            strokeWidth={width}
            strokeDasharray={dashed ? "5 4" : undefined}
          />
        );
      })}
    </>
  );
}

export function PdfStackedCashBar({
  data,
  meta,
}: PdfChartProps<CashNeededStacked>) {
  const height = 112;
  const barX = 24;
  const barW = 115;
  const segments = [
    ["Vlastní kapitál", data.equityCzk, PDF_BRAND.teal],
    ["Nutný fit-out", data.fitoutCzk, PDF_BRAND.gold],
    ["Vedlejší náklady", data.closingCzk, "#8a7350"],
    ["Držená rezerva", data.reserveCzk, PDF_BRAND.green],
    ["Volitelný fit-out", data.optionalFitoutCzk, PDF_BRAND.line],
  ] as const;
  const max = Math.max(data.totalWithOptionalFitoutCzk, 1);
  let cursor = 100;
  return (
    <View style={{ marginVertical: 4 }} wrap={false}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Svg width={160} height={height}>
          {segments.map(([label, value, fill]) => {
            const h = Math.max((value / max) * 88, value === 0 ? 0 : 1);
            cursor -= h;
            return (
              <Rect
                key={label}
                x={barX}
                y={cursor}
                width={barW}
                height={h}
                fill={fill}
              />
            );
          })}
          <Line
            x1={barX}
            x2={barX + barW}
            y1={100}
            y2={100}
            stroke={PDF_BRAND.ink}
          />
        </Svg>
        <View style={{ flex: 1, justifyContent: "center" }}>
          {segments.map(([label, value, fill]) => (
            <View
              key={label}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: fill,
                  marginRight: 6,
                }}
              />
              <Text style={{ fontSize: 7.5, flex: 1 }}>{label}</Text>
              <Text style={{ fontSize: 7.5, fontWeight: 700 }}>
                {formatModelCzk(value, 0)}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 4 }}>
        <Text style={{ fontSize: 7.5, fontWeight: 700 }}>
          Nutné: {formatModelCzk(data.totalRequiredCzk, 0)}
        </Text>
        <Text style={{ fontSize: 7.5 }}>
          Včetně volitelného: {formatModelCzk(data.totalWithOptionalFitoutCzk, 0)}
        </Text>
      </View>
      <PdfChartCaption meta={meta} />
    </View>
  );
}

export function PdfBeforeAfterPanels({
  data,
  meta,
}: PdfChartProps<BeforeAfterPanels>) {
  const panels = [data.monthlyCashFlow, data.ownCash, data.ownerCosts];
  return (
    <View style={{ marginVertical: 4 }} wrap={false}>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {panels.map((panel) => (
          <View key={panel.label} style={pdfStyles.card}>
            <Text style={{ fontSize: 7.5, fontWeight: 700, marginBottom: 4 }}>
              {panel.label}
            </Text>
            <Text style={{ fontSize: 7, color: PDF_BRAND.muted }}>
              Před: {formatModelCzk(panel.beforeCzk, 0)}
            </Text>
            <Svg width={140} height={7}>
              <Line x1={70} x2={70} y1={0} y2={7} stroke={PDF_BRAND.ink} />
              <Rect
                x={panel.beforeCzk >= 0 ? 70 : 70 - (Math.abs(panel.beforeCzk) / panel.scaleMaxAbsCzk) * 68}
                y={1}
                width={Math.max(1, (Math.abs(panel.beforeCzk) / panel.scaleMaxAbsCzk) * 68)}
                height={5}
                fill={panel.beforeCzk < 0 ? PDF_BRAND.red : PDF_BRAND.muted}
              />
            </Svg>
            <Text style={{ fontSize: 7, marginTop: 3 }}>
              Po: {formatModelCzk(panel.afterCzk, 0)}
            </Text>
            <Svg width={140} height={7}>
              <Line x1={70} x2={70} y1={0} y2={7} stroke={PDF_BRAND.ink} />
              <Rect
                x={panel.afterCzk >= 0 ? 70 : 70 - (Math.abs(panel.afterCzk) / panel.scaleMaxAbsCzk) * 68}
                y={1}
                width={Math.max(1, (Math.abs(panel.afterCzk) / panel.scaleMaxAbsCzk) * 68)}
                height={5}
                fill={panel.afterCzk < 0 ? PDF_BRAND.red : PDF_BRAND.teal}
              />
            </Svg>
          </View>
        ))}
      </View>
      <PdfChartCaption meta={meta} />
    </View>
  );
}

export function PdfTornadoChart({ data, meta }: PdfChartProps<TornadoDeltas>) {
  const max = Math.max(1, ...data.map((row) => Math.abs(row.deltaCzk)));
  const mid = 330;
  const rowH = 24;
  return (
    <View style={{ marginVertical: 4 }} wrap={false}>
      <Svg width={520} height={Math.max(42, data.length * rowH + 12)}>
        <Line x1={mid} x2={mid} y1={3} y2={data.length * rowH} stroke={PDF_BRAND.ink} />
        {data.map((row, index) => {
          const y = 5 + index * rowH;
          const w = (Math.abs(row.deltaCzk) / max) * 170;
          return (
            <Fragment key={`${row.label}-${index}`}>
              <Text x={4} y={y + 7} style={{ fontSize: 7, fontWeight: 700 }}>{row.label}</Text>
              <Text x={4} y={y + 16} style={{ fontSize: 5.5, fill: PDF_BRAND.muted }}>{row.changeNote}</Text>
              <Rect
                x={row.deltaCzk >= 0 ? mid : mid - w}
                y={y}
                width={Math.max(w, 1)}
                height={9}
                fill={row.deltaCzk >= 0 ? PDF_BRAND.green : PDF_BRAND.red}
              />
              <Text
                x={row.deltaCzk >= 0 ? mid + w + 4 : mid - w - 4}
                y={y + 7}
                textAnchor={row.deltaCzk >= 0 ? "start" : "end"}
                style={{ fontSize: 6.5, fontWeight: 700 }}
              >
                {pdfSignedCzk(row.deltaCzk)}
              </Text>
            </Fragment>
          );
        })}
      </Svg>
      <PdfChartCaption meta={meta} />
    </View>
  );
}

export function PdfReservePathChart({
  data,
  meta,
}: PdfChartProps<ReservePathSeries>) {
  const width = 520;
  const height = 155;
  const pad = { l: 34, r: 8, t: 18, b: 28 };
  const all = data.months.flatMap((row) => [row.openingCzk, row.closingCzk, row.hypotheticalClosingCzk]);
  const min = Math.min(0, ...all);
  const max = Math.max(1, ...all);
  const span = Math.max(max - min, 1);
  const x = (index: number) => pad.l + (index / Math.max(data.months.length - 1, 1)) * (width - pad.l - pad.r);
  const y = (value: number) => pad.t + ((max - value) / span) * (height - pad.t - pad.b);
  const actual = data.months.map((row, index) => ({ x: x(index), y: y(row.closingCzk) }));
  const hypothetical = data.months.map((row, index) => ({ x: x(index), y: y(row.hypotheticalClosingCzk) }));
  return (
    <View style={{ marginVertical: 4 }} wrap={false}>
      <Svg width={width} height={height}>
        <Line x1={pad.l} x2={width - pad.r} y1={y(0)} y2={y(0)} stroke={PDF_BRAND.ink} />
        <Text x={pad.l - 4} y={y(0) + 2} textAnchor="end" style={{ fontSize: 6 }}>0</Text>
        <PdfSeriesLines points={hypothetical} color={PDF_BRAND.red} dashed />
        <PdfSeriesLines points={actual} color={PDF_BRAND.teal} width={2.5} />
        {data.months.map((row, index) => (
          <Fragment key={row.month}>
            <Circle
              cx={x(index)}
              cy={y(row.closingCzk)}
              r={row.topup || row.repair ? 3.5 : 2}
              fill={row.topup ? PDF_BRAND.gold : row.repair ? PDF_BRAND.red : PDF_BRAND.teal}
            />
            <Text x={x(index)} y={height - 13} textAnchor="middle" style={{ fontSize: 5.5 }}>
              M{row.month}
            </Text>
          </Fragment>
        ))}
      </Svg>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
        {data.months.filter((row) => row.empty || row.repair || row.relet || row.topup).map((row) => (
          <Text key={row.month} style={{ fontSize: 6 }}>
            M{row.month}: {[row.empty && "prázdno", row.repair && "oprava", row.relet && "pronajato", row.topup && "doplnění"].filter(Boolean).join(", ")}
          </Text>
        ))}
      </View>
      <Text style={{ fontSize: 6, color: PDF_BRAND.muted }}>
        Plná čára: po doplnění. Červená přerušovaná: hypoteticky bez doplnění.
      </Text>
      <PdfChartCaption meta={meta} />
    </View>
  );
}

export function PdfRefixCompareChart({
  data,
  meta,
}: PdfChartProps<RefixTimeSeries>) {
  const width = 520;
  const height = 145;
  const pad = { l: 34, r: 8, t: 18, b: 22 };
  const all = data.months.flatMap((row) => [row.cfNoRefixCzk, row.cfWithRefixCzk]);
  const min = Math.min(0, ...all);
  const max = Math.max(0, ...all);
  const span = Math.max(max - min, 1);
  const minMonth = Math.min(...data.months.map((row) => row.month), 0);
  const maxMonth = Math.max(...data.months.map((row) => row.month), data.refixMonth, minMonth + 1);
  const x = (month: number) => pad.l + ((month - minMonth) / (maxMonth - minMonth)) * (width - pad.l - pad.r);
  const y = (value: number) => pad.t + ((max - value) / span) * (height - pad.t - pad.b);
  return (
    <View style={{ marginVertical: 4 }} wrap={false}>
      <Svg width={width} height={height}>
        <Line x1={pad.l} x2={width - pad.r} y1={y(0)} y2={y(0)} stroke={PDF_BRAND.line} />
        <Line x1={x(data.refixMonth)} x2={x(data.refixMonth)} y1={pad.t} y2={height - pad.b}
          stroke={PDF_BRAND.gold} strokeWidth={1.5} strokeDasharray="4 3" />
        <Text x={x(data.refixMonth)} y={10} textAnchor="middle" style={{ fontSize: 6.5, fontWeight: 700 }}>
          Refixace M{data.refixMonth}
        </Text>
        <PdfSeriesLines
          points={data.months.map((row) => ({ x: x(row.month), y: y(row.cfNoRefixCzk) }))}
          color={PDF_BRAND.muted}
        />
        <PdfSeriesLines
          points={data.months.map((row) => ({ x: x(row.month), y: y(row.cfWithRefixCzk) }))}
          color={PDF_BRAND.teal}
          width={2.5}
        />
      </Svg>
      <Text style={{ fontSize: 6, color: PDF_BRAND.muted }}>
        Zelená: s refixací · šedá: bez refixace.
      </Text>
      <PdfChartCaption meta={meta} />
    </View>
  );
}

export function PdfEquityDebtChart({
  data,
  meta,
}: PdfChartProps<EquityDebtSeries>) {
  const width = 520;
  const height = 150;
  const pad = { l: 30, r: 8, t: 14, b: 25 };
  const max = Math.max(1, ...data.flatMap((row) => [row.propertyValueCzk, row.debtCzk, row.equityCzk]));
  const x = (index: number) => pad.l + (index / Math.max(data.length - 1, 1)) * (width - pad.l - pad.r);
  const y = (value: number) => pad.t + (1 - value / max) * (height - pad.t - pad.b);
  return (
    <View style={{ marginVertical: 4 }} wrap={false}>
      <Svg width={width} height={height}>
        <Line x1={pad.l} x2={width - pad.r} y1={height - pad.b} y2={height - pad.b} stroke={PDF_BRAND.ink} />
        <PdfSeriesLines points={data.map((row, index) => ({ x: x(index), y: y(row.propertyValueCzk) }))} color={PDF_BRAND.gold} width={2.5} />
        <PdfSeriesLines points={data.map((row, index) => ({ x: x(index), y: y(row.debtCzk) }))} color={PDF_BRAND.red} />
        <PdfSeriesLines points={data.map((row, index) => ({ x: x(index), y: y(row.equityCzk) }))} color={PDF_BRAND.teal} width={2.5} />
        {data.map((row, index) => (
          <Text key={row.year} x={x(index)} y={height - 10} textAnchor="middle" style={{ fontSize: 5.5 }}>
            R{row.year}
          </Text>
        ))}
      </Svg>
      <Text style={{ fontSize: 6, color: PDF_BRAND.muted }}>
        Zlatá: hodnota · červená: dluh · zelená: vlastní kapitál.
      </Text>
      <PdfChartCaption meta={meta} />
    </View>
  );
}

function PdfMiniWaterfall({
  title,
  values,
}: {
  title: string;
  values: Array<{ label: string; value: number; total?: boolean }>;
}) {
  const bars = values.reduce<{
    running: number;
    bars: Array<{
      label: string;
      value: number;
      total?: boolean;
      from: number;
      to: number;
    }>;
  }>(
    (state, item) => {
      const from = item.total ? 0 : state.running;
      const to = item.total ? item.value : from + item.value;
      return {
        running: item.total ? state.running : to,
        bars: [...state.bars, { ...item, from, to }],
      };
    },
    { running: 0, bars: [] }
  ).bars;
  const extent = bars.flatMap((bar) => [bar.from, bar.to]);
  const min = Math.min(0, ...extent);
  const max = Math.max(0, ...extent);
  const span = Math.max(max - min, 1);
  const y = (value: number) => 16 + ((max - value) / span) * 78;
  return (
    <View style={{ width: 254 }}>
      <Text style={{ fontSize: 7.5, fontWeight: 700, color: PDF_BRAND.teal }}>{title}</Text>
      <Svg width={250} height={104}>
        <Line x1={5} x2={247} y1={y(0)} y2={y(0)} stroke={PDF_BRAND.ink} />
        {bars.map((bar, index) => {
          const x = 8 + index * 61;
          const top = y(Math.max(bar.from, bar.to));
          const bottom = y(Math.min(bar.from, bar.to));
          return (
            <Rect key={bar.label} x={x} y={top} width={42} height={Math.max(bottom - top, 1)}
              fill={bar.total ? PDF_BRAND.teal : bar.value >= 0 ? PDF_BRAND.green : PDF_BRAND.red} />
          );
        })}
      </Svg>
      <View style={{ flexDirection: "row" }}>
        {bars.map((bar) => (
          <View key={bar.label} style={{ width: 61 }}>
            <Text style={{ fontSize: 5.5, textAlign: "center" }}>{bar.label}</Text>
            <Text style={{ fontSize: 5.5, textAlign: "center", fontWeight: 700 }}>{pdfSignedCzk(bar.value)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function PdfSaleSettlementCharts({
  sale,
  settlement,
  saleMeta,
  settlementMeta,
}: {
  sale: SaleWaterfall;
  settlement: SettlementWaterfall;
  saleMeta?: ChartMeta;
  settlementMeta?: ChartMeta;
}) {
  return (
    <View style={{ marginVertical: 4 }} wrap={false}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <PdfMiniWaterfall
          title={saleMeta?.questionCs ?? "Inkaso z prodeje"}
          values={[
            { label: "Prodejní cena", value: sale.salePriceCzk },
            { label: "Náklady prodeje", value: -Math.abs(sale.costsCzk) },
            { label: "Splacení dluhu", value: -Math.abs(sale.debtCzk) },
            { label: "Čisté inkaso", value: sale.netProceedsCzk, total: true },
          ]}
        />
        <PdfMiniWaterfall
          title={settlementMeta?.questionCs ?? "Celkové vypořádání"}
          values={[
            { label: "Počáteční vklad", value: -Math.abs(settlement.initialOutlayCzk) },
            { label: "Doplnění", value: -Math.abs(settlement.topupsCzk) },
            { label: "Prodej + rezerva", value: settlement.saleAndReserveCzk },
            { label: "Celkem", value: settlement.totalCzk, total: true },
          ]}
        />
      </View>
      <PdfChartCaption meta={settlementMeta ?? saleMeta} />
    </View>
  );
}

export function PdfMarketScatter({
  data,
  meta,
}: PdfChartProps<MarketScatterPoint[]>) {
  const width = 520;
  const height = 165;
  const pad = { l: 35, r: 12, t: 15, b: 25 };
  const minX = Math.min(...data.map((point) => point.x), 0);
  const maxX = Math.max(...data.map((point) => point.x), minX + 1);
  const minY = Math.min(...data.map((point) => point.y), 0);
  const maxY = Math.max(...data.map((point) => point.y), minY + 1);
  const x = (value: number) => pad.l + ((value - minX) / (maxX - minX)) * (width - pad.l - pad.r);
  const y = (value: number) => pad.t + ((maxY - value) / (maxY - minY)) * (height - pad.t - pad.b);
  return (
    <View style={{ marginVertical: 4 }} wrap={false}>
      <Svg width={width} height={height}>
        <Line x1={pad.l} x2={width - pad.r} y1={height - pad.b} y2={height - pad.b} stroke={PDF_BRAND.ink} />
        <Line x1={pad.l} x2={pad.l} y1={pad.t} y2={height - pad.b} stroke={PDF_BRAND.ink} />
        {data.map((point, index) => (
          <Fragment key={`${point.label}-${index}`}>
            <Circle cx={x(point.x)} cy={y(point.y)} r={point.isModel ? 5 : 3.5}
              fill={point.isModel ? PDF_BRAND.gold : PDF_BRAND.teal} stroke={PDF_BRAND.ink} />
            <Text x={x(point.x) + 5} y={y(point.y) - 4} style={{ fontSize: 5.5, fontWeight: point.isModel ? 700 : 400 }}>
              {point.label}
            </Text>
          </Fragment>
        ))}
      </Svg>
      <PdfChartCaption meta={meta} />
    </View>
  );
}

export type PdfSensitivityHeatmapCell = {
  rowValue: number;
  columnValue: number;
  valueCzk: number;
};

export function PdfSensitivityHeatmap({
  rows,
  columns,
  cells,
  currentRow,
  currentColumn,
  rowLabel = "Nájem",
  columnLabel = "Sazba",
  meta,
}: {
  rows: number[];
  columns: number[];
  cells: PdfSensitivityHeatmapCell[];
  currentRow: number;
  currentColumn: number;
  rowLabel?: string;
  columnLabel?: string;
  meta?: ChartMeta;
}) {
  const lookup = new Map(cells.map((cell) => [`${cell.rowValue}:${cell.columnValue}`, cell]));
  const maxAbs = Math.max(1, ...cells.map((cell) => Math.abs(cell.valueCzk)));
  const cellW = 78;
  const cellH = 24;
  const left = 105;
  return (
    <View style={{ marginVertical: 4 }} wrap={false}>
      <Svg width={520} height={35 + rows.length * cellH}>
        <Text x={2} y={15} style={{ fontSize: 6.5, fontWeight: 700 }}>
          {rowLabel} ↓ / {columnLabel} →
        </Text>
        {columns.map((column, index) => (
          <Text key={column} x={left + index * cellW + cellW / 2} y={15} textAnchor="middle" style={{ fontSize: 6.5, fontWeight: 700 }}>
            {column.toLocaleString("cs-CZ")} %
          </Text>
        ))}
        {rows.map((row, rowIndex) => (
          <Fragment key={row}>
            <Text x={2} y={31 + rowIndex * cellH} style={{ fontSize: 6.5, fontWeight: 700 }}>
              {formatModelCzk(row, 0)}
            </Text>
            {columns.map((column, columnIndex) => {
              const value = lookup.get(`${row}:${column}`)?.valueCzk ?? 0;
              const opacity = 0.2 + (Math.abs(value) / maxAbs) * 0.65;
              const current = row === currentRow && column === currentColumn;
              return (
                <Fragment key={`${row}-${column}`}>
                  <Rect
                    x={left + columnIndex * cellW}
                    y={19 + rowIndex * cellH}
                    width={cellW - 2}
                    height={cellH - 2}
                    fill={value >= 0 ? PDF_BRAND.green : PDF_BRAND.red}
                    fillOpacity={opacity}
                    stroke={current ? PDF_BRAND.gold : PDF_BRAND.line}
                    strokeWidth={current ? 2 : 0.5}
                  />
                  <Text
                    x={left + columnIndex * cellW + (cellW - 2) / 2}
                    y={32 + rowIndex * cellH}
                    textAnchor="middle"
                    style={{ fontSize: 6, fontWeight: 700 }}
                  >
                    {formatModelCzk(value, 0)}{current ? " · aktuální" : ""}
                  </Text>
                </Fragment>
              );
            })}
          </Fragment>
        ))}
      </Svg>
      <PdfChartCaption meta={meta} />
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
