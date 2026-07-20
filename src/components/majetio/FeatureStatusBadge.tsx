import { cn } from "@/lib/utils";
import {
  FEATURE_STATUS_LABELS,
  type FeatureStatus,
} from "@/lib/majetio/types";

const STYLES: Record<FeatureStatus, string> = {
  LIVE: "bg-emerald-100 text-emerald-900 border-emerald-200",
  BETA: "bg-sky-100 text-sky-900 border-sky-200",
  COMING_SOON: "bg-stone-200 text-stone-800 border-stone-300",
};

export function FeatureStatusBadge({
  status,
  className,
}: {
  status: FeatureStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-bold tracking-wide",
        STYLES[status],
        className
      )}
    >
      {FEATURE_STATUS_LABELS[status]}
    </span>
  );
}
