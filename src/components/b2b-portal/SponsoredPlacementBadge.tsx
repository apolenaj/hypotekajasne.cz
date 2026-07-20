import { Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

export function SponsoredPlacementBadge({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 px-3 py-2",
        className
      )}
    >
      <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" aria-hidden />
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-900">
          Sponsored · Neovlivňuje investiční skóre
        </p>
        {label ? (
          <p className="mt-0.5 text-xs font-medium text-amber-950">{label}</p>
        ) : null}
      </div>
    </div>
  );
}
