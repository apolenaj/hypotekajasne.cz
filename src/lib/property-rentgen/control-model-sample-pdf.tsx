/**
 * Digital sample PDF (999 Kč) — ~8 A4 pages from control model + case study.
 */

import { Document, Page, Text, View, renderToBuffer } from "@react-pdf/renderer";
import {
  CONTROL_MODEL_VERSION,
  formatModelCzk,
  formatModelPct,
  runControlModel,
  type ControlModelInputs,
  type ControlModelResult,
} from "@/lib/property-rentgen/control-model";
import { buildCaseStudyBundle } from "@/lib/property-rentgen/case-study-analytics";
import { formatDigitalRentgenPrice } from "@/lib/property-rentgen/pricing";
import {
  FindingBox,
  Kv,
  PdfFooter,
  PdfHeader,
  PdfScenarioBars,
  PdfWaterfallChart,
  ensureRentgenPdfFonts,
  pdfStyles,
} from "@/lib/property-rentgen/pdf-brand";

function waterfallSteps(model: ControlModelResult) {
  const steps = model.monthlyWaterfall;
  const rent = steps.find((s) => s.key === "rent")!;
  const net = steps.find((s) => s.key === "net")!;
  const middles = steps.filter((s) => s.key !== "rent" && s.key !== "net");
  return [
    {
      key: rent.key,
      label: rent.label,
      deltaCzk: rent.amountCzk,
      kind: "start" as const,
    },
    ...middles.map((m) => ({
      key: m.key,
      label: m.label,
      deltaCzk: m.amountCzk,
      kind: "delta" as const,
    })),
    {
      key: net.key,
      label: net.label,
      deltaCzk: net.amountCzk,
      kind: "total" as const,
    },
  ];
}

