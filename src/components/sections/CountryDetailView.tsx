"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertOctagon,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Landmark,
  ListChecks,
  Lightbulb,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import { SmartCalculator } from "@/components/calculators/SmartCalculator";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  getCountryDetail,
  countryDetailTabLabels,
  type CountryDetailTabId,
} from "@/lib/country-detail-data";
import { destinationCards } from "@/lib/mock-data";
import { financingDetailsData } from "@/lib/mock-data";
import { buyingProcessCzData } from "@/lib/buying-process-cz-data";
import { buyingProcessUaeData } from "@/lib/buying-process-uae-data";
import { buyingProcessSpainData } from "@/lib/buying-process-spain-data";
import { buyingProcessItalyData } from "@/lib/buying-process-italy-data";
import { buyingProcessCroatiaData } from "@/lib/buying-process-croatia-data";
import { buyingProcessBaliData } from "@/lib/buying-process-bali-data";
import { buyingProcessKsaData } from "@/lib/buying-process-ksa-data";
import { buyingProcessSlovakiaData } from "@/lib/buying-process-slovakia-data";
import {
  swotAnalysisCzData,
  type SwotAnalysisSection,
  type SwotSectionColor,
  type SwotSectionIcon,
} from "@/lib/swot-analysis-cz-data";
import { swotAnalysisUaeData } from "@/lib/swot-analysis-uae-data";
import { swotAnalysisSpainData } from "@/lib/swot-analysis-spain-data";
import { swotAnalysisItalyData } from "@/lib/swot-analysis-italy-data";
import { swotAnalysisCroatiaData } from "@/lib/swot-analysis-croatia-data";
import { swotAnalysisBaliData } from "@/lib/swot-analysis-bali-data";
import { swotAnalysisKsaData } from "@/lib/swot-analysis-ksa-data";
import { swotAnalysisSlovakiaData } from "@/lib/swot-analysis-slovakia-data";
import type { CountryId } from "@/lib/calculators";
import { cn } from "@/lib/utils";

const tabIcons = {
  market: Building2,
  financing: Landmark,
  process: ListChecks,
  risks: AlertTriangle,
} as const;

const swotSectionIcons: Record<
  SwotSectionIcon,
  React.ComponentType<{ className?: string }>
> = {
  ShieldCheck,
  TrendingDown,
  Lightbulb,
  AlertOctagon,
};

const swotColorStyles: Record<SwotSectionColor, string> = {
  emerald: "border-t-emerald-500 bg-emerald-50/30",
  orange: "border-t-orange-500 bg-orange-50/30",
  blue: "border-t-blue-500 bg-blue-50/30",
  red: "border-t-red-500 bg-red-50/30",
};

const swotTitleColors: Record<SwotSectionColor, string> = {
  emerald: "text-emerald-700",
  orange: "text-orange-700",
  blue: "text-blue-700",
  red: "text-red-700",
};

const swotAnalysisByCountry: Record<string, SwotAnalysisSection[]> = {
  "Česká republika": swotAnalysisCzData,
  "SAE (Dubaj)": swotAnalysisUaeData,
  "Španělsko": swotAnalysisSpainData,
  "Itálie": swotAnalysisItalyData,
  "Chorvatsko": swotAnalysisCroatiaData,
  "Bali (Indonésie)": swotAnalysisBaliData,
  "Saúdská Arábie": swotAnalysisKsaData,
  "Slovensko": swotAnalysisSlovakiaData,
};

const swotIntroByCountry: Record<string, string> = {
  "Česká republika":
    "Český trh je historicky velmi stabilní a právně bezpečný, vyžaduje však precizní kalkulaci výnosů a přípravu na regulace ČNB.",
  "SAE (Dubaj)":
    "Dubaj nabízí jedinečnou kombinaci daňové efektivity a globálního růstu, ale vyžaduje pozornost na servisní poplatky, cykličnost trhu a riziko přetlaku výstavby.",
  "Španělsko":
    "Španělský trh láká lifestyle investory v rámci EU, ale regionální rozdíly, byrokracie a nová regulace nájemného vyžadují precizní výběr lokality.",
  "Itálie":
    "Italský trh kombinuje prestiž a turistický potenciál s náročnou byrokracií — úspěch závisí na výběru lokality a důkladné právní prověrce nemovitosti.",
  "Chorvatsko":
    "Chorvatské pobřeží po vstupu do Eurozóny zažívá boom, ale silná sezónnost a historické nejasnosti v katastru vyžadují pečlivou due diligence.",
  "Bali (Indonésie)":
    "Bali nabízí extrémní výnosy a celoroční sezónu, ale leasehold struktura a rizika zoning-u vyžadují expertní právní podporu.",
  "Saúdská Arábie":
    "Saúdská Arábie transformuje trh v rámci Vision 2030 s obrovským růstovým potenciálem, ale vyžaduje pozornost na byrokracii a geopolitiku.",
  "Slovensko":
    "Slovenský trh je pro české investory nejbližší a eurový, ale regionální rozdíly a politická nejistota vyžadují pečlivý výběr lokality.",
};

interface CountryDetailViewProps {
  country: CountryId;
  variant?: "full" | "section" | "overview";
  section?: CountryDetailTabId;
}

