/**
 * Locale-aware UI label access.
 * Czech production always uses CS maps — never mix EN into CS routes.
 * EN maps are for future /en academy & magazine pages only.
 */

import type { Locale } from "@/lib/i18n/config";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import {
  ACADEMY_UI_CS,
  COMMON_UI_CS,
  CONTENT_CHANNEL_LABELS_CS,
  LEARNING_STEP_KIND_LABELS_CS,
  MAGAZINE_UI_CS,
  MEDIA_STATUS_LABELS_CS,
} from "@/lib/i18n/ui-cs";
import {
  ACADEMY_UI_EN,
  COMMON_UI_EN,
  CONTENT_CHANNEL_LABELS_EN,
  LEARNING_STEP_KIND_LABELS_EN,
  MAGAZINE_UI_EN,
  MEDIA_STATUS_LABELS_EN,
} from "@/lib/i18n/ui-en";

export function academyUi(locale: Locale = DEFAULT_LOCALE) {
  return locale === "en" ? ACADEMY_UI_EN : ACADEMY_UI_CS;
}

export function magazineUi(locale: Locale = DEFAULT_LOCALE) {
  return locale === "en" ? MAGAZINE_UI_EN : MAGAZINE_UI_CS;
}

export function commonUi(locale: Locale = DEFAULT_LOCALE) {
  return locale === "en" ? COMMON_UI_EN : COMMON_UI_CS;
}

export function mediaStatusLabel(
  status: string,
  locale: Locale = DEFAULT_LOCALE
): string {
  const map = locale === "en" ? MEDIA_STATUS_LABELS_EN : MEDIA_STATUS_LABELS_CS;
  return (map as Record<string, string>)[status] ?? status;
}

export function contentChannelLabel(
  channel: string,
  locale: Locale = DEFAULT_LOCALE
): string {
  const map =
    locale === "en" ? CONTENT_CHANNEL_LABELS_EN : CONTENT_CHANNEL_LABELS_CS;
  return (map as Record<string, string>)[channel] ?? channel;
}

export function learningStepKindLabel(
  kind: string,
  locale: Locale = DEFAULT_LOCALE
): string {
  const map =
    locale === "en"
      ? LEARNING_STEP_KIND_LABELS_EN
      : LEARNING_STEP_KIND_LABELS_CS;
  return (map as Record<string, string>)[kind] ?? kind;
}
