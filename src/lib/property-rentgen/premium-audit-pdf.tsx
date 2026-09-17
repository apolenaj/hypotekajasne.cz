/**
 * Vercel-friendly PDF skeleton for Komplexní Investiční Audit.
 *
 * Why @react-pdf/renderer (not Puppeteer/Chromium):
 * - Pure JS, ~few MB, fits serverless memory/time budgets
 * - Deterministic page breaks via <Page> + wrap={false}
 * - No @sparticuz/chromium binary (~50MB+) or headless Chrome cold starts
 * - renderToBuffer works in Node.js App Router route handlers
 *
 * Page budget (≈30): cover, executive, assumptions, CF pages (chunked),
 * stress, wealth, methodology/disclaimer.
 */

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { PremiumRentgenAuditResult } from "@/lib/property-rentgen/audit-types";
import { formatAnalysisPrice } from "@/lib/property-rentgen/pricing";

const BRAND = {
  teal: "#1b4d3e",
  gold: "#c5a059",
  ink: "#1a1a1a",
  muted: "#6b7280",
  line: "#e5e7eb",
  soft: "#f4f7f6",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
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
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  headerMeta: {
    fontSize: 8,
    color: BRAND.muted,
  },
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
  footerText: {
    fontSize: 7,
    color: BRAND.muted,
  },
  h1: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: BRAND.teal,
    marginBottom: 8,
  },
  h2: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: BRAND.teal,
    marginBottom: 8,
    marginTop: 4,
  },
  lead: {
    fontSize: 10,
    lineHeight: 1.45,
    color: BRAND.ink,
    marginBottom: 10,
  },
  muted: {
    fontSize: 8,
    color: BRAND.muted,
    lineHeight: 1.4,
  },
  cardRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
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
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  cardValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: BRAND.ink,
  },
  table: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: BRAND.line,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BRAND.teal,
    color: "#ffffff",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BRAND.line,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tableRowAlt: {
    backgroundColor: BRAND.soft,
  },
  cell: {
    fontSize: 7.5,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: BRAND.gold,
    color: BRAND.ink,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginBottom: 10,
  },
});

function formatCzk(n: number): string {
  return `${Math.round(n).toLocaleString("cs-CZ")} Kč`;
}

function formatPct(n: number, digits = 1): string {
  return `${n.toLocaleString("cs-CZ", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} %`;
}

function Header({ subtitle }: { subtitle: string }) {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.headerBrand}>Hypotéka Jasně · Investiční rentgen</Text>
      <Text style={styles.headerMeta}>{subtitle}</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        Modelový audit · {formatAnalysisPrice()} · ne nabídka banky
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