export function CountryDetailView({
  country,
  variant = "full",
  section: forcedSection,
}: CountryDetailViewProps) {
  const content = getCountryDetail(country);
  const [activeTab, setActiveTab] = useState<CountryDetailTabId>(
    forcedSection ?? "market"
  );
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedFinancingKey, setSelectedFinancingKey] = useState<string | null>(
    null
  );
  const [residencyStatus, setResidencyStatus] = useState("cz_citizen");
  const [incomeType, setIncomeType] = useState("employee_cz");

  type MarketAnalysisChartPoint = {
    year: string;
    propertyIndex: number;
    rentIndex: number;
    inflation: number;
    interestRate: number;
  };

  type MarketAnalysisCity = {
    city: string;
    pricePerSqm: string;
    avgYield: string;
    growth5Y: string;
    risk: "Nízké" | "Střední" | "Vysoké" | "Extrémní";
  };

  type MarketPrediction = {
    title: string;
    desc: string;
    growth: string;
  };

  type MarketAnalysisData = {
    topCities: MarketAnalysisCity[];
    chartData: MarketAnalysisChartPoint[];
    predictions?: {
      conservative: MarketPrediction;
      average: MarketPrediction;
      optimistic: MarketPrediction;
    };
  };

  const marketAnalysisData = {
    "Česká republika": {
      topCities: [
        { city: 'Praha', pricePerSqm: '132 500 Kč', avgYield: '3.6 %', growth5Y: '+ 38 %', risk: 'Nízké' },
        { city: 'Brno', pricePerSqm: '98 000 Kč', avgYield: '4.1 %', growth5Y: '+ 32 %', risk: 'Nízké' },
        { city: 'Ostrava', pricePerSqm: '58 500 Kč', avgYield: '6.2 %', growth5Y: '+ 48 %', risk: 'Střední' },
        { city: 'Plzeň', pricePerSqm: '78 000 Kč', avgYield: '4.5 %', growth5Y: '+ 31 %', risk: 'Střední' }
      ],
      chartData: [
        { year: '2019', propertyIndex: 100, rentIndex: 100, inflation: 2.8, interestRate: 2.0 },
        { year: '2021', propertyIndex: 125, rentIndex: 105, inflation: 3.8, interestRate: 3.7 },
        { year: '2023', propertyIndex: 142, rentIndex: 122, inflation: 10.7, interestRate: 7.0 },
        { year: '2025', propertyIndex: 138, rentIndex: 132, inflation: 2.4, interestRate: 4.5 },
        { year: '2026', propertyIndex: 141, rentIndex: 138, inflation: 2.8, interestRate: 4.0 }, // Oživení trhu díky poklesu sazeb
      ]
    },
    "SAE (Dubaj)": {
      topCities: [
        { city: 'Dubai (Downtown)', pricePerSqm: '28 500 AED', avgYield: '5.5 %', growth5Y: '+ 45 %', risk: 'Nízké' },
        { city: 'Dubai (JVC)', pricePerSqm: '12 800 AED', avgYield: '7.8 %', growth5Y: '+ 52 %', risk: 'Střední' },
        { city: 'Abu Dhabi (Al Reem)', pricePerSqm: '14 500 AED', avgYield: '6.5 %', growth5Y: '+ 28 %', risk: 'Nízké' },
        { city: 'Ras Al Khaimah', pricePerSqm: '18 200 AED', avgYield: '8.5 %', growth5Y: '+ 85 %', risk: 'Vysoké' } // Efekt kasina Wynn
      ],
      chartData: [
        { year: '2019', propertyIndex: 100, rentIndex: 100, inflation: -1.9, interestRate: 2.5 },
        { year: '2021', propertyIndex: 115, rentIndex: 102, inflation: 0.2, interestRate: 1.5 },
        { year: '2023', propertyIndex: 152, rentIndex: 135, inflation: 3.3, interestRate: 5.5 },
        { year: '2025', propertyIndex: 168, rentIndex: 152, inflation: 2.2, interestRate: 4.5 },
        { year: '2026', propertyIndex: 175, rentIndex: 160, inflation: 3.1, interestRate: 4.5 }, // Safe-haven efekt kapitálu z Blízkého východu
      ]
    },
    "Španělsko": {
      topCities: [
        { city: 'Málaga (Costa del Sol)', pricePerSqm: '3 400 EUR', avgYield: '5.4 %', growth5Y: '+ 46 %', risk: 'Nízké' },
        { city: 'Alicante (Costa Blanca)', pricePerSqm: '2 300 EUR', avgYield: '6.2 %', growth5Y: '+ 38 %', risk: 'Nízké' },
        { city: 'Mallorca (Baleáry)', pricePerSqm: '4 800 EUR', avgYield: '4.2 %', growth5Y: '+ 51 %', risk: 'Střední' },
        { city: 'Tenerife (Kanárské ostrovy)', pricePerSqm: '2 700 EUR', avgYield: '6.8 %', growth5Y: '+ 43 %', risk: 'Střední' }
      ],
      chartData: [
        { year: '2019', propertyIndex: 100, rentIndex: 100, inflation: 0.8, interestRate: 0.0 },
        { year: '2021', propertyIndex: 108, rentIndex: 102, inflation: 3.1, interestRate: 0.0 },
        { year: '2023', propertyIndex: 126, rentIndex: 118, inflation: 3.4, interestRate: 4.5 },
        { year: '2025', propertyIndex: 136, rentIndex: 128, inflation: 2.3, interestRate: 3.5 },
        { year: '2026', propertyIndex: 142, rentIndex: 135, inflation: 2.1, interestRate: 3.0 }, // Pozvolný pokles sazeb ECB na 3 % stimuluje poptávku
      ],
      predictions: {
        conservative: {
          title: "Zpřísnění turistických licencí",
          desc: "Místní samosprávy (zejména Málaga a Barcelona) výrazně omezují licence pro krátkodobý pronájem. Výnosy klesají k úrovni dlouhodobého pronájmu.",
          growth: "+ 2 až 3 % p.a."
        },
        average: {
          title: "Stabilní zájem ze severní Evropy",
          desc: "Pokles sazeb ECB pod 3 % aktivuje lokální kupce. Poptávka cizinců po druhém domově (second home) drží ceny stabilně nahoře.",
          growth: "+ 5 až 6 % p.a."
        },
        optimistic: {
          title: "Středomořský investiční boom",
          desc: "Digitální nomádi a evropští investoři hromadně kupují nemovitosti na jihu Španělska. Nedostatek nové výstavby tlačí ceny k rekordním hodnotám.",
          growth: "+ 8 až 10 % p.a."
        }
      }
    },
    "Itálie": {
      topCities: [
        { city: 'Milán (Finanční centrum)', pricePerSqm: '5 600 EUR', avgYield: '4.2 %', growth5Y: '+ 28 %', risk: 'Nízké' },
        { city: 'Lago di Garda (Turistický hit)', pricePerSqm: '3 900 EUR', avgYield: '5.8 %', growth5Y: '+ 34 %', risk: 'Nízké' },
        { city: 'Řím (Historické centrum)', pricePerSqm: '3 400 EUR', avgYield: '4.6 %', growth5Y: '+ 15 %', risk: 'Střední' },
        { city: 'Toskánsko (Venkov / Vily)', pricePerSqm: '2 600 EUR', avgYield: '6.2 %', growth5Y: '+ 18 %', risk: 'Vysoké' }
      ],
      chartData: [
        { year: '2019', propertyIndex: 100, rentIndex: 100, inflation: 0.6, interestRate: 0.0 },
        { year: '2021', propertyIndex: 102, rentIndex: 99, inflation: 1.9, interestRate: 0.0 },
        { year: '2023', propertyIndex: 111, rentIndex: 108, inflation: 5.9, interestRate: 4.5 },
        { year: '2025', propertyIndex: 115, rentIndex: 116, inflation: 2.1, interestRate: 3.5 },
        { year: '2026', propertyIndex: 118, rentIndex: 120, inflation: 1.8, interestRate: 3.0 }, // Trh v severní Itálii mírně oživuje se snižováním sazeb ECB
      ],
      predictions: {
        conservative: {
          title: "Ekonomická stagnace a byrokracie",
          desc: "Složitý italský právní systém a pomalý růst ekonomiky brzdí sekundární trh. Růst cen se drží pod úrovní inflace, s výjimkou top luxusních lokalit.",
          growth: "+ 1 až 2 % p.a."
        },
        average: {
          title: "Oživení tažené severními regiony",
          desc: "Sever Itálie a turisticky atraktivní oblasti (Lombardie, Veneto) si udržují stabilní příliv zahraničního kapitálu. Úrokové sazby ECB klesají k 3 %.",
          growth: "+ 3 až 4 % p.a."
        },
        optimistic: {
          title: "Daňové pobídky pro rezidenty",
          desc: "Úspěšné fungování italských programů pro přilákání bohatých cizinců (flat tax) a digitálních nomádů spouští investiční boom v prémiovém segmentu.",
          growth: "+ 5 až 7 % p.a."
        }
      }
    },
    "Chorvatsko": {
      topCities: [
        { city: 'Dubrovník (Prémiový trh)', pricePerSqm: '4 200 EUR', avgYield: '4.5 %', growth5Y: '+ 35 %', risk: 'Nízké' },
        { city: 'Split (Centrum Dalmácie)', pricePerSqm: '3 800 EUR', avgYield: '5.2 %', growth5Y: '+ 42 %', risk: 'Nízké' },
        { city: 'Rovinj (Istrie - luxus)', pricePerSqm: '3 600 EUR', avgYield: '5.5 %', growth5Y: '+ 40 %', risk: 'Nízké' },
        { city: 'Zadar (Rostoucí segment)', pricePerSqm: '2 900 EUR', avgYield: '6.0 %', growth5Y: '+ 48 %', risk: 'Střední' }
      ],
      chartData: [
        { year: '2019', propertyIndex: 100, rentIndex: 100, inflation: 0.8, interestRate: 3.0 },
        { year: '2021', propertyIndex: 115, rentIndex: 105, inflation: 2.6, interestRate: 2.5 },
        { year: '2023', propertyIndex: 145, rentIndex: 130, inflation: 8.0, interestRate: 4.0 }, // Raketový skok po přijetí Eura
        { year: '2025', propertyIndex: 160, rentIndex: 145, inflation: 3.5, interestRate: 3.8 },
        { year: '2026', propertyIndex: 165, rentIndex: 150, inflation: 2.8, interestRate: 3.5 }, // Trh se stabilizuje na nových cenových maximech
      ],
      predictions: {
        conservative: {
          title: "Nasycení trhu po přijetí Eura",
          desc: "Prvotní euforie ze vstupu do Schengenu opadá, ceny na pobřeží narážejí na lokální limity kupní síly a trh přechází do fáze mírné stagnace.",
          growth: "+ 1 až 3 % p.a."
        },
        average: {
          title: "Stabilní zájem z DACH regionu a ČR",
          desc: "Díky skvělé dojezdové vzdálenosti zůstává pobřeží stabilním cílem pro kupce z Německa, Rakouska a ČR. Výnosy spolehlivě drží silná letní sezóna.",
          growth: "+ 4 až 5 % p.a."
        },
        optimistic: {
          title: "Rozvoj luxusních resortů a prodloužení sezóny",
          desc: "Masivní investice do moderní infrastruktury, hotelových resortů a jachtařských marin lákají movitější klientelu. Sezóna se díky teplému podnebí prodlužuje na 5-6 měsíců.",
          growth: "+ 7 až 8 % p.a."
        }
      }
    },
    "Bali (Indonésie)": {
      topCities: [
        { city: 'Canggu (Centrum nomádů)', pricePerSqm: '2 800 USD', avgYield: '11.5 %', growth5Y: '+ 65 %', risk: 'Střední' },
        { city: 'Uluwatu (Rostoucí hit jihu)', pricePerSqm: '2 300 USD', avgYield: '14.0 %', growth5Y: '+ 85 %', risk: 'Vysoké' },
        { city: 'Seminyak (Zavedený luxus)', pricePerSqm: '3 000 USD', avgYield: '8.5 %', growth5Y: '+ 30 %', risk: 'Nízké' },
        { city: 'Ubud (Kultura a džungle)', pricePerSqm: '1 900 USD', avgYield: '9.0 %', growth5Y: '+ 45 %', risk: 'Střední' }
      ],
      chartData: [
        { year: '2019', propertyIndex: 100, rentIndex: 100, inflation: 2.7, interestRate: 5.0 },
        { year: '2021', propertyIndex: 85, rentIndex: 60, inflation: 1.5, interestRate: 3.5 }, // Propad kvůli Covidu a zavřeným hranicím
        { year: '2023', propertyIndex: 140, rentIndex: 145, inflation: 4.3, interestRate: 5.7 }, // Post-covid exploze
        { year: '2025', propertyIndex: 185, rentIndex: 190, inflation: 2.9, interestRate: 6.0 },
        { year: '2026', propertyIndex: 198, rentIndex: 205, inflation: 3.1, interestRate: 6.2 }, // Přesun kapitálu do nových oblastí jako Uluwatu
      ],
      predictions: {
        conservative: {
          title: "Regulace a přehřátí infrastruktury",
          desc: "Lokální vláda zpřísňuje pravidla pro víza a stavební povolení v přeplněných oblastech (Canggu). Nadměrná nabídka nových vil mírně sráží průměrné yieldy.",
          growth: "+ 4 až 6 % p.a."
        },
        average: {
          title: "Přesun do nových zón",
          desc: "Zatímco Canggu cenově stagnuje, investiční tlak se přesouvá na jih (Uluwatu, Bingin) a sever (Lovina). Celoroční sezóna drží ROI vysoko nad celosvětovým průměrem.",
          growth: "+ 8 až 12 % p.a."
        },
        optimistic: {
          title: "Zlatá víza a infrastruktura (LRT)",
          desc: "Zlatá víza úspěšně lákají světový kapitál a zahájení stavby nové dopravní infrastruktury (LRT) řeší problémy se zácpami. Bali se etabluje jako globální prémiová destinace.",
          growth: "+ 15 % p.a."
        }
      }
    },
    "Saúdská Arábie": {
      topCities: [
        { city: 'Rijád (Byznysový hub)', pricePerSqm: '8 500 SAR', avgYield: '7.2 %', growth5Y: '+ 55 %', risk: 'Střední' },
        { city: 'Džidda / Jeddah (Pobřeží)', pricePerSqm: '6 200 SAR', avgYield: '6.8 %', growth5Y: '+ 40 %', risk: 'Střední' },
        { city: 'Dammám (Průmyslová zóna)', pricePerSqm: '4 800 SAR', avgYield: '8.0 %', growth5Y: '+ 35 %', risk: 'Vysoké' },
        { city: 'NEOM (Megaprojekt)', pricePerSqm: 'N/A', avgYield: 'N/A', growth5Y: 'Off-plan', risk: 'Extrémní' }
      ],
      chartData: [
        { year: '2019', propertyIndex: 100, rentIndex: 100, inflation: -1.2, interestRate: 2.2 },
        { year: '2021', propertyIndex: 110, rentIndex: 105, inflation: 3.1, interestRate: 1.0 },
        { year: '2023', propertyIndex: 140, rentIndex: 125, inflation: 2.3, interestRate: 6.0 },
        { year: '2025', propertyIndex: 165, rentIndex: 145, inflation: 1.8, interestRate: 5.5 },
        { year: '2026', propertyIndex: 180, rentIndex: 155, inflation: 2.1, interestRate: 5.0 }, // Ceny letí nahoru kvůli masivnímu přesunu expatů
      ],
      predictions: {
        conservative: {
          title: "Zpoždění megaprojektů",
          desc: "Rozpočtové škrty způsobené globální situací mírně zpomalují výstavbu gigantických projektů (NEOM). Růst se opírá pouze o organickou poptávku v Rijádu.",
          growth: "+ 4 % p.a."
        },
        average: {
          title: "Nová byznysová křižovatka",
          desc: "Zahraniční firmy poslušně přesouvají centrály z Dubaje do Rijádu kvůli státním zakázkám. Poptávka po luxusním bydlení pro expaty stabilně roste.",
          growth: "+ 8 % p.a."
        },
        optimistic: {
          title: "Vision 2030: ambiciózní otevírání trhu",
          desc: "Saúdská Arábie otevírá turismus a rezidenční trh cizincům. Růst cen v některých segmentech je silný, ale závisí na realizaci projektů a geopolitickém kontextu.",
          growth: "+ 12 % p.a."
        }
      }
    },
    "Slovensko": {
      topCities: [
        { city: 'Bratislava', pricePerSqm: '3 800 EUR', avgYield: '3.9 %', growth5Y: '+ 35 %', risk: 'Nízké' },
        { city: 'Košice', pricePerSqm: '2 400 EUR', avgYield: '4.8 %', growth5Y: '+ 42 %', risk: 'Nízké' },
        { city: 'Vysoké Tatry', pricePerSqm: '3 600 EUR', avgYield: '5.2 %', growth5Y: '+ 50 %', risk: 'Střední' },
        { city: 'Trnava', pricePerSqm: '2 100 EUR', avgYield: '4.5 %', growth5Y: '+ 38 %', risk: 'Střední' }
      ],
      chartData: [
        { year: '2019', propertyIndex: 100, rentIndex: 100, inflation: 2.7, interestRate: 1.5 },
        { year: '2021', propertyIndex: 130, rentIndex: 108, inflation: 3.2, interestRate: 1.0 },
        { year: '2023', propertyIndex: 145, rentIndex: 125, inflation: 10.5, interestRate: 4.5 },
        { year: '2025', propertyIndex: 140, rentIndex: 135, inflation: 3.0, interestRate: 3.8 },
        { year: '2026', propertyIndex: 143, rentIndex: 140, inflation: 2.8, interestRate: 3.5 }, // Postupné zlevňování úvěrů
      ],
      predictions: {
        conservative: {
          title: "Hospodářská stagnace",
          desc: "Odliv mozků a složitější politicko-ekonomická situace drží lokální kupní sílu na uzdě. Rostou pouze prémiové nemovitosti a Tatry.",
          growth: "+ 1 až 2 % p.a."
        },
        average: {
          title: "Pomalé zotavení trhu",
          desc: "Pokles sazeb Evropské centrální banky zlevňuje slovenské hypotéky. Bratislava si udržuje stabilní růst díky pendlerům do Vídně.",
          growth: "+ 3 až 5 % p.a."
        },
        optimistic: {
          title: "Průmyslový a turistický boom",
          desc: "Nové automobilky (Volvo) a silná investiční podpora regionů zvedají ceny v krajských městech. Investoři z ČR masivně skupují rekreační objekty.",
          growth: "+ 6 až 8 % p.a."
        }
      }
    }
  };

  const selectedCountryName =
    destinationCards.find((c) => c.id === country)?.name ?? "Česká republika";

  const buyingProcessByCountry = {
    "Česká republika": buyingProcessCzData,
    "SAE (Dubaj)": buyingProcessUaeData,
    "Španělsko": buyingProcessSpainData,
    "Itálie": buyingProcessItalyData,
    "Chorvatsko": buyingProcessCroatiaData,
    "Bali (Indonésie)": buyingProcessBaliData,
    "Saúdská Arábie": buyingProcessKsaData,
    "Slovensko": buyingProcessSlovakiaData,
  } as const;

  const processData =
    buyingProcessByCountry[
      selectedCountryName as keyof typeof buyingProcessByCountry
    ];

  const swotData = swotAnalysisByCountry[selectedCountryName];
  const swotIntro =
    swotIntroByCountry[selectedCountryName] ?? content.tabs.risks.intro;

  const currentFinancingDetails = financingDetailsData[selectedCountryName] ?? [];
  const filteredFinancingOptions = currentFinancingDetails.filter((option) => {
    if (!option.eligibility) return true;

    const matchResidency = option.eligibility.residency.includes(residencyStatus);
    const matchIncome = option.eligibility.income.includes(incomeType);

    return matchResidency && matchIncome;
  });
  const selectedFinancingDetail = filteredFinancingOptions.find(
    (item) => item.id === selectedFinancingKey
  ) ?? currentFinancingDetails.find((item) => item.id === selectedFinancingKey);

  const residencyOptions = [
    { value: "cz_citizen", label: "Občan ČR" },
    { value: "foreigner_in_cz", label: "Cizinec žijící v ČR" },
    { value: "foreigner", label: "Zahraniční investor bez pobytu" },
  ] as const;

  const incomeOptions = [
    { value: "employee_cz", label: "Zaměstnanec v ČR" },
    { value: "employee_foreign", label: "Zaměstnanec v zahraničí" },
    { value: "osvc_cz", label: "Živnostník (OSVČ) v ČR" },
    { value: "osvc_foreign", label: "Živnostník v zahraničí" },
    { value: "sro_cz", label: "Firma (s.r.o.) v ČR" },
    { value: "sro_foreign", label: "Firma v zahraničí" },
    { value: "rent", label: "Příjmy z pronájmu" },
  ] as const;

  const typedMarketAnalysisData = marketAnalysisData as unknown as Record<
    string,
    MarketAnalysisData
  >;

  const fallbackMarketData = typedMarketAnalysisData["Česká republika"];
  const hasMarketData = Boolean(typedMarketAnalysisData[selectedCountryName]);
  const currentMarketData =
    typedMarketAnalysisData[selectedCountryName] || fallbackMarketData;

  const tabs = Object.entries(countryDetailTabLabels) as [
    CountryDetailTabId,
    (typeof countryDetailTabLabels)[CountryDetailTabId],
  ][];

  useEffect(() => {
    if (variant === "section" && forcedSection) {
      setActiveTab(forcedSection);
    }
  }, [variant, forcedSection, country]);

  const isPanelVisible = (tabId: CountryDetailTabId) => {
    if (variant === "overview") {
      return tabId === "market" || tabId === "financing";
    }
    if (variant === "section") {
      return tabId === forcedSection;
    }
    return activeTab === tabId;
  };

  const showHeader = variant === "full" || variant === "overview";
  const showSmartCalculator = variant === "full";
  const showTabBar = variant === "full";

  return (
    <div
      id={variant === "full" ? "country-detail" : undefined}
      className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
    >
      <div
        className={cn(
          "max-w-5xl mx-auto",
          variant === "full" ? "mt-16 lg:mt-20" : "px-4"
        )}
      >
        {showHeader && (
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-deep-teal/70 mb-3">
              Detail destinace
            </p>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-text-dark mb-4">
              {content.title}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {content.subtitle}
            </p>
          </div>
        )}

        {variant === "section" && forcedSection && (
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-text-dark">
              {countryDetailTabLabels[forcedSection].label}
            </h2>
          </div>
        )}

        {showSmartCalculator && (
          <div className="rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-emerald-100 p-6 sm:p-8 lg:p-10 mb-10">
            <SmartCalculator country={country} />
          </div>
        )}

        <div className="rounded-3xl bg-white/70 backdrop-blur-md shadow-lg border border-gray-900/5 overflow-hidden">
          {showTabBar && (
            <div className="flex flex-wrap gap-2 p-4 sm:p-6 border-b border-gray-900/5 bg-slate-50/50">
              {tabs.map(([tabId, tab]) => {
                const Icon = tabIcons[tabId];
                const isActive = activeTab === tabId;

                return (
                  <button
                    key={tabId}
                    type="button"
                    onClick={() => setActiveTab(tabId)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-300",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                      isActive
                        ? "bg-white text-deep-teal shadow-md ring-1 ring-emerald-100"
                        : "text-muted-foreground hover:text-text-dark hover:bg-white/60"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">
                      {tabId === "risks" ? "Rizika ⚠️" : tab.label.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div
            key={variant === "full" ? activeTab : `${variant}-${forcedSection}`}
            className="p-6 sm:p-8 lg:p-10 animate-in fade-in duration-500 fill-mode-both"
          >
            {isPanelVisible("market") && (
              <div className="space-y-8">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {content.tabs.market.overview}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {content.tabs.market.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex min-h-[7.5rem] flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/50 p-6 text-center"
                    >
                      <div className="text-3xl font-bold text-gray-900 text-center">
                        {stat.value}
                      </div>
                      {stat.priceCzkEquivalent && (
                        <div className="text-sm font-medium text-emerald-600 mt-1 text-center">
                          {stat.priceCzkEquivalent}
                        </div>
                      )}
                      <div className="text-xs font-bold tracking-widest text-gray-400 uppercase mt-3 text-center">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
                <ul className="space-y-3">
                  {content.tabs.market.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm text-text-dark leading-relaxed"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="mt-4 border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => setShowAnalysis(!showAnalysis)}
                  >
                    Hloubková analýza trhu
                  </Button>

                  {showAnalysis && (
                    <div className="mt-6 animate-in slide-in-from-top-4 fade-in duration-500 rounded-3xl bg-slate-50 ring-1 ring-gray-900/5 shadow-sm overflow-hidden">
                      <div className="p-6 sm:p-8">
                        <div className="mb-8">
                          <p className="text-xs font-semibold uppercase tracking-widest text-deep-teal/70 mb-2">
                            Hloubková analýza trhu
                          </p>
                          <h3 className="font-heading text-2xl sm:text-3xl font-bold text-text-dark">
                            Srovnání klíčových lokalit
                          </h3>
                          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                            Přehled top lokalit podle ceny, výnosu a rizikového profilu (mock
                            data).
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {currentMarketData.topCities.map((row) => {
                            const riskTone =
                              row.risk === "Nízké"
                                ? "bg-emerald-100 text-emerald-800 ring-emerald-200/70"
                                : row.risk === "Střední"
                                  ? "bg-amber-100 text-amber-900 ring-amber-200/70"
                                  : row.risk === "Vysoké"
                                    ? "bg-rose-100 text-rose-900 ring-rose-200/70"
                                    : "bg-violet-100 text-violet-900 ring-violet-200/70";

                            return (
                              <div
                                key={row.city}
                                className="rounded-2xl bg-white/80 backdrop-blur-sm ring-1 ring-gray-900/5 shadow-sm p-5"
                              >
                                <div className="flex items-start justify-between gap-3 mb-4">
                                  <div>
                                    <p className="text-sm font-semibold text-text-dark">
                                      {row.city}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Cena za m²
                                    </p>
                                  </div>
                                  <span
                                    className={cn(
                                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                                      riskTone
                                    )}
                                  >
                                    {row.risk} riziko
                                  </span>
                                </div>

                                <div className="space-y-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Cena / m²
                                    </span>
                                    <span className="text-sm font-semibold text-text-dark">
                                      {row.pricePerSqm}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Průměrný výnos
                                    </span>
                                    <span className="text-sm font-semibold text-text-dark">
                                      {row.avgYield}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Růst 5 let
                                    </span>
                                    <span className="text-sm font-semibold text-emerald-700">
                                      {row.growth5Y}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-10">
                          <div className="mb-4 flex items-end justify-between gap-6 flex-wrap">
                            <div>
                              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-text-dark">
                                Vývoj trhu (indexy vs. makro)
                              </h3>
                              <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                                Porovnání vývoje cen nemovitostí, nájmů, inflace a úrokových sazeb
                                v čase (mock data).
                              </p>
                            </div>
                          </div>

                          <div className="rounded-3xl bg-white/80 backdrop-blur-sm ring-1 ring-gray-900/5 shadow-sm p-4 sm:p-6">
                            <ResponsiveContainer height={400} width="100%">
                              <ComposedChart
                                data={currentMarketData.chartData}
                                margin={{ top: 10, right: 12, left: 0, bottom: 10 }}
                              >
                                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="year"
                                  tick={{ fill: "#6b7280", fontSize: 12 }}
                                  axisLine={{ stroke: "#e5e7eb" }}
                                  tickLine={{ stroke: "#e5e7eb" }}
                                />
                                <YAxis
                                  yAxisId="index"
                                  tick={{ fill: "#6b7280", fontSize: 12 }}
                                  axisLine={{ stroke: "#e5e7eb" }}
                                  tickLine={{ stroke: "#e5e7eb" }}
                                  width={40}
                                  domain={["dataMin - 5", "dataMax + 5"]}
                                />
                                <YAxis
                                  yAxisId="pct"
                                  orientation="right"
                                  tick={{ fill: "#6b7280", fontSize: 12 }}
                                  axisLine={{ stroke: "#e5e7eb" }}
                                  tickLine={{ stroke: "#e5e7eb" }}
                                  width={40}
                                  domain={[0, "dataMax + 2"]}
                                />
                                <RechartsTooltip
                                  contentStyle={{
                                    background: "rgba(15, 23, 42, 0.92)",
                                    border: "1px solid rgba(148, 163, 184, 0.25)",
                                    borderRadius: "12px",
                                    color: "#fff",
                                    fontSize: "12px",
                                  }}
                                  labelStyle={{ color: "rgba(255,255,255,0.8)" }}
                                />
                                <Legend
                                  wrapperStyle={{ paddingTop: 10, color: "#374151" }}
                                />

                                <Line
                                  type="monotone"
                                  yAxisId="index"
                                  dataKey="propertyIndex"
                                  name="Ceny nemovitostí (Index)"
                                  stroke="#10b981"
                                  strokeWidth={3}
                                  dot={false}
                                />
                                <Line
                                  type="monotone"
                                  yAxisId="index"
                                  dataKey="rentIndex"
                                  name="Nájmy (Index)"
                                  stroke="#3b82f6"
                                  strokeWidth={2}
                                  dot={false}
                                />
                                <Line
                                  type="monotone"
                                  yAxisId="pct"
                                  dataKey="inflation"
                                  name="Inflace (%)"
                                  stroke="#ef4444"
                                  strokeWidth={2}
                                  strokeDasharray="5 5"
                                  dot={false}
                                />
                                <Line
                                  type="monotone"
                                  yAxisId="pct"
                                  dataKey="interestRate"
                                  name="Úrokové sazby (%)"
                                  stroke="#f59e0b"
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="mt-10">
                          <h3 className="font-heading text-2xl sm:text-3xl font-bold text-text-dark">
                            Predikce vývoje a očekávané zhodnocení
                          </h3>
                          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                            Tři scénáře vývoje pro investiční horizont — od konzervativního po
                            optimistický.
                          </p>

                          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {currentMarketData.predictions ? (
                              <>
                                <div className="rounded-3xl bg-white/80 backdrop-blur-sm ring-1 ring-gray-900/5 shadow-sm overflow-hidden">
                                  <div className="px-6 py-4 bg-gradient-to-r from-slate-200 to-amber-100">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-700">
                                      Konzervativní scénář
                                    </p>
                                    <p className="text-lg font-bold text-slate-900 mt-1">
                                      {currentMarketData.predictions.conservative.title}
                                    </p>
                                  </div>
                                  <div className="p-6 space-y-4">
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                                        Předpoklad
                                      </p>
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {currentMarketData.predictions.conservative.desc}
                                      </p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 ring-1 ring-gray-900/5 p-4">
                                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                        Očekávaný růst hodnoty
                                      </p>
                                      <p className="text-2xl font-bold text-slate-900 mt-1">
                                        {currentMarketData.predictions.conservative.growth}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-3xl bg-white/80 backdrop-blur-sm ring-1 ring-gray-900/5 shadow-sm overflow-hidden">
                                  <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                                      Základní scénář
                                    </p>
                                    <p className="text-lg font-bold text-white mt-1">
                                      {currentMarketData.predictions.average.title}
                                    </p>
                                  </div>
                                  <div className="p-6 space-y-4">
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                                        Předpoklad
                                      </p>
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {currentMarketData.predictions.average.desc}
                                      </p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 ring-1 ring-gray-900/5 p-4">
                                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                        Očekávaný růst hodnoty
                                      </p>
                                      <p className="text-2xl font-bold text-slate-900 mt-1">
                                        {currentMarketData.predictions.average.growth}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-3xl bg-white/90 backdrop-blur-sm ring-1 ring-emerald-200 shadow-lg shadow-emerald-900/10 overflow-hidden">
                                  <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-emerald-500">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                                      Optimistický scénář
                                    </p>
                                    <p className="text-lg font-bold text-white mt-1">
                                      {currentMarketData.predictions.optimistic.title}
                                    </p>
                                  </div>
                                  <div className="p-6 space-y-4">
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                                        Předpoklad
                                      </p>
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {currentMarketData.predictions.optimistic.desc}
                                      </p>
                                    </div>
                                    <div className="rounded-2xl bg-emerald-50/60 ring-1 ring-emerald-200/70 p-4">
                                      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-900/70">
                                        Očekávaný růst hodnoty
                                      </p>
                                      <p className="text-2xl font-bold text-emerald-900 mt-1">
                                        {currentMarketData.predictions.optimistic.growth}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="rounded-3xl bg-white/80 backdrop-blur-sm ring-1 ring-gray-900/5 shadow-sm overflow-hidden">
                                  <div className="px-6 py-4 bg-gradient-to-r from-slate-200 to-amber-100">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-700">
                                      Konzervativní scénář
                                    </p>
                                    <p className="text-lg font-bold text-slate-900 mt-1">
                                      Stagnace a vysoké sazby
                                    </p>
                                  </div>
                                  <div className="p-6 space-y-4">
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                                        Předpoklad
                                      </p>
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {selectedCountryName === "SAE (Dubaj)"
                                          ? "Regionální nestabilita na Blízkém východě omezí turismus, ale SAE si udrží status bezpečného přístavu."
                                          : "Inflace přetrvává, sazby neklesají pod 5 %. Ceny nemovitostí plošně stagnují."}
                                      </p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 ring-1 ring-gray-900/5 p-4">
                                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                        Očekávaný růst hodnoty
                                      </p>
                                      <p className="text-2xl font-bold text-slate-900 mt-1">
                                        {selectedCountryName === "SAE (Dubaj)"
                                          ? "+ 3 % p.a."
                                          : "+ 1 až 2 % p.a."}
                                      </p>
                                      {selectedCountryName !== "SAE (Dubaj)" && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Výnos tvoří primárně pouze nájemné.
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-3xl bg-white/80 backdrop-blur-sm ring-1 ring-gray-900/5 shadow-sm overflow-hidden">
                                  <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                                      Základní scénář
                                    </p>
                                    <p className="text-lg font-bold text-white mt-1">
                                      Pozvolný růst a stabilizace
                                    </p>
                                  </div>
                                  <div className="p-6 space-y-4">
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                                        Předpoklad
                                      </p>
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {selectedCountryName === "SAE (Dubaj)"
                                          ? "Kapitál z okolních států nadále proudí do Dubaje a Abu Dhabi, trh absorbuje novou výstavbu."
                                          : "Sazby se stabilizují kolem 3,5–4 %. Poptávka se plynule vrací k dlouhodobému normálu."}
                                      </p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 ring-1 ring-gray-900/5 p-4">
                                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                        Očekávaný růst hodnoty
                                      </p>
                                      <p className="text-2xl font-bold text-slate-900 mt-1">
                                        {selectedCountryName === "SAE (Dubaj)"
                                          ? "+ 6 % p.a."
                                          : "+ 4 až 5 % p.a."}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-3xl bg-white/90 backdrop-blur-sm ring-1 ring-emerald-200 shadow-lg shadow-emerald-900/10 overflow-hidden">
                                  <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-emerald-500">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                                      Optimistický scénář
                                    </p>
                                    <p className="text-lg font-bold text-white mt-1">
                                      Uvolnění trhu a akcelerace
                                    </p>
                                  </div>
                                  <div className="p-6 space-y-4">
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                                        Předpoklad
                                      </p>
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {selectedCountryName === "SAE (Dubaj)"
                                          ? "Rychlé uklidnění geopolitické situace a masivní spuštění projektů v Ras Al Khaimah přiláká globální fondy."
                                          : "Skokové snížení sazeb pod 3 %, silný převis poptávky nad nedostatečnou výstavbou."}
                                      </p>
                                    </div>
                                    <div className="rounded-2xl bg-emerald-50/60 ring-1 ring-emerald-200/70 p-4">
                                      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-900/70">
                                        Očekávaný růst hodnoty
                                      </p>
                                      <p className="text-2xl font-bold text-emerald-900 mt-1">
                                        {selectedCountryName === "SAE (Dubaj)"
                                          ? "+ 10 % p.a."
                                          : "+ 7 až 10 % p.a."}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {!hasMarketData && (
                        <div className="border-t border-gray-900/5 bg-white/70">
                          <div className="p-5 sm:p-6 text-sm text-muted-foreground">
                            Detailní data pro tuto destinaci se připravují. Zatím zobrazujeme
                            referenční dataset pro Českou republiku.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {isPanelVisible("financing") && (
              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  {content.tabs.financing.intro}
                </p>

                {(selectedCountryName === "Česká republika" ||
                  selectedCountryName === "SAE (Dubaj)") && (
                  <div className="space-y-5 rounded-2xl bg-slate-50/80 ring-1 ring-gray-900/5 p-5 sm:p-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                        Krok 1: Status (Občanství a pobyt)
                        {selectedCountryName === "SAE (Dubaj)" && (
                          <span className="block text-[10px] font-normal normal-case tracking-normal text-muted-foreground mt-1">
                            U UAE: „Cizinec v ČR“ = expat s rezidencí v Emirátech
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {residencyOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setResidencyStatus(option.value);
                              setSelectedFinancingKey(null);
                            }}
                            className={cn(
                              "rounded-full px-4 py-2 text-sm font-semibold transition-all",
                              residencyStatus === option.value
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                        Krok 2: Hlavní zdroj příjmů
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {incomeOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setIncomeType(option.value);
                              setSelectedFinancingKey(null);
                            }}
                            className={cn(
                              "rounded-full px-4 py-2 text-sm font-semibold transition-all",
                              incomeType === option.value
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {filteredFinancingOptions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredFinancingOptions.map((detail) => (
                      <button
                        key={detail.id}
                        type="button"
                        onClick={() => setSelectedFinancingKey(detail.id)}
                        className="text-left rounded-2xl bg-white ring-1 ring-gray-900/5 p-6 shadow-sm cursor-pointer hover:ring-2 ring-emerald-500 transition-all hover:shadow-md"
                      >
                        <h4 className="font-semibold text-text-dark mb-2">
                          {detail.title}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {detail.shortDesc}
                        </p>
                        <p className="text-xs text-deep-teal/80 font-semibold mt-3">
                          Sazby: {detail.rates}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : currentFinancingDetails.length > 0 ? (
                  <div className="rounded-2xl bg-slate-50 ring-1 ring-gray-900/5 p-6 text-center">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Pro vybraný profil (status a zdroj příjmů) nejsou dostupné žádné
                      možnosti financování. Upravte filtr nebo kontaktujte naše poradce.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-slate-50 ring-1 ring-gray-900/5 p-6 text-center">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Financování pro tuto zemi analyzujeme, kontaktujte naše poradce.
                    </p>
                  </div>
                )}

                <Dialog
                  open={Boolean(selectedFinancingDetail)}
                  onOpenChange={(open) => {
                    if (!open) setSelectedFinancingKey(null);
                  }}
                  title={selectedFinancingDetail?.title}
                >
                  {selectedFinancingDetail && (
                      <div className="space-y-6">
                        <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-deep-teal p-5 text-white shadow-lg shadow-emerald-900/15">
                          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                            Hlavní výhoda
                          </p>
                          <p className="text-lg font-bold mt-1">
                            {selectedFinancingDetail.advantages[0]}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="rounded-2xl bg-emerald-50/60 ring-1 ring-emerald-200/60 p-5">
                            <p className="text-sm font-bold text-emerald-900 mb-3">
                              Výhody
                            </p>
                            <ul className="space-y-2">
                              {selectedFinancingDetail.advantages.map((item) => (
                                <li
                                  key={item}
                                  className="flex gap-3 text-sm text-emerald-950/85"
                                >
                                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="rounded-2xl bg-amber-50/60 ring-1 ring-amber-200/60 p-5">
                            <p className="text-sm font-bold text-amber-950 mb-3">
                              Rizika
                            </p>
                            <ul className="space-y-2">
                              {selectedFinancingDetail.risks.map((item) => (
                                <li
                                  key={item}
                                  className="flex gap-3 text-sm text-amber-950/85"
                                >
                                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-slate-50 ring-1 ring-gray-900/5 p-5">
                          <p className="text-sm font-bold text-text-dark mb-2">
                            Jak to funguje
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedFinancingDetail.howItWorks}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold ring-1 ring-gray-900/10 text-muted-foreground">
                              Sazby: {selectedFinancingDetail.rates}
                            </span>
                          </div>
                        </div>

                        {selectedFinancingDetail.setup && (
                          <div className="rounded-2xl bg-white ring-1 ring-gray-900/5 p-5 shadow-sm">
                            <p className="text-sm font-bold text-text-dark mb-2">
                              Jak to zařídit
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {selectedFinancingDetail.setup}
                            </p>
                          </div>
                        )}

                        <div className="rounded-2xl bg-white ring-1 ring-gray-900/5 p-5 shadow-sm">
                          <p className="text-sm font-bold text-text-dark mb-2">
                            Pro koho je vhodné
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedFinancingDetail.idealFor}
                          </p>
                        </div>

                        {selectedFinancingDetail.requirements &&
                          selectedFinancingDetail.requirements.length > 0 && (
                          <div className="rounded-2xl bg-slate-50 ring-1 ring-gray-900/5 p-5">
                            <p className="text-sm font-bold text-text-dark mb-2">
                              Požadavky
                            </p>
                            <ul className="space-y-2">
                              {selectedFinancingDetail.requirements.map((item) => (
                                <li
                                  key={item}
                                  className="flex gap-3 text-sm text-muted-foreground"
                                >
                                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-deep-teal shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
                          <Button
                            variant="outline"
                            className="border-emerald-200"
                            onClick={() => setSelectedFinancingKey(null)}
                          >
                            Zavřít
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-deep-teal to-emerald-600 text-white"
                            onClick={() => setSelectedFinancingKey(null)}
                          >
                            Zvolit tuto možnost a konzultovat
                          </Button>
                        </div>
                      </div>
                    )}
                </Dialog>
              </div>
            )}

            {isPanelVisible("process") && (
              <div className="space-y-8">
                <p className="text-muted-foreground leading-relaxed">
                  {content.tabs.process.intro}
                </p>

                {processData ? (
                  <div className="flex flex-col gap-6 w-full">
                    {processData.map((step) => (
                      <div
                        key={step.step}
                        className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 transition-all hover:shadow-md"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 bg-emerald-700 text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-inner">
                            {step.step}
                          </div>
                        </div>

                        <div className="flex-grow">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {step.title}
                          </h3>
                          <p className="text-gray-600 mb-5 font-medium">
                            {step.description}
                          </p>

                          <ul className="space-y-3 mb-6">
                            {step.details.map((detail, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-3 text-gray-700"
                              >
                                <span className="text-emerald-500 mt-1 flex-shrink-0">
                                  <CheckCircle2 className="w-5 h-5" />
                                </span>
                                <span className="text-sm md:text-base leading-relaxed">
                                  {detail}
                                </span>
                              </li>
                            ))}
                          </ul>

                          {step.warning && (
                            <div className="bg-red-50 text-red-800 p-4 rounded-xl border-l-4 border-red-500 flex gap-3 items-start">
                              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm font-semibold leading-relaxed">
                                {step.warning}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {content.tabs.process.steps.map((step, index) => (
                      <div
                        key={step.title}
                        className="flex gap-5 rounded-2xl bg-slate-50/60 ring-1 ring-gray-900/5 p-5"
                      >
                        <div className="w-10 h-10 rounded-xl bg-deep-teal text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-text-dark mb-1">
                            {step.title.replace(/^\d+\.\s*/, "")}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isPanelVisible("risks") && (
              swotData ? (
                <div className="w-full">
                  <p className="text-gray-600 mb-8 text-lg">{swotIntro}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {swotData.map((section) => {
                      const SectionIcon = swotSectionIcons[section.icon];

                      return (
                        <div
                          key={section.id}
                          className={cn(
                            "p-6 rounded-2xl border-t-4 border-l border-r border-b border-gray-100 shadow-sm",
                            swotColorStyles[section.color]
                          )}
                        >
                          <div className="flex items-center gap-3 mb-5">
                            <div
                              className={cn(
                                "p-2 rounded-lg bg-white shadow-sm",
                                swotTitleColors[section.color]
                              )}
                            >
                              <SectionIcon className="w-6 h-6" />
                            </div>
                            <h3
                              className={cn(
                                "text-xl font-bold",
                                swotTitleColors[section.color]
                              )}
                            >
                              {section.title}
                            </h3>
                          </div>

                          <div className="space-y-5">
                            {section.items.map((item, index) => (
                              <div key={index}>
                                <h4 className="font-bold text-gray-900 mb-1">
                                  {item.subtitle}
                                </h4>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {item.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <p className="text-muted-foreground leading-relaxed">
                    {content.tabs.risks.intro}
                  </p>
                  <div className="space-y-4">
                    {content.tabs.risks.warnings.map((warning) => (
                      <div
                        key={warning.title}
                        className="flex gap-4 rounded-2xl bg-gradient-to-r from-amber-50/90 to-orange-50/50 ring-1 ring-amber-200/60 p-5"
                      >
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-amber-950 mb-1">
                            {warning.title}
                          </h4>
                          <p className="text-sm text-amber-900/80 leading-relaxed">
                            {warning.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-semibold text-text-dark">Příležitosti</h4>
                    </div>
                    <ul className="space-y-3">
                      {content.tabs.risks.opportunities.map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 text-sm text-text-dark leading-relaxed"
                        >
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
