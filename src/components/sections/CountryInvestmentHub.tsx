"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Loader2, Send } from "lucide-react";
import { articlesData, type Article } from "@/lib/articles-data";
import { routes } from "@/lib/routes";
import {
  getCountryHubData,
  getCountryHubName,
} from "@/lib/country-hub-data";
import type { CountryId } from "@/lib/calculators";
import { submitLead } from "@/lib/leads";
import { CountryInfoTabs } from "@/components/sections/CountryInfoTabs";
import {
  FormConsentFields,
  emptyFormConsentState,
  toConsentRecord,
} from "@/components/consent/FormConsentFields";

interface HubFormData {
  name: string;
  email: string;
  phone: string;
  investorType: string;
  budget: string;
  propertyType: string;
}

const defaultFormData: HubFormData = {
  name: "",
  email: "",
  phone: "",
  investorType: "rekreační",
  budget: "do-5m",
  propertyType: "apartmán",
};

const SUB_NAV_LINKS = [
  { href: "#analyza-trhu", label: "Analýza trhu" },
  { href: "#klicova-fakta", label: "Profil trhu" },
  { href: "#info-360", label: "360° informace" },
  { href: "#swot-analyza", label: "SWOT Analýza" },
  { href: "#proces-koupe", label: "Kroky při koupi" },
  { href: "#hypotecni-kalkulacka", label: "Kalkulačka hypotéky" },
  { href: "#roi-kalkulacka", label: "ROI Kalkulačka" },
] as const;

function RelatedArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={article.href || routes.clanky}
      className="group flex flex-col border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h4 className="font-bold text-gray-900 group-hover:text-emerald-700 mb-2 leading-snug">
          {article.title}
        </h4>
        <p className="text-sm text-gray-600 line-clamp-2 flex-1">
          {article.excerpt}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
          Číst článek
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function InvestorLeadForm({ countryName }: { countryName: string }) {
  const [formData, setFormData] = useState<HubFormData>(defaultFormData);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(() =>
    emptyFormConsentState("mortgage_specialist")
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      return;
    }
    setError(null);
    setLoading(true);

    const result = await submitLead({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      source: "country_hub",
      country: countryName,
      notes: [
        `Země: ${countryName}`,
        `Typ investora: ${formData.investorType}`,
        `Budget: ${formData.budget}`,
        `Typ nemovitosti: ${formData.propertyType}`,
      ].join(" | "),
      metadata: { ...formData },
      consent: toConsentRecord(consent),
    });

    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="sticky top-32 bg-emerald-50 border border-emerald-200 rounded-3xl p-8 shadow-xl text-center">
        <p className="text-emerald-900 font-bold text-lg mb-2">
          Děkujeme za váš zájem!
        </p>
        <p className="text-emerald-800 text-sm">
          Specialista na {countryName} vás bude kontaktovat do 24 hodin s
          nabídkami z Majetio.cz.
        </p>
      </div>
    );
  }

  return (
    <div className="sticky top-32 bg-gray-50 border border-gray-200 rounded-3xl p-8 shadow-xl">
      <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">
        Chci investovat v této zemi
      </h3>
      <p className="text-sm text-gray-600 mb-8 leading-relaxed">
        Zanechte nám na sebe kontakt. Spojíme vás s naším specialistou na
        lokalitu {countryName} a zašleme vám prémiové neveřejné nabídky z{" "}
        <a
          href="https://majetio.cz"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-emerald-800 hover:underline"
        >
          Majetio.cz
        </a>
        .
      </p>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="hub-name"
            className="block text-xs font-bold text-gray-700 uppercase mb-1"
          >
            Jméno a příjmení
          </label>
          <input
            id="hub-name"
            type="text"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full p-3 rounded-xl border border-gray-300 bg-white"
            placeholder="Jan Novák"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="hub-email"
              className="block text-xs font-bold text-gray-700 uppercase mb-1"
            >
              E-mail
            </label>
            <input
              id="hub-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full p-3 rounded-xl border border-gray-300 bg-white"
              placeholder="jan@email.cz"
            />
          </div>
          <div>
            <label
              htmlFor="hub-phone"
              className="block text-xs font-bold text-gray-700 uppercase mb-1"
            >
              Telefon
            </label>
            <input
              id="hub-phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full p-3 rounded-xl border border-gray-300 bg-white"
              placeholder="+420"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="hub-investor"
            className="block text-xs font-bold text-gray-700 uppercase mb-1"
          >
            Profil investora
          </label>
          <select
            id="hub-investor"
            value={formData.investorType}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                investorType: e.target.value,
              }))
            }
            className="w-full p-3 rounded-xl border border-gray-300 bg-white"
          >
            <option value="rekreační">
              Hledám rekreační bydlení (druhý domov)
            </option>
            <option value="investiční">
              Čistě investiční záměr (cash-flow / flip)
            </option>
            <option value="diverzifikace">
              Diverzifikace portfolia (ochrana kupní síly)
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="hub-budget"
            className="block text-xs font-bold text-gray-700 uppercase mb-1"
          >
            Předpokládaný rozpočet
          </label>
          <select
            id="hub-budget"
            value={formData.budget}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, budget: e.target.value }))
            }
            className="w-full p-3 rounded-xl border border-gray-300 bg-white"
          >
            <option value="do-5m">Do 5 000 000 Kč</option>
            <option value="5-10m">5 000 000 – 10 000 000 Kč</option>
            <option value="10m+">10 000 000 Kč a více</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="hub-property"
            className="block text-xs font-bold text-gray-700 uppercase mb-1"
          >
            Typ nemovitosti
          </label>
          <select
            id="hub-property"
            value={formData.propertyType}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                propertyType: e.target.value,
              }))
            }
            className="w-full p-3 rounded-xl border border-gray-300 bg-white"
          >
            <option value="apartmán">Apartmán</option>
            <option value="dům">Rodinný dům / Vila</option>
            <option value="off-plan">Off-plan / Novostavba</option>
            <option value="komerce">Komerční nemovitost</option>
          </select>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <FormConsentFields
          state={consent}
          onChange={setConsent}
          showPartnerTransfer
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-900 text-white font-bold text-lg p-4 rounded-xl hover:bg-emerald-800 transition-all shadow-lg mt-4 inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
          {loading ? "Odesílám…" : "Vyžádat neveřejné nabídky"}
        </button>
        <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed">
          Odeslání formuláře není univerzální marketingový souhlas. Marketing
          jen při samostatném zaškrtnutí.
        </p>
      </form>
    </div>
  );
}

