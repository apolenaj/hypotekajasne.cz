"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClaimBadge } from "@/components/property-rentgen/ClaimBadge";
import {
  EMPTY_MANUAL_INPUT,
  PROPERTY_ANALYSIS_PRICING,
  buildFreePreview,
  formatAnalysisPrice,
  formatAnalysisPriceLabel,
  type ManualPropertyInput,
  type RentgenInputMode,
} from "@/lib/property-rentgen";
import { submitLead } from "@/lib/leads";
import { routes } from "@/lib/routes";
import { cn, formatNumber, parseNumber } from "@/lib/utils";
import {
  FormConsentFields,
  emptyFormConsentState,
  toConsentRecord,
} from "@/components/consent/FormConsentFields";
import { track } from "@/lib/analytics/track";
import { getExperimentVariant } from "@/lib/analytics/experiments";
import { isPaidAnalysisCommerciallyAvailable } from "@/lib/legal";

const MODES: { id: RentgenInputMode; label: string; hint: string }[] = [
  {
    id: "url",
    label: "URL inzerátu",
    hint: "Odkaz jen jako reference — obsah automaticky neověřujeme.",
  },
  {
    id: "manual",
    label: "Manuálně",
    hint: "Nejspolehlivější cesta k bezplatnému náhledu.",
  },
  {
    id: "upload",
    label: "Nahrání",
    hint: "Dokumenty a fotky — připravujeme; zatím manuál nebo Prémiová analýza.",
  },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-text-dark">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function TextField({
  value,
  onChange,
  placeholder,
  inputMode = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: "text" | "numeric" | "url" | "email" | "tel";
}) {
  return (
    <input
      type="text"
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none ring-deep-teal/30 focus:ring-2"
    />
  );
}

