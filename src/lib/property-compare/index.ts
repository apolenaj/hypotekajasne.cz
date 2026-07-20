export * from "@/lib/property-compare/types";
export * from "@/lib/property-compare/scores";
export {
  buildPropertyComparison,
  fmtCzk,
  fmtPct,
  MIN_PROPERTIES,
  MAX_PROPERTIES,
} from "@/lib/property-compare/build";
export {
  encodeComparisonLink,
  decodeComparisonLink,
  buildShareableComparisonUrl,
} from "@/lib/property-compare/encode";
export { DEMO_COMPARE_PROPERTIES, newCompareProperty } from "@/lib/property-compare/demo";
