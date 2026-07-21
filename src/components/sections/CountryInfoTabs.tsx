"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  KeyRound,
  Scale,
  Search,
  Shield,
} from "lucide-react";
import { getCountryInfoData } from "@/lib/country-info-data";
import { cn } from "@/lib/utils";
import { ModelledDomainProvenance } from "@/components/trust/ModelledDomainProvenance";

type TabId = "overview" | "process" | "taxes" | "ownership" | "risks";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Přehled trhu" },
  { id: "process", label: "Proces koupě" },
  { id: "taxes", label: "Daně a poplatky" },
  { id: "ownership", label: "Vlastnictví (Právo)" },
  { id: "risks", label: "Rizika" },
];

const PROCESS_STEPS = [
  {
    title: "Rezervace",
    desc: "Výběr nemovitosti, rezervační smlouva a složení zálohy do úschovy.",
  },
  {
    title: "Právní prověrka",
    desc: "Due diligence: vlastnictví, zástavy, územní rozhodnutí a daňová historie.",
  },
  {
    title: "Podpis smlouvy",
    desc: "Kupní smlouva / SPA, nastavení Escrow a financing čerpání.",
  },
  {
    title: "Předání",
    desc: "Přepis v katastru (nebo ekvivalent), předání klíčů a nastavení správy.",
  },
];

interface OwnershipInfo {
  type: string;
  foreignerNote: string;
}

function getOwnershipInfo(country: string): OwnershipInfo {
  if (country.includes("Bali") || country.includes("Indonésie")) {
    return {
      type: "Leasehold / korporátní struktura",
      foreignerNote:
        "Cizinci typicky nenabývají Hak Milik (freehold). Běžný je leasehold nebo PT PMA — ověřte s indonéským právníkem.",
    };
  }
  if (country.includes("Dubaj") || country.includes("SAE")) {
    return {
      type: "Freehold (designované zóny)",
      foreignerNote:
        "V designovaných freehold zónách může cizinec vlastnit 100 % nemovitosti. Mimo ně platí omezení. Registrace: Dubai Land Department (DLD).",
    };
  }
  if (country.includes("Saúd")) {
    return {
      type: "Mix Freehold / Leasehold",
      foreignerNote:
        "Vlastnictví pro cizince je regulované a často vázané na schválené zóny / strukturu. Je nutná lokální právní kontrola před nákupem.",
    };
  }
  if (country.includes("Španěl")) {
    return {
      type: "Freehold",
      foreignerNote:
        "Freehold se zápisem do Registro de la Propiedad; transakce u notáře. Roční daň IBI je municipální.",
    };
  }
  if (country.includes("Itál")) {
    return {
      type: "Freehold",
      foreignerNote:
        "Převod u notaio a zápis (Conservatoria). Roční daň IMU typicky u druhé nemovitosti — ověřte u obce.",
    };
  }
  if (country.includes("Chorvat")) {
    return {
      type: "Vlastnictví se zápisem (ZK)",
      foreignerNote:
        "Prověřte zemljišne knjige / katastr a typ pozemku. Roční místní poplatky ověřujeme u obce.",
    };
  }
  if (country.includes("Slovens")) {
    return {
      type: "Freehold (kataster)",
      foreignerNote:
        "Zápis do slovenského katastra. Roční daň z nehnuteľností je obecní — ověřte sazbu lokálně.",
    };
  }
  if (country.includes("Česk") || country === "ČR") {
    return {
      type: "Volné vlastnictví (katastr)",
      foreignerNote:
        "Vlastnické právo vzniká zápisem do katastru nemovitostí. Daň z nemovitých věcí je roční.",
    };
  }
  return {
    type: "Údaj ověřujeme",
    foreignerNote:
      "Pro tuto zemi nemáme v datech ověřený vlastnický model — konzultujte lokálního právníka. Nevymýšlíme freehold jen proto, že pole musí být vyplněné.",
  };
}

function DataFallback({ topic }: { topic: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-sm leading-relaxed text-emerald-950">
      Detail k tématu „{topic}“ doplňujeme. Mezitím platí obecný právní rámec
      země — vždy ověřte s lokálním právníkem.
    </div>
  );
}

