export interface MarketMetrics {
  pricePerM2: number;
  yield: number;
}

export interface TypeModifier {
  priceMultiplier: number;
  yieldMultiplier: number;
}

export interface PurposeModifier {
  yieldMultiplier: number;
  growthMultiplier: number;
}

export const MARKET_METRICS: Record<string, MarketMetrics> = {
  Praha: { pricePerM2: 125_000, yield: 3.5 },
  Brno: { pricePerM2: 105_000, yield: 4.0 },
  Ostrava: { pricePerM2: 60_000, yield: 6.5 },
  Plzeň: { pricePerM2: 85_000, yield: 4.5 },
  Liberec: { pricePerM2: 75_000, yield: 4.8 },
  Olomouc: { pricePerM2: 80_000, yield: 4.2 },
  Dubaj: { pricePerM2: 110_000, yield: 7.5 },
  "Abú Dhabí": { pricePerM2: 100_000, yield: 6.8 },
  Denpasar: { pricePerM2: 45_000, yield: 12.0 },
  Ubud: { pricePerM2: 50_000, yield: 14.0 },
  Canggu: { pricePerM2: 60_000, yield: 15.0 },
  Madrid: { pricePerM2: 100_000, yield: 5.0 },
  Málaga: { pricePerM2: 85_000, yield: 6.5 },
  Záhřeb: { pricePerM2: 75_000, yield: 4.5 },
  Dubrovník: { pricePerM2: 115_000, yield: 5.5 },
  Bratislava: { pricePerM2: 95_000, yield: 4.0 },
  Košice: { pricePerM2: 70_000, yield: 5.0 },
  Řím: { pricePerM2: 110_000, yield: 4.5 },
  Milán: { pricePerM2: 130_000, yield: 4.0 },
};

export const DEFAULT_METRICS: MarketMetrics = {
  pricePerM2: 80_000,
  yield: 4.5,
};

export const TYPE_MODIFIERS: Record<string, TypeModifier> = {
  Byt: { priceMultiplier: 1.0, yieldMultiplier: 1.0 },
  Dům: { priceMultiplier: 0.75, yieldMultiplier: 0.85 },
  Komerce: { priceMultiplier: 0.6, yieldMultiplier: 1.4 },
};

export const PURPOSE_MODIFIERS: Record<string, PurposeModifier> = {
  "Dlouhodobý nájem": { yieldMultiplier: 1.0, growthMultiplier: 1.0 },
  "Krátkodobý nájem": { yieldMultiplier: 1.6, growthMultiplier: 1.0 },
  "Vlastní bydlení": { yieldMultiplier: 0.0, growthMultiplier: 1.0 },
  Flipping: { yieldMultiplier: 0.0, growthMultiplier: 1.5 },
};

export function getTypeModifier(propertyType: string): TypeModifier {
  return TYPE_MODIFIERS[propertyType] ?? TYPE_MODIFIERS.Byt;
}

export function getPurposeModifier(purpose: string): PurposeModifier {
  return (
    PURPOSE_MODIFIERS[purpose] ?? PURPOSE_MODIFIERS["Dlouhodobý nájem"]
  );
}

export function getMarketMetrics(city: string): MarketMetrics {
  return MARKET_METRICS[city] ?? DEFAULT_METRICS;
}

/** City metrics adjusted by property type and investment purpose. */
export function getAdjustedMetrics(
  city: string,
  propertyType: string = "Byt",
  purpose: string = "Dlouhodobý nájem"
): MarketMetrics {
  const base = getMarketMetrics(city);
  const typeMod = getTypeModifier(propertyType);
  const purposeMod = getPurposeModifier(purpose);
  return {
    pricePerM2: base.pricePerM2 * typeMod.priceMultiplier,
    yield:
      base.yield * typeMod.yieldMultiplier * purposeMod.yieldMultiplier,
  };
}

export function computeMarketPrice(
  area: number,
  city: string,
  propertyType: string = "Byt",
  purpose: string = "Dlouhodobý nájem"
): number {
  const metrics = getAdjustedMetrics(city, propertyType, purpose);
  return Math.round(area * metrics.pricePerM2);
}

export function computeMarketRent(
  price: number,
  city: string,
  propertyType: string = "Byt",
  purpose: string = "Dlouhodobý nájem"
): number {
  const metrics = getAdjustedMetrics(city, propertyType, purpose);
  return Math.round((price * (metrics.yield / 100)) / 12);
}
