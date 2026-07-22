import type { CountryId } from "@/lib/calculators";
import { countryConfigs } from "@/lib/calculators";
import type { CurrentRates } from "@/lib/rates";
import { makeDataRecord, missingDataRecord } from "@/lib/data/records";
import { REGULATORY_RECORDS } from "@/lib/data/static-regulatory";
import { getHistoricalChartData, HISTORICAL_END_YEAR } from "@/lib/historical-data";
import { getMarketProfile } from "@/lib/market-pulse/countries";
import {
  buildHistoricalTrend,
  buildMortgageRateTrends,
  buildYieldTrends,
  computeGrossYield,
} from "@/lib/market-pulse/trends";
import type {
  PulseInsight,
  PulseMetricCard,
  PulseMetricKind,
  PulseTimeframe,
  PulseTrend,
} from "@/lib/market-pulse/types";
import { PULSE_TIMEFRAMES } from "@/lib/market-pulse/types";

function fmtPct(n: number): string {
  return `${n.toFixed(1).replace(".", ",")} %`;
}

function fmtPpb(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1).replace(".", ",")} p.b.`;
}

function trendInsightText(
  metricLabel: string,
  segment: string,
  trend: PulseTrend,
  countryLabel: string
): string | null {
  if (!trend.available || trend.changePercent == null || trend.startValue == null) {
    return null;
  }

  const period =
    trend.timeframe === "1Y"
      ? "za 12 měsíců"
      : trend.timeframe === "3Y"
        ? "za 3 roky"
        : `za ${trend.timeframe}`;

  if (trend.unit === "percent_pa") {
    const dir =
      trend.direction === "up"
        ? "vzrostla"
        : trend.direction === "down"
          ? "klesla"
          : "zůstala přibližně stejná";
    return `Modelovaná / agregovaná hypoteční sazba v ${countryLabel} ${dir} ${period} o ${fmtPpb(trend.changeAbsolute ?? 0)} (z ${trend.startValue.toFixed(1)} % na ${(trend.endValue ?? 0).toFixed(1)} %).`;
  }

  if (trend.unit === "percent_gross") {
    const dir =
      trend.direction === "up"
        ? "vzrostl"
        : trend.direction === "down"
          ? "klesl"
          : "zůstal přibližně stejný";
    return `Modelovaný hrubý výnos segmentu ${segment} v ${countryLabel} ${dir} ${period} o ${fmtPct(Math.abs(trend.changePercent))} (z ${fmtPct(trend.startValue)} na ${fmtPct(trend.endValue ?? 0)}).`;
  }

  if (trend.unit === "czk") {
    const dir =
      trend.direction === "up"
        ? "vzrostla"
        : trend.direction === "down"
          ? "klesla"
          : "zůstala přibližně stejná";
    return `Modelovaná průměrná cena segmentu ${segment} v ${countryLabel} ${dir} ${period} o ${fmtPct(Math.abs(trend.changePercent))}.`;
  }

  if (trend.unit === "czk_month") {
    const dir =
      trend.direction === "up"
        ? "vzrostlo"
        : trend.direction === "down"
          ? "kleslo"
          : "zůstalo přibližně stejné";
    return `Modelované nájemné segmentu ${segment} v ${countryLabel} ${dir} ${period} o ${fmtPct(Math.abs(trend.changePercent))}.`;
  }

  return `${metricLabel} v ${countryLabel} — změna ${period}: ${fmtPct(trend.changePercent)} (${segment}).`;
}

function insightsFromTrends(
  kind: PulseMetricKind,
  metricLabel: string,
  segment: string,
  countryId: CountryId,
  trends: PulseTrend[],
  preferredTf: PulseTimeframe = "1Y"
): PulseInsight[] {
  const countryLabel = countryConfigs[countryId].label;
  const preferred = trends.find((t) => t.timeframe === preferredTf);
  const insights: PulseInsight[] = [];

  if (preferred) {
    const text = trendInsightText(metricLabel, segment, preferred, countryLabel);
    if (text) {
      insights.push({
        id: `${countryId}.${kind}.${preferredTf}`,
        metricKind: kind,
        timeframe: preferredTf,
        text,
        claimKind: preferred.claimKind,
        status: preferred.status,
      });
    }
  }

  const liveNote = trends.find(
    (t) => t.timeframe === "1M" && t.endValue != null && !t.available
  );
  if (liveNote && countryId === "cz" && kind === "mortgage_rate") {
    insights.push({
      id: `${countryId}.${kind}.live`,
      metricKind: kind,
      timeframe: "1M",
      text: `Aktuální agregovaná hypoteční sazba s pojištěním: ${liveNote.endValue!.toFixed(2).replace(".", ",")} % (LIVE). Měsíční trend není k dispozici.`,
      claimKind: "DATA",
      status: "LIVE",
    });
  }

  return insights;
}

function priceTrends(countryId: CountryId): PulseTrend[] {
  return PULSE_TIMEFRAMES.map((tf) =>
    buildHistoricalTrend({
      countryId,
      timeframe: tf,
      getValue: (p) => p.apt70m,
      unit: "czk",
      claimKind: "MODEL",
      status: "MODEL",
    })
  );
}

function rentTrends(countryId: CountryId): PulseTrend[] {
  return PULSE_TIMEFRAMES.map((tf) =>
    buildHistoricalTrend({
      countryId,
      timeframe: tf,
      getValue: (p) => p.rent,
      unit: "czk_month",
      claimKind: "MODEL",
      status: "MODEL",
    })
  );
}

export function buildMarketMetrics(
  countryId: CountryId,
  rates: CurrentRates | null
): PulseMetricCard[] {
  const profile = getMarketProfile(countryId);
  const segment = "byt ~70 m²";
  const chart = getHistoricalChartData(countryId);
  const latest = chart.find((p) => p.year === HISTORICAL_END_YEAR);

  const mortgageTrends = buildMortgageRateTrends(countryId, rates);
  const priceTr = priceTrends(countryId);
  const rentTr = rentTrends(countryId);
  const yieldTr = buildYieldTrends(countryId);

  const liveRate = countryId === "cz" ? rates?.rateWithInsurance ?? null : null;

  const cards: PulseMetricCard[] = [
    {
      kind: "mortgage_rate",
      label: "Hypoteční sazby",
      currentValue: liveRate ?? latest?.rate ?? null,
      currentLabel:
        liveRate != null
          ? `${liveRate.toFixed(2)} % p.a. (LIVE)`
          : latest
            ? `${latest.rate.toFixed(1)} % p.a. (MODEL)`
            : null,
      record:
        liveRate != null
          ? makeDataRecord({
              id: `pulse.${countryId}.rate`,
              value: liveRate,
              unit: "percent_pa",
              country: countryId,
              source: "Oficiální weby českých bank",
              sourceType: "supabase",
              status: "LIVE",
              confidence: 0.9,
              lastFetchedAt: rates?.updatedAt ?? null,
            })
          : missingDataRecord(`pulse.${countryId}.rate`, {
              unit: "percent_pa",
              country: countryId,
              source: "Žádný ověřený live feed pro tento trh",
              notes: "Zahraniční sazby nejsou na platformě live.",
            }),
      trends: mortgageTrends,
      insights: insightsFromTrends(
        "mortgage_rate",
        "Hypoteční sazba",
        segment,
        countryId,
        mortgageTrends
      ),
      reliabilityNote:
        countryId === "cz"
          ? "CZ sazby LIVE ze scraperu; trend 1Y/3Y vs. modelové roční body."
          : "Zahraniční sazby nejsou v aplikaci v reálném čase — trend z modelových ročních přehledů.",
    },
    {
      kind: "property_price",
      label: "Ceny nemovitostí",
      currentValue: latest?.apt70m ?? null,
      currentLabel: latest
        ? `${new Intl.NumberFormat("cs-CZ").format(latest.apt70m)} (MODEL, ${segment})`
        : null,
      record: latest
        ? makeDataRecord({
            id: `pulse.${countryId}.price.apt70`,
            value: latest.apt70m,
            unit: "czk",
            country: countryId,
            source: "Historické roční přehledy sazeb",
            sourceType: "model",
            status: "MODEL",
            confidence: countryId === "cz" ? 0.55 : 0.35,
          })
        : null,
      trends: priceTr,
      insights: insightsFromTrends(
        "property_price",
        "Cena nemovitosti",
        segment,
        countryId,
        priceTr
      ),
      reliabilityNote:
        countryId === "cz"
          ? "České roční přehledy (redakčně); zahraničí = škálované z české baseline."
          : "Modelované — ne aktuální nabídková cena z inzerce.",
    },
    {
      kind: "rent",
      label: "Nájemné",
      currentValue: latest?.rent ?? null,
      currentLabel: latest
        ? `${new Intl.NumberFormat("cs-CZ").format(latest.rent)} / měsíc (MODEL)`
        : null,
      record: latest
        ? makeDataRecord({
            id: `pulse.${countryId}.rent`,
            value: latest.rent,
            unit: "czk",
            country: countryId,
            source: "historical-data.ts",
            sourceType: "model",
            status: "MODEL",
            confidence: 0.4,
          })
        : null,
      trends: rentTr,
      insights: insightsFromTrends("rent", "Nájemné", segment, countryId, rentTr),
      reliabilityNote: "Modelované nájemné — ne live inzerce.",
    },
    {
      kind: "yield",
      label: "Výnos (yield)",
      currentValue: latest
        ? computeGrossYield(latest.apt70m, latest.rent)
        : null,
      currentLabel: latest
        ? `${computeGrossYield(latest.apt70m, latest.rent).toFixed(1)} % hrubý (MODEL)`
        : null,
      record: latest
        ? makeDataRecord({
            id: `pulse.${countryId}.yield.gross`,
            value: computeGrossYield(latest.apt70m, latest.rent),
            unit: "percent",
            country: countryId,
            source: "Odvozeno z modelové ceny a nájmu",
            sourceType: "model",
            status: "MODEL",
            confidence: 0.35,
          })
        : null,
      trends: yieldTr,
      insights: insightsFromTrends("yield", "Hrubý výnos", segment, countryId, yieldTr),
      reliabilityNote: "Hrubý yield z modelu — bez provozních nákladů a daní.",
    },
    {
      kind: "supply",
      label: "Nabídka (supply)",
      currentValue: null,
      currentLabel: null,
      record: missingDataRecord(`pulse.${countryId}.supply`, {
        unit: "other",
        country: countryId,
        source: "Feed nabídky není integrován",
        notes: "Supply metrika bude doplněna z partner/Majetio dat.",
      }),
      trends: PULSE_TIMEFRAMES.map((tf) => ({
        timeframe: tf,
        available: false,
        direction: null,
        changePercent: null,
        changeAbsolute: null,
        startValue: null,
        endValue: null,
        unit: "count",
        claimKind: "NEOVERENO" as const,
        status: "STALE" as const,
        unavailableReason: "Strukturovaná supply série není k dispozici.",
      })),
      insights: [],
      reliabilityNote: "Data o nabídce zatím nejsou k dispozici — nevyvozujeme závěry.",
    },
    {
      kind: "demand_proxy",
      label: "Poptávka (proxy)",
      currentValue: profile?.attributes.liquidity ?? null,
      currentLabel: profile
        ? `Likvidita ${profile.attributes.liquidity}/100 (MODEL proxy)`
        : null,
      record: profile
        ? makeDataRecord({
            id: `pulse.${countryId}.demand_proxy.liquidity`,
            value: profile.attributes.liquidity,
            unit: "score",
            country: countryId,
            source: "market-matching market-profiles.ts",
            sourceType: "model",
            status: "MODEL",
            confidence: 0.35,
            notes: "Proxy skóre likvidity — ne počet poptávek z inzerce.",
          })
        : null,
      trends: PULSE_TIMEFRAMES.map((tf) => ({
        timeframe: tf,
        available: false,
        direction: null,
        changePercent: null,
        changeAbsolute: null,
        startValue: profile?.attributes.liquidity ?? null,
        endValue: profile?.attributes.liquidity ?? null,
        unit: "score",
        claimKind: "MODEL" as const,
        status: "MODEL" as const,
        unavailableReason:
          "Časová řada poptávky není k dispozici — zobrazeno statické proxy skóre.",
      })),
      insights: profile
        ? [
            {
              id: `${countryId}.demand_proxy.static`,
              metricKind: "demand_proxy" as const,
              timeframe: "1Y" as const,
              text: `Modelové proxy skóre likvidity trhu ${countryConfigs[countryId].label}: ${profile.attributes.liquidity}/100 — nejde o live poptávku z inzerce.`,
              claimKind: "MODEL" as const,
              status: "MODEL" as const,
            },
          ]
        : [],
      reliabilityNote:
        "Proxy pouze kde spolehlivé — zde statické modelové skóre, ne live poptávka.",
    },
    {
      kind: "days_on_market",
      label: "Dny v inzerci (DOM)",
      currentValue: null,
      currentLabel: null,
      record: missingDataRecord(`pulse.${countryId}.dom`, {
        unit: "other",
        country: countryId,
        source: "DOM feed není integrován",
      }),
      trends: PULSE_TIMEFRAMES.map((tf) => ({
        timeframe: tf,
        available: false,
        direction: null,
        changePercent: null,
        changeAbsolute: null,
        startValue: null,
        endValue: null,
        unit: "days",
        claimKind: "NEOVERENO" as const,
        status: "STALE" as const,
        unavailableReason: "DOM série není k dispozici pro tento trh.",
      })),
      insights: [],
      reliabilityNote: "DOM zobrazíme až s ověřeným zdrojem — ne extrapolujeme.",
    },
    {
      kind: "fx",
      label: "Měnové riziko / FX",
      currentValue: profile?.attributes.fx_risk ?? null,
      currentLabel: profile
        ? `Měnové riziko ${100 - profile.attributes.fx_risk}/100 (orientační model — vyšší = rizikovější)`
        : countryId === "cz"
          ? "CZK — domácí měna, bez FX expozice"
          : null,
      record:
        countryId === "cz"
          ? makeDataRecord({
              id: `pulse.cz.fx`,
              value: 0,
              unit: "score",
              country: "cz",
              source: "Domácí měna CZK",
              sourceType: "editorial",
              status: "VERIFIED",
              confidence: 1,
            })
          : profile
            ? makeDataRecord({
                id: `pulse.${countryId}.fx.risk`,
                value: 100 - profile.attributes.fx_risk,
                unit: "score",
                country: countryId,
                source: "market-matching — fx_risk dimenze",
                sourceType: "model",
                status: "MODEL",
                confidence: 0.35,
                notes: "Modelové skóre — ne live FX kurz.",
              })
            : null,
      trends: PULSE_TIMEFRAMES.map((tf) => ({
        timeframe: tf,
        available: false,
        direction: null,
        changePercent: null,
        changeAbsolute: null,
        startValue: null,
        endValue: null,
        unit: "score",
        claimKind: "NEOVERENO" as const,
        status: "STALE" as const,
        unavailableReason: "Live FX trend není integrován — zobrazeno statické modelové skóre.",
      })),
      insights:
        countryId === "cz"
          ? [
              {
                id: "cz.fx.domestic",
                metricKind: "fx" as const,
                timeframe: "1Y" as const,
                text: "Domácí trh v CZK — bez měnové expozice při financování v korunách.",
                claimKind: "DATA" as const,
                status: "VERIFIED" as const,
              },
            ]
          : profile
            ? [
                {
                  id: `${countryId}.fx.risk`,
                  metricKind: "fx" as const,
                  timeframe: "1Y" as const,
                  text: `Modelové skóre měnového rizika pro ${countryConfigs[countryId].label}: ${100 - profile.attributes.fx_risk}/100 (vyšší = rizikovější). Live FX trend není k dispozici.`,
                  claimKind: "MODEL" as const,
                  status: "MODEL" as const,
                },
              ]
            : [],
      reliabilityNote: "FX trend pouze s live kurzem — jinak statické modelové skóre.",
    },
    {
      kind: "regulatory",
      label: "Regulace",
      currentValue:
        countryId === "cz"
          ? REGULATORY_RECORDS.ltvOwnerStandard.value
          : profile?.attributes.regulatory_complexity ?? null,
      currentLabel:
        countryId === "cz"
          ? `LTV vlastní bydlení ${REGULATORY_RECORDS.ltvOwnerStandard.value} % (ČNB VERIFIED)`
            : profile
            ? `Regulační skóre ${profile.attributes.regulatory_complexity}/100 (orientační přehled)`
            : null,
      record:
        countryId === "cz"
          ? REGULATORY_RECORDS.ltvOwnerStandard
          : profile
            ? makeDataRecord({
                id: `pulse.${countryId}.regulation.score`,
                value: profile.attributes.regulatory_complexity,
                unit: "score",
                country: countryId,
                source: "Přehled země a tržní profil",
                sourceType: "editorial",
                status: "MODEL",
                confidence: 0.5,
              })
            : null,
      trends: PULSE_TIMEFRAMES.map((tf) => ({
        timeframe: tf,
        available: false,
        direction: null,
        changePercent: null,
        changeAbsolute: null,
        startValue: null,
        endValue: null,
        unit: "score",
        claimKind: "NEOVERENO" as const,
        status: "STALE" as const,
        unavailableReason: "Regulační trend — viz changelog změn.",
      })),
      insights:
        countryId === "cz"
          ? [
              {
                id: "cz.regulatory.ltv",
                metricKind: "regulatory" as const,
                timeframe: "1Y" as const,
                text: `ČNB doporučuje LTV ${REGULATORY_RECORDS.ltvOwnerStandard.value} % pro vlastní bydlení; investiční max. ${REGULATORY_RECORDS.ltvInvestment.value} % (platí od 1. 4. 2026).`,
                claimKind: "DATA" as const,
                status: "VERIFIED" as const,
              },
            ]
          : profile
            ? [
                {
                  id: `${countryId}.regulatory.score`,
                  metricKind: "regulatory" as const,
                  timeframe: "1Y" as const,
                  text: `Orientační regulační skóre ${countryConfigs[countryId].label}: ${profile.attributes.regulatory_complexity}/100 — detail v přehledu země.`,
                  claimKind: "MODEL" as const,
                  status: "MODEL" as const,
                },
              ]
            : [],
      reliabilityNote: "Regulační změny sledujte v changelogu níže.",
    },
    {
      kind: "risk_events",
      label: "Riziková témata",
      currentValue: profile ? 100 - profile.attributes.operational_complexity : null,
      currentLabel: profile
        ? `Modelové riziko ${100 - profile.attributes.operational_complexity}/100`
        : null,
      record: null,
      trends: PULSE_TIMEFRAMES.map((tf) => ({
        timeframe: tf,
        available: false,
        direction: null,
        changePercent: null,
        changeAbsolute: null,
        startValue: null,
        endValue: null,
        unit: "score",
        claimKind: "MODEL" as const,
        status: "MODEL" as const,
        unavailableReason: "Rizikové události jsou redakční přehled — ne automatický živý feed.",
      })),
      insights: (profile?.topRisks ?? []).map((risk, i) => ({
        id: `${countryId}.risk.${i}`,
        metricKind: "risk_events" as const,
        timeframe: "1Y" as const,
        text: risk,
        claimKind: "MODEL" as const,
        status: "MODEL" as const,
      })),
      reliabilityNote:
        "Riziková témata jsou redakční přehled — ne automatický detektor událostí.",
    },
  ];

  return cards;
}

export function pickTopInsights(
  metrics: PulseMetricCard[],
  limit = 4
): PulseInsight[] {
  const all = metrics.flatMap((m) => m.insights);
  const priority = ["DATA", "MODEL", "ODHAD", "NEOVERENO"] as const;
  return [...all]
    .sort(
      (a, b) =>
        priority.indexOf(a.claimKind) - priority.indexOf(b.claimKind)
    )
    .slice(0, limit);
}