export function RentgenToolIsland() {
  const [mode, setMode] = useState<RentgenInputMode>("manual");
  const [input, setInput] = useState<ManualPropertyInput>(EMPTY_MANUAL_INPUT);
  const [ran, setRan] = useState(false);
  const [premiumName, setPremiumName] = useState("");
  const [premiumEmail, setPremiumEmail] = useState("");
  const [premiumPhone, setPremiumPhone] = useState("");
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [premiumMsg, setPremiumMsg] = useState<string | null>(null);
  const [consent, setConsent] = useState(() =>
    emptyFormConsentState("majetio")
  );

  const patch = <K extends keyof ManualPropertyInput>(
    key: K,
    value: ManualPropertyInput[K]
  ) => setInput((prev) => ({ ...prev, [key]: value }));

  const preview = useMemo(
    () => (ran ? buildFreePreview(input, mode) : null),
    [ran, input, mode]
  );

  const canPreview =
    mode === "upload"
      ? false
      : Boolean(
          input.priceCzk ||
            input.areaM2 ||
            input.rentMonthlyCzk ||
            input.city ||
            (mode === "url" && input.listingUrl.trim())
        );

  const requestPremium = async () => {
    if (
      !premiumName.trim() ||
      !premiumEmail.includes("@") ||
      premiumPhone.trim().length < 6
    )
      return;
    setPremiumLoading(true);
    setPremiumMsg(null);
    track("analysis_checkout_started", {
      tool_id: "property_rentgen",
      price_band: "premium",
      experiment_id: "free_preview",
      variant_id: getExperimentVariant("free_preview"),
    });
    const res = await submitLead({
      name: premiumName.trim(),
      email: premiumEmail.trim(),
      phone: premiumPhone.trim(),
      source: "property_analysis",
      country: input.country || undefined,
      notes: [
        formatAnalysisPriceLabel(),
        `mode=${mode}`,
        input.listingUrl ? `url=${input.listingUrl}` : null,
        input.city ? `city=${input.city}` : null,
        input.priceCzk != null ? `price=${input.priceCzk}` : null,
      ]
        .filter(Boolean)
        .join(" | "),
      metadata: {
        product_id: PROPERTY_ANALYSIS_PRICING.productId,
        amount_czk: PROPERTY_ANALYSIS_PRICING.amountCzk,
        input_mode: mode,
        city: input.city,
        price_czk: input.priceCzk,
        area_m2: input.areaM2,
        listing_url: input.listingUrl || null,
        preview_ran: ran,
      },
      consent: toConsentRecord(consent),
    });
    setPremiumLoading(false);
    setPremiumMsg(
      res.ok
        ? "Poptávka odeslána. Ozveme se s dalším postupem Prémiové analýzy."
        : res.error
    );
    if (res.ok) {
      track("lead_submitted", {
        lead_source: "property_analysis",
        tool_id: "property_rentgen",
        price_band: "premium",
        partner_scope: "majetio",
      });
    }
  };

  return (
    <section
      id="nastroj"
      className="scroll-mt-24 border-b border-border bg-white py-12 sm:py-16"
      aria-labelledby="tool-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2
          id="tool-heading"
          className="font-heading text-2xl font-bold text-text-dark sm:text-3xl"
        >
          Nástroj — bezplatný náhled
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Zadejte dostupné údaje. Nevymýšlíme právní ani technická fakta bez
          zdroje — chybějící údaje označíme jako Neověřeno.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id);
                setRan(false);
              }}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                mode === m.id
                  ? "border-deep-teal bg-deep-teal text-white"
                  : "border-border text-muted-foreground hover:border-deep-teal/40"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {MODES.find((m) => m.id === mode)?.hint}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-border bg-[#f7f8f7] p-5 sm:p-6">
            {(mode === "url" || mode === "manual") && (
              <>
                {mode === "url" && (
                  <Field label="URL inzerátu (reference)">
                    <TextField
                      value={input.listingUrl}
                      onChange={(v) => patch("listingUrl", v)}
                      placeholder="https://…"
                      inputMode="url"
                    />
                  </Field>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Země">
                    <TextField
                      value={input.country}
                      onChange={(v) => patch("country", v)}
                    />
                  </Field>
                  <Field label="Město / lokalita">
                    <TextField
                      value={input.city}
                      onChange={(v) => patch("city", v)}
                      placeholder="Praha"
                    />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Typ">
                    <select
                      value={input.propertyType}
                      onChange={(e) =>
                        patch(
                          "propertyType",
                          e.target.value as ManualPropertyInput["propertyType"]
                        )
                      }
                      className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm"
                    >
                      <option value="Byt">Byt</option>
                      <option value="Dům">Dům</option>
                      <option value="Komerce">Komerce</option>
                    </select>
                  </Field>
                  <Field label="Účel">
                    <select
                      value={input.purpose}
                      onChange={(e) =>
                        patch(
                          "purpose",
                          e.target.value as ManualPropertyInput["purpose"]
                        )
                      }
                      className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm"
                    >
                      <option value="investment">Investice</option>
                      <option value="own_use">Vlastní bydlení</option>
                    </select>
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Kupní cena (Kč)">
                    <TextField
                      value={
                        input.priceCzk != null
                          ? formatNumber(String(input.priceCzk))
                          : ""
                      }
                      onChange={(v) => {
                        const n = Number(parseNumber(v));
                        patch("priceCzk", n > 0 ? n : null);
                      }}
                      inputMode="numeric"
                    />
                  </Field>
                  <Field label="Plocha (m²)">
                    <TextField
                      value={
                        input.areaM2 != null ? String(input.areaM2) : ""
                      }
                      onChange={(v) => {
                        const n = Number(parseNumber(v));
                        patch("areaM2", n > 0 ? n : null);
                      }}
                      inputMode="numeric"
                    />
                  </Field>
                  <Field label="Nájem / měs. (Kč)">
                    <TextField
                      value={
                        input.rentMonthlyCzk != null
                          ? formatNumber(String(input.rentMonthlyCzk))
                          : ""
                      }
                      onChange={(v) => {
                        const n = Number(parseNumber(v));
                        patch("rentMonthlyCzk", n > 0 ? n : null);
                      }}
                      inputMode="numeric"
                    />
                  </Field>
                  <Field label="Vlastní zdroje / vlastní kapitál (Kč)">
                    <TextField
                      value={
                        input.equityCzk != null
                          ? formatNumber(String(input.equityCzk))
                          : ""
                      }
                      onChange={(v) => {
                        const n = Number(parseNumber(v));
                        patch("equityCzk", n > 0 ? n : null);
                      }}
                      inputMode="numeric"
                    />
                  </Field>
                </div>
              </>
            )}

            {mode === "upload" && (
              <div className="rounded-xl border border-dashed border-border bg-white p-6 text-center">
                <p className="text-sm font-semibold text-text-dark">
                  Nahrání dokumentů a fotek
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Funkce bude dostupná později. Zatím použijte manuální zadání
                  výše — nebo objednejte Prémiovou analýzu a podklady předáte
                  partnerovi bezpečně.
                </p>
                <ClaimBadge kind="NEOVERENO" className="mt-3" />
              </div>
            )}

            <button
              type="button"
              disabled={!canPreview || mode === "upload"}
              onClick={() => {
                setRan(true);
                track("analysis_started", {
                  tool_id: "property_rentgen",
                  price_band: "free",
                  experiment_id: "free_preview",
                  variant_id: getExperimentVariant("free_preview"),
                });
              }}
              className="w-full rounded-lg bg-deep-teal px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              Spočítat bezplatný náhled
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 sm:p-6">
            {!preview ? (
              <p className="text-sm text-muted-foreground">
                Výsledek bezplatného náhledu se zobrazí zde: orientační výnos, cena/m²,
                vhodnost financování a varovné signály — každý s typem claimu.
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Orientační výnos
                    </p>
                    <ClaimBadge kind={preview.orientationalYieldPa.kind} />
                  </div>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-deep-teal">
                    {preview.orientationalYieldPa.value != null
                      ? `${preview.orientationalYieldPa.value} % p.a.`
                      : "—"}
                  </p>
                  {preview.orientationalYieldPa.note ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {preview.orientationalYieldPa.note}
                    </p>
                  ) : null}
                </div>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Cena / m²
                    </p>
                    <ClaimBadge kind={preview.pricePerM2.kind} />
                  </div>
                  <p className="mt-1 text-xl font-bold tabular-nums text-text-dark">
                    {preview.pricePerM2.value != null
                      ? `${preview.pricePerM2.value.toLocaleString("cs-CZ")} Kč`
                      : "—"}
                  </p>
                  {preview.pricePerM2.note ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {preview.pricePerM2.note}
                    </p>
                  ) : null}
                </div>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Vhodnost financování
                    </p>
                    <ClaimBadge kind={preview.financingFit.kind} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {preview.financingFit.value}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-amber-800">
                    Varovné signály
                  </p>
                  <ul className="mt-2 space-y-2">
                    {preview.redFlags.map((f) => (
                      <li
                        key={f.text}
                        className="flex flex-wrap items-start gap-2 text-sm text-muted-foreground"
                      >
                        <ClaimBadge kind={f.kind} />
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <ul className="space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                  {preview.limitations.map((l) => (
                    <li key={l}>• {l}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 rounded-xl border border-muted-gold/40 bg-muted-gold/10 p-4">
              <p className="text-sm font-bold text-text-dark">
                {formatAnalysisPriceLabel()}
              </p>
              <div className="mt-3 space-y-2">
                {!isPaidAnalysisCommerciallyAvailable() ? (
                  <p className="rounded-lg border border-border bg-white px-3 py-2 text-xs text-muted-foreground">
                    Připravujeme — zatím můžete zanechat kontakt. Nejde o
                    objednávku ani platbu.
                  </p>
                ) : null}
                <TextField
                  value={premiumName}
                  onChange={setPremiumName}
                  placeholder="Jméno"
                />
                <TextField
                  value={premiumEmail}
                  onChange={setPremiumEmail}
                  placeholder="E-mail"
                  inputMode="email"
                />
                <TextField
                  value={premiumPhone}
                  onChange={setPremiumPhone}
                  placeholder="Telefon"
                  inputMode="tel"
                />
                <FormConsentFields
                  state={consent}
                  onChange={setConsent}
                  showPartnerTransfer
                />
                <p className="text-[11px] text-muted-foreground">
                  Podmínky digitální služby:{" "}
                  <Link
                    href={routes.legal.placenaAnalyza}
                    className="text-deep-teal underline"
                  >
                    Obchodní podmínky placené analýzy
                  </Link>
                </p>
                <button
                  type="button"
                  disabled={
                    premiumLoading ||
                    !premiumName.trim() ||
                    !premiumEmail.includes("@") ||
                    premiumPhone.trim().length < 6
                  }
                  onClick={requestPremium}
                  className="w-full rounded-lg bg-muted-gold px-4 py-2.5 text-sm font-bold text-[#0b3d3a] disabled:opacity-40"
                >
                  {premiumLoading
                    ? "Odesílám…"
                    : isPaidAnalysisCommerciallyAvailable()
                      ? `Objednat · ${formatAnalysisPrice()}`
                      : "Mám zájem — připravujeme"}
                </button>
                {premiumMsg ? (
                  <p className="text-xs text-muted-foreground">{premiumMsg}</p>
                ) : null}
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              30letý modelář peněžního toku:{" "}
              <Link
                href={routes.investicniRentgenModelar}
                className="font-semibold text-deep-teal underline"
              >
                Otevřít modelář
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
