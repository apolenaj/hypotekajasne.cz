import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAJETIO_INTELLIGENCE_LABEL } from "@/lib/b2b-portal/types";

export function MajetioIntelligenceBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-2 border-deep-teal/40 bg-gradient-to-r from-[#eef3f1] to-white px-4 py-2",
        className
      )}
    >
      <Sparkles className="h-4 w-4 text-deep-teal" aria-hidden />
      <span className="text-xs font-bold text-deep-teal">{MAJETIO_INTELLIGENCE_LABEL}</span>
    </div>
  );
}