function OverviewTab({ country }: { country: string }) {
  const data = getCountryInfoData(country);
  if (!data?.overview?.length) {
    return <DataFallback topic="přehledu trhu" />;
  }

  return (
    <ul className="space-y-4">
      {data.overview.map((point) => (
        <li key={point} className="flex gap-3 text-gray-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <span className="text-sm leading-relaxed sm:text-base">{point}</span>
        </li>
      ))}
    </ul>
  );
}

function ProcessTab() {
  return (
    <ol className="relative space-y-0 border-l-2 border-emerald-200 pl-6">
      {PROCESS_STEPS.map((step, index) => (
        <li key={step.title} className="relative pb-8 last:pb-0">
          <span className="absolute -left-[1.95rem] flex h-8 w-8 items-center justify-center rounded-full bg-deep-teal text-xs font-black text-white">
            {index + 1}
          </span>
          <p className="font-bold text-gray-900">{step.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {step.desc}
          </p>
        </li>
      ))}
    </ol>
  );
}

function TaxesTab({ country }: { country: string }) {
  const data = getCountryInfoData(country);
  if (!data?.taxes?.length) {
    return <DataFallback topic="daních" />;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-gray-900">
        <FileCheck2 className="h-5 w-5 text-deep-teal" />
        <h3 className="font-bold">Daně a poplatky — {country}</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.taxes.map((tax) => (
          <div
            key={tax.name}
            className="rounded-lg border border-gray-100 bg-gray-50 p-4"
          >
            <div className="mb-1 font-bold text-gray-900">{tax.name}</div>
            <div className="text-sm leading-relaxed text-gray-600">
              {tax.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OwnershipTab({ country }: { country: string }) {
  const info = getOwnershipInfo(country);
  return (
    <div className="rounded-2xl border-2 border-deep-teal/20 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-deep-teal">
        <Scale className="h-5 w-5" />
        <h3 className="font-bold">Vlastnictví (Právo)</h3>
      </div>
      <div className="inline-flex rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-black text-emerald-900">
        {info.type}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-gray-700 sm:text-base">
        {info.foreignerNote}
      </p>
      <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
        <KeyRound className="mt-0.5 h-4 w-4 shrink-0" />
        Doporučujeme vždy escrow / notářskou úschovu a lokální právní prověrku
        před odesláním jakékoli zálohy.
      </p>
      <div className="mt-4">
        <ModelledDomainProvenance
          topic="legal"
          label="Právo"
          source="Přehled vlastnictví v zemi"
          notes="Není individuální právní rada. Údaje ověřujeme redakčně."
        />
      </div>
    </div>
  );
}

function RisksTab({ country }: { country: string }) {
  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
      <div className="mb-3 flex items-center gap-2 text-orange-950">
        <AlertTriangle className="h-5 w-5" />
        <h3 className="font-bold">Rizika — {country}</h3>
      </div>
      <ul className="space-y-2 text-sm leading-relaxed text-orange-950/85 sm:text-base">
        <li className="flex gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0" />
          Měnové a úrokové riziko při financování z ČR.
        </li>
        <li className="flex gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0" />
          Regulační změny (Airbnb, daně z nájmu, limity pro cizince).
        </li>
        <li className="flex gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0" />
          Likvidita výstupu — doba prodeje se liší podle lokality a sezóny.
        </li>
      </ul>
      <p className="mt-4 text-sm text-orange-900/70">
        Detailní SWOT a lokální rizika jsou výše na stránce země; tato karta
        shrnuje univerzální body, které platí i pro {country}.
      </p>
    </div>
  );
}

export function CountryInfoTabs({ country }: { country: string }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <section className="mt-16 scroll-mt-32" id="info-360">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-emerald-700">
          <Search className="h-5 w-5" />
          <span className="text-sm font-bold uppercase tracking-widest">
            360° informace
          </span>
        </div>
        <h2 className="mt-2 font-heading text-2xl font-black text-gray-900 sm:text-3xl">
          Co potřebujete vědět o zemi {country}
        </h2>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold transition-all",
              activeTab === tab.id
                ? "bg-deep-teal text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-900/5 ring-1 ring-gray-900/5 sm:p-8">
        {activeTab === "overview" && <OverviewTab country={country} />}
        {activeTab === "process" && <ProcessTab />}
        {activeTab === "taxes" && <TaxesTab country={country} />}
        {activeTab === "ownership" && <OwnershipTab country={country} />}
        {activeTab === "risks" && <RisksTab country={country} />}
      </div>
    </section>
  );
}
