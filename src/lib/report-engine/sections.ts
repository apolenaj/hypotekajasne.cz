import type { ReportBlock, ReportDocument, ReportKeyValue } from "@/lib/report-engine/types";
import { REPORT_VERSION } from "@/lib/report-engine/types";

export const PLATFORM_METHODOLOGY = [
  "Hypotéka Jasně — informační platforma, ne banka ani investiční poradce.",
  "Každé číslo nese typ tvrzení: Data, Modelový výpočet, Odhad, nebo Neověřeno.",
  "Report neobsahuje individuální schválení úvěru ani právní due diligence.",
  "Propojení s Majetio (marketplace) je oddělené od organického skóre.",
];

export const PLATFORM_DISCLAIMERS = [
  "Tento report je orientační model pro rozhodovací proces — ne smlouva ani nabídka produktu.",
  "Finální posouzení provádí banka / partner po individuální analýze.",
  "Minulá výkonnost a modelové scénáře nejsou zárukou budoucích výsledků.",
  "Sdílený report může skrývat citlivá data — ve výchozím nastavení bez osobních údajů a přesných příjmů.",
];

export function block(
  id: string,
  title: string,
  items: ReportKeyValue[],
  extras?: { prose?: string[]; tables?: ReportBlock["tables"] }
): ReportBlock {
  return { id, title, items, prose: extras?.prose, tables: extras?.tables };
}

export function kv(label: string, value: string | number | null, claimKind?: ReportKeyValue["claimKind"]): ReportKeyValue {
  return {
    label,
    value: value == null ? "—" : String(value),
    claimKind,
  };
}

export function fmtCzk(n: number): string {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtPct(n: number, digits = 1): string {
  return `${n.toFixed(digits).replace(".", ",")} %`;
}

export function baseMeta(type: ReportDocument["type"], title: string): Pick<ReportDocument, "type" | "title" | "version"> {
  return { type, title, version: REPORT_VERSION };
}

export function standardFreshness(generatedAt: string): ReportKeyValue[] {
  return [
    kv("Vygenerováno", new Date(generatedAt).toLocaleString("cs-CZ"), "DATA"),
    kv("Verze reportu", REPORT_VERSION, "DATA"),
    kv("Sazby ČR", "Dle katalogu dat — viz Zdroje", "DATA"),
    kv("Modelové metriky", "Platí k datu generování", "MODEL"),
  ];
}

export function standardSources(extra: ReportKeyValue[] = []): ReportBlock {
  return block("sources", "Zdroje", [
    kv("Katalog dat Hypotéka Jasně", "Stránka Zdroje", "DATA"),
    kv("Metodika platformy", "/metodika", "DATA"),
    ...extra,
  ]);
}

export function standardNextSteps(steps: string[]): ReportBlock {
  return block(
    "next_steps",
    "Další kroky",
    steps.map((s, i) => kv(`Krok ${i + 1}`, s)),
    { prose: ["Doporučený postup — ne povinný checklist."] }
  );
}
