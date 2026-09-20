/**
 * Supabase Storage for Investiční rentgen order property photos.
 * Bucket: rentgen-order-photos (private). Metadata lives in order.input_snapshot.photos.
 */

import { randomUUID } from "node:crypto";
import {
  getSupabaseAdminForRentgen,
  PREMIUM_RENTGEN_STORAGE_BUCKET,
} from "@/lib/property-rentgen/premium-audit-storage";
import {
  isAllowedPhotoMime,
  RENTGEN_PHOTO_MAX_BYTES,
  type RentgenOrderPhotoRef,
} from "@/lib/property-rentgen/order-property";

export const RENTGEN_ORDER_PHOTOS_BUCKET = "rentgen-order-photos";

function sanitizeFileName(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 80);
  return base || "photo.jpg";
}

function extForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export function buildOrderPhotoStorageKey(args: {
  orderId: string;
  photoId: string;
  originalName: string;
  mimeType: string;
}): string {
  const safe = sanitizeFileName(args.originalName);
  const ext = extForMime(args.mimeType);
  const hasExt = /\.(jpe?g|png|webp)$/i.test(safe);
  const fileName = hasExt ? safe : `${safe}.${ext}`;
  return `orders/${args.orderId}/${args.photoId}-${fileName}`;
}

export function validatePhotoBuffer(args: {
  mimeType: string;
  size: number;
  buffer: Buffer;
}): { ok: true } | { ok: false; error: string } {
  if (!isAllowedPhotoMime(args.mimeType)) {
    return {
      ok: false,
      error: "Povolené formáty jsou JPG, PNG a WEBP.",
    };
  }
  if (args.size <= 0 || args.size > RENTGEN_PHOTO_MAX_BYTES) {
    return {
      ok: false,
      error: `Maximální velikost jedné fotografie je ${Math.round(RENTGEN_PHOTO_MAX_BYTES / (1024 * 1024))} MB.`,
    };
  }
  // Reject obvious executables / HTML disguised by content sniff of magic bytes.
  if (
    args.buffer.length >= 2 &&
    args.buffer[0] === 0x4d &&
    args.buffer[1] === 0x5a
  ) {
    return { ok: false, error: "Soubor není platný obrázek." };
  }
  const head = args.buffer.subarray(0, 16).toString("utf8").toLowerCase();
  if (head.includes("<!doctype") || head.includes("<html") || head.includes("<?php")) {
    return { ok: false, error: "Soubor není platný obrázek." };
  }
  return { ok: true };
}

export async function uploadOrderPhoto(args: {
  orderId: string;
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  position: number;
}): Promise<RentgenOrderPhotoRef> {
  const check = validatePhotoBuffer({
    mimeType: args.mimeType,
    size: args.buffer.length,
    buffer: args.buffer,
  });
  if (!check.ok) throw new Error(check.error);

  const photoId = randomUUID();
  const storageKey = buildOrderPhotoStorageKey({
    orderId: args.orderId,
    photoId,
    originalName: args.originalName,
    mimeType: args.mimeType,
  });

  const supabase = getSupabaseAdminForRentgen();
  const { error } = await supabase.storage
    .from(RENTGEN_ORDER_PHOTOS_BUCKET)
    .upload(storageKey, args.buffer, {
      contentType: args.mimeType,
      upsert: false,
      cacheControl: "3600",
    });

  if (error) {
    // Fallback: reuse premium bucket folder if dedicated bucket missing in env.
    if (/bucket|not found|does not exist/i.test(error.message)) {
      const fallbackPath = `order-photos/${storageKey}`;
      const retry = await supabase.storage
        .from(PREMIUM_RENTGEN_STORAGE_BUCKET)
        .upload(fallbackPath, args.buffer, {
          contentType: args.mimeType,
          upsert: false,
          cacheControl: "3600",
        });
      if (retry.error) {
        throw new Error(`Upload fotografie selhal: ${retry.error.message}`);
      }
      return {
        id: photoId,
        storageKey: `${PREMIUM_RENTGEN_STORAGE_BUCKET}:${fallbackPath}`,
        mimeType: args.mimeType,
        size: args.buffer.length,
        position: args.position,
        originalName: sanitizeFileName(args.originalName),
        createdAt: new Date().toISOString(),
      };
    }
    throw new Error(`Upload fotografie selhal: ${error.message}`);
  }

  return {
    id: photoId,
    storageKey,
    mimeType: args.mimeType,
    size: args.buffer.length,
    position: args.position,
    originalName: sanitizeFileName(args.originalName),
    createdAt: new Date().toISOString(),
  };
}

export async function deleteOrderPhotoObject(
  storageKey: string
): Promise<void> {
  const supabase = getSupabaseAdminForRentgen();
  if (storageKey.includes(":")) {
    const [bucket, ...rest] = storageKey.split(":");
    const path = rest.join(":");
    await supabase.storage.from(bucket).remove([path]);
    return;
  }
  await supabase.storage.from(RENTGEN_ORDER_PHOTOS_BUCKET).remove([storageKey]);
}

export async function createSignedPhotoUrl(
  storageKey: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  const supabase = getSupabaseAdminForRentgen();
  let bucket = RENTGEN_ORDER_PHOTOS_BUCKET;
  let path = storageKey;
  if (storageKey.includes(":")) {
    const [b, ...rest] = storageKey.split(":");
    bucket = b;
    path = rest.join(":");
  }
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
