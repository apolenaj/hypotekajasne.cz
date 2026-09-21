"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ClaimBadge } from "@/components/property-rentgen/ClaimBadge";
import {
  EMPTY_MANUAL_INPUT,
  PROPERTY_ANALYSIS_PRICING,
  analysisPackageFromQuery,
  buildFreePreview,
  formatAnalysisPrice,
  formatAnalysisPriceLabel,
  formatDigitalRentgenPrice,
  getRentgenPremiumConfig,
  rentgenPrimaryCtaLabel,
  type AnalysisProductTierId,
  type ManualPropertyInput,
  type RentgenInputMode,
} from "@/lib/property-rentgen";
import {
  EMPTY_ORDER_PROPERTY_FORM,
  buildPropertyAddressLine,
  formStateToOrderSnapshot,
  parseLooseNumber,
  validateOrderPropertyForCheckout,
  type OrderPropertyFormState,
} from "@/lib/property-rentgen/order-property";
import {
  RentgenOrderPropertyFields,
  type LocalPhotoItem,
} from "@/components/property-rentgen/RentgenOrderPropertyFields";
import {
  formatModelCzk,
  formatModelPct,
} from "@/lib/property-rentgen/control-model";
import {
  CUSTOMER_DIGITAL_DEFAULTS,
  runCustomerDigitalModelFromManual,
} from "@/lib/property-rentgen/customer-digital-model";
import { submitLead } from "@/lib/leads";
import { routes } from "@/lib/routes";
import { cn, formatNumber, parseNumber } from "@/lib/utils";
import {
  FormConsentFields,
  emptyFormConsentState,
  toConsentRecord,
} from "@/components/consent/FormConsentFields";
import { defaultPartnerScope } from "@/lib/consent/records";
import { track, trackCanonical } from "@/lib/analytics/track";
import { getExperimentVariant } from "@/lib/analytics/experiments";

const MODES: { id: RentgenInputMode; label: string; hint: string }[] = [
  {
    id: "manual",
    label: "Manuálně",
    hint: "Nejspolehlivější cesta k bezplatnému náhledu.",
  },
  {
    id: "url",
    label: "S odkazem na inzerát",
    hint: "Odkaz je jen reference — obsah inzerátu automaticky nenačítáme ani neověřujeme.",
  },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactElement<{ id?: string; "aria-label"?: string }>;
}) {
  const id = useId();
  return (
    <div className="block text-sm">
      <label htmlFor={id} className="font-medium text-text-dark">
        {label}
      </label>
      <div className="mt-1.5">
        {isValidElement(children)
          ? cloneElement(children, { id, "aria-label": undefined })
          : children}
      </div>
    </div>
  );
}

function TextField({
  id,
  value,
  onChange,
  placeholder,
  label,
  inputMode = "text",
  "aria-label": ariaLabel,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  inputMode?: "text" | "numeric" | "decimal" | "url" | "email" | "tel";
  "aria-label"?: string;
}) {
  const autoId = useId();
  const inputId = id ?? (label ? autoId : undefined);
  const input = (
    <input
      id={inputId}
      type="text"
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label ? undefined : ariaLabel || placeholder || "Textové pole"}
      className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none ring-deep-teal/30 focus:ring-2"
    />
  );
  if (!label) return input;
  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-1 block text-xs font-semibold text-text-dark"
      >
        {label}
      </label>
      {input}
    </div>
  );
}

