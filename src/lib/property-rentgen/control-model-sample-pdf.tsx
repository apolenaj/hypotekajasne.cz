/**
 * Ukázkové / zákaznické PDF z kontrolního výpočetního modulu.
 * Noto Sans pro české znaky; SVG grafy; tabulky; verze modelu.
 */

import path from "node:path";
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Svg,
  Rect,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import {
  CONTROL_MODEL_VERSION,
  formatModelCzk,
  formatModelPct,
  runControlModel,
  runControlScenarios,
  runRelativeScenarios,
  type ControlModelInputs,
  type ControlModelResult,
} from "@/lib/property-rentgen/control-model";
import {
  formatAnalysisPrice,
  formatDigitalRentgenPrice,
} from "@/lib/property-rentgen/pricing";

const FONT_DIR = path.join(
  process.cwd(),
  "src/lib/property-rentgen/fonts"
);

Font.register({
  family: "NotoSans",
  fonts: [
    { src: path.join(FONT_DIR, "NotoSans-Regular.ttf"), fontWeight: 400 },
    { src: path.join(FONT_DIR, "NotoSans-Bold.ttf"), fontWeight: 700 },
  ],
});

const BRAND = {
  teal: "#1b4d3e",
  gold: "#c5a059",
  ink: "#1a1a1a",
  muted: "#6b7280",
  line: "#e5e7eb",
  soft: "#f4f7f6",
  red: "#dc2626",
  green: "#047857",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "NotoSans",
    color: BRAND.ink,
  },
  header: {
    position: "absolute",
    top: 18,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: BRAND.line,
    paddingBottom: 6,
  },
  headerBrand: {
    fontSize: 8,
    color: BRAND.teal,
    fontFamily: "NotoSans",
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  headerMeta: { fontSize: 8, color: BRAND.muted },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: BRAND.line,
    paddingTop: 6,
  },
  footerText: { fontSize: 7, color: BRAND.muted },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: BRAND.gold,
    color: BRAND.ink,
    fontSize: 8,
    fontFamily: "NotoSans",
    fontWeight: 700,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginBottom: 10,
  },
  h1: {
    fontSize: 16,
    fontFamily: "NotoSans",
    fontWeight: 700,
    color: BRAND.teal,
    marginBottom: 8,
  },
  h2: {
    fontSize: 11,
    fontFamily: "NotoSans",
    fontWeight: 700,
    color: BRAND.teal,
    marginBottom: 6,
    marginTop: 10,
  },
  lead: { fontSize: 9, lineHeight: 1.45, marginBottom: 8 },
  muted: { fontSize: 8, color: BRAND.muted, lineHeight: 1.4, marginBottom: 6 },
  cardRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  card: {
    flex: 1,
    backgroundColor: BRAND.soft,
    borderWidth: 1,
    borderColor: BRAND.line,
    borderRadius: 4,
    padding: 8,
  },
  cardLabel: {
    fontSize: 7,
    color: BRAND.muted,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  cardValue: { fontSize: 10, fontFamily: "NotoSans", fontWeight: 700 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: BRAND.line,
    paddingVertical: 3,
  },
  rowLabel: { fontSize: 8, color: BRAND.muted, flex: 1, paddingRight: 8 },
  rowValue: {
    fontSize: 8,
    fontFamily: "NotoSans",
    fontWeight: 700,
    textAlign: "right",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BRAND.teal,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    color: "#fff",
    fontSize: 7,
    fontFamily: "NotoSans",
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BRAND.line,
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  cell: { fontSize: 7.5 },
});

function Header({ subtitle }: { subtitle: string }) {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.headerBrand}>Hypotéka Jasně · Investiční rentgen</Text>
      <Text style={styles.headerMeta}>{subtitle}</Text>
    </View>
  );
}