interface CountryInvestmentHubProps {
  countryId: CountryId;
}

export function CountryInvestmentHub({ countryId }: CountryInvestmentHubProps) {
  const countryName = getCountryHubName(countryId);
  const data = getCountryHubData(countryId);
  const [imageError, setImageError] = useState(false);
  const [imageResetKey, setImageResetKey] = useState(`${countryId}:${data.heroImage}`);
  const nextImageKey = `${countryId}:${data.heroImage}`;
  if (imageResetKey !== nextImageKey) {
    setImageResetKey(nextImageKey);
    setImageError(false);
  }

  const heroTitle = countryName.includes("Dubaj") ? "Dubaj" : countryName;

  return (
    <div className="w-full bg-white animate-in fade-in duration-500">
      <div className="relative h-[55vh] min-h-[420px] flex items-end pb-16 justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-gray-900 z-0" />

        {!imageError && (
          <img
            src={data.heroImage}
            alt={countryName}
            onError={() => setImageError(true)}
            className="absolute inset-0 w-full h-full object-cover z-0 mix-blend-overlay opacity-60"
          />
        )}

        <div className="absolute inset-0 bg-gray-900/50 z-10" />

        <div className="relative z-20 text-center max-w-4xl px-4">
          <span className="text-emerald-400 font-bold tracking-widest uppercase text-sm mb-4 block drop-shadow-md">
            Komplexní investiční průvodce
          </span>
          <h1 className="mb-6 font-heading text-3xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-5xl md:text-7xl">
            Trh nemovitostí:
            <br />
            {heroTitle}
          </h1>
          <p className="mx-auto max-w-2xl text-base font-medium text-gray-200 drop-shadow-md sm:text-xl">
            {data.subtitle}
          </p>
        </div>
      </div>

      <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="-mx-4 flex gap-6 overflow-x-auto px-4 text-sm font-bold text-gray-600 py-4 [scrollbar-width:thin] sm:mx-0 sm:px-0">
            {SUB_NAV_LINKS.map((link) => (
              <li key={link.href} className="shrink-0">
                <a
                  href={link.href}
                  className="whitespace-nowrap transition-colors hover:text-emerald-700"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div id="analyza-trhu" className="scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <div
              className="prose prose-lg prose-emerald max-w-none text-gray-700 article-rich-text"
              dangerouslySetInnerHTML={{ __html: data.marketOverview }}
            />

            <div className="mt-12 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-emerald-900 font-medium">
                Prohlédněte si aktuální nabídku nemovitostí v této zemi.
              </p>
              <a
                href="https://majetio.cz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-900 text-white px-6 py-3 rounded-full font-bold hover:bg-emerald-800 transition-colors whitespace-nowrap"
              >
                Majetio.cz
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-4">
            <InvestorLeadForm countryName={countryName} />
          </div>
        </div>
      </div>

      <div
        id="klicova-fakta"
        className="bg-gray-50 py-16 scroll-mt-32 border-y border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold font-serif text-gray-900 mb-10 text-center">
            Profil trhu v kostce
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-emerald-800 uppercase text-xs tracking-wider mb-3">
                🏠 Realitní trh
              </h3>
              <p className="text-gray-700 text-sm">{data.fourPillars.market}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-emerald-800 uppercase text-xs tracking-wider mb-3">
                💰 Možnosti financování
              </h3>
              <p className="text-gray-700 text-sm">
                {data.fourPillars.financing}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-emerald-800 uppercase text-xs tracking-wider mb-3">
                📑 Proces koupě
              </h3>
              <p className="text-gray-700 text-sm">{data.fourPillars.process}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-emerald-800 uppercase text-xs tracking-wider mb-3">
                ⚠️ Rizika a Příležitosti
              </h3>
              <p className="text-gray-700 text-sm">{data.fourPillars.risks}</p>
            </div>
          </div>

          <CountryInfoTabs country={countryName} />
        </div>
      </div>
    </div>
  );
}

export function CountryArticlesSection({ countryId }: { countryId: CountryId }) {
  const countryName = getCountryHubName(countryId);
  const relatedArticles = articlesData.filter(
    (article) => article.targetCountry === countryName
  );

  if (relatedArticles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="font-heading text-3xl font-bold text-gray-900 mb-4">
          Poslední analýzy z trhu: {countryName}
        </h2>
        <p className="text-gray-600">
          Pro tuto destinaci zatím nemáme publikované články. Sledujte náš{" "}
          <Link href={routes.clanky} className="text-emerald-700 font-semibold hover:underline">
            investiční magazín
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="font-heading text-3xl font-bold text-gray-900 mb-8 border-b border-gray-200 pb-4">
        Poslední analýzy z trhu: {countryName}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {relatedArticles.map((article) => (
          <RelatedArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
