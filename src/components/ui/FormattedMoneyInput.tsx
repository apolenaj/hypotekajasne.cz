"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  formatNumber,
  parseFormattedNumber,
} from "@/lib/format";
import { cn } from "@/lib/utils";

type FormattedMoneyInputProps = {
  id?: string;
  value: number;
  onChange: (next: number) => void;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  disabled?: boolean;
  /** Zobrazit „0“ místo prázdna. */
  showZero?: boolean;
  /** Suffix vpravo (např. Kč). */
  suffix?: string;
  minHeightClass?: string;
};

/**
 * Money input: zobrazení s NBSP tisícovými oddělovači,
 * do stavu / backendu jde vždy čisté číslo.
 * Formát při blur (+ sync mimo focus); při psaní draft bez ztráty focusu.
 */
export function FormattedMoneyInput({
  id,
  value,
  onChange,
  className,
  placeholder,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  disabled,
  showZero = false,
  suffix,
  minHeightClass = "h-11 min-h-11",
}: FormattedMoneyInputProps) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(() =>
    formatNumber(value, { emptyZero: !showZero })
  );

  useEffect(() => {
    if (!focused) {
      setDraft(formatNumber(value, { emptyZero: !showZero }));
    }
  }, [value, focused, showZero]);

  return (
    <div className={cn("relative min-w-0", suffix && "has-suffix")}>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        value={focused ? draft : formatNumber(value, { emptyZero: !showZero })}
        onFocus={() => {
          setFocused(true);
          setDraft(formatNumber(value, { emptyZero: !showZero }));
        }}
        onChange={(e) => {
          const nextText = e.target.value;
          setDraft(nextText);
          onChange(parseFormattedNumber(nextText));
        }}
        onBlur={() => {
          setFocused(false);
          const parsed = parseFormattedNumber(draft);
          onChange(parsed);
          setDraft(formatNumber(parsed, { emptyZero: !showZero }));
        }}
        className={cn(
          minHeightClass,
          "w-full min-w-0 tabular-nums text-text-dark placeholder:text-gray-400",
          suffix && "pr-12",
          className
        )}
      />
      {suffix ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}
