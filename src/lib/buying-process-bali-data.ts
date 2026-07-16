import type { BuyingProcessStep } from "@/lib/buying-process-cz-data";

export const buyingProcessBaliData: BuyingProcessStep[] = [
  {
    step: 1,
    title: "Volba struktury vlastnictví (Leasehold vs. PT PMA)",
    description:
      "Cizinec nemůže vlastnit půdu (Hak Milik). Musíte se rozhodnout: pronájem (Leasehold) nebo firma (PT PMA).",
    details: [
      "Leasehold (Hak Sewa) je smlouva na 25–30 let s opcí na prodloužení.",
      "PT PMA je indonéská firma vlastněná cizincem, která může vlastnit půdu (Hak Pakai/HGB).",
    ],
    warning:
      "Nikdy neuzavírejte 'přátelskou dohodu' o držení půdy na místního Indonésana – je to právně neúčinné a riskujete ztrátu veškerého majetku.",
  },
  {
    step: 2,
    title: "Prověření pozemku a developera (Due Diligence)",
    description: "Kontrola právního stavu pozemku a územního plánu (Zoning).",
    details: [
      "Ověřte 'Izin Mendirikan Bangunan' (IMB) – stavební povolení.",
      "Zkontrolujte, zda je pozemek v zóně povolené pro turistické ubytování.",
    ],
    warning:
      "Pozor na pozemky v 'Green Zone' (rýžová pole), kde je zakázáno stavět jakékoli komerční vily.",
  },
  {
    step: 3,
    title: "Rezervační smlouva a záloha",
    description: "Podpis 'Booking Agreement' a úhrada rezervačního poplatku.",
    details: [
      "Definice ceny, platebního kalendáře a termínu dokončení.",
      "Smlouva se obvykle podepisuje u notáře (PPAT).",
    ],
    warning:
      "Požadujte, aby rezervační poplatek byl vratný, pokud due diligence odhalí právní vady pozemku.",
  },
  {
    step: 4,
    title: "Notářský zápis (Akta Jual Beli / Perjanjian Sewa)",
    description: "Finální právní akt, který stvrzuje váš pronájem nebo převod.",
    details: [
      "Vše probíhá u notáře (Pejabat Pembuat Akta Tanah - PPAT).",
      "U Leaseholdu se smlouva registruje na místním úřadě.",
    ],
    warning:
      "Vždy nechte smlouvu přeložit a zkontrolovat nezávislým právníkem, ne právníkem developera.",
  },
  {
    step: 5,
    title: "Platba daní (BPHTB)",
    description: "Daň z převodu nemovitosti (BPHTB) ve výši 5 %.",
    details: [
      "Daň se platí místnímu finančnímu úřadu.",
      "Bez potvrzení o zaplacení daně nelze provést zápis do katastru.",
    ],
    warning:
      "Nezaplacení daně včas vede k vysokým pokutám a komplikacím při případném dalším prodeji (exit).",
  },
  {
    step: 6,
    title: "Zápis do katastru a předání",
    description: "Finální zápis (Sertifikat) a předání nemovitosti.",
    details: [
      "U Leaseholdu dostáváte kopii notářského zápisu o pronájmu.",
      "Předání vily a podpis předávacího protokolu.",
    ],
    warning:
      "Ujistěte se, že všechny licence (např. pro pronájem - Pondok Wisata) jsou převedeny na vaše jméno.",
  },
];
