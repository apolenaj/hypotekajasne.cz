/**
 * Premium model case-study PDF (~30 A4 pages) — individual analysis demo.
 * Synthetic comps are explicitly labeled; no fake official documents.
 */

import { Document, Page, Text, View, renderToBuffer } from "@react-pdf/renderer";
import {
  CONTROL_MODEL_VERSION,
  formatModelCzk,
  formatModelPct,
  otherAnnualCosts,
  runControlModel,
} from "@/lib/property-rentgen/control-model";
import {
  CASE_STUDY_LABEL_CS,
  buildCaseStudyBundle,
  type CaseStudyBundle,
} from "@/lib/property-rentgen/case-study-analytics";
import { formatAnalysisPrice, formatDigitalRentgenPrice } from "@/lib/property-rentgen/pricing";
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
import { legalOperator } from "@/config/legal";
import { PREMIUM_SAMPLE_PAGE_COUNT } from "@/lib/property-rentgen/sample-pdf-meta";

export { PREMIUM_SAMPLE_PAGE_COUNT };

function waterfallSteps(bundle: CaseStudyBundle) {
  const steps = bundle.model.monthlyWaterfall;
  const rent = steps.find((s) => s.key === "rent")!;
  const net = steps.find((s) => s.key === "net")!;
  const middles = steps.filter((s) => s.key !== "rent" && s.key !== "net");
  return [
    { key: rent.key, label: rent.label, deltaCzk: rent.amountCzk, kind: "start" as const },
    ...middles.map((m) => ({
      key: m.key,
      label: m.label,
      deltaCzk: m.amountCzk,
      kind: "delta" as const,
    })),
    { key: net.key, label: net.label, deltaCzk: net.amountCzk, kind: "total" as const },
  ];
}

function ChapterTitle({ n, title }: { n: number; title: string }) {
  return (
    <Text style={pdfStyles.h1}>
      {n}. {title}
    </Text>
  );
}