function MetricCards({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <View style={styles.cardRow}>
      {items.map((item) => (
        <View key={item.label} style={styles.card} wrap={false}>
          <Text style={styles.cardLabel}>{item.label}</Text>
          <Text style={styles.cardValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const CF_CHUNK = 12;

function CashFlowTablePage({
  rows,
  chunkIndex,
  chunkCount,
}: {
  rows: PremiumRentgenAuditResult["yearlyCashFlows"];
  chunkIndex: number;
  chunkCount: number;
}) {
  return (
    <Page size="A4" style={styles.page} wrap>
      <Header subtitle="Cash-flow 30Y" />
      <Footer />
      <Text style={styles.h2}>
        Roční cash-flow ({chunkIndex + 1}/{chunkCount})
      </Text>
      <Text style={styles.muted}>
        Tabulka je stránkovaná po {CF_CHUNK} řádcích — řádky se nelámou přes okraj
        stránky (wrap=false).
      </Text>
      <View style={styles.table}>
        <View style={styles.tableHeader} wrap={false}>
          <Text style={[styles.tableHeaderCell, { width: "8%" }]}>Rok</Text>
          <Text style={[styles.tableHeaderCell, { width: "18%" }]}>Nájem</Text>
          <Text style={[styles.tableHeaderCell, { width: "18%" }]}>Dluh</Text>
          <Text style={[styles.tableHeaderCell, { width: "18%" }]}>Provoz</Text>
          <Text style={[styles.tableHeaderCell, { width: "18%" }]}>Čisté CF</Text>
          <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Equity</Text>
        </View>
        {rows.map((row, i) => (
          <View
            key={row.year}
            style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
            wrap={false}
          >
            <Text style={[styles.cell, { width: "8%" }]}>{row.year}</Text>
            <Text style={[styles.cell, { width: "18%" }]}>
              {formatCzk(row.annualEffectiveRentCzk)}
            </Text>
            <Text style={[styles.cell, { width: "18%" }]}>
              {formatCzk(row.annualDebtServiceCzk)}
            </Text>
            <Text style={[styles.cell, { width: "18%" }]}>
              {formatCzk(
                row.annualOperatingCostsCzk + row.annualReserveCzk
              )}
            </Text>
            <Text style={[styles.cell, { width: "18%" }]}>
              {formatCzk(row.annualNetCashFlowCzk)}
            </Text>
            <Text style={[styles.cell, { width: "20%" }]}>
              {formatCzk(row.equityCzk)}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  );
}

export function PremiumRentgenAuditDocument({
  result,
}: {
  result: PremiumRentgenAuditResult;
}) {
  const { summary, stressTests, wealthCreation, yearlyCashFlows, input } =
    result;
  const label = input.property.label ?? input.property.city ?? "Nemovitost";
  const chunks: Array<typeof yearlyCashFlows> = [];
  for (let i = 0; i < yearlyCashFlows.length; i += CF_CHUNK) {
    chunks.push(yearlyCashFlows.slice(i, i + CF_CHUNK));
  }

  return (
    <Document
      title={`Komplexní Investiční Audit — ${label}`}
      author="Hypotéka Jasně"
      subject="Prémiový modelový report Investičního rentgenu"
      language="cs-CZ"
    >
      <Page size="A4" style={styles.page}>
        <Header subtitle="Cover" />
        <Footer />
        <Text style={styles.badge}>Komplexní Investiční Audit</Text>
        <Text style={styles.h1}>{label}</Text>
        <Text style={styles.lead}>
          30letý model cash-flow, úrokový šok po fixaci a srovnání tvorby bohatství
          vůči S&amp;P 500. Cena produktu: {formatAnalysisPrice()}.
        </Text>
        <MetricCards
          items={[
            {
              label: "Skutečná cena dealu",
              value: formatCzk(summary.totalDealCostCzk),
            },
            {
              label: "LTV",
              value: formatPct(summary.ltvPercent),
            },
            {
              label: "Splátka (base)",
              value: `${formatCzk(summary.baseMonthlyPaymentCzk)}/měs.`,
            },
          ]}
        />
        <Text style={styles.muted}>{result.disclaimer}</Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Header subtitle="Executive summary" />
        <Footer />
        <Text style={styles.h2}>Executive summary</Text>
        <MetricCards
          items={[
            {
              label: "Čisté CF rok 1",
              value: formatCzk(summary.year1NetCashFlowCzk),
            },
            {
              label: "Net yield / deal",
              value: formatPct(summary.year1NetYieldOnDealPct),
            },
            {
              label: "Cash-on-cash",
              value:
                summary.year1CashOnCashPct == null
                  ? "—"
                  : formatPct(summary.year1CashOnCashPct),
            },
          ]}
        />
        <Text style={styles.lead}>
          Počáteční equity {formatCzk(summary.initialEquityCzk)} · úvěr{" "}
          {formatCzk(summary.loanAmountCzk)} · sazba{" "}
          {formatPct(input.mortgage.annualRatePercent, 2)} p.a. · fixace{" "}
          {input.mortgage.fixationYears} let.
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Header subtitle="Předpoklady" />
        <Footer />
        <Text style={styles.h2}>Modelové předpoklady</Text>
        <Text style={styles.lead}>
          Růst nájmu {formatPct(input.market.rentGrowthPa * 100)} p.a. · růst
          nákladů {formatPct(input.market.opexGrowthPa * 100)} p.a. · appreciation{" "}
          {formatPct(input.market.propertyAppreciationPa * 100)} p.a. · S&amp;P{" "}
          {formatPct(input.market.sp500ReturnPa * 100)} p.a. · vacancy{" "}
          {formatPct(input.property.vacancyRate * 100)}.
        </Text>
        <Text style={styles.muted}>
          CAPEX {formatCzk(input.property.capexCzk)} · closing{" "}
          {formatCzk(input.property.closingCostsCzk)} · hrubý nájem{" "}
          {formatCzk(input.property.monthlyGrossRentCzk)}/měs.
        </Text>
      </Page>

      {chunks.map((rows, idx) => (
        <CashFlowTablePage
          key={`cf-${idx}`}
          rows={rows}
          chunkIndex={idx}
          chunkCount={chunks.length}
        />
      ))}

      <Page size="A4" style={styles.page}>
        <Header subtitle="Úrokový šok" />
        <Footer />
        <Text style={styles.h2}>
          Stress test sazby (rok {stressTests.fixationYears + 1})
        </Text>
        <Text style={styles.lead}>
          Po {stressTests.fixationYears} letech fixace se anuita přepočte na
          zůstatek jistiny a zbývající splatnost.
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeader} wrap={false}>
            <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Sazba</Text>
            <Text style={[styles.tableHeaderCell, { width: "27%" }]}>
              Nová splátka
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "27%" }]}>Δ vs base</Text>
            <Text style={[styles.tableHeaderCell, { width: "26%" }]}>
              Čisté CF po šoku
            </Text>
          </View>
          {stressTests.scenarios.map((s, i) => (
            <View
              key={s.shockRatePercent}
              style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
              wrap={false}
            >
              <Text style={[styles.cell, { width: "20%" }]}>
                {formatPct(s.shockRatePercent, 0)}
              </Text>
              <Text style={[styles.cell, { width: "27%" }]}>
                {formatCzk(s.monthlyPaymentAfterShockCzk)}
              </Text>
              <Text style={[styles.cell, { width: "27%" }]}>
                {formatCzk(s.monthlyPaymentDeltaCzk)}
              </Text>
              <Text style={[styles.cell, { width: "26%" }]}>
                {formatCzk(s.annualNetCashFlowYearAfterShockCzk)}
              </Text>
            </View>
          ))}
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Header subtitle="Wealth creation" />
        <Footer />
        <Text style={styles.h2}>Wealth creation vs S&amp;P 500</Text>
        <Text style={styles.lead}>
          Stejný počáteční kapitál {formatCzk(wealthCreation.initialEquityCzk)}{" "}
          ve S&amp;P při {formatPct(wealthCreation.sp500ReturnPa * 100)} p.a. vs.
          equity v nemovitosti (páka + appreciation).
        </Text>
        <MetricCards
          items={[
            {
              label: `Equity rok ${wealthCreation.terminal.year}`,
              value: formatCzk(wealthCreation.terminal.propertyEquityCzk),
            },
            {
              label: "S&P 500",
              value: formatCzk(wealthCreation.terminal.sp500ValueCzk),
            },
            {
              label: "Výhoda páky",
              value: formatCzk(wealthCreation.terminal.leverageAdvantageCzk),
            },
          ]}
        />
        <Text style={styles.muted}>
          Ukázka terminálu; plný 30Y graf je v interaktivním dashboardu. PDF drží
          číselné shrnutí kvůli velikosti bufferu na Vercelu.
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Header subtitle="Metodika" />
        <Footer />
        <Text style={styles.h2}>Metodika a limity</Text>
        <Text style={styles.lead}>{result.disclaimer}</Text>
        <Text style={styles.muted}>
          Annuity: P · r · (1+r)^n / ((1+r)^n − 1), r = sazba%/1200. Umoření po
          měsících. Generováno {result.generatedAt}. Motor:
          rentgen-math-engine.ts · PDF: @react-pdf/renderer.
        </Text>
      </Page>
    </Document>
  );
}

/** Server-only: render PDF to Buffer for Storage upload. */
export async function renderPremiumRentgenPdfBuffer(
  result: PremiumRentgenAuditResult
): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <PremiumRentgenAuditDocument result={result} />
  );
  return Buffer.from(buffer);
}
