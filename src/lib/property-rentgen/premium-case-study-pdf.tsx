/**
 * Premium model case-study PDF — a dense, client-facing investment analysis.
 * All decision outputs come from buildCaseStudyBundle().adjustedModel.
 */

import type { ReactNode } from "react";
import {
  Document,
  Link,
  Page,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import {
  CONTROL_MODEL_VERSION,
  formatModelCzk,
  formatModelPct,
  runControlModel,
} from "@/lib/property-rentgen/control-model";
import {
  CASE_STUDY_LABEL_CS,
  CASE_STUDY_VERSION,
  LISTINGS_ACCESS_DATE,
  buildCaseStudyBundle,
  type BudgetLine,
  type CaseStudyBundle,
  type InvestmentSettlement,
  type MarketListing,
  type ModelDocument,
} from "@/lib/property-rentgen/case-study-analytics";
import {
  buildBeforeAfterPanels,
  buildCashNeededStacked,
  buildEquityDebtSeries,
  buildMarketScatter,
  buildRefixTimeSeries,
  buildReservePathSeries,
  buildSaleWaterfall,
  buildSettlementWaterfall,
  buildTornadoDeltas,
} from "@/lib/property-rentgen/chart-series";
import {
  FindingBox,
  Kv,
  PDF_BRAND,
  PdfBeforeAfterPanels,
  PdfEquityDebtChart,
  PdfFooter,
  PdfHeader,
  PdfMarketScatter,
  PdfRefixCompareChart,
  PdfReservePathChart,
  PdfSaleSettlementCharts,
  PdfScenarioBars,
  PdfSensitivityHeatmap,
  PdfStackedCashBar,
  PdfTornadoChart,
  PdfWaterfallChart,
  ensureRentgenPdfFonts,
  pdfStyles,
} from "@/lib/property-rentgen/pdf-brand";
import {
  formatAnalysisPrice,
  formatDigitalRentgenPrice,
} from "@/lib/property-rentgen/pricing";
import { legalOperator } from "@/config/legal";
import { PREMIUM_SAMPLE_PAGE_COUNT } from "@/lib/property-rentgen/sample-pdf-meta";

export { PREMIUM_SAMPLE_PAGE_COUNT };

function Shell({
  variant,
  generatedAt,
  children,
}: {
  variant: string;
  generatedAt: string;
  children: ReactNode;
}) {
  return (
    <Page size="A4" style={pdfStyles.page}>
      <PdfHeader subtitle={variant} />
      <PdfFooter
        generatedAt={generatedAt}
        version={CONTROL_MODEL_VERSION}
        variant={variant}
      />
      {children}
    </Page>
  );
}

function ChapterTitle({ n, title }: { n: number; title: string }) {
  return (
    <Text style={pdfStyles.h1}>
      {n}. {title}
    </Text>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={pdfStyles.h2}>{children}</Text>;
}

function hostFromUrl(url: string | null): string {
  if (!url) return "—";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.slice(0, 28);
  }
}

function ListingLink({ listing }: { listing: MarketListing }) {
  if (!listing.url) return <Text style={pdfStyles.cell}>—</Text>;
  return (
    <Link src={listing.url} style={[pdfStyles.cell, { color: PDF_BRAND.teal }]}>
      {hostFromUrl(listing.url)}
    </Link>
  );
}

function sumBudget(lines: BudgetLine[], category: BudgetLine["category"]) {
  return lines
    .filter((line) => line.category === category)
    .reduce((sum, line) => sum + line.amountCzk, 0);
}

function BudgetTable({ lines, title }: { lines: BudgetLine[]; title: string }) {
  return (
    <View wrap={false}>
      <Text style={pdfStyles.h3}>{title}</Text>
      <View style={pdfStyles.tableHeader}>
        <Text style={[pdfStyles.tableHeaderCell, { width: "42%" }]}>Položka</Text>
        <Text style={[pdfStyles.tableHeaderCell, { width: "20%" }]}>Částka</Text>
        <Text style={[pdfStyles.tableHeaderCell, { width: "38%" }]}>Kdy / nejistota</Text>
      </View>
      {lines.map((line) => (
        <View key={line.id} style={pdfStyles.tableRow}>
          <Text style={[pdfStyles.cell, { width: "42%" }]}>{line.label}</Text>
          <Text style={[pdfStyles.cell, { width: "20%" }]}>
            {formatModelCzk(line.amountCzk, 0)}
          </Text>
          <Text style={[pdfStyles.cell, { width: "38%" }]}>
            {line.timing}; {line.uncertainty}
          </Text>
        </View>
      ))}
    </View>
  );
}

function DocumentFinding({ doc }: { doc: ModelDocument }) {
  return (
    <View style={pdfStyles.finding} wrap={false}>
      <Text style={pdfStyles.h3}>{doc.title}</Text>
      <Text style={pdfStyles.body}>
        <Text style={pdfStyles.findingLabel}>Co podklad říká: </Text>
        {doc.says}
      </Text>
      <Text style={pdfStyles.body}>
        <Text style={pdfStyles.findingLabel}>Dopad na rozhodnutí: </Text>
        {doc.relevantForOwner}
      </Text>
      <Kv
        label="Měsíční změna po zpracování"
        value={
          doc.amountDeltaMonthlyCzk === 0
            ? "beze změny"
            : `${doc.amountDeltaMonthlyCzk > 0 ? "+" : ""}${formatModelCzk(doc.amountDeltaMonthlyCzk, 0)}/měs.`
        }
      />
      <Text style={pdfStyles.muted}>{doc.disclaimer}</Text>
    </View>
  );
}

function SettlementRows({
  settlement,
}: {
  settlement: InvestmentSettlement;
}) {
  return (
    <View>
      <Kv
        label="Počáteční vlastní hotovost"
        value={formatModelCzk(settlement.initialOwnCashCzk, 0)}
      />
      <Kv
        label="Dodatečně vložené peníze"
        value={formatModelCzk(settlement.investorTopUpsCzk, 0)}
      />
      <Kv
        label="Čisté inkaso z prodeje před daní"
        value={formatModelCzk(settlement.saleNetProceedsBeforeTaxCzk, 0)}
      />
      <Kv
        label="Rezerva skutečně zbývající při prodeji"
        value={formatModelCzk(settlement.reserveReleasedCzk, 0)}
      />
      <Kv
        label="Celkový výsledek před daní"
        value={formatModelCzk(settlement.totalResultBeforeTaxCzk, 0)}
      />
      <Text style={pdfStyles.muted}>
        Součet provozních toků {formatModelCzk(settlement.cumulativeOperatingCashCzk, 0)}
        je informativní. Projevil se v konečné rezervě a do výsledku se znovu
        nepřičítá.
      </Text>
    </View>
  );
}

function PremiumDocument({ bundle }: { bundle: CaseStudyBundle }) {
  const original = bundle.originalModel;
  const adjusted = bundle.adjustedModel;
  const profile = bundle.profile;
  const liquidity = bundle.combinedLiquidity;
  const vacancy = bundle.vacancyAnalysis;
  const variant = `Individuální rozbor ${formatAnalysisPrice()}`;
  const generatedAt = bundle.generatedAt;
  const originalMonthly = Math.round(original.monthlyCashFlowCzk);
  const adjustedMonthly = Math.round(adjusted.monthlyCashFlowCzk);
  const salePsm = bundle.saleListings.map((listing) => listing.pricePerM2Czk);
  const rentValues = bundle.rentListings.map((listing) => listing.priceOrRentCzk);
  const modelPsm = Math.round(adjusted.pricePerM2Czk);
  const closing = bundle.budgets.filter((line) => line.category === "closing");
  const fitout = bundle.budgets.filter((line) => line.category === "fitout");
  const operating = bundle.budgets.filter((line) => line.category === "opex");
  const extraordinary = bundle.budgets.filter(
    (line) => line.category === "extraordinary"
  );
  const closingSum = sumBudget(bundle.budgets, "closing");
  const fitoutSum = sumBudget(bundle.budgets, "fitout");
  const requiredCash = buildCashNeededStacked({
    equityCzk: adjusted.equityTowardPurchaseCzk,
    fitoutCzk: adjusted.inputs.initialFitOutCzk,
    optionalFitoutCzk: 0,
    closingCzk: adjusted.inputs.closingCostsCzk,
    reserveCzk: adjusted.inputs.cashReserveCzk,
  });
  const beforeAfter = buildBeforeAfterPanels({
    monthlyCashFlow: {
      beforeCzk: originalMonthly,
      afterCzk: adjustedMonthly,
    },
    ownCash: {
      beforeCzk: original.totalOwnCashIncludingReserveCzk,
      afterCzk: adjusted.totalOwnCashIncludingReserveCzk,
    },
    ownerCosts: {
      beforeCzk: original.inputs.ownerBuildingCostsAnnualCzk / 12,
      afterCzk: adjusted.inputs.ownerBuildingCostsAnnualCzk / 12,
    },
  });
  const tornado = buildTornadoDeltas(
    bundle.sensitivity.concreteDeltas.map((item) => ({
      label: item.label,
      deltaCzk: item.deltaMonthlyCashFlowCzk,
      changeNote: item.changeDescriptionCs,
    }))
  );
  const reservePath = buildReservePathSeries(
    liquidity.path.map((row) => ({
      month: row.month,
      openingCzk: row.openingCzk,
      closingCzk: row.closingCzk,
      topupCzk: row.investorInflowCzk,
      empty: row.month <= liquidity.emptyMonthsWithoutRent,
      repair: row.month === liquidity.repairMonth,
      relet: row.month === liquidity.repairMonth + 1,
    })),
    {
      periodCs: "Prvních 12 měsíců stresu",
      interpretationCs:
        "Tři měsíce je byt prázdný; ve čtvrtém je stále bez nájmu a současně přichází oprava.",
    }
  );
  const refixCompare = buildRefixTimeSeries(
    bundle.longTermNoRefix.map((row, index) => ({
      month: row.year * 12,
      cfNoRefixCzk: row.netCfCzk,
      cfWithRefixCzk: bundle.longTermWithRefix[index]!.netCfCzk,
    })),
    61,
    {
      periodCs: "Roky 1–10; nová splátka od měsíce 61",
      interpretationCs:
        "Obě řady používají stejné upravené vstupy. Liší se pouze změnou splátky po refixaci.",
    }
  );
  const equityDebt = buildEquityDebtSeries(
    bundle.longTermWithRefix.map((row) => ({
      year: row.year,
      propertyValueCzk: row.propertyValueCzk,
      debtCzk: row.loanBalanceCzk,
      equityCzk: row.equityCzk,
    }))
  );
  const saleY5 = bundle.sales[0]!;
  const saleChart = buildSaleWaterfall({
    salePriceCzk: saleY5.assumedSalePriceCzk,
    costsCzk: saleY5.sellingCostsCzk,
    debtCzk: saleY5.loanBalanceCzk,
    netProceedsCzk: saleY5.netProceedsBeforeTaxCzk,
  });
  const baseSettlementChart = buildSettlementWaterfall({
    initialOutlayCzk: bundle.settlementY5.initialOwnCashCzk,
    topupsCzk: bundle.settlementY5.investorTopUpsCzk,
    saleAndReserveCzk:
      bundle.settlementY5.saleNetProceedsBeforeTaxCzk +
      bundle.settlementY5.reserveReleasedCzk,
    totalCzk: bundle.settlementY5.totalResultBeforeTaxCzk,
  });
  const stressSettlementChart = buildSettlementWaterfall({
    initialOutlayCzk: bundle.settlementStressY5.initialOwnCashCzk,
    topupsCzk: bundle.settlementStressY5.investorTopUpsCzk,
    saleAndReserveCzk:
      bundle.settlementStressY5.saleNetProceedsBeforeTaxCzk +
      bundle.settlementStressY5.reserveReleasedCzk,
    totalCzk: bundle.settlementStressY5.totalResultBeforeTaxCzk,
  });
  const saleScatter = buildMarketScatter(
    [
      ...bundle.saleListings.map((listing) => ({
        x: listing.areaM2,
        y: listing.pricePerM2Czk,
        isModel: false,
        label: listing.label,
      })),
      {
        x: profile.areaM2,
        y: adjusted.pricePerM2Czk,
        isModel: true,
        label: "Model",
      },
    ],
    {
      unitCs: "x: m², y: Kč/m²",
      periodCs: `Veřejné nabídky k ${LISTINGS_ACCESS_DATE}`,
      interpretationCs:
        "Modelová kupní cena leží pod zahrnutými nabídkami; to je důvod k prověření stavu, práv a domu.",
    }
  );
  const rentScatter = buildMarketScatter(
    [
      ...bundle.rentListings.map((listing) => ({
        x: listing.areaM2,
        y: listing.priceOrRentCzk,
        isModel: false,
        label: listing.label,
      })),
      {
        x: profile.areaM2,
        y: adjusted.inputs.monthlyRentCzk,
        isModel: true,
        label: "Model",
      },
    ],
    {
      unitCs: "x: m², y: měsíční nájem",
      periodCs: `Veřejné nabídky k ${LISTINGS_ACCESS_DATE}`,
      interpretationCs:
        "Modelový nájem leží uvnitř nabídkového pásma, nikoli na jeho bezpečně potvrzené úrovni.",
    }
  );
  const waterfallSteps = adjusted.monthlyWaterfall.map((step) => ({
    key: step.key,
    label: step.label,
    deltaCzk: step.amountCzk,
    kind:
      step.key === "rent"
        ? ("start" as const)
        : step.key === "net"
          ? ("total" as const)
          : ("delta" as const),
  }));

  return (
    <Document
      title={`Individuální rozbor — ${CASE_STUDY_LABEL_CS}`}
      author="Hypotéka Jasně"
      subject="Modelový individuální rozbor — Brno-Židenice"
    >
      {/* 1 */}
      <Shell variant={variant} generatedAt={generatedAt}>
        <Text style={pdfStyles.badge}>
          MODELOVÁ UKÁZKA · BRNO-ŽIDENICE · {formatAnalysisPrice()}
        </Text>
        <Text style={pdfStyles.h1}>Investiční rentgen nemovitosti</Text>
        <Text style={pdfStyles.lead}>{CASE_STUDY_LABEL_CS}</Text>
        <View style={pdfStyles.cardRow}>
          {[
            ["Kupní cena", formatModelCzk(adjusted.inputs.purchasePriceCzk, 0)],
            ["Nájem", `${formatModelCzk(adjusted.inputs.monthlyRentCzk, 0)}/měs.`],
            ["Vlastní hotovost", formatModelCzk(adjusted.totalOwnCashIncludingReserveCzk, 0)],
          ].map(([label, value]) => (
            <View key={label} style={pdfStyles.card}>
              <Text style={pdfStyles.cardLabel}>{label}</Text>
              <Text style={pdfStyles.cardValue}>{value}</Text>
            </View>
          ))}
        </View>
        <SectionTitle>Co tato ukázka řeší</SectionTitle>
        <Text style={pdfStyles.body}>
          Kolik hotovosti je potřeba, jak podklady změnily výsledek, zda
          investice unese výpadek nájmu a opravu, co udělá refixace a jak
          vypadá vypořádání při prodeji.
        </Text>
        <SectionTitle>Označení a omezení</SectionTitle>
        <Text style={pdfStyles.body}>{profile.disclaimerCs}</Text>
        <Text style={pdfStyles.body}>
          Veřejné nabídky jsou nabídkové ceny s URL a datem přístupu. Nejde o
          uzavřené transakce ani znalecký posudek.
        </Text>
        <Kv label="Verze případu" value={CASE_STUDY_VERSION} />
        <Kv label="Verze modelu" value={CONTROL_MODEL_VERSION} />
        <Kv label="Datum výpočtu" value={generatedAt} />
        <Text style={pdfStyles.muted}>
          Provozovatel: {legalOperator.companyName}, IČO {legalOperator.ico}
        </Text>
      </Shell>

      {/* 2 */}
      <Shell variant={variant} generatedAt={generatedAt}>
        <ChapterTitle n={1} title="Rozhodnutí v jedné stránce" />
        <Text style={pdfStyles.h2}>
          Upravený model vyžaduje pravidelný doplatek přibližně{" "}
          {formatModelCzk(Math.abs(adjustedMonthly), 0)}/měs.
        </Text>
        <Text style={pdfStyles.body}>{adjusted.baseConclusionCs}</Text>
        <PdfStackedCashBar data={requiredCash.data} meta={requiredCash.meta} />
        <PdfBeforeAfterPanels data={beforeAfter.data} meta={beforeAfter.meta} />
        <FindingBox
          podklad="Upravený model, veřejné nabídky a zpracované modelové podklady"
          zjisteni={`Nájem ${formatModelCzk(adjusted.inputs.monthlyRentCzk, 0)} je v nabídkovém pásmu, ale provoz po započtení upravených nákladů nevychází kladně.`}
          dopad={`Vedle vstupní hotovosti ${formatModelCzk(adjusted.totalOwnCashIncludingReserveCzk, 0)} je potřeba počítat s průběžným doplácením a samostatnou likviditou pro stres.`}
          overit="List vlastnictví, technický stav, skutečné předpisy SVJ a závazné podmínky banky."
        />
      </Shell>

      {/* 3 */}
      <Shell variant={variant} generatedAt={generatedAt}>
        <ChapterTitle n={2} title="Byt, podklady a neobsazenost" />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Kv label="Dispozice / plocha" value={`${profile.disposition} · ${profile.areaM2} m²`} />
            <Kv label="Lokalita" value={profile.locality} />
            <Kv label="Patro / výtah" value={`${profile.floor} · ${profile.elevator}`} />
            <Kv label="Stav jednotky" value={profile.unitCondition} />
            <Kv label="Zamýšlené využití" value={profile.intendedUse} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={pdfStyles.h3}>Chybí ověřit</Text>
            {profile.missingDocs.map((item) => (
              <Text key={item} style={pdfStyles.body}>· {item}</Text>
            ))}
          </View>
        </View>
        <SectionTitle>Historie není budoucí předpoklad</SectionTitle>
        <View style={pdfStyles.cardRow}>
          <View style={pdfStyles.card}>
            <Text style={pdfStyles.cardLabel}>Historie podkladu</Text>
            <Text style={pdfStyles.cardValue}>
              {vacancy.historicalEmptyMonths}/{vacancy.historicalHorizonMonths} ={" "}
              {formatModelPct(vacancy.historicalRate, 2)}
            </Text>
          </View>
          <View style={pdfStyles.card}>
            <Text style={pdfStyles.cardLabel}>Budoucí předpoklad modelu</Text>
            <Text style={pdfStyles.cardValue}>
              {formatModelPct(vacancy.futureAssumptionRate, 0)}
            </Text>
          </View>
        </View>
        <Text style={pdfStyles.body}>{vacancy.futureAssumptionReasonCs}</Text>
        <Kv
          label="Měsíční výsledek při budoucím předpokladu 5 %"
          value={`${formatModelCzk(vacancy.monthlyCashFlowAtFutureAssumptionCzk, 0)}/měs.`}
        />
        <Kv
          label="Měsíční výsledek při historických 4/36"
          value={`${formatModelCzk(vacancy.monthlyCashFlowAtHistoricalRateCzk, 0)}/měs.`}
        />
        <Text style={pdfStyles.muted}>{vacancy.noteCs}</Text>
        {bundle.documents
          .filter((doc) => doc.id === "doc-svj" || doc.id === "doc-occupancy")
          .map((doc) => <DocumentFinding key={doc.id} doc={doc} />)}
      </Shell>

      {/* 4 */}
      <Shell variant={variant} generatedAt={generatedAt}>
        <ChapterTitle n={3} title="Kupní cena vůči nabídkám" />
        <PdfMarketScatter data={saleScatter.data} meta={saleScatter.meta} />
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "34%" }]}>Nabídka</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "12%" }]}>m²</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "20%" }]}>Cena</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "18%" }]}>Cena/m²</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "16%" }]}>Zdroj</Text>
        </View>
        {bundle.saleListings.map((listing) => (
          <View key={listing.id} style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.cell, { width: "34%" }]}>{listing.label}</Text>
            <Text style={[pdfStyles.cell, { width: "12%" }]}>{listing.areaM2}</Text>
            <Text style={[pdfStyles.cell, { width: "20%" }]}>
              {formatModelCzk(listing.priceOrRentCzk, 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "18%" }]}>
              {formatModelCzk(listing.pricePerM2Czk, 0)}
            </Text>
            <View style={{ width: "16%" }}><ListingLink listing={listing} /></View>
          </View>
        ))}
        <Kv label="Modelová cena/m²" value={formatModelCzk(modelPsm, 0)} />
        <Kv
          label="Pásmo zahrnutých nabídek"
          value={`${formatModelCzk(Math.min(...salePsm), 0)}–${formatModelCzk(Math.max(...salePsm), 0)}/m²`}
        />
        <Text style={pdfStyles.body}>
          Nízká cena sama o sobě není potvrzením výhodné koupě. Bez prohlídky,
          listu vlastnictví a podkladů domu může odrážet riziko, které model nevidí.
        </Text>
      </Shell>

      {/* 5 */}
      <Shell variant={variant} generatedAt={generatedAt}>
        <ChapterTitle n={4} title="Nájem vůči nabídkám" />
        <PdfMarketScatter data={rentScatter.data} meta={rentScatter.meta} />
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "34%" }]}>Nabídka</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "12%" }]}>m²</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "20%" }]}>Nájem</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "18%" }]}>Nájem/m²</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "16%" }]}>Zdroj</Text>
        </View>
        {bundle.rentListings.map((listing) => (
          <View key={listing.id} style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.cell, { width: "34%" }]}>{listing.label}</Text>
            <Text style={[pdfStyles.cell, { width: "12%" }]}>{listing.areaM2}</Text>
            <Text style={[pdfStyles.cell, { width: "20%" }]}>
              {formatModelCzk(listing.priceOrRentCzk, 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "18%" }]}>
              {formatModelCzk(listing.pricePerM2Czk, 0)}
            </Text>
            <View style={{ width: "16%" }}><ListingLink listing={listing} /></View>
          </View>
        ))}
        <Kv
          label="Upravený model"
          value={`${formatModelCzk(adjusted.inputs.monthlyRentCzk, 0)}/měs.`}
        />
        <Kv
          label="Nabídkové pásmo"
          value={`${formatModelCzk(Math.min(...rentValues), 0)}–${formatModelCzk(Math.max(...rentValues), 0)}/měs.`}
        />
        <FindingBox
          podklad={`Veřejné nabídky k ${LISTINGS_ACCESS_DATE}`}
          zjisteni="Zvolený nájem leží uvnitř pásma, ale byt bez výtahu nelze bez dalšího srovnávat s horním okrajem."
          dopad="Pro základní výpočet je použitelný, nikoli garantovaný."
          overit="Aktuální nabídky stejného stavu, patra a vybavení; dosažené nájmy po vyjednání."
        />
      </Shell>

      {/* 6 */}
      <Shell variant={variant} generatedAt={generatedAt}>
        <ChapterTitle n={5} title="Vstupní rozpočet a měsíční tok" />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <BudgetTable lines={closing} title="Vedlejší náklady koupě" />
          </View>
          <View style={{ flex: 1 }}>
            <BudgetTable lines={fitout} title="Nutné úpravy a vybavení" />
          </View>
        </View>
        <Kv
          label="Vedlejší náklady a nutné úpravy celkem"
          value={formatModelCzk(closingSum + fitoutSum, 0)}
        />
        <SectionTitle>Jak vzniká měsíční výsledek</SectionTitle>
        <PdfWaterfallChart steps={waterfallSteps} />
        <Text style={pdfStyles.body}>
          Vodopád používá pouze upravený model po zpracování podkladů. Výsledek
          je {formatModelCzk(adjustedMonthly, 0)}/měs.
        </Text>
      </Shell>

      {/* 7 */}
      <Shell variant={variant} generatedAt={generatedAt}>
        <ChapterTitle n={6} title="Scénáře a citlivost" />
        <PdfScenarioBars
          values={bundle.scenarios.map((scenario) => ({
            label: scenario.label,
            value: scenario.monthlyCashFlowCzk,
            emphasize: scenario.id === "base",
          }))}
        />
        <PdfSensitivityHeatmap
          rows={bundle.sensitivity.rents}
          columns={bundle.sensitivity.rates}
          cells={bundle.sensitivity.cells.map((cell) => ({
            rowValue: cell.monthlyRentCzk,
            columnValue: cell.annualRatePercent,
            valueCzk: cell.monthlyCashFlowCzk,
          }))}
          currentRow={adjusted.inputs.monthlyRentCzk}
          currentColumn={adjusted.inputs.annualRatePercent}
          meta={{
            id: "sensitivity",
            questionCs: "Kdy se měsíční výsledek překlopí?",
            unitCs: "Kč/měs.",
            periodCs: "Nájem a sazba na upravených vstupech",
            interpretationCs:
              "Zelená pole jsou kladná, červená záporná; zlatý rámeček označuje základ.",
            assumptionsCs: [],
          }}
        />
        <Text style={pdfStyles.muted}>
          Každá buňka mění nájem a sazbu, ostatní upravené vstupy zůstávají stejné.
        </Text>
      </Shell>

      {/* 8 */}
      <Shell variant={variant} generatedAt={generatedAt}>
        <ChapterTitle n={7} title="Co nejvíc mění výsledek" />
        <PdfTornadoChart data={tornado.data} meta={tornado.meta} />
        <SectionTitle>Výpadek nájmu čtený správně</SectionTitle>
        <Text style={pdfStyles.body}>
          Historický podklad ukazuje {vacancy.historicalEmptyMonths} prázdné
          měsíce z {vacancy.historicalHorizonMonths}, tedy{" "}
          {formatModelPct(vacancy.historicalRate, 2)}. Budoucích{" "}
          {formatModelPct(vacancy.futureAssumptionRate, 0)} je samostatný,
          příznivější předpoklad modelu a podklad jej nepotvrzuje.
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <BudgetTable lines={operating} title="Roční náklady vlastníka" />
          </View>
          <View style={{ flex: 1 }}>
            <BudgetTable lines={extraordinary} title="Mimořádná rizika" />
          </View>
        </View>
      </Shell>

      {/* 9 */}
      <Shell variant={variant} generatedAt={generatedAt}>
        <ChapterTitle n={8} title="Ustojí rezerva souvislý stres?" />
        <Text style={pdfStyles.body}>{liquidity.noteCs}</Text>
        <PdfReservePathChart data={reservePath.data} meta={reservePath.meta} />
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "12%" }]}>Měsíc</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Začátek</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Výdaje</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Doplnění</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Konec</Text>
        </View>
        {liquidity.path
          .filter((row) => row.month <= 5 || row.month === 12)
          .map((row) => (
            <View key={row.month} style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.cell, { width: "12%" }]}>{row.month}</Text>
              <Text style={[pdfStyles.cell, { width: "22%" }]}>
                {formatModelCzk(row.openingCzk, 0)}
              </Text>
              <Text style={[pdfStyles.cell, { width: "22%" }]}>
                {formatModelCzk(row.outflowCzk, 0)}
              </Text>
              <Text style={[pdfStyles.cell, { width: "22%" }]}>
                {formatModelCzk(row.investorInflowCzk, 0)}
              </Text>
              <Text style={[pdfStyles.cell, { width: "22%" }]}>
                {formatModelCzk(row.closingCzk, 0)}
              </Text>
            </View>
          ))}
        <Kv
          label="Potřebné dodatečné peníze"
          value={formatModelCzk(liquidity.extraCapitalNeededCzk, 0)}
        />
        <Text style={pdfStyles.muted}>{liquidity.rebuildNoteCs}</Text>
      </Shell>

      {/* 10 */}
      <Shell variant={variant} generatedAt={generatedAt}>
        <ChapterTitle n={9} title="Dlouhodobě: bez refixace a s refixací" />
        <PdfRefixCompareChart data={refixCompare.data} meta={refixCompare.meta} />
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "12%" }]}>Rok</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Nájem</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Bez refixace</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>S refixací</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Rozdíl</Text>
        </View>
        {[1, 5, 6, 10].map((year) => {
          const noRefix = bundle.longTermNoRefix[year - 1]!;
          const withRefix = bundle.longTermWithRefix[year - 1]!;
          return (
            <View key={year} style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.cell, { width: "12%" }]}>{year}</Text>
              <Text style={[pdfStyles.cell, { width: "22%" }]}>
                {formatModelCzk(withRefix.rentCzk, 0)}
              </Text>
              <Text style={[pdfStyles.cell, { width: "22%" }]}>
                {formatModelCzk(noRefix.netCfCzk, 0)}
              </Text>
              <Text style={[pdfStyles.cell, { width: "22%" }]}>
                {formatModelCzk(withRefix.netCfCzk, 0)}
              </Text>
              <Text style={[pdfStyles.cell, { width: "22%" }]}>
                {formatModelCzk(withRefix.netCfCzk - noRefix.netCfCzk, 0)}
              </Text>
            </View>
          );
        })}
        <Text style={pdfStyles.body}>
          Srovnání drží stejné upravené vstupy a odděluje samotný dopad nové
          splátky. Nejde o totéž jako jednorázový izolovaný test níže.
        </Text>
      </Shell>

      {/* 11 */}
      <Shell variant={variant} generatedAt={generatedAt}>
        <ChapterTitle n={10} title="Dva různé pohledy na refixaci" />
        <View style={{ flexDirection: "row", gap: 8 }}>
          {[bundle.refixIsolated, bundle.refixConnected].map((scenario) => (
            <View key={scenario.id} style={[pdfStyles.card, { flex: 1 }]}>
              <Text style={pdfStyles.h3}>{scenario.label}</Text>
              <Text style={pdfStyles.muted}>{scenario.descriptionCs}</Text>
              <Kv label="Nájem při testu" value={formatModelCzk(scenario.rentAtRefixCzk, 0)} />
              <Kv label="Zůstatek úvěru" value={formatModelCzk(scenario.balanceAtRefixCzk, 0)} />
              <Kv label="Původní splátka" value={formatModelCzk(scenario.basePaymentCzk, 0)} />
              <Kv label="Nová splátka" value={formatModelCzk(scenario.shockedPaymentCzk, 0)} />
              <Kv
                label="Měsíční výsledek po refixaci"
                value={`${formatModelCzk(scenario.monthlyCashFlowAfterRefixCzk, 0)}/měs.`}
              />
            </View>
          ))}
        </View>
        <FindingBox
          podklad="Izolovaný test sazby a navazující model v pátém roce"
          zjisteni={`Izolovaný výsledek je ${formatModelCzk(bundle.refixIsolated.monthlyCashFlowAfterRefixCzk, 0)}/měs.; navazující výsledek ${formatModelCzk(bundle.refixConnected.monthlyCashFlowAfterRefixCzk, 0)}/měs.`}
          dopad="Výsledky nelze zaměnit: navazující varianta zahrnuje nájem dosažený v čase, izolovaná nikoli."
          overit="Nabídku banky před koncem fixace a reálně dosažený nájem."
        />
        <Text style={pdfStyles.body}>
          Dlouhodobá časová řada na předchozí straně navíc ukazuje průběh po
          jednotlivých letech. Tyto dvě karty vysvětlují význam obou testů.
        </Text>
      </Shell>

      {/* 12 */}
      <Shell variant={variant} generatedAt={generatedAt}>
        <ChapterTitle n={11} title="Jak se vyvíjí dluh a vlastní kapitál" />
        <PdfEquityDebtChart data={equityDebt.data} meta={equityDebt.meta} />
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "14%" }]}>Rok</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "29%" }]}>Hodnota</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "28%" }]}>Dluh</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "29%" }]}>Vlastní kapitál</Text>
        </View>
        {[1, 5, 10].map((year) => {
          const row = bundle.longTermWithRefix[year - 1]!;
          return (
            <View key={year} style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.cell, { width: "14%" }]}>{year}</Text>
              <Text style={[pdfStyles.cell, { width: "29%" }]}>
                {formatModelCzk(row.propertyValueCzk, 0)}
              </Text>
              <Text style={[pdfStyles.cell, { width: "28%" }]}>
                {formatModelCzk(row.loanBalanceCzk, 0)}
              </Text>
              <Text style={[pdfStyles.cell, { width: "29%" }]}>
                {formatModelCzk(row.equityCzk, 0)}
              </Text>
            </View>
          );
        })}
        <Text style={pdfStyles.muted}>
          Hodnota nemovitosti je modelový předpoklad, nikoli budoucí odhad ceny
          konkrétního bytu. Dluh vychází z upraveného financování a refixace.
        </Text>
      </Shell>

      {/* 13 */}
      <Shell variant={variant} generatedAt={generatedAt}>
        <ChapterTitle n={12} title="Prodej a základní vypořádání po 5 letech" />
        <PdfSaleSettlementCharts
          sale={saleChart.data}
          settlement={baseSettlementChart.data}
          saleMeta={saleChart.meta}
          settlementMeta={{
            ...baseSettlementChart.meta,
            questionCs: "Základní vypořádání po 5 letech",
            interpretationCs:
              "Provozní výsledek se projevil v konečné rezervě a nepřičítá se podruhé.",
          }}
        />
        <SectionTitle>Základní historie bez úvodního stresu</SectionTitle>
        <SettlementRows settlement={bundle.settlementY5} />
        <Text style={pdfStyles.body}>
          Uvolňuje se pouze rezerva, která v základní historii skutečně zbývá v
          okamžiku prodeje:{" "}
          {formatModelCzk(bundle.settlementY5.reserveReleasedCzk, 0)}.
        </Text>
        <Text style={pdfStyles.muted}>{bundle.settlementY5.excludedCs}</Text>
      </Shell>

      {/* 14 */}
      <Shell variant={variant} generatedAt={generatedAt}>
        <ChapterTitle n={13} title="Stresové vypořádání po 5 letech" />
        <Text style={pdfStyles.body}>{liquidity.noteCs}</Text>
        <PdfSaleSettlementCharts
          sale={saleChart.data}
          settlement={stressSettlementChart.data}
          saleMeta={saleChart.meta}
          settlementMeta={{
            ...stressSettlementChart.meta,
            questionCs: "Vypořádání po úvodním stresu",
            interpretationCs:
              "Po stresu se nevrací automaticky původních 150 000 Kč. Uvolní se jen skutečný konečný zůstatek.",
          }}
        />
        <SectionTitle>Stresová historie: 4 měsíce bez nájmu a oprava</SectionTitle>
        <SettlementRows settlement={bundle.settlementStressY5} />
        <Kv
          label="Rozdíl proti základní historii"
          value={formatModelCzk(
            bundle.settlementStressY5.totalResultBeforeTaxCzk -
              bundle.settlementY5.totalResultBeforeTaxCzk,
            0
          )}
        />
        <Text style={pdfStyles.body}>
          Základní a stresová historie jsou zobrazeny odděleně. Každá používá
          vlastní konečný zůstatek rezervy; žádná nevrací původní rezervu bez
          jejího skutečného obnovení.
        </Text>
      </Shell>

      {/* 15 */}
      <Shell variant={variant} generatedAt={generatedAt}>
        <ChapterTitle n={14} title="Rizika a doporučený další krok" />
        {[
          [
            "1. Skutečný stav domu a jednotky",
            "Nízká cena vůči nabídkám může skrývat technické nebo právní omezení.",
            "Doplnit list vlastnictví, prohlídku a zápisy SVJ.",
          ],
          [
            "2. Souvislý výpadek nájmu a oprava",
            `${liquidity.noteCs} Potřebné dodatečné peníze jsou ${formatModelCzk(liquidity.extraCapitalNeededCzk, 0)}.`,
            "Držet dostupnou likviditu mimo běžný účet investice.",
          ],
          [
            "3. Refixace",
            `Po refixaci vychází navazující měsíční výsledek ${formatModelCzk(bundle.refixConnected.monthlyCashFlowAfterRefixCzk, 0)}.`,
            "Vyžádat nabídku banky s předstihem a připravit variantu mimořádné splátky.",
          ],
          [
            "4. Budoucí obsazenost",
            `Historie je ${formatModelPct(vacancy.historicalRate, 2)}, zatímco model předpokládá ${formatModelPct(vacancy.futureAssumptionRate, 0)}.`,
            "Budoucích 5 % považovat za předpoklad, ne za potvrzený údaj.",
          ],
        ].map(([title, impact, verify]) => (
          <View key={title} style={pdfStyles.finding} wrap={false}>
            <Text style={pdfStyles.h3}>{title}</Text>
            <Text style={pdfStyles.body}>{impact}</Text>
            <Text style={pdfStyles.body}>
              <Text style={pdfStyles.findingLabel}>Další krok: </Text>{verify}
            </Text>
          </View>
        ))}
        <SectionTitle>Závěr k modelovému zadání</SectionTitle>
        <Text style={pdfStyles.body}>
          Nájem je v pásmu veřejných nabídek, ale upravený provoz je záporný.
          Kupní cena je proti nabídkám nízká a vyžaduje důkladné ověření.
          Investice zároveň potřebuje rezervu na průběžný doplatek, souvislé
          prázdno, opravu a případnou vyšší splátku po refixaci.
        </Text>
      </Shell>

      {/* 16 */}
      <Shell variant={variant} generatedAt={generatedAt}>
        <ChapterTitle n={15} title="Zdroje, metodika a rozsah" />
        <Text style={pdfStyles.body}>
          Výpočty: model {CONTROL_MODEL_VERSION}; případ {CASE_STUDY_VERSION};
          společný výpočetní model webu i PDF (bez paralelního enginu).
        </Text>
        <SectionTitle>Veřejné nabídky</SectionTitle>
        {[...bundle.saleListings, ...bundle.rentListings].map((listing) => (
          <View key={`source-${listing.id}`} wrap={false}>
            <Text style={pdfStyles.body}>
              · {listing.label} — {formatModelCzk(listing.priceOrRentCzk, 0)} ·
              přístup {listing.accessDate}
            </Text>
            {listing.url ? (
              <Link
                src={listing.url}
                style={{ fontSize: 6.5, color: PDF_BRAND.teal, marginBottom: 2 }}
              >
                {listing.url}
              </Link>
            ) : null}
          </View>
        ))}
        <SectionTitle>Rozsah služby</SectionTitle>
        <Text style={pdfStyles.body}>
          Individuální rozbor ({formatAnalysisPrice()}) přidává k digitálnímu
          výpočtu ({formatDigitalRentgenPrice()}) práci s podklady, veřejné
          nabídky s URL, stres likvidity, oddělené pohledy na refixaci a
          vypořádání investice.
        </Text>
        <Text style={pdfStyles.h3}>Co služba není</Text>
        <Text style={pdfStyles.body}>
          Znalecký posudek, právní stanovisko, technická prohlídka, schválení
          úvěru, daňové poradenství ani garance budoucího výnosu.
        </Text>
        <Text style={pdfStyles.muted}>
          Modelový byt nemá konkrétní adresu. Podklady jsou demonstrační.
          Nabídkové ceny nejsou uzavřené transakce. Daně z příjmů a výnos z
          volné hotovosti nejsou zahrnuty.
        </Text>
      </Shell>
    </Document>
  );
}

export async function renderPremiumCaseStudyPdfBuffer(
  generatedAt = new Date().toISOString().slice(0, 10)
): Promise<Buffer> {
  ensureRentgenPdfFonts();
  const bundle = buildCaseStudyBundle(undefined, generatedAt);
  const buffer = await renderToBuffer(<PremiumDocument bundle={bundle} />);
  return Buffer.from(buffer);
}

/** Ensure the control model remains available for sample checks. */
export function getPremiumSampleModel() {
  return runControlModel();
}