function PremiumDocument({ bundle }: { bundle: CaseStudyBundle }) {
  const m = bundle.model;
  const variant = `Individuální rozbor ${formatAnalysisPrice()}`;
  const cf = Math.round(m.monthlyCashFlowCzk);
  const gen = bundle.generatedAt;

  return (
    <Document
      title={`Individuální rozbor — ${CASE_STUDY_LABEL_CS}`}
      author="Hypotéka Jasně"
      subject="Modelový individuální rozbor — demonstrační případ"
    >
      {/* 1 Title */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <Text style={pdfStyles.badge}>MODELOVÁ UKÁZKA — SMYŠLENÁ NEMOVITOST</Text>
        <Text style={pdfStyles.h1}>Individuální rozbor nemovitosti</Text>
        <Text style={pdfStyles.lead}>{CASE_STUDY_LABEL_CS}</Text>
        <Kv label="Varianta služby" value={`Individuální rozbor · ${formatAnalysisPrice()}`} />
        <Kv label="Datum" value={gen} />
        <Kv label="Verze modelu" value={CONTROL_MODEL_VERSION} />
        <Kv label="Identifikátor případu" value={bundle.caseId} />
        <Text style={pdfStyles.h2}>Označení</Text>
        <Text style={pdfStyles.body}>
          Tento dokument je modelový podklad vytvořený pro demonstraci analýzy.
          Nejde o ověřený rozbor konkrétní nabídky na trhu. Srovnávací nabídky
          jsou syntetická sada — neprokazují skutečnou cenovou úroveň.
        </Text>
        <Text style={pdfStyles.muted}>
          Provozovatel: {legalOperator.companyName}, IČO {legalOperator.ico}
        </Text>
      </Page>

      {/* 2 Decision summary */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={2} title="Rozhodovací shrnutí" />
        <Text style={pdfStyles.h2}>
          {cf < 0
            ? `Měsíčně doplácíte přibližně ${Math.abs(cf).toLocaleString("cs-CZ")} Kč.`
            : `Měsíčně zbývá přibližně ${cf.toLocaleString("cs-CZ")} Kč.`}
        </Text>
        <Text style={pdfStyles.body}>{m.baseConclusionCs}</Text>
        <View style={pdfStyles.cardRow}>
          {[
            ["Hotovost vč. rezervy", formatModelCzk(m.totalOwnCashIncludingReserveCzk)],
            ["Měsíční tok", formatModelCzk(cf)],
            ["Hrubý výnos", formatModelPct(m.grossYieldOnPurchase, 2)],
            ["Provozní výnos", formatModelPct(m.operatingYieldOnAcquisition, 2)],
          ].map(([l, v]) => (
            <View key={l} style={pdfStyles.card}>
              <Text style={pdfStyles.cardLabel}>{l}</Text>
              <Text style={pdfStyles.cardValue}>{v}</Text>
            </View>
          ))}
        </View>
        <Text style={pdfStyles.h3}>Největší neznámé</Text>
        <Text style={pdfStyles.body}>
          LV a věcná břemena · technický stav · skutečné SVJ platby · dosažitelný
          nájem z veřejných nabídek
        </Text>
        <Text style={pdfStyles.h3}>Co tento rozbor přidává oproti automatickému modelu</Text>
        {bundle.whatPremiumAddsCs.map((line) => (
          <Text key={line} style={pdfStyles.body}>
            · {line}
          </Text>
        ))}
      </Page>

      {/* 3 Property */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={3} title="Popis nemovitosti a využití" />
        <Kv label="Typ" value="Byt · modelový předpoklad" />
        <Kv label="Plocha" value={`${m.inputs.areaM2} m²`} />
        <Kv label="Lokalita" value="Modelová lokalita — bez skutečné adresy" />
        <Kv label="Zamýšlené využití" value="Dlouhodobý pronájem" />
        <Kv label="Kupní cena (vstup)" value={formatModelCzk(m.inputs.purchasePriceCzk)} />
        <FindingBox
          podklad="Zadání modelového případu"
          zjisteni="Byt je veden jako investiční pronájem bez krátkodobé destinace."
          dopad="Výpočty předpokládají stabilní měsíční nájem bez turistického provozu."
          overit="Soulad s domovním řádem SVJ a pravidly krátkodobého pronájmu — neznámo."
        />
      </Page>

      {/* 4 Evidence quality */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={4} title="Přehled podkladů a kvality vstupů" />
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "28%" }]}>Údaj</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "24%" }]}>Hodnota</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "24%" }]}>Původ</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "24%" }]}>Stav</Text>
        </View>
        {(
          [
            ["Kupní cena", formatModelCzk(m.inputs.purchasePriceCzk), "zadáno v modelu", "modelový předpoklad"],
            ["Nájem", formatModelCzk(m.inputs.monthlyRentCzk), "zadáno v modelu", "neověřeno z inzerátu"],
            ["SVJ / dům", formatModelCzk(m.inputs.ownerBuildingCostsAnnualCzk / 12) + "/měs.", "model", "neověřeno"],
            ["List vlastnictví", "—", "—", "chybí"],
            ["Prohlídka", "—", "—", "neprovedena"],
            ["Srovnání nabídek", "syntetická sada", "modelový podklad", "ne tržní průměr"],
          ] as const
        ).map(([a, b, c, d]) => (
          <View key={a} style={pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.cell, { width: "28%" }]}>{a}</Text>
            <Text style={[pdfStyles.cell, { width: "24%" }]}>{b}</Text>
            <Text style={[pdfStyles.cell, { width: "24%" }]}>{c}</Text>
            <Text style={[pdfStyles.cell, { width: "24%" }]}>{d}</Text>
          </View>
        ))}
        <Text style={pdfStyles.muted}>
          Váš vstup automaticky neoznačujeme jako ověřený ze zdroje.
        </Text>
      </Page>

      {/* 5 Locality */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={5} title="Lokalita" />
        <Text style={pdfStyles.body}>
          Pro demonstrační případ používáme obecnou městskou lokalitní logiku bez
          konkrétní adresy. Faktory níže jsou modelové předpoklady, ne zjištění
          z mapy či statistik.
        </Text>
        <FindingBox
          podklad="Modelový předpoklad dostupnosti MHD a občanské vybavenosti"
          zjisteni="Lokalita je klasifikována jako standardní městská — bez prémiového vodního nebo historického premium."
          dopad="Nezdůvodňuje prémii k nájmu nad modelové pásmo."
          overit="Doplnit konkrétní městskou část a dojezdové časy při reálném rozboru."
        />
        <FindingBox
          podklad="Neznámý stav domu / SVJ"
          zjisteni="Plánované investice do společných částí nejsou doloženy."
          dopad="Riziko jednorázového příspěvku nad modelovou rezervu."
          overit="Výpis SVJ a zápisy z posledních schůzí."
        />
      </Page>

      {/* 6 Sale comps */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={6} title="Srovnávací nabídky prodeje" />
        <Text style={pdfStyles.badge}>
          SYNTETICKÁ SROVNÁVACÍ SADA — NEPROKAZUJE TRŽNÍ ÚROVEŇ
        </Text>
        <Text style={pdfStyles.body}>
          Podklad: čtyři modelové nabídky vytvořené pro demonstraci práce se
          srovnáním. Nejsou to existující inzeráty ani realizované prodeje.
        </Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Nabídka</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "10%" }]}>m²</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Cena</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "18%" }]}>Kč/m²</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "28%" }]}>Omezení</Text>
        </View>
        {bundle.saleListings.map((l) => (
          <View key={l.id} style={pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.cell, { width: "22%" }]}>{l.label}</Text>
            <Text style={[pdfStyles.cell, { width: "10%" }]}>{l.areaM2}</Text>
            <Text style={[pdfStyles.cell, { width: "22%" }]}>
              {formatModelCzk(l.priceOrRentCzk)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "18%" }]}>
              {formatModelCzk(l.pricePerM2Czk)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "28%" }]}>{l.notes}</Text>
          </View>
        ))}
        <Text style={pdfStyles.muted}>
          Zdroj u všech řádků: {bundle.saleListings[0]?.sourceNote}. Datum sady:{" "}
          {gen}.
        </Text>
        <FindingBox
          podklad="Syntetická sada prodejních nabídek"
          zjisteni={`Modelový byt ${formatModelCzk(m.pricePerM2Czk)}/m² leží mezi nabídkami sady.`}
          dopad="Bez veřejných URL nelze tvrdit, že cena je „tržní“."
          overit="Při reálném rozboru nahradit sadu dohledanými inzeráty se zdrojem a datem."
        />
      </Page>

      {/* 7 Sale evaluation */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={7} title="Vyhodnocení srovnatelnosti a cenového rozpětí" />
        {(() => {
          const psm = bundle.saleListings.map((l) => l.pricePerM2Czk);
          const min = Math.min(...psm);
          const max = Math.max(...psm);
          return (
            <>
              <Kv
                label="Modelové pásmo Kč/m²"
                value={`${formatModelCzk(min)} – ${formatModelCzk(max)}`}
              />
              <Kv label="Modelový byt" value={formatModelCzk(m.pricePerM2Czk)} />
              <Kv
                label="Kupní cena celkem"
                value={formatModelCzk(m.inputs.purchasePriceCzk)}
              />
              <FindingBox
                podklad="Syntetická sada 4 nabídek"
                zjisteni={`Kupní cena ${formatModelCzk(m.pricePerM2Czk)}/m² leží uvnitř modelového pásma.`}
                dopad="Nejde o potvrzení „férovosti“ ceny — sada není tržní průměr ani realizované prodeje."
                overit="Dohledat veřejné inzeráty se URL a datem při reálném rozboru."
              />
            </>
          );
        })()}
        <Text style={pdfStyles.h3}>Korekce srovnatelnosti</Text>
        <Text style={pdfStyles.body}>
          Větší dispozice a rekonstrukce posouvají horní okraj. Nižší patro a
          absence balkonu snižují srovnatelnost směrem dolů. Bez prohlídky
          neprovádíme bodové ocenění.
        </Text>
        <FindingBox
          podklad="Rozdíly dispozice, patra a stavu v modelové sadě"
          zjisteni="Šířka pásma je úzká (~2,4 tis. Kč/m²) — typické pro syntetickou demonstraci, ne pro reálný trh."
          dopad="Širší reálné pásmo by zvýšilo nejistotu kolem kupní ceny."
          overit="Zařadit alespoň 6–8 veřejných nabídek se stejnou lokalitou a stavem."
        />
      </Page>

      {/* 8 Rent comps */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={8} title="Srovnávací nabídky pronájmu" />
        <Text style={pdfStyles.badge}>
          SYNTETICKÁ SROVNÁVACÍ SADA — NEPROKAZUJE TRŽNÍ NÁJEM
        </Text>
        <Text style={pdfStyles.body}>
          Podklad: modelové nájemní nabídky pro demonstraci. URL inzerátů
          záměrně neuvádíme — nejde o existující inzeráty.
        </Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Nabídka</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "10%" }]}>m²</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "24%" }]}>Nájem / měs.</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "44%" }]}>Poznámka</Text>
        </View>
        {bundle.rentListings.map((l) => (
          <View key={l.id} style={pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.cell, { width: "22%" }]}>{l.label}</Text>
            <Text style={[pdfStyles.cell, { width: "10%" }]}>{l.areaM2}</Text>
            <Text style={[pdfStyles.cell, { width: "24%" }]}>
              {formatModelCzk(l.priceOrRentCzk)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "44%" }]}>{l.notes}</Text>
          </View>
        ))}
        <Text style={pdfStyles.muted}>
          Zdroj: {bundle.rentListings[0]?.sourceNote}. Datum sady: {gen}.
        </Text>
        <FindingBox
          podklad="Syntetické nájemní nabídky A–D"
          zjisteni={`Zadaný nájem ${formatModelCzk(m.inputs.monthlyRentCzk)} leží uvnitř pásma sady.`}
          dopad="Odchylka ±1–2 tis. Kč/měs. může změnit znaménko peněžního toku."
          overit="Ověřit dosažitelné nájemné u srovnatelných bytů v lokalitě."
        />
      </Page>

      {/* 9 Rent evaluation */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={9} title="Vyhodnocení nájemného a nejistoty" />
        {(() => {
          const vals = bundle.rentListings.map((l) => l.priceOrRentCzk);
          return (
            <FindingBox
              podklad={`Syntetické nájmy ${Math.min(...vals).toLocaleString("cs-CZ")}–${Math.max(...vals).toLocaleString("cs-CZ")} Kč`}
              zjisteni={`Zadaný nájem ${formatModelCzk(m.inputs.monthlyRentCzk)} je uvnitř pásma.`}
              dopad="Nejistota ±1 000–2 000 Kč/měs. mění znaménko toku (viz citlivost)."
              overit="Ověřit dosažitelné nájemné u srovnatelných bytů a stav vybavení."
            />
          );
        })()}
        <Kv
          label="Nájem pro nulový tok (výpočet)"
          value={`${formatModelCzk(m.rentForZeroCashFlowCzk, 0)} / měs.`}
        />
        <Text style={pdfStyles.muted}>
          Bod zvratu je podmínka modelu, ne tržní nabídka.
        </Text>
      </Page>

      {/* 10 Occupancy */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={10} title="Obsazenost a provozní předpoklady" />
        <Kv label="Průměrný výpadek v základu" value={`${m.inputs.vacancyRate * 100} %`} />
        <Kv label="Správa" value={`${m.inputs.managementFeeRate * 100} % inkasa`} />
        <Text style={pdfStyles.body}>
          Průměrný výpadek modeluje dlouhodobý průměr. Několik měsíců prázdna je
          jiný stres — viz kapitola 19. Nezaměňujte je.
        </Text>
        <FindingBox
          podklad="Modelový předpoklad výměny nájemníka jednou za 3–4 roky"
          zjisteni="Mezi nájemníky vzniká období bez inkasa + náklady na úklid/inzerci."
          dopad="Rezerva 150 000 Kč je určena i na tyto výkyvy, ne jen na drobnou údržbu."
          overit="Historie obsazenosti u prodávajícího — neznámo."
        />
      </Page>

      {/* 11 Acquisition budget */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={11} title="Rozpočet koupě a vedlejší náklady" />
        <Kv label="Kupní cena" value={formatModelCzk(m.inputs.purchasePriceCzk)} />
        <Kv label="Vedlejší náklady" value={formatModelCzk(m.inputs.closingCostsCzk)} />
        <Kv label="Úpravy a vybavení" value={formatModelCzk(m.inputs.initialFitOutCzk)} />
        <Kv
          label="Pořizovací investice (bez držené rezervy)"
          value={formatModelCzk(m.totalAcquisitionCostCzk)}
        />
        <FindingBox
          podklad="Modelové vedlejší náklady 70 000 Kč"
          zjisteni="Částka pokrývá typické právní a administrativní položky v modelu."
          dopad="Skutečné notářské a daňové položky se mohou lišit — neověřeno."
          overit="Rozpis od právního zástupce před rezervací."
        />
      </Page>

      {/* 12 Fit-out */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={12} title="Úpravy, vybavení a modelové opravy" />
        <Kv label="Úpravy ve vstupu" value={formatModelCzk(m.inputs.initialFitOutCzk)} />
        <Kv
          label="Mimořádná modelová oprava (stres)"
          value={formatModelCzk(bundle.emergencyRepair.amountCzk)}
        />
        <Text style={pdfStyles.body}>{bundle.emergencyRepair.noteCs}</Text>
        <FindingBox
          podklad="Modelová jednorázová oprava 80 000 Kč"
          zjisteni={
            bundle.emergencyRepair.extraCapitalNeededCzk > 0
              ? `Po opravě chybí cca ${formatModelCzk(bundle.emergencyRepair.extraCapitalNeededCzk)} nad rezervou.`
              : "Oddělená rezerva unese modelovou opravu spolu s běžným tokem."
          }
          dopad="Měsíční rezerva na údržbu (1 000 Kč) není fond na havárie."
          overit="Technický stav rozvodů a jádra — prohlídka neprovedena."
        />
      </Page>

      {/* 13 Own cash */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={13} title="Vlastní hotovost a oddělená rezerva" />
        <Kv label="Vlastní část ceny" value={formatModelCzk(m.equityTowardPurchaseCzk)} />
        <Kv label="Úpravy + vedlejší" value={formatModelCzk(m.inputs.initialFitOutCzk + m.inputs.closingCostsCzk)} />
        <Kv label="Oddělená rezerva" value={formatModelCzk(m.inputs.cashReserveCzk)} />
        <Kv
          label="Celkem vlastní hotovost"
          value={formatModelCzk(m.totalOwnCashIncludingReserveCzk)}
        />
        <Text style={pdfStyles.body}>
          Rezerva je držena odděleně od pořizovací investice. Záporný zůstatek
          rezervy ve stresu = potřeba dodatečného kapitálu.
        </Text>
        <FindingBox
          podklad="Oddělená hotovostní rezerva 150 000 Kč"
          zjisteni="Rezerva není součástí jmenovatele pořizovací investice 4 450 000 Kč."
          dopad="Bez rezervy je vstup levnější na papíře, ale stres prázdna/opravy vyžaduje dodatečný kapitál dříve."
          overit="Zda má investor likviditu navíc mimo modelovanou rezervu."
        />
      </Page>

      {/* 14 OpEx */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={14} title="Provozní náklady a jejich rozpad" />
        <Kv label="Náklady vlastníka na dům" value={`${formatModelCzk(m.inputs.ownerBuildingCostsAnnualCzk / 12)} /měs.`} />
        <Kv label="Pojištění" value={`${formatModelCzk(m.inputs.insuranceAnnualCzk / 12)} /měs.`} />
        <Kv label="Daň z nemovitých věcí" value={`${formatModelCzk(m.inputs.propertyTaxAnnualCzk / 12)} /měs.`} />
        <Kv label="Rezerva na údržbu jednotky" value={`${formatModelCzk(m.inputs.unitMaintenanceReserveAnnualCzk / 12)} /měs.`} />
        <Kv label="Správa (z inkasa)" value={`${formatModelCzk(m.managementFeeCzk / 12)} /měs.`} />
        <Kv
          label="Ostatní roční náklady celkem"
          value={formatModelCzk(otherAnnualCosts(m.inputs))}
        />
        <Text style={pdfStyles.muted}>
          Přeúčtované služby nájemníkovi nejsou v tomto modelu v nákladech
          vlastníka. Mimořádné opravy jsou oddělené (kap. 12 / 19). Měsíční
          rezerva na údržbu se nesčítá znovu s jednorázovou opravou ve stresu.
        </Text>
        <FindingBox
          podklad="Rozpad nákladů vlastníka vs. správa vs. financování"
          zjisteni="Provozní položky a splátka jsou vedeny odděleně — správa se počítá z inkasovaného nájmu."
          dopad="Dvojí započtení údržby by uměle zhoršilo tok."
          overit="Skutečný předpis SVJ a pojištění za 12 měsíců."
        />
      </Page>

      {/* 15 Financing */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={15} title="Financování a podmínky modelového úvěru" />
        <Kv label="Úvěr" value={formatModelCzk(m.inputs.loanAmountCzk)} />
        <Kv label="Sazba / splatnost" value={`${m.inputs.annualRatePercent} % · ${m.inputs.termYears} let`} />
        <Kv label="Měsíční splátka" value={formatModelCzk(m.monthlyPaymentCzk, 0)} />
        <Kv
          label="Poměr úvěru ke kupní ceně"
          value={`${(m.inputs.loanToPurchaseRatio * 100).toLocaleString("cs-CZ", { maximumFractionDigits: 1 })} % (ne bankovní LTV)`}
        />
        <Kv
          label="Splacená jistina za 12 měsíců"
          value={formatModelCzk(m.principalPaidFirst12MonthsCzk, 0)}
        />
        <Text style={pdfStyles.body}>
          Model nevyslovuje závěr o schválení úvěru. Poplatky za zpracování a
          pojištění úvěru nejsou započteny. Jistina není peněžní příjem na účet.
        </Text>
        <FindingBox
          podklad="Anuita z jistiny, sazby a splatnosti"
          zjisteni={`Splátka ${formatModelCzk(m.monthlyPaymentCzk, 0)} je největší měsíční výdaj modelu.`}
          dopad="Změna sazby při refixaci (kap. 21) mění tok výrazněji než drobná změna nájmu."
          overit="Indikativní nabídka banky pro investiční LTV."
        />
      </Page>

      {/* 16 CF */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={16} title="Měsíční a roční peněžní tok" />
        <PdfWaterfallChart steps={waterfallSteps(bundle)} />
        <Kv label="Měsíční tok" value={formatModelCzk(m.monthlyCashFlowCzk, 0)} />
        <Kv label="Roční tok" value={formatModelCzk(m.annualCashFlowCzk, 0)} />
        <Kv
          label="Cash-on-cash vč. rezervy"
          value={formatModelPct(m.cashOnCashIncludingReserve, 2)}
        />
        <Text style={pdfStyles.muted}>
          Jmenovatel cash-on-cash = vlastní hotovost včetně rezervy. Tok před
          daní z příjmů.
        </Text>
      </Page>

      {/* 17 Scenarios */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={17} title="Tři scénáře" />
        <PdfScenarioBars
          values={bundle.scenarios.map((s) => ({
            label: s.label,
            value: s.monthlyCashFlowCzk,
            emphasize: s.id === "base",
          }))}
        />
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Scénář</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "20%" }]}>Nájem</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "14%" }]}>Výpadek</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "14%" }]}>Sazba</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "30%" }]}>Tok / měs.</Text>
        </View>
        {bundle.scenarios.map((s) => (
          <View key={s.id} style={pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.cell, { width: "22%", fontWeight: s.id === "base" ? 700 : 400 }]}>
              {s.label}
            </Text>
            <Text style={[pdfStyles.cell, { width: "20%" }]}>
              {formatModelCzk(s.monthlyRentCzk)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "14%" }]}>
              {(s.vacancyRate * 100).toLocaleString("cs-CZ")} %
            </Text>
            <Text style={[pdfStyles.cell, { width: "14%" }]}>
              {s.annualRatePercent} %
            </Text>
            <Text style={[pdfStyles.cell, { width: "30%", fontWeight: s.id === "base" ? 700 : 400 }]}>
              {formatModelCzk(s.monthlyCashFlowCzk, 0)}
            </Text>
          </View>
        ))}
        <Text style={pdfStyles.body}>
          Nepříznivý: nižší nájem, vyšší výpadek, vyšší sazba od počátku.
          Příznivý: mírně vyšší nájem a nižší výpadek. Zdůvodnění: test citlivosti
          vstupů, ne forecast.
        </Text>
      </Page>

      {/* 18 Sensitivity */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={18} title="Citlivost na klíčové proměnné" />
        <Text style={pdfStyles.body}>
          Buňky = měsíční peněžní tok (Kč). Výpadek a správa zůstávají jako v
          základním modelu. Zelené znaménko jen nad nulou.
        </Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "20%" }]}>Nájem\sazba</Text>
          {bundle.sensitivity.rates.map((r) => (
            <Text key={r} style={[pdfStyles.tableHeaderCell, { width: "20%" }]}>
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
                (c) => c.monthlyRentCzk === rent && c.annualRatePercent === rate
              );
              return (
                <Text key={`${rent}-${rate}`} style={[pdfStyles.cell, { width: "20%" }]}>
                  {formatModelCzk(cell?.monthlyCashFlowCzk ?? 0, 0)}
                </Text>
              );
            })}
          </View>
        ))}
        {(() => {
          const at18 = bundle.sensitivity.cells.filter((c) => c.monthlyRentCzk === 18_000);
          const at22base = bundle.sensitivity.cells.find(
            (c) => c.monthlyRentCzk === 22_000 && c.annualRatePercent === 4.8
          );
          const allNegAt18 = at18.every((c) => c.monthlyCashFlowCzk < 0);
          return (
            <FindingBox
              podklad="Matice nájem × sazba"
              zjisteni={
                allNegAt18 && at22base != null && at22base.monthlyCashFlowCzk > 0
                  ? `Při nájmu 18 000 Kč je tok záporný ve všech sazbách matice; při 22 000 Kč a 4,8 % vychází ${formatModelCzk(at22base.monthlyCashFlowCzk, 0)}.`
                  : "Citlivost ukazuje, které kombinace nájmu a sazby drží tok nad nebo pod nulou."
              }
              dopad="Nájem je citlivější páka než drobná změna sazby v pásmu 4–6 %."
              overit="Udržet konzervativní nájemní předpoklad do ověření trhu."
            />
          );
        })()}
      </Page>

      {/* 19 Vacancy + repair stress */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={19} title="Test prázdného bytu a mimořádné opravy" />
        <Text style={pdfStyles.body}>{bundle.vacancyStress.noteCs}</Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "12%" }]}>Měs.</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Počátek</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Výdaj</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Konec</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "22%" }]}>Pozn.</Text>
        </View>
        {bundle.vacancyStress.reservePath.map((r) => (
          <View key={r.month} style={pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.cell, { width: "12%" }]}>{r.month}</Text>
            <Text style={[pdfStyles.cell, { width: "22%" }]}>
              {formatModelCzk(r.openingCzk, 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "22%" }]}>
              {formatModelCzk(r.outflowCzk, 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "22%" }]}>
              {formatModelCzk(r.closingCzk, 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "22%" }]}>prázdno</Text>
          </View>
        ))}
        <Kv
          label="Dodatečný kapitál (prázdno)"
          value={formatModelCzk(bundle.vacancyStress.extraCapitalNeededCzk, 0)}
        />
        <Kv
          label="Dodatečný kapitál (oprava)"
          value={formatModelCzk(bundle.emergencyRepair.extraCapitalNeededCzk, 0)}
        />
      </Page>

      {/* 20 Long term */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={20} title="Dlouhodobý model (10 let)" />
        <Text style={pdfStyles.muted}>
          Modelové předpoklady: růst nájmu 2 % p.a., růst hodnoty 2 % p.a., sazba
          beze změny do refixace. Nejde o predikci.
        </Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "10%" }]}>Rok</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "18%" }]}>Nájem</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "18%" }]}>Tok/měs.</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "27%" }]}>Zůstatek</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "27%" }]}>Equity</Text>
        </View>
        {bundle.longTerm.map((r) => (
          <View key={r.year} style={pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.cell, { width: "10%" }]}>{r.year}</Text>
            <Text style={[pdfStyles.cell, { width: "18%" }]}>
              {formatModelCzk(r.rentCzk, 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "18%" }]}>
              {formatModelCzk(r.netCfCzk, 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "27%" }]}>
              {formatModelCzk(r.loanBalanceCzk, 0)}
            </Text>
            <Text style={[pdfStyles.cell, { width: "27%" }]}>
              {formatModelCzk(r.equityCzk, 0)}
            </Text>
          </View>
        ))}
        <Text style={pdfStyles.muted}>
          Equity = modelová hodnota − zůstatek dluhu. Splacená jistina se sem
          nepočítá podruhé při prodeji.
        </Text>
      </Page>

      {/* 21 Refix */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={21} title="Refixace a vývoj zbývajícího dluhu" />
        <Kv
          label={`Zůstatek po ${bundle.refix.fixationYears} letech`}
          value={formatModelCzk(bundle.refix.balanceAtRefixCzk, 0)}
        />
        <Kv
          label="Zbývající splatnost"
          value={`${bundle.refix.remainingTermYears} let`}
        />
        <Kv
          label={`Nová splátka při ${bundle.refix.shockedRatePercent} %`}
          value={formatModelCzk(bundle.refix.shockedPaymentCzk, 0)}
        />
        <Kv
          label="Změna splátky"
          value={formatModelCzk(bundle.refix.paymentDeltaCzk, 0)}
        />
        <Kv
          label="Tok po refixaci"
          value={formatModelCzk(bundle.refix.monthlyCashFlowAfterRefixCzk, 0)}
        />
        <FindingBox
          podklad="Amortizace do měsíce 60, nová anuita ze zůstatku"
          zjisteni="Refixace ≠ sazba od začátku úvěru."
          dopad="Doplatek po refixaci výrazně roste — likviditní plán je nutný."
          overit="Podmínky banky a možnost mimořádné splátky."
        />
      </Page>

      {/* 22 Sale variants */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={22} title="Varianty prodeje a čistého výstupu" />
        {bundle.sales.map((s) => (
          <View key={s.id} style={{ marginBottom: 6 }} wrap={false}>
            <Text style={pdfStyles.h3}>{s.label}</Text>
            <Kv label="Modelová prodejní cena" value={formatModelCzk(s.assumedSalePriceCzk, 0)} />
            <Kv
              label={`Prodejní náklady (${(s.sellingCostRate * 100).toLocaleString("cs-CZ")} %)`}
              value={formatModelCzk(s.sellingCostsCzk, 0)}
            />
            <Kv label="Zůstatek dluhu" value={formatModelCzk(s.loanBalanceCzk, 0)} />
            <Kv label="Čistý výstup před daní" value={formatModelCzk(s.netBeforeTaxCzk, 0)} />
          </View>
        ))}
        <Text style={pdfStyles.muted}>{bundle.sales[0]?.notes}</Text>
      </Page>

      {/* 23 Document findings */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={23} title="Ekonomická zjištění z modelových podkladů" />
        {bundle.findings.slice(0, 4).map((f) => (
          <FindingBox
            key={f.id}
            podklad={f.podklad}
            zjisteni={f.zjisteni}
            dopad={f.dopad}
            overit={f.overit}
          />
        ))}
      </Page>

      {/* 24 Risks */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={24} title="Rizika podle dopadu" />
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: "28%" }]}>Riziko</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "20%" }]}>Dopad</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: "52%" }]}>Ověření</Text>
        </View>
        {(
          [
            ["Neobsazenost 3+ měsíců", "vysoký", "Likviditní rezerva, marketing nájmu"],
            ["Refixace sazby nahoru", "vysoký", "Scénář kap. 21, podmínky banky"],
            ["Mimořádná oprava", "střední", "Prohlídka, stavební fond SVJ"],
            ["Nižší nájem než model", "střední", "Srovnání nabídek kap. 8–9"],
            ["Právní omezení (LV)", "vysoký", "Aktuální list vlastnictví"],
          ] as const
        ).map(([a, b, c]) => (
          <View key={a} style={pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.cell, { width: "28%" }]}>{a}</Text>
            <Text style={[pdfStyles.cell, { width: "20%" }]}>{b}</Text>
            <Text style={[pdfStyles.cell, { width: "52%" }]}>{c}</Text>
          </View>
        ))}
      </Page>

      {/* 25 Missing info */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={25} title="Chybějící informace a jejich význam" />
        {bundle.findings
          .filter((f) => f.provenance === "neznamo")
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
          Další chybějící: předpis SVJ 12 měsíců, nájemní historie, zápis z
          prohlídky, potvrzení banky o parametrech úvěru.
        </Text>
      </Page>

      {/* 26 Price/rent targets */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={26} title="Cenové a nájemní podmínky cílů" />
        <Kv
          label="Nájem pro nulový tok"
          value={`${formatModelCzk(m.rentForZeroCashFlowCzk, 0)} / měs.`}
        />
        <Kv
          label="Cenová hranice nulového toku (L=70 % P)"
          value={formatModelCzk(m.purchasePriceForZeroCashFlowAt70LoanCzk, 0)}
        />
        <Kv label="Nabídkové pásmo (syntetické)" value="viz kap. 6–7 — ne tržní hodnota" />
        <Text style={pdfStyles.body}>
          Oddělujeme: (1) cenu pro nulový tok modelu, (2) jiné investiční cíle,
          (3) nabídkové srovnání. Hranici modelu neoznačujeme jako tržní hodnotu.
        </Text>
      </Page>

      {/* 27 Questions */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={27} title="Otázky pro prodávajícího, SVJ a banku" />
        <Text style={pdfStyles.h3}>Prodávající</Text>
        <Text style={pdfStyles.body}>
          · Jaké jsou skutečné platby SVJ za 12 měsíců?{"\n"}
          · Existují plánované investice do společných částí?{"\n"}
          · Jaký je stav rozvodů, oken a jádra?
        </Text>
        <Text style={pdfStyles.h3}>Správce / výbor SVJ</Text>
        <Text style={pdfStyles.body}>
          · Výše fondu oprav a schválené čerpání?{"\n"}· Omezení pronájmu v
          domovním řádu?
        </Text>
        <Text style={pdfStyles.h3}>Financující instituce</Text>
        <Text style={pdfStyles.body}>
          · Podmínky LTV u investičního bytu?{"\n"}· Možnosti mimořádné splátky a
          refixace?
        </Text>
      </Page>

      {/* 28 Conclusion */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={28} title="Individuální komentovaný závěr" />
        <Text style={pdfStyles.body}>{m.baseConclusionCs}</Text>
        <FindingBox
          podklad="Celý modelový rozbor"
          zjisteni={`Automatický model ukazuje doplatek cca ${formatModelCzk(Math.abs(cf))}/měs. Individuální vrstva ukazuje, že 3 měsíce prázdna a refixace na ${bundle.refix.shockedRatePercent} % jsou hlavní likviditní rizika; syntetické pásmo cen/nájmů kupní cenu a nájem nevylučuje, ale nic nepotvrzuje.`}
          dopad="Bez LV, prohlídky a reálných nabídek nelze doporučit koupi ani ji vyloučit."
          overit="Dodat LV, předpis SVJ, prohlídku; teprve poté aktualizovat závěr."
        />
        <Text style={pdfStyles.h3}>Další postup (modelová ukázka)</Text>
        <Text style={pdfStyles.body}>
          1. Doplnit chybějící podklady.{"\n"}
          2. Přepočítat provozní náklady ze skutečných dokladů.{"\n"}
          3. Ověřit nájem srovnáním veřejných nabídek.{"\n"}
          4. Ověřit financování s bankou — model neschvaluje úvěr.
        </Text>
      </Page>

      {/* 29 Sources */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={29} title="Zdroje a návaznost tvrzení" />
        <Text style={pdfStyles.body}>
          · Výpočty: control model {CONTROL_MODEL_VERSION} (anuita, provozní
          přebytek, scénáře, citlivost).{"\n"}
          · Srovnání: syntetická sada označená jako modelový podklad — bez URL
          veřejných inzerátů.{"\n"}
          · Provozovatel: {legalOperator.companyName}, IČO {legalOperator.ico}.{"\n"}
          · Každé zjištění v kapitolách nese strukturu podklad → zjištění → dopad
          → ověřit.
        </Text>
      </Page>

      {/* 30 Methodology */}
      <Page size="A4" style={pdfStyles.page}>
        <PdfHeader subtitle={variant} />
        <PdfFooter generatedAt={gen} version={CONTROL_MODEL_VERSION} variant={variant} />
        <ChapterTitle n={30} title="Metodika, rozsah služby a omezení" />
        <Text style={pdfStyles.h3}>Rozsah individuálního rozboru</Text>
        <Text style={pdfStyles.body}>
          Vše z automatického modelu {formatDigitalRentgenPrice()} plus dohledání
          nabídek (v této ukázce synteticky), posouzení předpokladů, rozbor
          dodaných podkladů v dohodnutém rozsahu a individuální závěr.
        </Text>
        <Text style={pdfStyles.h3}>Co služba není</Text>
        <Text style={pdfStyles.body}>
          Znalecký posudek, právní stanovisko, technická prohlídka, schválení
          úvěru, garantovaný výnos.
        </Text>
        <Text style={pdfStyles.h3}>Dodání a opravy (orientace)</Text>
        <Text style={pdfStyles.body}>
          Termín se potvrzuje po kontrole rozsahu a podkladů. Oprava zjevně
          chybných vstupů klienta se řeší v rámci objednávky; rozsah následných
          dotazů se potvrzuje při převzetí zakázky. Online nákup může být ve
          fázi poptávky.
        </Text>
        <Text style={pdfStyles.muted}>
          Tento PDF je modelová ukázka. Budoucí výnos není garantován.
        </Text>
      </Page>
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
