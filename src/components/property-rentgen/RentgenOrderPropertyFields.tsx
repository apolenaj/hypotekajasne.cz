"use client";

import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import { cn, formatNumber } from "@/lib/utils";
import {
  OWNERSHIP_TYPE_OPTIONS,
  PROPERTY_CONDITION_OPTIONS,
  PROPERTY_DESCRIPTION_MAX,
  PROPERTY_LAYOUT_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  RENTGEN_PHOTO_MAX_BYTES,
  RENTGEN_PHOTO_MAX_COUNT,
  isAllowedPhotoMime,
  type OrderPropertyFormState,
  type PropertyIdentificationMode,
  type RentgenOrderPhotoRef,
} from "@/lib/property-rentgen/order-property";

export type LocalPhotoItem = {
  localId: string;
  file: File;
  previewUrl: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  remote?: RentgenOrderPhotoRef;
};

type Props = {
  form: OrderPropertyFormState;
  onChange: (patch: Partial<OrderPropertyFormState>) => void;
  photos: LocalPhotoItem[];
  onPhotosChange: (photos: LocalPhotoItem[]) => void;
  isPremium: boolean;
  fieldErrors?: Record<string, string>;
  /** Which checkout steps to render (default: all). */
  steps?: Array<"property" | "finance" | "documents" | "all">;
};

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-semibold text-text-dark"
    >
      {children}
      {required ? <span className="text-deep-teal"> *</span> : null}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none ring-deep-teal/30 focus:ring-2"
      >
        <option value="">Vyberte…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function RentgenOrderPropertyFields({
  form,
  onChange,
  photos,
  onPhotosChange,
  isPremium,
  fieldErrors = {},
  steps = ["all"],
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const descCount = form.propertyDescription.length;
  const showAll = steps.includes("all");
  const showProperty = showAll || steps.includes("property");
  const showFinance = showAll || steps.includes("finance");
  const showDocuments = showAll || steps.includes("documents");
  const requireDescription = isPremium;
  const requirePhotosWithoutListing = false;

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList);
      const next = [...photos];
      for (const file of incoming) {
        if (next.length >= RENTGEN_PHOTO_MAX_COUNT) break;
        if (!isAllowedPhotoMime(file.type)) {
          next.push({
            localId: crypto.randomUUID(),
            file,
            previewUrl: "",
            status: "error",
            error: "Povolené formáty: JPG, PNG, WEBP",
          });
          continue;
        }
        if (file.size > RENTGEN_PHOTO_MAX_BYTES) {
          next.push({
            localId: crypto.randomUUID(),
            file,
            previewUrl: "",
            status: "error",
            error: "Soubor je větší než 10 MB",
          });
          continue;
        }
        next.push({
          localId: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          status: "pending",
        });
      }
      onPhotosChange(next);
    },
    [onPhotosChange, photos]
  );

  const removePhoto = (localId: string) => {
    const target = photos.find((p) => p.localId === localId);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    onPhotosChange(photos.filter((p) => p.localId !== localId));
  };

  const setMode = (mode: PropertyIdentificationMode) => {
    onChange({ identificationMode: mode });
  };

  return (
    <div className="space-y-6">
      {showProperty ? (
      <section className="rounded-2xl border border-deep-teal/15 bg-white p-5 sm:p-6">
        <h4 className="font-heading text-lg font-bold text-text-dark">
          Analyzovaná nemovitost
        </h4>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {isPremium
            ? "Zadejte konkrétní nemovitost. Čím přesnější údaje dodáte, tím kvalitnější bude individuální posouzení."
            : "Pro automatický výpočet stačí identifikace a klíčová čísla."}
        </p>

        <fieldset className="mt-5">
          <legend className="text-xs font-semibold text-text-dark">
            Jak chcete nemovitost identifikovat?
          </legend>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {(
              [
                ["url", "Mám odkaz na inzerát"],
                ["address", "Znám adresu / lokalitu"],
                ["both", "Mám obojí"],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm",
                  form.identificationMode === value
                    ? "border-deep-teal bg-deep-teal/5 font-semibold text-deep-teal"
                    : "border-border bg-[#fafbfa] text-muted-foreground"
                )}
              >
                <input
                  type="radio"
                  name="id-mode"
                  className="accent-deep-teal"
                  checked={form.identificationMode === value}
                  onChange={() => setMode(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {(form.identificationMode === "url" ||
          form.identificationMode === "both") && (
          <div className="mt-4">
            <FieldLabel required>Odkaz na inzerát</FieldLabel>
            <input
              type="url"
              inputMode="url"
              value={form.listingUrl}
              onChange={(e) => onChange({ listingUrl: e.target.value })}
              placeholder="https://www.sreality.cz/detail/…"
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none ring-deep-teal/30 focus:ring-2"
            />
            {fieldErrors.listingUrl ? (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.listingUrl}</p>
            ) : (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Odkaz přiložíme k zadání. Údaje pro automatický výpočet vyplníte
                níže — obsah inzerátu automaticky nenačítáme.
              </p>
            )}
          </div>
        )}

        {(form.identificationMode === "address" ||
          form.identificationMode === "both") && (
          <div className="mt-4 grid gap-3 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <FieldLabel required>Ulice a číslo popisné</FieldLabel>
              <input
                type="text"
                value={form.street}
                onChange={(e) => onChange({ street: e.target.value })}
                placeholder="Vinohradská 1234/56"
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none ring-deep-teal/30 focus:ring-2"
              />
              {fieldErrors.street ? (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.street}</p>
              ) : null}
            </div>
            <div className="sm:col-span-2">
              <FieldLabel required>Město / lokalita</FieldLabel>
              <input
                type="text"
                value={form.city}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="Praha"
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none ring-deep-teal/30 focus:ring-2"
              />
              {fieldErrors.city ? (
                <p className="mt-1 text-xs text-red-700">{fieldErrors.city}</p>
              ) : null}
            </div>
            <div className="sm:col-span-1">
              <FieldLabel>PSČ</FieldLabel>
              <input
                type="text"
                inputMode="numeric"
                value={form.postalCode}
                onChange={(e) => onChange({ postalCode: e.target.value })}
                placeholder="120 00"
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none ring-deep-teal/30 focus:ring-2"
              />
            </div>
          </div>
        )}

        {fieldErrors.identity ? (
          <p className="mt-3 text-xs text-red-700" role="alert">
            {fieldErrors.identity}
          </p>
        ) : null}

        {/* Compact property params for digital; richer for premium */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <FieldLabel required>Podlahová plocha</FieldLabel>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={form.floorArea}
                onChange={(e) => onChange({ floorArea: e.target.value })}
                placeholder="58"
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 pr-12 text-sm outline-none ring-deep-teal/30 focus:ring-2"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                m²
              </span>
            </div>
            {fieldErrors.floorArea ? (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.floorArea}</p>
            ) : null}
          </div>
          {isPremium ? (
            <>
              <SelectField
                label="Typ nemovitosti"
                value={form.propertyType}
                onChange={(v) =>
                  onChange({
                    propertyType: v as OrderPropertyFormState["propertyType"],
                  })
                }
                options={PROPERTY_TYPE_OPTIONS}
              />
              <SelectField
                label="Dispozice"
                value={form.layout}
                onChange={(v) =>
                  onChange({ layout: v as OrderPropertyFormState["layout"] })
                }
                options={PROPERTY_LAYOUT_OPTIONS}
              />
            </>
          ) : null}
        </div>

        {isPremium ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Stav nemovitosti"
              value={form.condition}
              onChange={(v) =>
                onChange({
                  condition: v as OrderPropertyFormState["condition"],
                })
              }
              options={PROPERTY_CONDITION_OPTIONS}
            />
            <SelectField
              label="Vlastnictví"
              value={form.ownershipType}
              onChange={(v) =>
                onChange({
                  ownershipType: v as OrderPropertyFormState["ownershipType"],
                })
              }
              options={OWNERSHIP_TYPE_OPTIONS}
            />
          </div>
        ) : null}
      </section>
      ) : null}

      {showFinance ? (
      <section className="rounded-2xl border border-border bg-[#f7f9f8] p-5 sm:p-6">
        <h4 className="font-heading text-lg font-bold text-text-dark">
          Financování
        </h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Základní čísla pro cash flow. Pokud sazbu nebo splatnost neznáte,
          použijeme modelový předpoklad.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <FieldLabel required>Kupní cena</FieldLabel>
            <input
              type="text"
              inputMode="decimal"
              value={form.purchasePrice}
              onChange={(e) => onChange({ purchasePrice: e.target.value })}
              placeholder="např. 4 500 000"
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none ring-deep-teal/30 focus:ring-2"
            />
            {fieldErrors.purchasePrice ? (
              <p className="mt-1 text-xs text-red-700">
                {fieldErrors.purchasePrice}
              </p>
            ) : null}
          </div>
          <div>
            <FieldLabel required>Měsíční nájem</FieldLabel>
            <input
              type="text"
              inputMode="decimal"
              value={form.monthlyRent}
              onChange={(e) => onChange({ monthlyRent: e.target.value })}
              placeholder="např. 18 000"
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none ring-deep-teal/30 focus:ring-2"
            />
            {fieldErrors.monthlyRent ? (
              <p className="mt-1 text-xs text-red-700">
                {fieldErrors.monthlyRent}
              </p>
            ) : null}
          </div>
          <div>
            <FieldLabel required>Vlastní kapitál</FieldLabel>
            <input
              type="text"
              inputMode="decimal"
              value={form.equity}
              onChange={(e) => onChange({ equity: e.target.value })}
              placeholder="např. 900 000"
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none ring-deep-teal/30 focus:ring-2"
            />
            {fieldErrors.equity ? (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.equity}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel>Úroková sazba</FieldLabel>
            <label className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="accent-deep-teal"
                checked={form.useModelRate}
                onChange={(e) =>
                  onChange({ useModelRate: e.target.checked })
                }
              />
              Nevím – použít modelový předpoklad (4,8 %)
            </label>
            {!form.useModelRate ? (
              <input
                type="text"
                inputMode="decimal"
                value={form.annualRatePercent}
                onChange={(e) =>
                  onChange({ annualRatePercent: e.target.value })
                }
                placeholder="např. 4,8"
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none ring-deep-teal/30 focus:ring-2"
              />
            ) : null}
          </div>
          <div>
            <FieldLabel>Splatnost</FieldLabel>
            <label className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="accent-deep-teal"
                checked={form.useModelTerm}
                onChange={(e) =>
                  onChange({ useModelTerm: e.target.checked })
                }
              />
              Nevím – použít modelový předpoklad (30 let)
            </label>
            {!form.useModelTerm ? (
              <input
                type="text"
                inputMode="numeric"
                value={form.termYears}
                onChange={(e) => onChange({ termYears: e.target.value })}
                placeholder="např. 30"
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none ring-deep-teal/30 focus:ring-2"
              />
            ) : null}
          </div>
        </div>
      </section>
      ) : null}

      {showDocuments && isPremium ? (
      <>
      <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
        <h4 className="font-heading text-lg font-bold text-text-dark">
          Popis a kontext
        </h4>
        <div className="mt-4">
          <FieldLabel required={requireDescription}>
            Popis nemovitosti
          </FieldLabel>
          <textarea
            value={form.propertyDescription}
            onChange={(e) =>
              onChange({
                propertyDescription: e.target.value.slice(
                  0,
                  PROPERTY_DESCRIPTION_MAX
                ),
              })
            }
            rows={5}
            placeholder="Byt 2+kk, stav, nájemní vztah, rekonstrukce…"
            className="min-h-[120px] w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm leading-relaxed outline-none ring-deep-teal/30 focus:ring-2"
          />
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-muted-foreground">
              Pomáhá individuálnímu posouzení — není vstupem do automatického
              výpočtu Rentgenu.
            </p>
            <p
              className={cn(
                "text-[11px] tabular-nums",
                descCount > PROPERTY_DESCRIPTION_MAX * 0.9
                  ? "text-amber-700"
                  : "text-muted-foreground"
              )}
            >
              {descCount} / {PROPERTY_DESCRIPTION_MAX}
            </p>
          </div>
          {fieldErrors.propertyDescription ? (
            <p className="mt-1 text-xs text-red-700">
              {fieldErrors.propertyDescription}
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
        <h4 className="font-heading text-lg font-bold text-text-dark">
          Fotografie
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            doporučené pro kvalitnější individuální posouzení
          </span>
        </h4>
        <p className="mt-2 rounded-xl bg-deep-teal/5 px-3 py-2 text-sm text-deep-teal">
          Fotografie neovlivňují automatický výpočet. Další dokumenty (půdorys,
          PENB, SVJ, nájemní vztah, plán rekonstrukce) můžete doplnit i po
          platbě.
        </p>

        <div
          className={cn(
            "mt-4 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition",
            dragOver
              ? "border-deep-teal bg-deep-teal/5"
              : "border-border bg-[#fafbfa]"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
          }}
        >
          <p className="text-sm font-semibold text-text-dark">
            Přetáhněte fotografie sem
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 inline-flex rounded-xl bg-deep-teal px-4 py-2.5 text-sm font-bold text-white"
          >
            Vybrat fotografie
          </button>
          <p className="mt-3 text-[11px] text-muted-foreground">
            JPG, PNG, WEBP · max. {RENTGEN_PHOTO_MAX_COUNT} fotografií · max.{" "}
            {Math.round(RENTGEN_PHOTO_MAX_BYTES / (1024 * 1024))} MB / soubor
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {photos.length > 0 ? (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((p) => (
              <li
                key={p.localId}
                className="relative overflow-hidden rounded-xl border border-border bg-white"
              >
                {p.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.previewUrl}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-[#f0f2f1] text-xs text-muted-foreground">
                    {p.error || "Soubor"}
                  </div>
                )}
                <div className="space-y-0.5 p-2">
                  <p className="truncate text-[11px] text-muted-foreground">
                    {p.file.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {p.status === "uploading"
                      ? "Nahrávám…"
                      : p.status === "done"
                        ? "Nahráno"
                        : p.status === "error"
                          ? p.error || "Chyba"
                          : formatNumber(Math.round(p.file.size / 1024)) +
                            " kB"}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Odstranit fotografii"
                  onClick={() => removePhoto(p.localId)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white"
                >
                  ×
                </button>
              </li>
            ))}
            {photos.length < RENTGEN_PHOTO_MAX_COUNT ? (
              <li>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square w-full flex-col items-center justify-center rounded-xl border border-dashed border-border text-sm font-semibold text-deep-teal"
                >
                  + Přidat
                </button>
              </li>
            ) : null}
          </ul>
        ) : null}
        {fieldErrors.photos ? (
          <p className="mt-2 text-xs text-red-700" role="alert">
            {fieldErrors.photos}
          </p>
        ) : null}
        {/* silence unused — photos never required for digital */}
        {requirePhotosWithoutListing ? null : null}
      </section>
      </>
      ) : null}
    </div>
  );
}
