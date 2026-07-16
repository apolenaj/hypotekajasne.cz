"use client";

import { cn } from "@/lib/utils";

interface FloatingInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email";
  suffix?: string;
  className?: string;
}

export function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  required,
  inputMode,
  suffix,
  className,
}: FloatingInputProps) {
  const hasValue = value.length > 0;

  return (
    <div className={cn("relative group", className)}>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className={cn(
          "peer w-full h-14 px-4 pt-5 pb-2 rounded-xl",
          "bg-white/60 backdrop-blur-sm",
          "border border-gray-200/80",
          "text-text-dark text-base font-medium",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-deep-teal/20 focus:border-deep-teal/40",
          "hover:border-deep-teal/30",
          suffix && "pr-16"
        )}
      />
      <label
        htmlFor={id}
        className={cn(
          "absolute left-4 transition-all duration-200 pointer-events-none",
          "text-muted-foreground",
          "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base",
          "peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-deep-teal peer-focus:font-medium",
          hasValue ? "top-2 translate-y-0 text-xs font-medium text-deep-teal" : ""
        )}
      >
        {label}
      </label>
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-deep-teal/70">
          {suffix}
        </span>
      )}
    </div>
  );
}
