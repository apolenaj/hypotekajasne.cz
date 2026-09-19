/**
 * Whether the three header zones fit on one line.
 * Logo and CTA are fixed; the nav width is its unwrapped content width.
 */
export function desktopHeaderFits(input: {
  containerWidth: number;
  logoWidth: number;
  navWidth: number;
  ctaWidth: number;
  paddingX: number;
  zoneGap: number;
  safety?: number;
}): boolean {
  const safety = input.safety ?? 8;
  const needed =
    input.logoWidth +
    input.navWidth +
    input.ctaWidth +
    input.paddingX +
    input.zoneGap * 2 +
    safety;
  return input.containerWidth >= needed;
}

/** Compact bar: logo + optional CTA + menu button, still one line. */
export function compactInlineCtaFits(input: {
  containerWidth: number;
  logoWidth: number;
  ctaWidth: number;
  menuButtonWidth: number;
  paddingX: number;
  zoneGap: number;
  safety?: number;
}): boolean {
  const safety = input.safety ?? 8;
  const needed =
    input.logoWidth +
    input.ctaWidth +
    input.menuButtonWidth +
    input.paddingX +
    input.zoneGap * 2 +
    safety;
  return input.containerWidth >= needed;
}