function Footer({ generatedAt }: { generatedAt: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        Model {CONTROL_MODEL_VERSION} · {generatedAt} · ne tržní nabídka
      </Text>
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) =>
          `Strana ${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row} wrap={false}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function ScenarioBars({
  values,
}: {
  values: Array<{ label: string; value: number }>;
}) {
  const maxAbs = Math.max(...values.map((v) => Math.abs(v.value)), 1);
  const midY = 70;
  const chartH = 140;
  const barW = 48;
  const gap = 36;
  const startX = 40;

  return (
    <View style={{ marginVertical: 8 }} wrap={false}>
      <Text style={styles.muted}>
        Graf: měsíční peněžní tok ve třech modelových situacích (Kč). Nulová osa
        uprostřed.
      </Text>
      <Svg width={500} height={chartH}>
        <Rect x={0} y={midY} width={500} height={1} fill={BRAND.ink} />
        {values.map((v, i) => {
          const h = (Math.abs(v.value) / maxAbs) * 55;
          const x = startX + i * (barW + gap);
          const y = v.value >= 0 ? midY - h : midY;
          return (
            <Rect
              key={v.label}
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, 1)}
              fill={v.value >= 0 ? BRAND.green : BRAND.red}
            />
          );
        })}
      </Svg>
      <View style={{ flexDirection: "row", paddingLeft: startX }}>
        {values.map((v) => (
          <View key={v.label} style={{ width: barW + gap }}>
            <Text style={{ fontSize: 7, textAlign: "center" }}>{v.label}</Text>
            <Text style={{ fontSize: 7, textAlign: "center", fontWeight: 700 }}>
              {formatModelCzk(v.value, 0)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function WaterfallBars({
  items,
}: {
  items: Array<{ label: string; amountCzk: number }>;
}) {
  const maxAbs = Math.max(...items.map((i) => Math.abs(i.amountCzk)), 1);
  const barW = 28;
  const gap = 8;
  const midY = 80;
  return (
    <View style={{ marginVertical: 6 }} wrap={false}>
      <Text style={styles.muted}>
        Graf vodopádu měsíčního výsledku (kladné zeleně, záporné červeně).
      </Text>
      <Svg width={520} height={160}>
        <Rect x={0} y={midY} width={520} height={1} fill={BRAND.ink} />
        {items.map((item, i) => {
          const h = (Math.abs(item.amountCzk) / maxAbs) * 65;
          const x = 10 + i * (barW + gap);
          const y = item.amountCzk >= 0 ? midY - h : midY;
          return (
            <Rect
              key={item.label}
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, 1)}
              fill={item.amountCzk >= 0 ? BRAND.green : BRAND.red}
            />
          );
        })}
      </Svg>
    </View>
  );
}

function ControlSampleDocument({
  model,
  generatedAt,
  documentKind,
}: {
  model: ControlModelResult;
  generatedAt: string;
  documentKind: "demo" | "customer";
}) {
  const scenarios =
    documentKind === "demo"
      ? runControlScenarios(model.inputs)
      : runRelativeScenarios(model.inputs);
  const badge =
    documentKind === "demo"
      ? "MODELOVÝ PŘÍKLAD — SMYŠLENÁ NEMOVITOST"
      : "VÝPOČET Z VAŠICH VSTUPŮ — NE OVĚŘENÝ ROZBOR";

  return (
    <Document
      title={`Investiční rentgen (${CONTROL_MODEL_VERSION})`}
      author="Hypotéka Jasně"
      subject={
        documentKind === "demo"
          ? "Modelový příklad — smyšlená nemovitost, přesně spočtené vstupy"
          : "Automatický model z zákaznických vstupů"
      }
    >
      <Page size="A4" style={styles.page}>
        <Header subtitle={`Model ${CONTROL_MODEL_VERSION}`} />
        <Footer generatedAt={generatedAt} />
        <Text style={styles.badge}>{badge}</Text>
        <Text style={styles.h1}>Investiční rentgen — souhrn</Text>
        <Text style={styles.lead}>{model.baseConclusionCs}</Text>
        <Text style={styles.muted}>
          Balíčky: Model {formatDigitalRentgenPrice()} · Podrobný rozbor{" "}
          {formatAnalysisPrice()}. Toto PDF obsahuje vypočitatelnou část modelu.
          Individuální dohledání nabídek a rozbor dokumentů sem nepatří, dokud
          neproběhne skutečná práce.
        </Text>

        <View style={styles.cardRow}>
          {[
            [
              "Vlastní hotovost vč. rezervy",
              formatModelCzk(model.totalOwnCashIncludingReserveCzk),
            ],
            ["Měsíční tok", formatModelCzk(model.monthlyCashFlowCzk, 2)],
            ["Hrubý výnos", formatModelPct(model.grossYieldOnPurchase, 2)],
            ["Cena / m²", formatModelCzk(model.pricePerM2Czk)],
          ].map(([label, value]) => (
            <View key={label} style={styles.card}>
              <Text style={styles.cardLabel}>{label}</Text>
              <Text style={styles.cardValue}>{value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.h2}>Vstupy</Text>
        <Kv label="Plocha" value={`${model.inputs.areaM2} m²`} />
        <Kv
          label="Kupní cena"
          value={formatModelCzk(model.inputs.purchasePriceCzk)}
        />
        <Kv
          label="Úpravy + vedlejší"
          value={formatModelCzk(
            model.inputs.initialFitOutCzk + model.inputs.closingCostsCzk
          )}
        />
        <Kv
          label="Úvěr / sazba / splatnost"
          value={`${formatModelCzk(model.inputs.loanAmountCzk)} · ${model.inputs.annualRatePercent} % · ${model.inputs.termYears} let`}
        />
        <Kv
          label="Nájem / výpadek / správa"
          value={`${formatModelCzk(model.inputs.monthlyRentCzk)} · ${model.inputs.vacancyRate * 100} % · ${model.inputs.managementFeeRate * 100} %`}
        />
        <Kv
          label="Celková pořizovací investice"
          value={formatModelCzk(model.totalAcquisitionCostCzk)}
        />
        <Kv
          label="Oddělená hotovostní rezerva"
          value={formatModelCzk(model.inputs.cashReserveCzk)}
        />
      </Page>

      <Page size="A4" style={styles.page}>
        <Header subtitle={`Model ${CONTROL_MODEL_VERSION}`} />
        <Footer generatedAt={generatedAt} />
        <Text style={styles.h2}>Měsíční výsledek — vodopád</Text>
        <WaterfallBars
          items={model.monthlyWaterfall
            .filter((w) => w.key !== "net")
            .map((w) => ({ label: w.label, amountCzk: w.amountCzk }))}
        />
        {model.monthlyWaterfall.map((w) => (
          <Kv key={w.key} label={w.label} value={formatModelCzk(w.amountCzk, 2)} />
        ))}

        <Text style={styles.h2}>Tři modelové situace</Text>
        <ScenarioBars
          values={scenarios.map((s) => ({
            label: s.label,
            value: s.monthlyCashFlowCzk,
          }))}
        />
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { width: "18%" }]}>Scénář</Text>
          <Text style={[styles.tableHeaderCell, { width: "16%" }]}>Nájem</Text>
          <Text style={[styles.tableHeaderCell, { width: "14%" }]}>Výpadek</Text>
          <Text style={[styles.tableHeaderCell, { width: "14%" }]}>Sazba</Text>
          <Text style={[styles.tableHeaderCell, { width: "19%" }]}>Splátka</Text>
          <Text style={[styles.tableHeaderCell, { width: "19%" }]}>Tok</Text>
        </View>
        {scenarios.map((s) => (
          <View key={s.id} style={styles.tableRow} wrap={false}>
            <Text style={[styles.cell, { width: "18%" }]}>{s.label}</Text>
            <Text style={[styles.cell, { width: "16%" }]}>
              {formatModelCzk(s.monthlyRentCzk)}
            </Text>
            <Text style={[styles.cell, { width: "14%" }]}>
              {s.vacancyRate * 100} %
            </Text>
            <Text style={[styles.cell, { width: "14%" }]}>
              {s.annualRatePercent} %
            </Text>
            <Text style={[styles.cell, { width: "19%" }]}>
              {formatModelCzk(s.monthlyPaymentCzk, 2)}
            </Text>
            <Text style={[styles.cell, { width: "19%" }]}>
              {formatModelCzk(s.monthlyCashFlowCzk, 2)}
            </Text>
          </View>
        ))}
      </Page>

      <Page size="A4" style={styles.page}>
        <Header subtitle={`Model ${CONTROL_MODEL_VERSION}`} />
        <Footer generatedAt={generatedAt} />
        <Text style={styles.h2}>Financování — prvních 12 měsíců</Text>
        <Text style={styles.muted}>
          Splacená jistina: {formatModelCzk(model.principalPaidFirst12MonthsCzk, 2)}.
          Jistina není peněžní příjem. Záporný tok a umoření mohou existovat
          současně.
        </Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { width: "12%" }]}>Měsíc</Text>
          <Text style={[styles.tableHeaderCell, { width: "22%" }]}>Úrok</Text>
          <Text style={[styles.tableHeaderCell, { width: "22%" }]}>Umoření</Text>
          <Text style={[styles.tableHeaderCell, { width: "22%" }]}>Splátka</Text>
          <Text style={[styles.tableHeaderCell, { width: "22%" }]}>Zůstatek</Text>
        </View>
        {model.first12Months.map((m) => (
          <View key={m.month} style={styles.tableRow} wrap={false}>
            <Text style={[styles.cell, { width: "12%" }]}>{m.month}</Text>
            <Text style={[styles.cell, { width: "22%" }]}>
              {formatModelCzk(m.interestCzk, 2)}
            </Text>
            <Text style={[styles.cell, { width: "22%" }]}>
              {formatModelCzk(m.principalCzk, 2)}
            </Text>
            <Text style={[styles.cell, { width: "22%" }]}>
              {formatModelCzk(m.paymentCzk, 2)}
            </Text>
            <Text style={[styles.cell, { width: "22%" }]}>
              {formatModelCzk(m.closingBalanceCzk, 2)}
            </Text>
          </View>
        ))}

        <Text style={styles.h2}>Cenové podmínky modelu</Text>
        <Kv
          label="Nájem pro nulový tok"
          value={`${formatModelCzk(model.rentForZeroCashFlowCzk, 2)} / měs.`}
        />
        <Kv
          label="Cenová hranice při úvěru 70 % kupní ceny"
          value={formatModelCzk(model.purchasePriceForZeroCashFlowAt70LoanCzk, 2)}
        />
        <Text style={styles.muted}>
          Není tržní ocenění, garantovaná nákupní cena ani osobní doporučení.
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Header subtitle={`Model ${CONTROL_MODEL_VERSION}`} />
        <Footer generatedAt={generatedAt} />
        <Text style={styles.h2}>Předpoklady a metodika</Text>
        <Text style={styles.lead}>
          Verze výpočtu: {CONTROL_MODEL_VERSION}. Datum: {generatedAt}.
        </Text>
        <Text style={styles.muted}>
          Anuita z jistiny, sazby a splatnosti. Provozní přebytek po rezervě =
          inkasovaný nájem − správa − ostatní roční náklady. Poměr úvěru ke
          kupní ceně není automaticky bankovní LTV. Nezapočtena daň z příjmů,
          poplatky za úvěr, výnos rezervy ani náklady prodeje.
        </Text>
        <Text style={styles.h2}>Co PDF není</Text>
        <Text style={styles.muted}>
          Není investiční doporučení, znalecký posudek, nabídka banky ani
          ověřený právní/technický stav. Bez LV nepotvrzujeme vlastnictví. Bez
          prohlídky nevydáváme zjištěný stav oprav. Individuální dohledání
          nabídek patří jen do podrobného rozboru po skutečné práci.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderControlModelSamplePdfBuffer(
  model: ControlModelResult = runControlModel(),
  documentKind: "demo" | "customer" = "demo"
): Promise<Buffer> {
  const generatedAt = new Date().toISOString().slice(0, 10);
  const buffer = await renderToBuffer(
    <ControlSampleDocument
      model={model}
      generatedAt={generatedAt}
      documentKind={documentKind}
    />
  );
  return Buffer.from(buffer);
}

export async function renderCustomerModelPdfBuffer(
  inputs: ControlModelInputs
): Promise<Buffer> {
  return renderControlModelSamplePdfBuffer(runControlModel(inputs), "customer");
}
