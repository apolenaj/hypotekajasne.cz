/**
 * Deterministic LTV band matching.
 *
 * Product rules for CZ standard bands:
 *   ≤80  → min=0,  max=80, minExclusive=false  →  ltv >= 0 && ltv <= 80
 *   >80–90 → min=80, max=90, minExclusive=true →  ltv > 80 && ltv <= 90
 *
 * No artificial 80.01 threshold; arbitrary numeric LTV is supported.
 */

export type LtvBandMatchOptions = {
  /** When true, require ltv > ltvMin. Default false → ltv >= ltvMin. */
  ltvMinExclusive?: boolean;
  /** When true, require ltv < ltvMax. Default false → ltv <= ltvMax. */
  ltvMaxExclusive?: boolean;
};

export function matchesLtvBand(
  ltvMin: number,
  ltvMax: number,
  ltv: number,
  options: LtvBandMatchOptions = {}
): boolean {
  if (!Number.isFinite(ltvMin) || !Number.isFinite(ltvMax) || !Number.isFinite(ltv)) {
    return false;
  }
  if (!(ltvMin >= 0 && ltvMax <= 100 && ltvMin < ltvMax)) return false;

  const minExclusive = options.ltvMinExclusive === true;
  const maxExclusive = options.ltvMaxExclusive === true;
  const aboveMin = minExclusive ? ltv > ltvMin : ltv >= ltvMin;
  const belowMax = maxExclusive ? ltv < ltvMax : ltv <= ltvMax;
  return aboveMin && belowMax;
}
