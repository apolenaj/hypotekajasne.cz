/**
 * Premium model case-study PDF (~25–28 A4 pages) — individual analysis demo.
 * Driven by buildCaseStudyBundle(); no invented official documents.
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
  type MarketListing,
  type ModelDocument,
} from "@/lib/property-rentgen/case-study-analytics";
import {
  formatAnalysisPrice,
  formatDigitalRentgenPrice,
} from "@/lib/property-rentgen/pricing";
import {
  FindingBox,
  Kv,
  PDF_BRAND,
  PdfFooter,
  PdfHeader,
  PdfScenarioBars,
  PdfWaterfallChart,
  ensureRentgenPdfFonts,
  pdfStyles,
} from "@/lib/property-rentgen/pdf-brand";
import { legalOperator } from "@/config/legal";
import { PREMIUM_SAMPLE_PAGE_COUNT } from "@/lib/property-rentgen/sample-pdf-meta";

export { PREMIUM_SAMPLE_PAGE_COUNT };

function waterfallSteps(bundle: CaseStudyBundle) {
  const steps = bundle.adjustedModel.monthlyWaterfall;
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

function hostFromUrl(url: string | null): string {
  if (!url) return "—";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.slice(0, 28);
  }
}

function sumBudget(lines: BudgetLine[], category: BudgetLine["category"]) {
  return lines
    .filter((l) => l.category === category)
    .reduce((s, l) => s + l.amountCzk, 0);
}

function Shell({
  variant,
  gen,
  children,
}: {
  variant: string;
  gen: string;
  children: ReactNode;
}) {
  return (
    <Page size="A4" style={pdfStyles.page}>
      <PdfHeader subtitle={variant} />
      <PdfFooter
        generatedAt={gen}
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

function SectionTitle({ title }: { title: string }) {
  return <Text style={pdfStyles.h2}>{title}</Text>;
}

function ListingLink({ listing }: { listing: MarketListing }) {
  if (!listing.url) {
    return <Text style={pdfStyles.cell}>—</Text>;
  }
  return (
    <Link src={listing.url} style={[pdfStyles.cell, { color: PDF_BRAND.teal }]}>
      {hostFromUrl(listing.url)}
    </Link>
  );
}

function BudgetTable({
  lines,
  title,
}: {
  lines: BudgetLine[];
  title: string;
}) {
  const total = lines.reduce((s, l) => s + l.amountCzk, 0);
  return (
    <View>
      <Text style={pdfStyles.h3}>{title}</Text>
      <View style={pdfStyles.tableHeader}>
        <Text style={[pdfStyles.tableHeaderCell, { width: "34%" }]}>Položka</Text>
        <Text style={[pdfStyles.tableHeaderCell, { width: "18%" }]}>Částka</Text>
        <Text style={[pdfStyles.tableHeaderCell, { width: "20%" }]}>Načasování</Text>
        <Text style={[pdfStyles.tableHeaderCell, { width: "28%" }]}>Nejistota</Text>
      </View>
      {lines.map((l) => (
        <View key={l.id} style={pdfStyles.tableRow} wrap={false}>
          <Text style={[pdfStyles.cell, { width: "34%" }]}>{l.label}</Text>
          <Text style={[pdfStyles.cell, { width: "18%" }]}>
            {formatModelCzk(l.amountCzk, 0)}
          </Text>
          <Text style={[pdfStyles.cell, { width: "20%" }]}>{l.timing}</Text>
          <Text style={[pdfStyles.cell, { width: "28%" }]}>{l.uncertainty}</Text>
        </View>
      ))}
      <Kv label="Součet kategorie" value={formatModelCzk(total, 0)} />
    </View>
  );
}

function DocDeltaBlock({ doc }: { doc: ModelDocument }) {
  return (
    <View style={pdfStyles.finding} wrap={false}>
      <Text style={pdfStyles.h3}>{doc.title}</Text>
      <Text style={pdfStyles.muted}>{doc.kindLabel}</Text>
      <Text style={pdfStyles.body}>
        <Text style={pdfStyles.findingLabel}>Říká: </Text>
        {doc.says}
      </Text>
      <Text style={pdfStyles.body}>
        <Text style={pdfStyles.findingLabel}>Mezera oproti zadání: </Text>
        {doc.originalModelGap}
      </Text>
      <Text style={pdfStyles.body}>
        <Text style={pdfStyles.findingLabel}>Pro vlastníka: </Text>
        {doc.relevantForOwner}
      </Text>
      <Kv
        label="Měsíční delta (před -> po)"
        value={
          doc.amountDeltaMonthlyCzk === 0
            ? "0 Kč/měs."
            : `${doc.amountDeltaMonthlyCzk > 0 ? "+" : ""}${formatModelCzk(doc.amountDeltaMonthlyCzk, 0)}/měs.`
        }
      />
      <Kv
        label="Jednorázová delta"
        value={
          doc.amountDeltaOneOffCzk === 0
            ? "0 Kč"
            : `${doc.amountDeltaOneOffCzk > 0 ? "+" : ""}${formatModelCzk(doc.amountDeltaOneOffCzk, 0)}`
        }
      />
      <Text style={pdfStyles.muted}>{doc.disclaimer}</Text>
    </View>
  );
}

function PremiumDocument({ bundle }: { bundle: CaseStudyBundle }) {
  const orig = bundle.originalModel;
  const adj = bundle.adjustedModel;
  const profile = bundle.profile;
  const variant = `Individuální rozbor ${formatAnalysisPrice()}`;
  const gen = bundle.generatedAt;
  const cfOrig = Math.round(orig.monthlyCashFlowCzk);
  const cfAdj = Math.round(adj.monthlyCashFlowCzk);
  const docFindings = bundle.findings.filter((f) => f.fromDocumentWork);
  const topDocFindings = docFindings.slice(0, 3);
  const salePsm = bundle.saleListings.map((l) => l.pricePerM2Czk);
  const rentVals = bundle.rentListings.map((l) => l.priceOrRentCzk);
  const modelPsm = Math.round(orig.pricePerM2Czk);
  const closing = bundle.budgets.filter((b) => b.category === "closing");
  const fitout = bundle.budgets.filter((b) => b.category === "fitout");
  const opex = bundle.budgets.filter((b) => b.category === "opex");
  const extra = bundle.budgets.filter((b) => b.category === "extraordinary");
  const closingSum = sumBudget(bundle.budgets, "closing");
  const fitoutSum = sumBudget(bundle.budgets, "fitout");
  const opexSum = sumBudget(bundle.budgets, "opex");
  const extraSum = sumBudget(bundle.budgets, "extraordinary");
  const liq = bundle.combinedLiquidity;
  const sensCells = bundle.sensitivity.cells;
  const rates = bundle.sensitivity.rates;
  const rents = bundle.sensitivity.rents;

  const cashNeedBase = adj.totalOwnCashIncludingReserveCzk;
  const cashNeedStress = cashNeedBase + liq.extraCapitalNeededCzk;

  return (
    <Document
      title={`Individuální rozbor — ${CASE_STUDY_LABEL_CS}`}
      author="Hypotéka Jasně"
      subject="Modelový individuální rozbor — demonstrační případ Brno-Židenice"
    >
      {/* 1 Cover */}
      <Shell variant={variant} gen={gen}>
        <Text style={pdfStyles.badge}>
          MODELOVÁ UKÁZKA — BRNO-ŽIDENICE · {formatAnalysisPrice()}
        </Text>
        <Text style={pdfStyles.h1}>Individuální rozbor nemovitosti</Text>
        <Text style={pdfStyles.lead}>{CASE_STUDY_LABEL_CS}</Text>
        <Kv label="Varianta služby" value={`Individuální rozbor · ${formatAnalysisPrice()}`} />
        <Kv label="Datum generování" value={gen} />
        <Kv label="Verze případu" value={CASE_STUDY_VERSION} />
        <Kv label="Verze control modelu" value={CONTROL_MODEL_VERSION} />
        <Kv label="Identifikátor" value={bundle.caseId} />
        <SectionTitle title="Označení a omezení" />
        <Text style={pdfStyles.body}>{profile.disclaimerCs}</Text>
        <Text style={pdfStyles.body}>
          Podklady označené jako „modelový podklad“ nejsou skutečné výpisy SVJ,
          faktury ani zápisy ze schůze. Veřejné nabídky mají URL a datum přístupu
          {` ${LISTINGS_ACCESS_DATE}`} — jde o nabídkové ceny, ne o uzavřené
          transakce ani o tržní průměr.
        </Text>
        <Text style={pdfStyles.muted}>
          Provozovatel: {legalOperator.companyName}, IČO {legalOperator.ico}
        </Text>
        <Text style={pdfStyles.muted}>
          Cílová hustota: {bundle.pageTargets.premium}. Digitální vrstva:{" "}
          {bundle.pageTargets.digital}.
        </Text>
      </Shell>

      {/* 2 Decision summary A */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={1} title="Rozhodovací shrnutí (1/2)" />
        <Text style={pdfStyles.h2}>
          {cfAdj < 0
            ? `Po zpracování podkladů: měsíčně doplácíte cca ${Math.abs(cfAdj).toLocaleString("cs-CZ")} Kč.`
            : `Po zpracování podkladů: měsíčně zbývá cca ${cfAdj.toLocaleString("cs-CZ")} Kč.`}
        </Text>
        <Text style={pdfStyles.body}>
          Původní zadání (před podklady):{" "}
          {cfOrig < 0
            ? `doplatek cca ${Math.abs(cfOrig).toLocaleString("cs-CZ")} Kč/měs.`
            : `přebytek cca ${cfOrig.toLocaleString("cs-CZ")} Kč/měs.`}{" "}
          Upravený model (po SVJ a fit-outu):{" "}
          {cfAdj < 0
            ? `doplatek cca ${Math.abs(cfAdj).toLocaleString("cs-CZ")} Kč/měs.`
            : `přebytek cca ${cfAdj.toLocaleString("cs-CZ")} Kč/měs.`}{" "}
          Rozdíl: {formatModelCzk(cfAdj - cfOrig, 0)} Kč/měs. (před / po).
        </Text>
        <Text style={pdfStyles.body}>{adj.baseConclusionCs}</Text>
        <View style={pdfStyles.cardRow}>
          {(
            [
              [
                "Hotovost vč. rezervy (po)",
                formatModelCzk(adj.totalOwnCashIncludingReserveCzk, 0),
              ],
              ["Měsíční tok (po)", formatModelCzk(cfAdj, 0)],
              ["Hrubý výnos (po)", formatModelPct(adj.grossYieldOnPurchase, 2)],
              [
                "Provozní výnos (po)",
                formatModelPct(adj.operatingYieldOnAcquisition, 2),
              ],
            ] as const
          ).map(([l, v]) => (
            <View key={l} style={pdfStyles.card}>
              <Text style={pdfStyles.cardLabel}>{l}</Text>
              <Text style={pdfStyles.cardValue}>{v}</Text>
            </View>
          ))}
        </View>
        <SectionTitle title="Top 3 zjištění z práce s podklady" />
        {topDocFindings.map((f) => (
          <FindingBox
            key={f.id}
            podklad={f.podklad}
            zjisteni={f.zjisteni}
            dopad={f.dopad}
            overit={f.overit}
          />
        ))}
      </Shell>

      {/* 3 Decision summary B */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={1} title="Rozhodovací shrnutí (2/2)" />
        <SectionTitle title="Co individuální rozbor přidává oproti automatickému modelu" />
        {bundle.whatPremiumAddsCs.map((line) => (
          <Text key={line} style={pdfStyles.body}>
            · {line}
          </Text>
        ))}
        <SectionTitle title="Největší neznámé (stav podkladů)" />
        <Text style={pdfStyles.body}>
          Chybí: {profile.missingDocs.join("; ")}. Bez těchto položek nelze
          potvrdit právní ani technický stav ani bankovní podmínky.
        </Text>
        <Text style={pdfStyles.body}>
          K dispozici (modelové): {profile.availableDocs.join("; ")}.
        </Text>
        <SectionTitle title="Potřeba hotovosti — základ a stres" />
        <Kv
          label="Základ (vlastní hotovost vč. rezervy, po úpravě)"
          value={formatModelCzk(cashNeedBase, 0)}
        />
        <Kv
          label="Doplnění z kombinované likvidity (prázdno + oprava)"
          value={formatModelCzk(liq.extraCapitalNeededCzk, 0)}
        />
        <Kv
          label="Celkem základ + stresové doplnění"
          value={formatModelCzk(cashNeedStress, 0)}
        />
        <Text style={pdfStyles.muted}>
          Střecha (~60 tis.) je samostatné riziko mimo automatické krytí rezervy
          — viz kapitola rizik a vypořádání.
        </Text>
        <SectionTitle title="Orientační odpověď na krátké otázky" />
        <Text style={pdfStyles.body}>
          · Drží cash-flow? Po podkladech spíš ne — doplatek cca{" "}
          {formatModelCzk(Math.abs(cfAdj), 0)}/měs. (kap. 12–13).{"\n"}
          · Je 4,2 mil. v souladu s nabídkami? Modelové Kč/m²{" "}
          {modelPsm.toLocaleString("cs-CZ")} leží pod nabídkami{" "}
          {Math.min(...salePsm).toLocaleString("cs-CZ")}–
          {Math.max(...salePsm).toLocaleString("cs-CZ")} Kč/m² (kap. 8–9).{"\n"}
          · Je nájem 20 tis. obhajitelný? Ano uvnitř pásma{" "}
          {Math.min(...rentVals).toLocaleString("cs-CZ")}–
          {Math.max(...rentVals).toLocaleString("cs-CZ")} Kč (kap. 10).
        </Text>
      </Shell>

      {/* 4 TOC */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={2} title="Obsah (orientační stránky)" />
        <Text style={pdfStyles.muted}>
          React-PDF nepodporuje spolehlivé interní odkazy — níže textový rozcestník.
        </Text>
        {(
          [
            ["1", "Titulní list — označení případu, ceny, verze"],
            ["2–3", "Rozhodovací shrnutí před/po, metriky, neznámé, hotovost"],
            ["4", "Obsah"],
            ["5", "Profil bytu, lokalita Židenice, zamýšlené využití"],
            ["6", "Kvalita podkladů — dostupné / chybějící"],
            ["7", "Práce s podklady: SVJ, fit-out, střecha (před -> po)"],
            ["8", "Srovnání prodeje — veřejné nabídky + vyřazené novostavby"],
            ["9", "Vyhodnocení prodeje vs. 4,2 mil. Kč"],
            ["10", "Srovnání a vyhodnocení nájmu"],
            ["11", "Položkové rozpočty (closing, fit-out, opex, mimořádné)"],
            ["12", "Financování a měsíční vodopád (upravený model)"],
            ["13", "Srovnání CF před/po a tři scénáře"],
            ["14", "Citlivost: matice + konkrétní delty"],
            ["15", "Kombinovaná likvidita — tabulka a interpretace"],
            ["16", "Dlouhodobý model: flat vs. rostoucí náklady; časová osa"],
            ["17", "Refixace izolovaná vs. navazující"],
            ["18", "Prodejní varianty a vypořádání investice Y5 / Y10"],
            ["19", "Prioritizovaná rizika"],
            ["20", "Individuální závěr k zadání"],
            ["21", "Zdroje (URL)"],
            ["22", "Metodika, rozsah 4 990 vs 999, omezení"],
            ["23–25", "Přílohy: mimořádné položky, plná citlivost, kontrolní součty"],
          ] as const
        ).map(([p, t]) => (
          <View key={p} style={pdfStyles.row} wrap={false}>
            <Text style={[pdfStyles.rowLabel, { flex: 0.22 }]}>s. {p}</Text>
            <Text style={[pdfStyles.rowValue, { flex: 0.78, textAlign: "left" }]}>
              {t}
            </Text>
          </View>
        ))}
      </Shell>

      {/* 5 Profile + locality */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={3} title="Profil bytu, lokalita a využití" />
        <Kv label="Označení" value={profile.labelCs} />
        <Kv label="Dispozice / plocha" value={`${profile.disposition} · ${profile.areaM2} m²`} />
        <Kv label="Lokalita" value={profile.locality} />
        <Kv label="Patro / výtah" value={`${profile.floor} · výtah: ${profile.elevator}`} />
        <Kv label="Balkon / sklep / parkování" value={`${profile.balcony} · ${profile.cellar} · ${profile.parking}`} />
        <Kv label="Stav domu" value={profile.buildingCondition} />
        <Kv label="Stav jednotky" value={profile.unitCondition} />
        <Kv label="Vybavení" value={profile.furnishing} />
        <Kv label="Zamýšlené využití" value={profile.intendedUse} />
        <Kv label="Plánované práce" value={profile.plannedWorks} />
        <Kv
          label="Kupní cena (vstup)"
          value={formatModelCzk(orig.inputs.purchasePriceCzk, 0)}
        />
        <Kv
          label="Modelové Kč/m²"
          value={`${modelPsm.toLocaleString("cs-CZ")} Kč/m²`}
        />
        <SectionTitle title="Lokalita Brno-Židenice (kontext)" />
        <Text style={pdfStyles.body}>
          Židenice jsou zvoleny proto, že veřejné nabídky 2+kk jsou dohledatelné
          s URL. Modelový byt nemá konkrétní adresu — srovnání slouží k pásmu
          nabídkových cen/nájmů, ne k ocenění konkrétní jednotky.
        </Text>
        <FindingBox
          podklad="Profil případu + veřejné nabídky"
          zjisteni="Byt bez výtahu ve starším cihlovém domě patří spíš do spodní poloviny místního nabídkového pásma než k novostavbám Nové Zbrojovky."
          dopad="Nelze bez prohlídky přenést horní nabídkové Kč/m² na modelovou kupní cenu 4,2 mil."
          overit="Skutečná adresa, hluk, orientace, stav společných částí."
        />
      </Shell>

      {/* 6 Documents quality */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={4} title="Kvalita podkladů a vstupů" />
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "26%" }]}>Údaj</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "24%" }]}>Hodnota</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "25%" }]}>Původ</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "25%" }]}>Stav</Text>
        </View>
        {(
          [
            [
              "Kupní cena",
              formatModelCzk(orig.inputs.purchasePriceCzk, 0),
              "zadáno v modelu",
              "neověřeno z kupní smlouvy",
            ],
            [
              "Nájem",
              formatModelCzk(orig.inputs.monthlyRentCzk, 0),
              "zadáno v modelu",
              "pásmo z veřejných nabídek",
            ],
            [
              "SVJ / dům (před)",
              `${formatModelCzk(orig.inputs.ownerBuildingCostsAnnualCzk / 12, 0)}/měs.`,
              "zadáno v modelu",
              "nahrazeno podkladem",
            ],
            [
              "SVJ / dům (po)",
              `${formatModelCzk(adj.inputs.ownerBuildingCostsAnnualCzk / 12, 0)}/měs.`,
              "modelový předpis",
              "ne ověřený výpis SVJ",
            ],
            [
              "Fit-out (před -> po)",
              `${formatModelCzk(orig.inputs.initialFitOutCzk, 0)} -> ${formatModelCzk(adj.inputs.initialFitOutCzk, 0)}`,
              "modelový rozpočet",
              "volitelný nábytek vyřazen",
            ],
            ["List vlastnictví", "—", "—", "chybí"],
            ["Technická prohlídka", "—", "—", "neprovedena"],
            ["Bankovní podmínky", "modelová sazba", "zadáno v modelu", "nepotvrzeno bankou"],
            [
              "Srovnání nabídek",
              `${bundle.saleListings.length}+${bundle.rentListings.length} URL`,
              "verejna_nabidka",
              `přístup ${LISTINGS_ACCESS_DATE}`,
            ],
          ] as const
        ).map(([a, b, c, d]) => (
          <View key={a} style={pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.cell, { width: "26%" }]}>{a}</Text>
            <Text style={[pdfStyles.cell, { width: "24%" }]}>{b}</Text>
            <Text style={[pdfStyles.cell, { width: "25%" }]}>{c}</Text>
            <Text style={[pdfStyles.cell, { width: "25%" }]}>{d}</Text>
          </View>
        ))}
        <SectionTitle title="Dostupné (modelové) podklady" />
        {profile.availableDocs.map((d) => (
          <Text key={d} style={pdfStyles.body}>
            · {d}
          </Text>
        ))}
        <SectionTitle title="Chybějící podklady" />
        {profile.missingDocs.map((d) => (
          <Text key={d} style={pdfStyles.body}>
            · {d}
          </Text>
        ))}
        <Text style={pdfStyles.muted}>
          Váš vstup automaticky neoznačujeme jako ověřený ze zdroje.
        </Text>
      </Shell>

      {/* 7 Document deep-dive */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={5} title="Práce s podklady: před / po" />
        <Text style={pdfStyles.body}>
          Níže tři klíčové modelové podklady (SVJ, fit-out, střecha). Čtvrtý
          (neobsazenost) neposouvá měsíční delta, ale potvrzuje stresový scénář
          prázdna — viz likvidita.
        </Text>
        {bundle.documents
          .filter((d) => d.id === "doc-svj" || d.id === "doc-fitout" || d.id === "doc-roof")
          .map((d) => (
            <DocDeltaBlock key={d.id} doc={d} />
          ))}
        <Kv
          label="Souhrn: měsíční tok před -> po"
          value={`${formatModelCzk(cfOrig, 0)} -> ${formatModelCzk(cfAdj, 0)} / měs.`}
        />
        <Kv
          label="Souhrn: vlastní hotovost před -> po"
          value={`${formatModelCzk(orig.totalOwnCashIncludingReserveCzk, 0)} -> ${formatModelCzk(adj.totalOwnCashIncludingReserveCzk, 0)}`}
        />
      </Shell>

      {/* 8 Sale comps */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={6} title="Srovnání prodeje — veřejné nabídky" />
        <Text style={pdfStyles.body}>
          Provenience: verejna_nabidka. Datum přístupu: {LISTINGS_ACCESS_DATE}.
          Částky jsou nabídkové, ne uzavřené prodeje.
        </Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "28%" }]}>Nabídka</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "10%" }]}>m²</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "16%" }]}>Cena</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "14%" }]}>Kč/m²</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "16%" }]}>Zdroj</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "16%" }]}>Limit</Text>
        </View>
        {bundle.saleListings.map((l) => (
          <View key={l.id} style={pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.cell, { width: "28%" }]}>{l.label}</Text>
            <Text style={[pdfStyles.cell, { width: "10%" }]}>{l.areaM2}</Text>
            <Text style={[pdfStyles.cell, { width: "16%" }]}>
              {formatModelCzk(l.priceOrRentCzk, 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "14%" }]}>
              {l.pricePerM2Czk.toLocaleString("cs-CZ")}
            </Text>
            <View style={{ width: "16%" }}>
              <ListingLink listing={l} />
            </View>
            <Text style={[pdfStyles.cell, { width: "16%" }]}>
              {l.comparabilityLimit.slice(0, 42)}
              {l.comparabilityLimit.length > 42 ? "…" : ""}
            </Text>
          </View>
        ))}
        <SectionTitle title="Vyřazené nabídky (novostavby / jiný segment)" />
        {bundle.excludedListings.map((l) => (
          <View key={l.id} wrap={false}>
            <Text style={pdfStyles.body}>
              · {l.label} — {formatModelCzk(l.priceOrRentCzk, 0)} (
              {l.pricePerM2Czk.toLocaleString("cs-CZ")} Kč/m²).{" "}
              {l.excludeReason}
            </Text>
            {l.url ? (
              <Link src={l.url} style={{ fontSize: 7.5, color: PDF_BRAND.teal }}>
                {hostFromUrl(l.url)}
              </Link>
            ) : null}
          </View>
        ))}
        <Text style={pdfStyles.muted}>
          Novostavby záměrně neaveragujeme do „tržní“ ceny modelu.
        </Text>
      </Shell>

      {/* 9 Sale evaluation */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={7} title="Vyhodnocení prodeje vs. 4,2 mil. Kč" />
        <Kv
          label="Modelová kupní cena"
          value={formatModelCzk(orig.inputs.purchasePriceCzk, 0)}
        />
        <Kv label="Modelové Kč/m² (60 m²)" value={`${modelPsm.toLocaleString("cs-CZ")} Kč/m²`} />
        <Kv
          label="Nabídkové Kč/m² (zahrnuté)"
          value={`${Math.min(...salePsm).toLocaleString("cs-CZ")}–${Math.max(...salePsm).toLocaleString("cs-CZ")} Kč/m²`}
        />
        {bundle.findings
          .filter((f) => f.id === "f-market-sale")
          .map((f) => (
            <FindingBox
              key={f.id}
              podklad={f.podklad}
              zjisteni={f.zjisteni}
              dopad={f.dopad}
              overit={f.overit}
            />
          ))}
        <SectionTitle title="Implikace pro investiční rozhodnutí" />
        <Text style={pdfStyles.body}>
          1. Pokud je modelový byt srovnatelný s Gajdošovou / Mikšíčkovou,
          zadaná cena 4,2 mil. je agresivně nízká — ověřit, zda nejde o
          podhodnocení rizika (stav, břemena, SVJ).{"\n"}
          2. Pokud je bližší Ševčíkově (původní stav, menší m²), pásmo je
          relevantnější, ale 50 m² a podmínka půdy limitují přenos.{"\n"}
          3. Vyřazená novostavba (~135 tis. Kč/m²) nesmí táhnout „průměr nahoru“.
          {"\n"}
          4. Bez prohlídky a LV nejde rozhodnout mezi „výhodnou koupí“ a
          „skrytým rizikem“.
        </Text>
        <Text style={pdfStyles.body}>
          Proč zahrnuto: {bundle.saleListings.map((l) => l.includeReason).join(" · ")}
        </Text>
      </Shell>

      {/* 10 Rent comps + eval */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={8} title="Srovnání a vyhodnocení nájmu" />
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "26%" }]}>Nabídka</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "10%" }]}>m²</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "14%" }]}>Nájem</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "12%" }]}>Kč/m²</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "18%" }]}>Služby</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "20%" }]}>Zdroj</Text>
        </View>
        {bundle.rentListings.map((l) => (
          <View key={l.id} style={pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.cell, { width: "26%" }]}>{l.label}</Text>
            <Text style={[pdfStyles.cell, { width: "10%" }]}>{l.areaM2}</Text>
            <Text style={[pdfStyles.cell, { width: "14%" }]}>
              {formatModelCzk(l.priceOrRentCzk, 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "12%" }]}>
              {l.pricePerM2Czk.toLocaleString("cs-CZ")}
            </Text>
            <Text style={[pdfStyles.cell, { width: "18%" }]}>
              {l.servicesIncluded.slice(0, 36)}
              {l.servicesIncluded.length > 36 ? "…" : ""}
            </Text>
            <View style={{ width: "20%" }}>
              <ListingLink listing={l} />
            </View>
          </View>
        ))}
        <Kv
          label="Modelový nájem (volba)"
          value={formatModelCzk(adj.inputs.monthlyRentCzk, 0)}
        />
        <Kv
          label="Nabídkové pásmo"
          value={`${Math.min(...rentVals).toLocaleString("cs-CZ")}–${Math.max(...rentVals).toLocaleString("cs-CZ")} Kč/měs.`}
        />
        {bundle.findings
          .filter((f) => f.id === "f-market-rent")
          .map((f) => (
            <FindingBox
              key={f.id}
              podklad={f.podklad}
              zjisteni={f.zjisteni}
              dopad={f.dopad}
              overit={f.overit}
            />
          ))}
        <Text style={pdfStyles.body}>
          Volba 20 000 Kč: leží uvnitř pásma a blízko Bělohorské (20 400 Kč),
          ale modelový byt je bez výtahu — horní okraj Letní (24 000 Kč) je
          nadstandard a do základu se nepromítá. Služby jdou zvlášť.
        </Text>
      </Shell>

      {/* 11 Budgets */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={9} title="Položkové rozpočty" />
        <BudgetTable lines={closing} title="Closing / vedlejší při koupi" />
        <BudgetTable lines={fitout} title="Úpravy a vybavení (fit-out)" />
        <Kv
          label="Kontrola: closing + fit-out (jednorázově při vstupu)"
          value={formatModelCzk(closingSum + fitoutSum, 0)}
        />
        <Text style={pdfStyles.muted}>
          Opex níže je roční provoz; mimořádné položky nejsou v základní hotovosti
          automaticky.
        </Text>
        <BudgetTable lines={opex} title="Provozní náklady vlastníka (ročně)" />
        <Kv label="Součet opex (rok)" value={formatModelCzk(opexSum, 0)} />
        <Kv
          label="Součet mimořádných (orientace)"
          value={formatModelCzk(extraSum, 0)}
        />
      </Shell>

      {/* 12 Financing + waterfall */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={10} title="Financování a měsíční vodopád" />
        <Text style={pdfStyles.body}>
          Čísla níže = upravený model po dokumentech (SVJ 2 800 Kč/měs., fit-out
          145 tis.).
        </Text>
        <Kv label="Kupní cena" value={formatModelCzk(adj.inputs.purchasePriceCzk, 0)} />
        <Kv label="Úvěr" value={formatModelCzk(adj.inputs.loanAmountCzk, 0)} />
        <Kv
          label="Sazba / splatnost"
          value={`${adj.inputs.annualRatePercent.toLocaleString("cs-CZ")} % p.a. · ${adj.inputs.termYears} let`}
        />
        <Kv
          label="Měsíční splátka"
          value={formatModelCzk(adj.monthlyPaymentCzk, 0)}
        />
        <Kv
          label="Vlastní kapitál + vedlejší + fit-out + rezerva"
          value={formatModelCzk(adj.totalOwnCashIncludingReserveCzk, 0)}
        />
        <SectionTitle title="Vodopád (upravený model)" />
        <PdfWaterfallChart steps={waterfallSteps(bundle)} />
        <Text style={pdfStyles.muted}>
          Výsledek vodopádu = {formatModelCzk(cfAdj, 0)} Kč/měs. (shoda s
          monthlyCashFlowCzk).
        </Text>
      </Shell>

      {/* 13 Before/after + scenarios */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={11} title="CF před/po a tři scénáře" />
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "34%" }]}>Metrika</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "33%" }]}>Před podklady</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "33%" }]}>Po podkladech</Text>
        </View>
        {(
          [
            [
              "Měsíční tok",
              formatModelCzk(cfOrig, 0),
              formatModelCzk(cfAdj, 0),
            ],
            [
              "Náklady na dům /měs.",
              formatModelCzk(orig.inputs.ownerBuildingCostsAnnualCzk / 12, 0),
              formatModelCzk(adj.inputs.ownerBuildingCostsAnnualCzk / 12, 0),
            ],
            [
              "Fit-out",
              formatModelCzk(orig.inputs.initialFitOutCzk, 0),
              formatModelCzk(adj.inputs.initialFitOutCzk, 0),
            ],
            [
              "Vlastní hotovost vč. rezervy",
              formatModelCzk(orig.totalOwnCashIncludingReserveCzk, 0),
              formatModelCzk(adj.totalOwnCashIncludingReserveCzk, 0),
            ],
            [
              "Hrubý výnos",
              formatModelPct(orig.grossYieldOnPurchase, 2),
              formatModelPct(adj.grossYieldOnPurchase, 2),
            ],
          ] as const
        ).map(([a, b, c]) => (
          <View key={a} style={pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.cell, { width: "34%" }]}>{a}</Text>
            <Text style={[pdfStyles.cell, { width: "33%" }]}>{b}</Text>
            <Text style={[pdfStyles.cell, { width: "33%" }]}>{c}</Text>
          </View>
        ))}
        <SectionTitle title="Scénáře na upravených vstupech" />
        <PdfScenarioBars
          values={bundle.scenarios.map((s) => ({
            label: s.label,
            value: s.monthlyCashFlowCzk,
            emphasize: s.id === "base",
          }))}
        />
        {bundle.scenarios.map((s) => (
          <Kv
            key={s.id}
            label={`${s.label} (nájem ${formatModelCzk(s.monthlyRentCzk, 0)}, sazba ${s.annualRatePercent.toLocaleString("cs-CZ")} %)`}
            value={`${formatModelCzk(Math.round(s.monthlyCashFlowCzk), 0)}/měs.`}
          />
        ))}
      </Shell>

      {/* 14 Sensitivity */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={12} title="Citlivost: matice a konkrétní delty" />
        <Text style={pdfStyles.body}>
          Matice = měsíční tok (Kč) při změně nájmu a sazby na upravených
          vstupech. Žádné vágní tvrzení „nájem je citlivější“ bez čísel.
        </Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "20%" }]}>
            Nájem \ sazba
          </Text>
          {rates.map((r) => (
            <Text
              key={r}
              style={[
                pdfStyles.tableHeaderCell,
                { width: `${80 / rates.length}%` },
              ]}
            >
              {r.toLocaleString("cs-CZ")} %
            </Text>
          ))}
        </View>
        {rents.map((rent) => (
          <View key={rent} style={pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.cell, { width: "20%", fontWeight: 700 }]}>
              {formatModelCzk(rent, 0)}
            </Text>
            {rates.map((rate) => {
              const cell = sensCells.find(
                (c) => c.monthlyRentCzk === rent && c.annualRatePercent === rate
              );
              return (
                <Text
                  key={`${rent}-${rate}`}
                  style={[pdfStyles.cell, { width: `${80 / rates.length}%` }]}
                >
                  {cell
                    ? formatModelCzk(Math.round(cell.monthlyCashFlowCzk), 0)
                    : "—"}
                </Text>
              );
            })}
          </View>
        ))}
        <SectionTitle title="Konkrétní delty (concreteDeltas)" />
        {bundle.sensitivity.concreteDeltas.map((d) => (
          <View key={d.id} wrap={false}>
            <Kv
              label={d.label}
              value={`${d.deltaMonthlyCashFlowCzk >= 0 ? "+" : ""}${formatModelCzk(Math.round(d.deltaMonthlyCashFlowCzk), 0)} Kč/měs. tok`}
            />
            <Text style={pdfStyles.muted}>{d.changeDescriptionCs}</Text>
            {d.deltaPaymentCzk != null ? (
              <Text style={pdfStyles.muted}>
                Delta splátky:{" "}
                {`${d.deltaPaymentCzk >= 0 ? "+" : ""}${formatModelCzk(Math.round(d.deltaPaymentCzk), 0)} Kč/měs.`}
              </Text>
            ) : null}
          </View>
        ))}
      </Shell>

      {/* 15 Liquidity — table + reading on one page */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={13} title="Kombinovaná likvidita — dráha a čtení" />
        <Text style={pdfStyles.body}>{liq.noteCs}</Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "8%" }]}>M</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "15%" }]}>Otevření</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "14%" }]}>Ops+</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "14%" }]}>Inv+</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "14%" }]}>Odtok</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "14%" }]}>Převod*</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "21%" }]}>Zůstatek</Text>
        </View>
        {liq.path.map((row) => (
          <View key={row.month} style={pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.cell, { width: "8%" }]}>{row.month}</Text>
            <Text style={[pdfStyles.cell, { width: "15%" }]}>
              {formatModelCzk(Math.round(row.openingCzk), 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "14%" }]}>
              {formatModelCzk(Math.round(row.opsInflowCzk), 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "14%" }]}>
              {formatModelCzk(Math.round(row.investorInflowCzk), 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "14%" }]}>
              {formatModelCzk(Math.round(row.outflowCzk), 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "14%" }]}>
              {formatModelCzk(Math.round(row.reserveTransferCzk), 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "21%" }]}>
              {formatModelCzk(Math.round(row.closingCzk), 0)}
            </Text>
          </View>
        ))}
        <Text style={pdfStyles.muted}>
          * Převod do kapsy údržby je účetní poznámka — není druhý cash hit navíc
          k odtoku. M1–M3 prázdno; M4 oprava 80 tis.; M5+ opětovný pronájem.
        </Text>
        <Kv
          label="Nejnižší modelový zůstatek (bez doplnění)"
          value={formatModelCzk(Math.round(liq.minReserveCzk), 0)}
        />
        <Kv
          label="Potřebné externí doplnění"
          value={formatModelCzk(Math.round(liq.extraCapitalNeededCzk), 0)}
        />
        <Text style={pdfStyles.body}>
          <Text style={pdfStyles.findingLabel}>Co rezerva kryje: </Text>
          {liq.whatReserveCoversCs}
        </Text>
        <Text style={pdfStyles.body}>
          <Text style={pdfStyles.findingLabel}>Další prázdno: </Text>
          {liq.whatHappensNextVacancyCs}
        </Text>
        <Text style={pdfStyles.body}>
          <Text style={pdfStyles.findingLabel}>Obnova: </Text>
          {liq.rebuildNoteCs}
        </Text>
        {bundle.findings
          .filter((f) => f.id === "f-liquidity")
          .map((f) => (
            <FindingBox
              key={f.id}
              podklad={f.podklad}
              zjisteni={f.zjisteni}
              dopad={f.dopad}
              overit={f.overit}
            />
          ))}
      </Shell>

      {/* 17 Long-term */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={14} title="Dlouhodobý model a časová osa" />
        <Text style={pdfStyles.body}>
          Časová osa: {bundle.timeline.startLabel}. Růst nájmu{" "}
          {(bundle.timeline.rentGrowthPa * 100).toLocaleString("cs-CZ")} % p.a.;
          růst nákladů (varianta grown){" "}
          {(bundle.timeline.costGrowthPa * 100).toLocaleString("cs-CZ")} % p.a.;
          hodnota{" "}
          {(bundle.timeline.valueGrowthPa * 100).toLocaleString("cs-CZ")} % p.a.;
          fixace {bundle.timeline.fixationYears} let; modelová refix. sazba{" "}
          {bundle.timeline.refixRatePercent.toLocaleString("cs-CZ")} %.
        </Text>
        <Text style={pdfStyles.h3}>Flat náklady (nájem roste, opex ne)</Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "10%" }]}>Rok</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "18%" }]}>Nájem</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "18%" }]}>Opex/měs.</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "18%" }]}>CF/měs.</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "18%" }]}>Dluh</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "18%" }]}>Equity</Text>
        </View>
        {bundle.longTermFlatCosts
          .filter((r) => r.year === 1 || r.year === 5 || r.year === 10)
          .map((r) => (
            <View key={`f-${r.year}`} style={pdfStyles.tableRow} wrap={false}>
              <Text style={[pdfStyles.cell, { width: "10%" }]}>{r.year}</Text>
              <Text style={[pdfStyles.cell, { width: "18%" }]}>
                {formatModelCzk(Math.round(r.rentCzk), 0)}
              </Text>
              <Text style={[pdfStyles.cell, { width: "18%" }]}>
                {formatModelCzk(Math.round(r.otherMonthlyCzk), 0)}
              </Text>
              <Text style={[pdfStyles.cell, { width: "18%" }]}>
                {formatModelCzk(Math.round(r.netCfCzk), 0)}
              </Text>
              <Text style={[pdfStyles.cell, { width: "18%" }]}>
                {formatModelCzk(Math.round(r.loanBalanceCzk), 0)}
              </Text>
              <Text style={[pdfStyles.cell, { width: "18%" }]}>
                {formatModelCzk(Math.round(r.equityCzk), 0)}
              </Text>
            </View>
          ))}
        <Text style={pdfStyles.muted}>
          {bundle.longTermFlatCosts[0]?.assumptionsNote}
        </Text>
        <Text style={pdfStyles.h3}>Rostoucí náklady (+2 % p.a. opex)</Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "10%" }]}>Rok</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Nájem</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Opex/měs.</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "23%" }]}>CF flat</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "23%" }]}>CF grown</Text>
        </View>
        {[1, 5, 10].map((y) => {
          const flat = bundle.longTermFlatCosts[y - 1]!;
          const grown = bundle.longTermGrownCosts[y - 1]!;
          return (
            <View key={`g-${y}`} style={pdfStyles.tableRow} wrap={false}>
              <Text style={[pdfStyles.cell, { width: "10%" }]}>{y}</Text>
              <Text style={[pdfStyles.cell, { width: "22%" }]}>
                {formatModelCzk(Math.round(grown.rentCzk), 0)}
              </Text>
              <Text style={[pdfStyles.cell, { width: "22%" }]}>
                {formatModelCzk(Math.round(grown.otherMonthlyCzk), 0)}
              </Text>
              <Text style={[pdfStyles.cell, { width: "23%" }]}>
                {formatModelCzk(Math.round(flat.netCfCzk), 0)}
              </Text>
              <Text style={[pdfStyles.cell, { width: "23%" }]}>
                {formatModelCzk(Math.round(grown.netCfCzk), 0)}
              </Text>
            </View>
          );
        })}
        <Text style={pdfStyles.muted}>
          {bundle.longTermGrownCosts[0]?.assumptionsNote}. Splátka do refixace
          beze změny — viz kapitola 15.
        </Text>
      </Shell>

      {/* 18 Refix */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={15} title="Refixace: izolovaná vs. navazující" />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={pdfStyles.h3}>{bundle.refixIsolated.label}</Text>
            <Text style={pdfStyles.muted}>{bundle.refixIsolated.descriptionCs}</Text>
            <Kv
              label="Nájem při testu"
              value={formatModelCzk(Math.round(bundle.refixIsolated.rentAtRefixCzk), 0)}
            />
            <Kv
              label="Zůstatek úvěru"
              value={formatModelCzk(Math.round(bundle.refixIsolated.balanceAtRefixCzk), 0)}
            />
            <Kv
              label="Splátka před -> po"
              value={`${formatModelCzk(Math.round(bundle.refixIsolated.basePaymentCzk), 0)} -> ${formatModelCzk(Math.round(bundle.refixIsolated.shockedPaymentCzk), 0)}`}
            />
            <Kv
              label={`Sazba šok ${bundle.refixIsolated.shockedRatePercent} %`}
              value={`delta splátky ${formatModelCzk(Math.round(bundle.refixIsolated.paymentDeltaCzk), 0)}`}
            />
            <Kv
              label="CF po refixaci"
              value={formatModelCzk(
                Math.round(bundle.refixIsolated.monthlyCashFlowAfterRefixCzk),
                0
              )}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={pdfStyles.h3}>{bundle.refixConnected.label}</Text>
            <Text style={pdfStyles.muted}>{bundle.refixConnected.descriptionCs}</Text>
            <Kv
              label="Nájem při testu (po 5× +2 %)"
              value={formatModelCzk(Math.round(bundle.refixConnected.rentAtRefixCzk), 0)}
            />
            <Kv
              label="Zůstatek úvěru"
              value={formatModelCzk(Math.round(bundle.refixConnected.balanceAtRefixCzk), 0)}
            />
            <Kv
              label="Splátka před -> po"
              value={`${formatModelCzk(Math.round(bundle.refixConnected.basePaymentCzk), 0)} -> ${formatModelCzk(Math.round(bundle.refixConnected.shockedPaymentCzk), 0)}`}
            />
            <Kv
              label={`Sazba šok ${bundle.refixConnected.shockedRatePercent} %`}
              value={`delta splátky ${formatModelCzk(Math.round(bundle.refixConnected.paymentDeltaCzk), 0)}`}
            />
            <Kv
              label="CF po refixaci"
              value={formatModelCzk(
                Math.round(bundle.refixConnected.monthlyCashFlowAfterRefixCzk),
                0
              )}
            />
          </View>
        </View>
        {bundle.findings
          .filter((f) => f.id === "f-refix")
          .map((f) => (
            <FindingBox
              key={f.id}
              podklad={f.podklad}
              zjisteni={f.zjisteni}
              dopad={f.dopad}
              overit={f.overit}
            />
          ))}
        <Text style={pdfStyles.body}>
          Izolovaný test drží nájem {formatModelCzk(Math.round(bundle.refixIsolated.rentAtRefixCzk), 0)};
          navazující používá {formatModelCzk(Math.round(bundle.refixConnected.rentAtRefixCzk), 0)}.
          Zaměnit je nelze — výsledek CF se liší.
        </Text>
      </Shell>

      {/* 19 Sales + settlement */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={16} title="Prodej a vypořádání investice" />
        <Text style={pdfStyles.body}>
          Čistý výnos z prodeje (netProceedsBeforeTaxCzk) neni rovno celkovému
          výsledku investice — chybí provozní CF, top-upy a uvolnění rezervy.
        </Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "36%" }]}>Scénář</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "16%" }]}>Cena</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "16%" }]}>Náklady</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "16%" }]}>Dluh</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "16%" }]}>Čistý</Text>
        </View>
        {bundle.sales.map((s) => (
          <View key={s.id} style={pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.cell, { width: "36%" }]}>{s.label}</Text>
            <Text style={[pdfStyles.cell, { width: "16%" }]}>
              {formatModelCzk(Math.round(s.assumedSalePriceCzk), 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "16%" }]}>
              {formatModelCzk(Math.round(s.sellingCostsCzk), 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "16%" }]}>
              {formatModelCzk(Math.round(s.loanBalanceCzk), 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "16%" }]}>
              {formatModelCzk(Math.round(s.netProceedsBeforeTaxCzk), 0)}
            </Text>
          </View>
        ))}
        <Text style={pdfStyles.muted}>{bundle.sales[0]?.notes}</Text>
        <SectionTitle title="Vypořádání Y5 (total result neni rovno jen prodeji)" />
        <Kv
          label="Vstupní hotovost"
          value={formatModelCzk(Math.round(bundle.settlementY5.initialOwnCashCzk), 0)}
        />
        <Kv
          label="Kumulovaný provozní CF"
          value={formatModelCzk(
            Math.round(bundle.settlementY5.cumulativeOperatingCashCzk),
            0
          )}
        />
        <Kv
          label="Investor top-upy"
          value={formatModelCzk(Math.round(bundle.settlementY5.investorTopUpsCzk), 0)}
        />
        <Kv
          label="Čistý prodej před daní"
          value={formatModelCzk(
            Math.round(bundle.settlementY5.saleNetProceedsBeforeTaxCzk),
            0
          )}
        />
        <Kv
          label="Uvolněná rezerva"
          value={formatModelCzk(Math.round(bundle.settlementY5.reserveReleasedCzk), 0)}
        />
        <Kv
          label="Celkový výsledek před daní (Y5)"
          value={formatModelCzk(
            Math.round(bundle.settlementY5.totalResultBeforeTaxCzk),
            0
          )}
        />
        <SectionTitle title="Vypořádání Y10" />
        <Kv
          label="Celkový výsledek před daní (Y10)"
          value={formatModelCzk(
            Math.round(bundle.settlementY10.totalResultBeforeTaxCzk),
            0
          )}
        />
        <Kv
          label="Čistý prodej Y10"
          value={formatModelCzk(
            Math.round(bundle.settlementY10.saleNetProceedsBeforeTaxCzk),
            0
          )}
        />
        <Text style={pdfStyles.muted}>{bundle.settlementY5.excludedCs}</Text>
      </Shell>

      {/* 20 Risks */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={17} title="Prioritizovaná rizika" />
        {(
          [
            [
              "1",
              "SVJ / dům vyšší než zadání",
              `+800 Kč/měs. po předpisu; tok ${formatModelCzk(cfAdj, 0)}/měs.`,
              "Ověřit 12 měsíců předpisů a fond oprav.",
            ],
            [
              "2",
              "Souvislé prázdno + havárie",
              `Doplnění cca ${formatModelCzk(Math.round(liq.extraCapitalNeededCzk), 0)}; průměrný výpadek 5 % nestačí.`,
              "Osobní likvidita mimo modelovou rezervu.",
            ],
            [
              "3",
              "Refixace na vyšší sazbu",
              `Izolovaně CF ${formatModelCzk(Math.round(bundle.refixIsolated.monthlyCashFlowAfterRefixCzk), 0)}; navazující ${formatModelCzk(Math.round(bundle.refixConnected.monthlyCashFlowAfterRefixCzk), 0)}.`,
              "Podmínky banky, mimořádná splátka.",
            ],
            [
              "4",
              "Podíl na střeše",
              `Riziko ~${formatModelCzk(60_000, 0)} do 24 měsíců mimo běžnou údržbu.`,
              "Zápisy SVJ, stav fondu.",
            ],
            [
              "5",
              "Kupní cena vs. nabídky",
              `${modelPsm.toLocaleString("cs-CZ")} Kč/m² vs. nabídky ${Math.min(...salePsm).toLocaleString("cs-CZ")}–${Math.max(...salePsm).toLocaleString("cs-CZ")}.`,
              "Prohlídka + nezávislé ocenění.",
            ],
            [
              "6",
              "Chybějící LV / prohlídka / banka",
              "Právní a technický stav neznámý; sazba modelová.",
              profile.missingDocs.join("; "),
            ],
          ] as const
        ).map(([n, title, impact, verify]) => (
          <View key={n} style={pdfStyles.finding} wrap={false}>
            <Text style={pdfStyles.h3}>
              {n}. {title}
            </Text>
            <Text style={pdfStyles.body}>
              <Text style={pdfStyles.findingLabel}>Dopad: </Text>
              {impact}
            </Text>
            <Text style={pdfStyles.body}>
              <Text style={pdfStyles.findingLabel}>Ověřit: </Text>
              {verify}
            </Text>
          </View>
        ))}
      </Shell>

      {/* 21 Conclusion */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={18} title="Individuální závěr k zadání" />
        <Text style={pdfStyles.body}>{adj.baseConclusionCs}</Text>
        <Text style={pdfStyles.h3}>Odpovědi na otázky briefu (s Kč a odkazy)</Text>
        <Text style={pdfStyles.body}>
          1. Drží měsíční cash-flow? Po podkladech ne — doplatek cca{" "}
          {formatModelCzk(Math.abs(cfAdj), 0)}/měs. (před:{" "}
          {formatModelCzk(cfOrig, 0)}; kap. 5, 11–12).{"\n"}
          2. Kolik hotovosti potřebuji? Základ{" "}
          {formatModelCzk(cashNeedBase, 0)}; se stresem prázdna+opravy{" "}
          {formatModelCzk(cashNeedStress, 0)} (kap. 1, 13).{"\n"}
          3. Je nájem 20 tis. reálný? Uvnitř nabídkového pásma{" "}
          {Math.min(...rentVals).toLocaleString("cs-CZ")}–
          {Math.max(...rentVals).toLocaleString("cs-CZ")} Kč; bez výtahu spíš
          střed než horní okraj (kap. 8).{"\n"}
          4. Je 4,2 mil. v souladu s trhem nabídek? Modelové{" "}
          {modelPsm.toLocaleString("cs-CZ")} Kč/m² je pod zahrnutými nabídkami;
          novostavby vyřazeny (kap. 6–7).{"\n"}
          5. Co zlomí likviditu? 3 měsíce prázdna + oprava 80 tis. — doplnění{" "}
          {formatModelCzk(Math.round(liq.extraCapitalNeededCzk), 0)} (kap. 13).
          {"\n"}
          6. Co udělá refixace? Izolovaně tok{" "}
          {formatModelCzk(
            Math.round(bundle.refixIsolated.monthlyCashFlowAfterRefixCzk),
            0
          )}
          ; s růstem nájmu{" "}
          {formatModelCzk(
            Math.round(bundle.refixConnected.monthlyCashFlowAfterRefixCzk),
            0
          )}{" "}
          (kap. 15).{"\n"}
          7. Stačí prodej jako „výsledek“? Ne — total Y5{" "}
          {formatModelCzk(
            Math.round(bundle.settlementY5.totalResultBeforeTaxCzk),
            0
          )}{" "}
          neni rovno jen čistému prodeji{" "}
          {formatModelCzk(
            Math.round(bundle.settlementY5.saleNetProceedsBeforeTaxCzk),
            0
          )}{" "}
          (kap. 16).
        </Text>
        <FindingBox
          podklad="Celý modelový individuální rozbor"
          zjisteni={`Po dokumentech je provoz ztrátový cca ${formatModelCzk(Math.abs(cfAdj), 0)}/měs.; hlavní rizika jsou SVJ uplift, souvislé prázdno a refixace. Nabídky nájmu 20 tis. nevylučují; nabídky prodeje 4,2 mil. spíš zpochybňují bez prohlídky.`}
          dopad="Bez LV, prohlídky a bankovních podmínek nelze doporučit koupi ani ji vyloučit."
          overit="Doplnit chybějící podklady a přepočítat upravený model."
        />
        <Text style={pdfStyles.h3}>Další postup</Text>
        <Text style={pdfStyles.body}>
          1. Doplnit LV, prohlídku, skutečný předpis SVJ.{"\n"}
          2. Přepočítat provozní náklady a fit-out ze skutečných dokladů.{"\n"}
          3. Ověřit nájem u bytů bez výtahu ve stejném stavu.{"\n"}
          4. Ověřit financování s bankou — model neschvaluje úvěr.
        </Text>
      </Shell>

      {/* 22 Sources */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={19} title="Zdroje a návaznost tvrzení" />
        <Text style={pdfStyles.body}>
          · Výpočty: control model {CONTROL_MODEL_VERSION}; případ{" "}
          {CASE_STUDY_VERSION}; balíček buildCaseStudyBundle().{"\n"}
          · Provozovatel: {legalOperator.companyName}, IČO {legalOperator.ico}.
          {"\n"}
          · Struktura zjištění: podklad / zjištění / dopad / ověřit.
        </Text>
        <SectionTitle title="Veřejné nabídky prodeje (klikací URL)" />
        {bundle.saleListings.map((l) => (
          <View key={`src-s-${l.id}`} wrap={false}>
            <Text style={pdfStyles.body}>
              · {l.label} — {formatModelCzk(l.priceOrRentCzk, 0)} · přístup{" "}
              {l.accessDate}
            </Text>
            {l.url ? (
              <Link src={l.url} style={{ fontSize: 7.5, color: PDF_BRAND.teal, marginBottom: 3 }}>
                {l.url}
              </Link>
            ) : null}
          </View>
        ))}
        <SectionTitle title="Veřejné nabídky pronájmu" />
        {bundle.rentListings.map((l) => (
          <View key={`src-r-${l.id}`} wrap={false}>
            <Text style={pdfStyles.body}>
              · {l.label} — {formatModelCzk(l.priceOrRentCzk, 0)} · přístup{" "}
              {l.accessDate}
            </Text>
            {l.url ? (
              <Link src={l.url} style={{ fontSize: 7.5, color: PDF_BRAND.teal, marginBottom: 3 }}>
                {l.url}
              </Link>
            ) : null}
          </View>
        ))}
        <SectionTitle title="Vyřazené" />
        {bundle.excludedListings.map((l) => (
          <View key={`src-x-${l.id}`} wrap={false}>
            <Text style={pdfStyles.body}>
              · {l.label}: {l.excludeReason}
            </Text>
            {l.url ? (
              <Link src={l.url} style={{ fontSize: 7.5, color: PDF_BRAND.teal }}>
                {l.url}
              </Link>
            ) : null}
          </View>
        ))}
      </Shell>

      {/* 23 Methodology */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={20} title="Metodika, rozsah služby a omezení" />
        <Text style={pdfStyles.h3}>
          Individuální rozbor {formatAnalysisPrice()} vs. digitální{" "}
          {formatDigitalRentgenPrice()}
        </Text>
        <Text style={pdfStyles.body}>
          Digitální vrstva ({formatDigitalRentgenPrice()}): control model,
          scénáře, citlivost, základní závěr — bez dohledání veřejných nabídek s
          URL, bez práce s podklady před/po a bez vypořádání investice.
        </Text>
        <Text style={pdfStyles.body}>
          Individuální rozbor ({formatAnalysisPrice()}): vše z digitální vrstvy
          plus lokalitní profil, veřejné nabídky s URL a datem přístupu, čtyři
          modelové podklady s úpravou vstupů, kombinovaná likvidita, oddělená
          refixace, prodejní vypořádání a komentovaný závěr. Cíl hustoty:{" "}
          {bundle.pageTargets.premium}.
        </Text>
        <Text style={pdfStyles.h3}>Co služba není</Text>
        <Text style={pdfStyles.body}>
          Znalecký posudek, právní stanovisko, technická prohlídka, schválení
          úvěru, garantovaný výnos, daňové poradenství.
        </Text>
        <Text style={pdfStyles.h3}>Omezení této ukázky</Text>
        <Text style={pdfStyles.body}>
          · Modelový byt bez adresy; podklady jsou demonstrační, ne oficiální.
          {"\n"}
          · Nabídky jsou nabídkové ceny — netvoříme z nich „tržní průměr“.{"\n"}
          · Daně z příjmů, poplatky mimo model a výnos z hotovosti nejsou v
          totalResult.{"\n"}
          · Budoucí výnos není garantován.
        </Text>
        <Text style={pdfStyles.h3}>Dodání (orientace)</Text>
        <Text style={pdfStyles.body}>
          Termín se potvrzuje po kontrole rozsahu a podkladů. Oprava zjevně
          chybných vstupů klienta se řeší v rámci objednávky. Online nákup může
          být ve fázi poptávky.
        </Text>
      </Shell>

      {/* 24 Appendix — extraordinary budgets + occupancy doc */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={21} title="Příloha A — mimořádné položky a neobsazenost" />
        <BudgetTable lines={extra} title="Mimořádné / stresové položky" />
        <Kv
          label="Kontrolní součet všech budget řádků"
          value={formatModelCzk(
            closingSum + fitoutSum + opexSum + extraSum,
            0
          )}
        />
        <Text style={pdfStyles.muted}>
          Closing {formatModelCzk(closingSum, 0)} + fit-out{" "}
          {formatModelCzk(fitoutSum, 0)} + opex {formatModelCzk(opexSum, 0)} +
          mimořádné {formatModelCzk(extraSum, 0)}.
        </Text>
        {bundle.documents
          .filter((d) => d.id === "doc-occupancy")
          .map((d) => (
            <DocDeltaBlock key={d.id} doc={d} />
          ))}
        {bundle.findings
          .filter((f) => f.id === "f-fitout" || f.id === "f-roof" || f.id === "f-svj")
          .map((f) => (
            <FindingBox
              key={f.id}
              podklad={`${f.chapter}: ${f.podklad}`}
              zjisteni={f.zjisteni}
              dopad={f.dopad}
              overit={f.overit}
            />
          ))}
      </Shell>

      {/* 25 Appendix — full sensitivity years */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={22} title="Příloha B — dlouhodobý přehled (roky 1–10)" />
        <Text style={pdfStyles.body}>
          Flat-cost varianta (nájem +2 % p.a., opex bez růstu). Vybrané sloupce.
        </Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "8%" }]}>R</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "18%" }]}>Nájem</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "18%" }]}>CF/měs.</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "20%" }]}>Dluh</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "18%" }]}>Hodnota</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "18%" }]}>Equity</Text>
        </View>
        {bundle.longTermFlatCosts.map((r) => (
          <View key={`lt-${r.year}`} style={pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.cell, { width: "8%" }]}>{r.year}</Text>
            <Text style={[pdfStyles.cell, { width: "18%" }]}>
              {formatModelCzk(Math.round(r.rentCzk), 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "18%" }]}>
              {formatModelCzk(Math.round(r.netCfCzk), 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "20%" }]}>
              {formatModelCzk(Math.round(r.loanBalanceCzk), 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "18%" }]}>
              {formatModelCzk(Math.round(r.propertyValueCzk), 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "18%" }]}>
              {formatModelCzk(Math.round(r.equityCzk), 0)}
            </Text>
          </View>
        ))}
      </Shell>

      {/* 26 Appendix — grown costs full + check rows */}
      <Shell variant={variant} gen={gen}>
        <ChapterTitle n={23} title="Příloha C — grown costs a kontrolní řádky" />
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "10%" }]}>Rok</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Opex/měs.</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "23%" }]}>CF grown</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>CF flat</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "23%" }]}>Delta</Text>
        </View>
        {bundle.longTermGrownCosts.map((r, i) => {
          const flat = bundle.longTermFlatCosts[i]!;
          return (
            <View key={`gc-${r.year}`} style={pdfStyles.tableRow} wrap={false}>
              <Text style={[pdfStyles.cell, { width: "10%" }]}>{r.year}</Text>
              <Text style={[pdfStyles.cell, { width: "22%" }]}>
                {formatModelCzk(r.otherMonthlyCzk, 2)}
              </Text>
              <Text style={[pdfStyles.cell, { width: "23%" }]}>
                {formatModelCzk(r.netCfCzk, 2)}
              </Text>
              <Text style={[pdfStyles.cell, { width: "22%" }]}>
                {formatModelCzk(flat.netCfCzk, 2)}
              </Text>
              <Text style={[pdfStyles.cell, { width: "23%" }]}>
                {formatModelCzk(r.netCfCzk - flat.netCfCzk, 2)}
              </Text>
            </View>
          );
        })}
        <SectionTitle title="Kontrolní shody" />
        <Kv
          label="Vodopád net vs. monthlyCashFlowCzk"
          value={`${formatModelCzk(adj.monthlyWaterfall.find((s) => s.key === "net")!.amountCzk, 2)} vs ${formatModelCzk(adj.monthlyCashFlowCzk, 2)}`}
        />
        <Kv
          label="Prodej Y5: cena − náklady − dluh"
          value={formatModelCzk(
            bundle.sales[0]!.assumedSalePriceCzk -
              bundle.sales[0]!.sellingCostsCzk -
              bundle.sales[0]!.loanBalanceCzk,
            2
          )}
        />
        <Kv
          label="= netProceedsBeforeTaxCzk"
          value={formatModelCzk(bundle.sales[0]!.netProceedsBeforeTaxCzk, 2)}
        />
        <Text style={pdfStyles.muted}>
          Konec ukázky individuálního rozboru · {CASE_STUDY_LABEL_CS} ·{" "}
          {formatAnalysisPrice()}
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

/** Ensure control model still drives the premium numbers. */
export function getPremiumSampleModel() {
  return runControlModel();
}