function DigitalDocument({
  model,
  generatedAt,
  documentKind,
}: {
  model: ControlModelResult;
  generatedAt: string;
  documentKind: "demo" | "customer";
}) {
  const bundle = buildCaseStudyBundle(model.inputs, generatedAt);
  const scenarios = bundle.scenarios;
  const badge =
    documentKind === "demo"
      ? "MODELOVÝ PŘÍKLAD — AUTOMATICKÝ RENTGEN"
      : "VÝPOČET Z VAŠICH VSTUPŮ — NE LIDSKÝ ROZBOR";
  const variant = `Automatický model ${formatDigitalRentgenPrice()}`;
  const cfRound = Math.round(model.monthlyCashFlowCzk);

  return (
    <Document
      title={`Investiční rentgen ${formatDigitalRentgenPrice()} (${CONTROL_MODEL_VERSION})`}
      author="Hypotéka Jasně"
      subject="Automatický modelový výstup — ne individuální rozbor"
    >
      {/* 1 Cover + KPIs */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter
          generatedAt={generatedAt}
          version={CONTROL_MODEL_VERSION}
          variant={variant}
        />
        <Text style={pdfStyles.badge}>{badge}</Text>
        <Text style={pdfStyles.h1}>Investiční rentgen — automatický model</Text>
        <Text style={pdfStyles.lead}>
          {documentKind === "demo"
            ? "Smyšlená nemovitost, přesně spočtené vstupy. Nejde o tržní nabídku ani ověřený rozbor."
            : "Výpočet z vámi zadaných čísel a modelových provozních předpokladů."}
        </Text>
        <Text style={pdfStyles.h2}>
          {cfRound < 0
            ? `Měsíčně doplácíte přibližně ${Math.abs(cfRound).toLocaleString("cs-CZ")} Kč.`
            : cfRound > 0
              ? `Měsíčně vám zbývá přibližně ${cfRound.toLocaleString("cs-CZ")} Kč.`
              : "Měsíční peněžní tok vychází přibližně na nulu."}
        </Text>
        <Text style={pdfStyles.body}>{model.baseConclusionCs}</Text>
        <View style={pdfStyles.cardRow}>
          {[
            [
              "Vlastní hotovost vč. rezervy",
              formatModelCzk(model.totalOwnCashIncludingReserveCzk),
            ],
            ["Měsíční tok", formatModelCzk(cfRound)],
            ["Hrubý výnos / kupní cena", formatModelPct(model.grossYieldOnPurchase, 2)],
            [
              "Provozní výnos / pořízení",
              formatModelPct(model.operatingYieldOnAcquisition, 2),
            ],
          ].map(([label, value]) => (
            <View key={label} style={pdfStyles.card}>
              <Text style={pdfStyles.cardLabel}>{label}</Text>
              <Text style={pdfStyles.cardValue}>{value}</Text>
            </View>
          ))}
        </View>
        <Text style={pdfStyles.muted}>
          Hrubý výnos = roční potenciální nájem / kupní cena. Provozní výnos po
          rezervě = přebytek po rezervě / pořizovací investice{" "}
          {formatModelCzk(model.totalAcquisitionCostCzk)}. Tok je před daní z
          příjmů. Toto PDF není lidsky prověřený rozbor.
        </Text>
      </Page>

      {/* 2 Inputs + budget */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter
          generatedAt={generatedAt}
          version={CONTROL_MODEL_VERSION}
          variant={variant}
        />
        <Text style={pdfStyles.h2}>Vstupy a jejich původ</Text>
        <Kv label="Plocha" value={`${model.inputs.areaM2} m² · zadáno v modelu`} />
        <Kv
          label="Kupní cena"
          value={`${formatModelCzk(model.inputs.purchasePriceCzk)} · zadáno`}
        />
        <Kv
          label="Úpravy / vedlejší / rezerva"
          value={`${formatModelCzk(model.inputs.initialFitOutCzk)} / ${formatModelCzk(model.inputs.closingCostsCzk)} / ${formatModelCzk(model.inputs.cashReserveCzk)}`}
        />
        <Kv
          label="Úvěr / sazba / splatnost"
          value={`${formatModelCzk(model.inputs.loanAmountCzk)} · ${model.inputs.annualRatePercent} % · ${model.inputs.termYears} let`}
        />
        <Kv
          label="Nájem bez záloh"
          value={`${formatModelCzk(model.inputs.monthlyRentCzk)} / měs.`}
        />
        <Kv
          label="Výpadek / správa"
          value={`${model.inputs.vacancyRate * 100} % / ${model.inputs.managementFeeRate * 100} % · modelový předpoklad`}
        />
        <Text style={pdfStyles.h2}>Rozpočet pořízení a hotovosti</Text>
        <Kv
          label="Celková pořizovací investice (bez držené rezervy)"
          value={formatModelCzk(model.totalAcquisitionCostCzk)}
        />
        <Kv
          label="Vlastní část kupní ceny"
          value={formatModelCzk(model.equityTowardPurchaseCzk)}
        />
        <Kv
          label="Celkem vlastní hotovost včetně rezervy"
          value={formatModelCzk(model.totalOwnCashIncludingReserveCzk)}
        />
        <Text style={pdfStyles.muted}>
          Oddělená rezerva není součástí pořizovací investice v jmenovateli
          provozního výnosu.
        </Text>
      </Page>

      {/* 3 Waterfall */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter
          generatedAt={generatedAt}
          version={CONTROL_MODEL_VERSION}
          variant={variant}
        />
        <Text style={pdfStyles.h2}>Rozklad měsíčního výsledku</Text>
        <PdfWaterfallChart steps={waterfallSteps(model)} />
        {model.monthlyWaterfall.map((w) => (
          <Kv key={w.key} label={w.label} value={formatModelCzk(w.amountCzk, 0)} />
        ))}
        <Text style={pdfStyles.muted}>
          Splátka úvěru zahrnuje úrok i umoření. Umoření není peněžní příjem na
          účet. Daň z příjmů není započtena.
        </Text>
      </Page>

      {/* 4 Scenarios */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter
          generatedAt={generatedAt}
          version={CONTROL_MODEL_VERSION}
          variant={variant}
        />
        <Text style={pdfStyles.h2}>Tři modelové situace</Text>
        <PdfScenarioBars
          values={scenarios.map((s) => ({
            label: s.label,
            value: s.monthlyCashFlowCzk,
            emphasize: s.id === "base",
          }))}
        />
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "18%" }]}>Scénář</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "16%" }]}>Nájem</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "14%" }]}>Výpadek</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "14%" }]}>Sazba</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "19%" }]}>Splátka</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "19%" }]}>Tok</Text>
        </View>
        {scenarios.map((s) => (
          <View key={s.id} style={pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.cell, { width: "18%" }]}>{s.label}</Text>
            <Text style={[pdfStyles.cell, { width: "16%" }]}>
              {formatModelCzk(s.monthlyRentCzk)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "14%" }]}>
              {s.vacancyRate * 100} %
            </Text>
            <Text style={[pdfStyles.cell, { width: "14%" }]}>
              {s.annualRatePercent} %
            </Text>
            <Text style={[pdfStyles.cell, { width: "19%" }]}>
              {formatModelCzk(s.monthlyPaymentCzk, 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "19%" }]}>
              {formatModelCzk(s.monthlyCashFlowCzk, 0)}
            </Text>
          </View>
        ))}
        <Text style={pdfStyles.muted}>
          Scénáře srovnávají počáteční podmínky — ne predikci ani pravděpodobnost.
        </Text>
      </Page>

      {/* 5 Sensitivity */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter
          generatedAt={generatedAt}
          version={CONTROL_MODEL_VERSION}
          variant={variant}
        />
        <Text style={pdfStyles.h2}>Citlivost: nájem × sazba</Text>
        <Text style={pdfStyles.muted}>
          Buňky = měsíční peněžní tok (Kč). Výpadek a správa jako v základu.
          Nejvíce výsledek táhne výše nájmu a sazba úvěru.
        </Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "20%" }]}>
            Nájem \ sazba
          </Text>
          {bundle.sensitivity.rates.map((r) => (
            <Text
              key={r}
              style={[pdfStyles.tableHeaderCell, { width: "20%" }]}
            >
              {r} %
            </Text>
          ))}
        </View>
        {bundle.sensitivity.rents.map((rent) => (
          <View key={rent} style={pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.cell, { width: "20%", fontWeight: 700 }]}>
              {formatModelCzk(rent)}
            </Text>
            {bundle.sensitivity.rates.map((rate) => {
              const cell = bundle.sensitivity.cells.find(
                (c) =>
                  c.monthlyRentCzk === rent && c.annualRatePercent === rate
              );
              return (
                <Text key={`${rent}-${rate}`} style={[pdfStyles.cell, { width: "20%" }]}>
                  {formatModelCzk(cell?.monthlyCashFlowCzk ?? 0, 0)}
                </Text>
              );
            })}
          </View>
        ))}
        <Text style={pdfStyles.h2}>Bod zvratu a cenové podmínky</Text>
        <Kv
          label="Nájem pro nulový tok"
          value={`${formatModelCzk(model.rentForZeroCashFlowCzk, 0)} / měs.`}
        />
        <Kv
          label="Cenová hranice nulového toku (úvěr 70 % ceny)"
          value={formatModelCzk(model.purchasePriceForZeroCashFlowAt70LoanCzk, 0)}
        />
        <Text style={pdfStyles.muted}>
          Cenová hranice modelu ≠ tržní hodnota. Úvěr se v tomto výpočtu mění s
          70 % kupní ceny.
        </Text>
      </Page>

      {/* 6 Financing sample */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter
          generatedAt={generatedAt}
          version={CONTROL_MODEL_VERSION}
          variant={variant}
        />
        <Text style={pdfStyles.h2}>Financování — prvních 12 měsíců</Text>
        <Text style={pdfStyles.body}>
          Splacená jistina za rok:{" "}
          {formatModelCzk(model.principalPaidFirst12MonthsCzk, 0)}. Jistina není
          příjem na účet.
        </Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "12%" }]}>Měs.</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Úrok</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Umoření</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Splátka</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Zůstatek</Text>
        </View>
        {model.first12Months.map((m) => (
          <View key={m.month} style={pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.cell, { width: "12%" }]}>{m.month}</Text>
            <Text style={[pdfStyles.cell, { width: "22%" }]}>
              {formatModelCzk(m.interestCzk, 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "22%" }]}>
              {formatModelCzk(m.principalCzk, 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "22%" }]}>
              {formatModelCzk(m.paymentCzk, 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "22%" }]}>
              {formatModelCzk(m.closingBalanceCzk, 0)}
            </Text>
          </View>
        ))}
      </Page>

      {/* 7 Interpretation */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter
          generatedAt={generatedAt}
          version={CONTROL_MODEL_VERSION}
          variant={variant}
        />
        <Text style={pdfStyles.h2}>Stručná interpretace</Text>
        <FindingBox
          podklad="Automatický model ze zadaných vstupů"
          zjisteni={`Potřebujete cca ${formatModelCzk(model.totalOwnCashIncludingReserveCzk)} na začátku; měsíčně ${cfRound < 0 ? "doplácíte" : "zbývá"} ${formatModelCzk(Math.abs(cfRound))}.`}
          dopad="Výsledek nejvíce ovlivní výše nájmu, sazba a délka neobsazenosti."
          overit="Skutečné SVJ náklady, dosažitelný nájem, technický stav — zde neověřeno."
        />
        <Text style={pdfStyles.h3}>Co automatický model neověřuje</Text>
        <Text style={pdfStyles.body}>
          · List vlastnictví a věcná břemena{"\n"}
          · Technickou prohlídku{"\n"}
          · Aktuální místní nabídky se zdrojem{"\n"}
          · Dodané smlouvy a předpis plateb
        </Text>
        <Text style={pdfStyles.muted}>
          Tyto body patří do individuálního rozboru po dodání podkladů.
        </Text>
      </Page>

      {/* 8 Methodology */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter
          generatedAt={generatedAt}
          version={CONTROL_MODEL_VERSION}
          variant={variant}
        />
        <Text style={pdfStyles.h2}>Metodika a omezení</Text>
        <Text style={pdfStyles.body}>
          Verze modelu: {CONTROL_MODEL_VERSION}. Datum: {generatedAt}.
        </Text>
        <Text style={pdfStyles.body}>
          Anuita z jistiny, sazby a splatnosti. Provozní přebytek po rezervě =
          inkasovaný nájem − správa − ostatní roční náklady. Poměr úvěru ke
          kupní ceně není bankovní LTV. Nezapočtena daň z příjmů, poplatky za
          úvěr, výnos rezervy ani náklady prodeje.
        </Text>
        <Text style={pdfStyles.h3}>Co PDF není</Text>
        <Text style={pdfStyles.body}>
          Není investiční doporučení, znalecký posudek, nabídka banky ani
          ověřený právní/technický stav. Budoucí výnos není garantován.
        </Text>
        <Text style={pdfStyles.h3}>Rozsah služby {formatDigitalRentgenPrice()}</Text>
        <Text style={pdfStyles.body}>
          Automatický výstup z vašich čísel: hotovost, cash flow, scénáře,
          citlivost, bod zvratu a PDF. Bez lidské kontroly nabídek a dokumentů.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderDigitalSamplePdfBuffer(
  model: ControlModelResult = runControlModel(),
  documentKind: "demo" | "customer" = "demo"
): Promise<Buffer> {
  ensureRentgenPdfFonts();
  const generatedAt = new Date().toISOString().slice(0, 10);
  const buffer = await renderToBuffer(
    <DigitalDocument
      model={model}
      generatedAt={generatedAt}
      documentKind={documentKind}
    />
  );
  return Buffer.from(buffer);
}

/** @deprecated alias — use renderDigitalSamplePdfBuffer */
export async function renderControlModelSamplePdfBuffer(
  model: ControlModelResult = runControlModel(),
  documentKind: "demo" | "customer" = "demo"
): Promise<Buffer> {
  return renderDigitalSamplePdfBuffer(model, documentKind);
}

export async function renderCustomerModelPdfBuffer(
  inputs: ControlModelInputs
): Promise<Buffer> {
  return renderDigitalSamplePdfBuffer(runControlModel(inputs), "customer");
}

export { DIGITAL_SAMPLE_PAGE_COUNT } from "@/lib/property-rentgen/sample-pdf-meta";