export function RentgenToolIsland({
  checkoutLive = false,
}: {
  /** Server-resolved: Stripe production checkout is on */
  checkoutLive?: boolean;
}) {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<RentgenInputMode>("manual");
  const [input, setInput] = useState<ManualPropertyInput>(EMPTY_MANUAL_INPUT);
  const [ran, setRan] = useState(false);
  const [interestPackage, setInterestPackage] = useState<AnalysisProductTierId>(
    () => analysisPackageFromQuery(searchParams.get("balicek"))
  );
  const [premiumName, setPremiumName] = useState("");
  const [premiumEmail, setPremiumEmail] = useState("");
  const [premiumPhone, setPremiumPhone] = useState("");
  const [orderForm, setOrderForm] = useState<OrderPropertyFormState>(
    EMPTY_ORDER_PROPERTY_FORM
  );
  const [orderPhotos, setOrderPhotos] = useState<LocalPhotoItem[]>([]);
  const [draftOrder, setDraftOrder] = useState<{
    orderId: string;
    publicId: string;
    accessToken: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [premiumMsg, setPremiumMsg] = useState<string | null>(null);
  const [consent, setConsent] = useState(() =>
    emptyFormConsentState(defaultPartnerScope("property_analysis"))
  );
  const prefillDoneRef = useRef(false);
  const startedRef = useRef(false);
  const freeViewedRef = useRef(false);
  const premiumViewedRef = useRef(false);
  const premiumBlockRef = useRef<HTMLDivElement>(null);

  const premiumCfg = useMemo(() => getRentgenPremiumConfig(), []);
  const live = checkoutLive || premiumCfg.commerciallyActive;

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("hj-rentgen-draft");
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        orderId?: string;
        publicId?: string;
        accessToken?: string;
      };
      if (parsed.orderId && parsed.accessToken) {
        setDraftOrder({
          orderId: parsed.orderId,
          publicId: parsed.publicId || "",
          accessToken: parsed.accessToken,
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setInterestPackage(analysisPackageFromQuery(searchParams.get("balicek")));
  }, [searchParams]);

  useEffect(() => {
    const balicek = searchParams.get("balicek");
    if (!balicek && typeof window !== "undefined" && !window.location.hash.includes("premium-objednavka")) {
      return;
    }
    const t = window.setTimeout(() => {
      premiumBlockRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(t);
  }, [searchParams]);

  // Prefill order form from free-preview inputs (once, then user can edit).
  useEffect(() => {
    if (prefillDoneRef.current) return;
    const hasPreviewData =
      Boolean(input.listingUrl?.trim()) ||
      Boolean(input.city?.trim()) ||
      input.priceCzk != null ||
      input.rentMonthlyCzk != null ||
      input.equityCzk != null ||
      input.areaM2 != null;
    if (!hasPreviewData) return;
    prefillDoneRef.current = true;
    setOrderForm((prev) => {
      const listing = input.listingUrl?.trim() || prev.listingUrl;
      const city = input.city?.trim() || prev.city;
      const hasUrl = Boolean(listing);
      const hasCity = Boolean(city);
      return {
        ...prev,
        listingUrl: listing,
        city,
        street: prev.street,
        identificationMode: hasUrl && hasCity ? "both" : hasUrl ? "url" : "address",
        purchasePrice:
          prev.purchasePrice ||
          (input.priceCzk != null ? formatNumber(input.priceCzk) : ""),
        monthlyRent:
          prev.monthlyRent ||
          (input.rentMonthlyCzk != null
            ? formatNumber(input.rentMonthlyCzk)
            : ""),
        equity:
          prev.equity ||
          (input.equityCzk != null ? formatNumber(input.equityCzk) : ""),
        floorArea:
          prev.floorArea ||
          (input.areaM2 != null ? String(input.areaM2) : ""),
        propertyType:
          prev.propertyType ||
          (input.propertyType === "Byt"
            ? "Byt"
            : input.propertyType === "Dům"
              ? "Rodinný dům"
              : input.propertyType === "Komerce"
                ? "Komerční"
                : prev.propertyType),
      };
    });
  }, [input]);

  // Re-sync financial prefill when user runs preview again.
  useEffect(() => {
    if (!ran) return;
    setOrderForm((prev) => ({
      ...prev,
      listingUrl: input.listingUrl?.trim() || prev.listingUrl,
      city: input.city?.trim() || prev.city,
      purchasePrice:
        input.priceCzk != null ? formatNumber(input.priceCzk) : prev.purchasePrice,
      monthlyRent:
        input.rentMonthlyCzk != null
          ? formatNumber(input.rentMonthlyCzk)
          : prev.monthlyRent,
      equity:
        input.equityCzk != null ? formatNumber(input.equityCzk) : prev.equity,
      floorArea:
        input.areaM2 != null ? String(input.areaM2) : prev.floorArea,
    }));
  }, [ran, input.listingUrl, input.city, input.priceCzk, input.rentMonthlyCzk, input.equityCzk, input.areaM2]);

  const patch = <K extends keyof ManualPropertyInput>(
    key: K,
    value: ManualPropertyInput[K]
  ) => setInput((prev) => ({ ...prev, [key]: value }));

  const preview = useMemo(
    () => (ran ? buildFreePreview(input, mode) : null),
    [ran, input, mode]
  );
  const digitalModel = useMemo(
    () => (ran ? runCustomerDigitalModelFromManual(input) : null),
    [ran, input]
  );

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackCanonical("property_xray_started", "rentgen_started", {
      tool_id: "property_rentgen",
      price_band: "free",
      experiment_id: "free_preview",
      variant_id: getExperimentVariant("free_preview"),
    });
  }, []);

  useEffect(() => {
    if (!preview || freeViewedRef.current) return;
    freeViewedRef.current = true;
    trackCanonical("property_xray_completed", "free_result_viewed", {
      tool_id: "property_rentgen",
      price_band: "free",
      experiment_id: "free_preview",
      variant_id: getExperimentVariant("free_preview"),
    });
  }, [preview]);

  useEffect(() => {
    const el = premiumBlockRef.current;
    if (!el || premiumViewedRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || premiumViewedRef.current) return;
        premiumViewedRef.current = true;
        track("premium_viewed", {
          tool_id: "property_rentgen",
          price_band: "premium",
        });
        obs.disconnect();
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [preview]);

  const canPreview = Boolean(
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
    ) {
      setPremiumMsg("Doplňte jméno, e-mail a telefon.");
      return;
    }

    const validPhotos = orderPhotos.filter((p) => p.status !== "error");
    const validation = validateOrderPropertyForCheckout({
      form: orderForm,
      photoCount: validPhotos.length,
      requirePhotoWithoutListing: true,
    });
    if (!validation.ok) {
      setPremiumMsg(validation.errors[0] || "Doplňte údaje o nemovitosti.");
      const errs: Record<string, string> = {};
      for (const e of validation.errors) {
        if (/adres|inzerát/i.test(e)) errs.identity = e;
        else if (/popis/i.test(e)) errs.propertyDescription = e;
        else if (/kupní/i.test(e)) errs.purchasePrice = e;
        else if (/nájem/i.test(e)) errs.monthlyRent = e;
        else if (/kapitál/i.test(e)) errs.equity = e;
        else if (/fotograf/i.test(e)) errs.photos = e;
      }
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setPremiumLoading(true);
    setPremiumMsg(null);
    track("premium_cta_clicked", {
      tool_id: "property_rentgen",
      price_band: "premium",
      experiment_id: "free_preview",
      variant_id: getExperimentVariant("free_preview"),
    });
    track("analysis_checkout_started", {
      tool_id: "property_rentgen",
      price_band: "premium",
      experiment_id: "free_preview",
      variant_id: getExperimentVariant("free_preview"),
    });

    if (live) {
      try {
        const productCode =
          interestPackage === "premium"
            ? "INDIVIDUAL_ANALYSIS"
            : "INVESTMENT_XRAY";
        const snapshot = formStateToOrderSnapshot(orderForm, {
          annualRatePercent:
            input.annualRatePercent ??
            CUSTOMER_DIGITAL_DEFAULTS.annualRatePercent,
          termYears: input.termYears ?? CUSTOMER_DIGITAL_DEFAULTS.termYears,
          areaM2Fallback: input.areaM2,
          productCode,
        });

        // 1) Create / update DRAFT order
        const draftRes = await fetch("/api/checkout/rentgen/draft", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            productCode,
            email: premiumEmail.trim(),
            name: premiumName.trim(),
            phone: premiumPhone.trim(),
            property: snapshot,
            orderId: draftOrder?.orderId,
            resumePublicId: draftOrder?.publicId,
            resumeAccess: draftOrder?.accessToken,
            sourceUrl:
              typeof window !== "undefined" ? window.location.href : undefined,
          }),
        });
        const draftJson = (await draftRes.json()) as {
          error?: string;
          orderId?: string;
          publicId?: string;
          accessToken?: string;
        };
        if (!draftRes.ok || !draftJson.orderId || !draftJson.accessToken) {
          throw new Error(draftJson.error || "Objednávku se nepodařilo uložit.");
        }
        const credentials = {
          orderId: draftJson.orderId,
          publicId: draftJson.publicId || "",
          accessToken: draftJson.accessToken,
        };
        setDraftOrder(credentials);
        try {
          sessionStorage.setItem(
            "hj-rentgen-draft",
            JSON.stringify(credentials)
          );
        } catch {
          /* ignore */
        }

        // 2) Upload pending photos bound to orderId
        const uploadedRefs = [...(snapshot.photos || [])];
        const nextPhotos = [...orderPhotos];
        for (let i = 0; i < nextPhotos.length; i++) {
          const item = nextPhotos[i]!;
          if (item.status === "error") continue;
          if (item.remote) {
            uploadedRefs.push(item.remote);
            continue;
          }
          nextPhotos[i] = { ...item, status: "uploading" };
          setOrderPhotos([...nextPhotos]);
          const fd = new FormData();
          fd.set("file", item.file);
          fd.set("orderId", credentials.orderId);
          fd.set("publicId", credentials.publicId);
          fd.set("accessToken", credentials.accessToken);
          const up = await fetch("/api/checkout/rentgen/photos", {
            method: "POST",
            body: fd,
          });
          const upJson = (await up.json()) as {
            error?: string;
            photo?: (typeof uploadedRefs)[number];
          };
          if (!up.ok || !upJson.photo) {
            nextPhotos[i] = {
              ...item,
              status: "error",
              error: upJson.error || "Upload selhal",
            };
            setOrderPhotos([...nextPhotos]);
            throw new Error(
              upJson.error || `Nahrání fotografie „${item.file.name}“ selhalo.`
            );
          }
          uploadedRefs.push(upJson.photo);
          nextPhotos[i] = {
            ...item,
            status: "done",
            remote: upJson.photo,
          };
          setOrderPhotos([...nextPhotos]);
        }

        // Photo rule after uploads
        const hasListing = Boolean(snapshot.listingUrl);
        if (!hasListing && uploadedRefs.length < 1) {
          throw new Error(
            "Nahrajte alespoň jednu fotografii objektu, nebo vložte odkaz na inzerát."
          );
        }

        const { startRentgenCheckout } = await import(
          "@/lib/property-rentgen/start-checkout"
        );
        const result = await startRentgenCheckout({
          productCode,
          email: premiumEmail.trim(),
          name: premiumName.trim(),
          phone: premiumPhone.trim(),
          orderId: credentials.orderId,
          resumePublicId: credentials.publicId,
          resumeAccess: credentials.accessToken,
          property: {
            ...snapshot,
            photos: uploadedRefs,
          },
          sourceUrl:
            typeof window !== "undefined" ? window.location.href : undefined,
        });
        track("analysis_checkout_started", {
          tool_id: "property_rentgen",
          price_band: "premium",
        });
        window.location.href = result.url;
        return;
      } catch (err) {
        setPremiumLoading(false);
        setPremiumMsg(
          err instanceof Error
            ? err.message
            : "Platbu se nepodařilo spustit. Zkuste to znovu."
        );
        return;
      }
    }

    const res = await submitLead({
      name: premiumName.trim(),
      email: premiumEmail.trim(),
      phone: premiumPhone.trim(),
      source: "property_analysis",
      country: input.country || undefined,
      notes: [
        formatAnalysisPriceLabel(),
        `zajembalicek=${interestPackage}`,
        `mode=${mode}`,
        orderForm.listingUrl ? `url=${orderForm.listingUrl}` : null,
        orderForm.city ? `city=${orderForm.city}` : null,
        orderForm.street ? `street=${orderForm.street}` : null,
        parseLooseNumber(orderForm.purchasePrice) != null
          ? `price=${parseLooseNumber(orderForm.purchasePrice)}`
          : null,
      ]
        .filter(Boolean)
        .join(" | "),
      metadata: {
        product_id:
          interestPackage === "premium"
            ? PROPERTY_ANALYSIS_PRICING.productId
            : "hypotekajasne-rentgen-digital-v1",
        amount_czk:
          interestPackage === "premium"
            ? PROPERTY_ANALYSIS_PRICING.amountCzk
            : 999,
        interest_package: interestPackage,
        input_mode: mode,
        city: orderForm.city || input.city,
        price_czk: parseLooseNumber(orderForm.purchasePrice) ?? input.priceCzk,
        area_m2: parseLooseNumber(orderForm.floorArea) ?? input.areaM2,
        listing_url: orderForm.listingUrl || input.listingUrl || null,
        preview_ran: ran,
      },
      consent: toConsentRecord(consent),
    });
    setPremiumLoading(false);
    setPremiumMsg(
      res.ok
        ? "Objednávku jsme přijali. Pokud se platba nespustila, zkontrolujte, že je Stripe checkout aktivní, nebo to zkuste znovu."
        : res.error
    );
    if (res.ok) {
      trackCanonical("lead_form_submitted", "lead_submitted", {
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
          Analyzovat nemovitost
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Zadejte údaje o konkrétní nemovitosti. Výsledek je modelový náhled —
          ne investiční doporučení.
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
                  <Field label="Odkaz na inzerát (jen reference)">
                    <TextField
                      value={input.listingUrl}
                      onChange={(v) => patch("listingUrl", v)}
                      placeholder="https://…"
                      inputMode="url"
                    />
                  </Field>
                )}
                {mode === "url" ? (
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Odkaz slouží jen jako reference k nemovitosti. Obsah inzerátu
                    automaticky nenačítáme.
                  </p>
                ) : null}
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
                  <Field label="Typ nemovitosti">
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
                  <div>
                    <Field label="Nájem bez záloh (Kč / měs.)">
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
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Čistý nájem bez přeúčtovaných záloh na služby.
                    </p>
                  </div>
                  <div>
                    <Field label="Vlastní kapitál vůči kupní ceně (Kč)">
                      <TextField
                        value={
                          input.equityCzk != null
                            ? formatNumber(String(input.equityCzk))
                            : ""
                        }
                        onChange={(v) => {
                          const n = Number(parseNumber(v));
                          patch("equityCzk", n >= 0 ? n : null);
                        }}
                        inputMode="numeric"
                      />
                    </Field>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Část kupní ceny z vlastních prostředků (ne celková hotovost
                      včetně rezerv). Úvěr = cena − tento kapitál. Nula = 100 %
                      úvěr.
                    </p>
                  </div>
                </div>

                {mode === "manual" ? (
                  <Field label="Odkaz na inzerát (jen reference, volitelně)">
                    <TextField
                      value={input.listingUrl}
                      onChange={(v) => patch("listingUrl", v)}
                      placeholder="https://…"
                      inputMode="url"
                    />
                  </Field>
                ) : null}

                <details className="rounded-xl border border-border bg-white px-4 py-3">
                  <summary className="cursor-pointer text-sm font-semibold text-deep-teal">
                    Parametry financování
                  </summary>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Sazba a splatnost vstupují do modelu cash flow. Pokud je
                    nevyplníte, použijeme modelové předpoklady (
                    {CUSTOMER_DIGITAL_DEFAULTS.annualRatePercent} % ·{" "}
                    {CUSTOMER_DIGITAL_DEFAULTS.termYears} let).
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Field label="Sazba úvěru (% p.a.)">
                      <TextField
                        value={
                          input.annualRatePercent != null
                            ? String(input.annualRatePercent)
                            : ""
                        }
                        onChange={(v) => {
                          const n = Number(parseNumber(v.replace(",", ".")));
                          patch(
                            "annualRatePercent",
                            Number.isFinite(n) && n >= 0 ? n : null
                          );
                        }}
                        placeholder="např. 4,8"
                        inputMode="numeric"
                      />
                    </Field>
                    <Field label="Splatnost (roky)">
                      <TextField
                        value={
                          input.termYears != null
                            ? String(input.termYears)
                            : ""
                        }
                        onChange={(v) => {
                          const n = Number(parseNumber(v));
                          patch("termYears", n > 0 ? Math.round(n) : null);
                        }}
                        placeholder="např. 30"
                        inputMode="numeric"
                      />
                    </Field>
                  </div>
                </details>
              </>
            )}

            <button
              type="button"
              disabled={!canPreview}
              onClick={() => {
                setRan(true);
                track("property_input_completed", {
                  tool_id: "property_rentgen",
                  price_band: "free",
                });
                track("analysis_started", {
                  tool_id: "property_rentgen",
                  price_band: "free",
                  experiment_id: "free_preview",
                  variant_id: getExperimentVariant("free_preview"),
                });
              }}
              className="w-full rounded-xl bg-deep-teal px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              Spočítat náhled zdarma
            </button>
            <p className="text-center text-[11px] text-muted-foreground">
              Bezplatný náhled ≠ placený Rentgen. PDF a scénáře patří k placenému
              výstupu.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 sm:p-6">
            {!preview ? (
              <p className="text-sm text-muted-foreground">
                Po výpočtu se zde zobrazí orientační výnos, cena/m² a signály k
                ověření. Každý údaj má označení zdroje (zadáno, vypočteno,
                předpoklad, neověřeno).
              </p>
            ) : (
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wide text-deep-teal">
                  Bezplatný výsledek
                </p>
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

                {preview.marketComparison ? (
                  <div className="rounded-xl border border-border bg-[#f7f8f7] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Porovnání trhu
                      </p>
                      <ClaimBadge kind={preview.marketComparison.kind} />
                    </div>
                    <p className="mt-1 text-sm text-text-dark">
                      {preview.marketComparison.summary}
                    </p>
                    {preview.marketComparison.hasMarketData &&
                    preview.marketComparison.deltaPercent.value != null ? (
                      <p className="mt-1 text-xs tabular-nums text-deep-teal">
                        Δ vs. reference:{" "}
                        {preview.marketComparison.deltaPercent.value > 0 ? "+" : ""}
                        {preview.marketComparison.deltaPercent.value} %
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {digitalModel?.ok ? (
                  <div className="rounded-xl border border-deep-teal/30 bg-[#f4f7f6] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        Model cash flow z vašich vstupů
                      </p>
                      <ClaimBadge kind="MODEL" />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Spočteno modulem {digitalModel.modelVersion} z vámi zadané
                      ceny, plochy, nájmu a kapitálu — ne z ukázkového dema.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        [
                          "Vlastní hotovost vč. rezervy",
                          formatModelCzk(
                            digitalModel.result.totalOwnCashIncludingReserveCzk
                          ),
                        ],
                        [
                          "Tok / měs.",
                          formatModelCzk(
                            digitalModel.result.monthlyCashFlowCzk,
                            2
                          ),
                        ],
                        [
                          "Hrubý výnos",
                          formatModelPct(
                            digitalModel.result.grossYieldOnPurchase,
                            2
                          ),
                        ],
                        [
                          "Cena / m²",
                          formatModelCzk(digitalModel.result.pricePerM2Czk),
                        ],
                      ].map(([l, v]) => (
                        <div key={l}>
                          <p className="text-[10px] text-muted-foreground">{l}</p>
                          <p className="font-semibold tabular-nums text-text-dark">
                            {v}
                          </p>
                        </div>
                      ))}
                    </div>
                    <ul className="mt-3 space-y-1 text-[11px] text-muted-foreground">
                      {digitalModel.assumptionNotesCs.slice(0, 3).map((n) => (
                        <li key={n}>· {n}</li>
                      ))}
                    </ul>
                    <a
                      href={`/api/rentgen-sample-pdf?source=customer&price=${input.priceCzk}&area=${input.areaM2}&rent=${input.rentMonthlyCzk}&equity=${input.equityCzk}`}
                      className="mt-3 inline-flex text-xs font-semibold text-deep-teal underline-offset-2 hover:underline"
                    >
                      Stáhnout PDF z těchto vstupů (model)
                    </a>
                  </div>
                ) : digitalModel && !digitalModel.ok ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
                    <p className="font-semibold">Pro plný model cash flow</p>
                    <p className="mt-1">{digitalModel.messageCs}</p>
                    <p className="mt-1 text-amber-900/80">
                      Náhled zdarma výše zůstává. Model {formatDigitalRentgenPrice()}{" "}
                      počítá až z kompletních vstupů — ne z ukázkových čísel.
                    </p>
                  </div>
                ) : null}

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Orientace financování
                    </p>
                    <ClaimBadge kind={preview.financingFit.kind} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {preview.financingFit.value}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Úplnost vstupů
                    </p>
                    <ClaimBadge kind="MODEL" />
                  </div>
                  <p className="mt-1 text-lg font-bold tabular-nums text-deep-teal">
                    {preview.dataQuality.score}/100
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {preview.dataQuality.label}
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Skóre úplnosti zadaných polí — ne kvalita ani doporučení
                    nemovitosti.
                  </p>
                  {preview.dataQuality.missingFields.length > 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Chybí: {preview.dataQuality.missingFields.join(", ")}
                    </p>
                  ) : null}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-amber-800">
                    Signály k ověření
                  </p>
                  <ul className="mt-2 space-y-2">
                    {preview.warningSignals.map((f) => (
                      <li
                        key={f.id}
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

            {preview ? (
              <div className="mt-6 rounded-2xl border border-muted-gold/50 bg-muted-gold/10 p-4">
                <p className="text-sm font-bold text-text-dark">
                  Chcete znát skutečné cash flow, rizika a scénáře této
                  nemovitosti?
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <a
                    href="#premium-objednavka"
                    onClick={() => setInterestPackage("digital")}
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-muted-gold px-4 py-2.5 text-sm font-bold text-text-dark"
                  >
                    Odemknout celý Rentgen – {formatDigitalRentgenPrice()}
                  </a>
                  <a
                    href="#premium-objednavka"
                    onClick={() => setInterestPackage("premium")}
                    className="inline-flex flex-1 items-center justify-center rounded-xl border border-deep-teal/30 px-4 py-2.5 text-sm font-bold text-deep-teal"
                  >
                    Individuální rozbor – {formatAnalysisPrice()}
                  </a>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Potřebujete hlubší rozbor podkladů a lokality? Zvolte
                  individuální rozbor.
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  30letý modelář:{" "}
                  <Link
                    href={routes.investicniRentgenModelar}
                    className="font-semibold text-deep-teal underline"
                  >
                    Otevřít modelář
                  </Link>
                </p>
              </div>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground">
                Chcete placený výstup?{" "}
                <a
                  href="#premium-objednavka"
                  className="font-semibold text-deep-teal underline-offset-2 hover:underline"
                >
                  Přejít na objednávku
                </a>
              </p>
            )}
          </div>
        </div>

        <div
          ref={premiumBlockRef}
          id="premium-objednavka"
          className="mt-10 scroll-mt-28 rounded-2xl border border-deep-teal/20 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep-teal",
                interestPackage === "digital"
                  ? "bg-deep-teal text-white"
                  : "border border-border bg-[#f7f9f8] text-muted-foreground"
              )}
              onClick={() => setInterestPackage("digital")}
            >
              Rentgen {formatDigitalRentgenPrice()}
            </button>
            <button
              type="button"
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep-teal",
                interestPackage === "premium"
                  ? "bg-deep-teal text-white"
                  : "border border-border bg-[#f7f9f8] text-muted-foreground"
              )}
              onClick={() => setInterestPackage("premium")}
            >
              Rozbor {formatAnalysisPrice()}
            </button>
          </div>

          {interestPackage === "premium" ? (
            <>
              <h3 className="mt-5 font-heading text-2xl font-bold text-text-dark">
                Individuální rozbor
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Hlubší analýza konkrétní nemovitosti s individuálním zpracováním.
              </p>
              <p className="mt-4 font-heading text-3xl font-bold tabular-nums text-deep-teal">
                {formatAnalysisPrice()}
              </p>
              <p className="text-xs text-muted-foreground">
                jednorázově / 1 nemovitost · Bez předplatného
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>✓ Kompletní Investiční rentgen</li>
                <li>✓ Rozbor dodaných podkladů</li>
                <li>✓ Kontrola finančních předpokladů</li>
                <li>✓ Dohledání relevantních veřejných dat a nabídek</li>
                <li>✓ Individuální komentář</li>
                <li>✓ Rizika a oblasti k dalšímu prověření</li>
                <li>✓ Výstup v PDF</li>
              </ul>
            </>
          ) : (
            <>
              <h3 className="mt-5 font-heading text-2xl font-bold text-text-dark">
                Investiční rentgen
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Automatický model cash flow, scénářů a bodu zvratu pro jednu
                nemovitost.
              </p>
              <p className="mt-4 font-heading text-3xl font-bold tabular-nums text-deep-teal">
                {formatDigitalRentgenPrice()}
              </p>
              <p className="text-xs text-muted-foreground">
                jednorázově / 1 nemovitost · Bez předplatného
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>✓ Vlastní hotovost a cash flow</li>
                <li>✓ Scénáře a stress test</li>
                <li>✓ Bod zvratu</li>
                <li>✓ Interaktivní výstup a PDF</li>
              </ul>
            </>
          )}

          <div className="mt-6 space-y-6">
            <RentgenOrderPropertyFields
              form={orderForm}
              onChange={(patchForm) =>
                setOrderForm((prev) => ({ ...prev, ...patchForm }))
              }
              photos={orderPhotos}
              onPhotosChange={setOrderPhotos}
              isPremium={interestPackage === "premium"}
              fieldErrors={fieldErrors}
            />
            <p className="text-[11px] text-muted-foreground">
              Pokud jste už vyplnili náhled výše, údaje se použijí automaticky —
              zde je můžete upravit nebo doplnit.
            </p>

            <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
              <h4 className="font-heading text-lg font-bold text-text-dark">
                Kontaktní údaje
              </h4>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <TextField
                  label="Jméno"
                  value={premiumName}
                  onChange={setPremiumName}
                  placeholder="Jan Novák"
                />
                <TextField
                  label="E-mail"
                  value={premiumEmail}
                  onChange={setPremiumEmail}
                  placeholder="jan@email.cz"
                  inputMode="email"
                />
                <TextField
                  label="Telefon"
                  value={premiumPhone}
                  onChange={setPremiumPhone}
                  placeholder="+420 …"
                  inputMode="tel"
                />
              </div>
            </section>

            <div className="space-y-2">
              <FormConsentFields
                state={consent}
                onChange={setConsent}
                showPartnerTransfer
              />
              <p className="text-[11px] text-muted-foreground">
                Podmínky:{" "}
                <Link
                  href={routes.legal.placenaAnalyza}
                  className="text-deep-teal underline"
                >
                  Obchodní podmínky placené analýzy
                </Link>
                {" · "}
                <Link
                  href={routes.legal.gdpr}
                  className="text-deep-teal underline"
                >
                  Ochrana osobních údajů
                </Link>
              </p>
            </div>

            <div className="rounded-2xl border border-deep-teal/15 bg-[#f7f9f8] p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Souhrn objednávky
              </p>
              <h4 className="mt-1 font-heading text-xl font-bold text-text-dark">
                {interestPackage === "premium"
                  ? "Individuální rozbor"
                  : "Investiční rentgen"}
              </h4>
              <dl className="mt-4 space-y-2 text-sm">
                {(orderForm.layout ||
                  orderForm.floorArea ||
                  orderForm.propertyType) && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Nemovitost</dt>
                    <dd className="text-right font-medium text-text-dark">
                      {[
                        orderForm.propertyType,
                        orderForm.layout,
                        orderForm.floorArea
                          ? `${orderForm.floorArea} m²`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </dd>
                  </div>
                )}
                {(orderForm.street || orderForm.city) && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Adresa</dt>
                    <dd className="text-right font-medium text-text-dark">
                      {buildPropertyAddressLine({
                        street: orderForm.street,
                        city: orderForm.city,
                        postalCode: orderForm.postalCode,
                      })}
                    </dd>
                  </div>
                )}
                {orderForm.listingUrl.trim() ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Inzerát</dt>
                    <dd className="max-w-[60%] truncate text-right font-medium text-deep-teal">
                      {orderForm.listingUrl}
                    </dd>
                  </div>
                ) : null}
                {parseLooseNumber(orderForm.purchasePrice) != null ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Kupní cena</dt>
                    <dd className="font-medium tabular-nums text-text-dark">
                      {formatNumber(parseLooseNumber(orderForm.purchasePrice)!)}{" "}
                      Kč
                    </dd>
                  </div>
                ) : null}
                {parseLooseNumber(orderForm.monthlyRent) != null ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">
                      Předpokládaný nájem
                    </dt>
                    <dd className="font-medium tabular-nums text-text-dark">
                      {formatNumber(parseLooseNumber(orderForm.monthlyRent)!)} Kč
                      / měsíc
                    </dd>
                  </div>
                ) : null}
                {parseLooseNumber(orderForm.equity) != null ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Vlastní kapitál</dt>
                    <dd className="font-medium tabular-nums text-text-dark">
                      {formatNumber(parseLooseNumber(orderForm.equity)!)} Kč
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Fotografie</dt>
                  <dd className="font-medium text-text-dark">
                    {orderPhotos.filter((p) => p.status !== "error").length}{" "}
                    nahráno
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-border pt-2">
                  <dt className="font-semibold text-text-dark">Cena analýzy</dt>
                  <dd className="font-bold tabular-nums text-deep-teal">
                    {interestPackage === "premium"
                      ? formatAnalysisPrice()
                      : formatDigitalRentgenPrice()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {interestPackage === "premium" ? (
              <p className="rounded-xl bg-deep-teal/5 px-3 py-2 text-xs text-deep-teal">
                Po platbě budete moci doplnit další podklady k rozboru (půdorys,
                PENB, dokumenty SVJ, plán rekonstrukce aj.).
              </p>
            ) : null}
            <button
              type="button"
              disabled={
                premiumLoading ||
                !premiumName.trim() ||
                !premiumEmail.includes("@") ||
                premiumPhone.trim().length < 6
              }
              onClick={requestPremium}
              className={cn(
                "w-full rounded-xl px-4 py-3.5 text-sm font-bold disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep-teal",
                interestPackage === "premium"
                  ? "bg-deep-teal text-white"
                  : "bg-muted-gold text-text-dark"
              )}
            >
              {premiumLoading
                ? "Připravuji platbu…"
                : live
                  ? interestPackage === "premium"
                    ? `Pokračovat k bezpečné platbě – ${formatAnalysisPrice()}`
                    : `Pokračovat k bezpečné platbě – ${formatDigitalRentgenPrice()}`
                  : rentgenPrimaryCtaLabel(
                      interestPackage === "premium" ? "premium" : "digital"
                    )}
            </button>
            <p className="text-center text-[11px] text-muted-foreground">
              Platba proběhne bezpečně prostřednictvím Stripe. Nejde o
              předplatné.
            </p>
            {premiumMsg ? (
              <p className="text-xs text-red-700" role="status">
                {premiumMsg}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
