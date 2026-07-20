import { cn } from "@/lib/utils";
import {
  CLAIM_KIND_DESCRIPTIONS,
  CLAIM_KIND_LABELS,
  type ClaimKind,
} from "@/lib/property-rentgen/types";

const KIND_STYLES: Record<ClaimKind, string> = {
  DATA: "bg-emerald-100 text-emerald-900 border-emerald-200",
  MODEL: "bg-sky-100 text-sky-900 border-sky-200",
  ODHAD: "bg-amber-100 text-amber-950 border-amber-200",
  NEOVERENO: "bg-stone-200 text-stone-800 border-stone-300",
};

export function ClaimBadge({
  kind,
  className,
}: {
  kind: ClaimKind;
  className?: string;
}) {
  return (
    <span
      title={CLAIM_KIND_DESCRIPTIONS[kind]}
      className={cn(
        "inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        KIND_STYLES[kind],
        className
      )}
    >
      {CLAIM_KIND_LABELS[kind]}
    </span>
  );
}

export function ClaimLegend({ className }: { className?: string }) {
  const kinds: ClaimKind[] = ["DATA", "MODEL", "ODHAD", "NEOVERENO"];
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-[#f7f8f7] p-4",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-deep-teal">
        Typy údajů
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {kinds.map((k) => (
          <li key={k} className="flex items-start gap-2 text-xs text-muted-foreground">
            <ClaimBadge kind={k} className="mt-0.5" />
            <span>{CLAIM_KIND_DESCRIPTIONS[k]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
