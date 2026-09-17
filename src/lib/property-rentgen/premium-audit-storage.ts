/**
 * Supabase Storage upload for premium rentgen PDF buffers.
 * Bucket: premium-rentgen-reports (private) + signed download URL.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

export const PREMIUM_RENTGEN_STORAGE_BUCKET = "premium-rentgen-reports";
export const PREMIUM_RENTGEN_SIGNED_URL_SECONDS = 60 * 60; // 1h

export function getSupabaseAdminForRentgen(): SupabaseClient {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  url = url.replace(/\/rest\/v1\/?$/i, "").replace(/\/$/, "");

  if (!url || !key) {
    throw new Error(
      "Chybí Supabase credentials (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type PremiumRentgenUploadResult = {
  bucket: string;
  path: string;
  signedUrl: string;
  expiresInSeconds: number;
  reportId: string;
};

export async function uploadPremiumRentgenPdf(args: {
  pdfBuffer: Buffer;
  reportId?: string;
  supabase?: SupabaseClient;
  /** Override signed URL TTL (default 1h; e-mail fulfillment uses 7d). */
  signedUrlSeconds?: number;
}): Promise<PremiumRentgenUploadResult> {
  const supabase = args.supabase ?? getSupabaseAdminForRentgen();
  const reportId = args.reportId?.trim() || randomUUID();
  const path = `${reportId}/komplexni-investicni-audit.pdf`;
  const expiresInSeconds =
    args.signedUrlSeconds && args.signedUrlSeconds > 0
      ? Math.round(args.signedUrlSeconds)
      : PREMIUM_RENTGEN_SIGNED_URL_SECONDS;

  const { error: uploadError } = await supabase.storage
    .from(PREMIUM_RENTGEN_STORAGE_BUCKET)
    .upload(path, args.pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(
      `Supabase Storage upload selhal: ${uploadError.message}`
    );
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from(PREMIUM_RENTGEN_STORAGE_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (signedError || !signed?.signedUrl) {
    throw new Error(
      `Signed URL selhal: ${signedError?.message ?? "missing url"}`
    );
  }

  return {
    bucket: PREMIUM_RENTGEN_STORAGE_BUCKET,
    path,
    signedUrl: signed.signedUrl,
    expiresInSeconds,
    reportId,
  };
}
