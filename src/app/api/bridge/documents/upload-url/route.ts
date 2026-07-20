import { NextResponse } from "next/server";
import { buildSignedUrlContract } from "@/lib/document-vault/security";

export const runtime = "nodejs";

type UploadUrlRequest = {
  documentId: string;
  mimeType: string;
  purpose?: "view" | "download";
};

export async function GET() {
  return NextResponse.json({
    status: "BETA",
    version: 1,
    method: "POST",
    body: {
      documentId: "string",
      mimeType: "string",
      purpose: "view | download",
    },
    note: "Presigned upload URL — production object storage. No binary in request body.",
    security: [
      "Signed URL expirace ≤ 15 min",
      "Checksum SHA-256 required on register",
      "Encryption at rest (AES-256 server-side)",
    ],
  });
}

export async function POST(request: Request) {
  let body: UploadUrlRequest;
  try {
    body = (await request.json()) as UploadUrlRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.documentId || !body.mimeType) {
    return NextResponse.json(
      { error: "documentId and mimeType required" },
      { status: 400 }
    );
  }

  const signed = buildSignedUrlContract({
    documentId: body.documentId,
    purpose: body.purpose ?? "view",
    expiresInSeconds: 900,
  });

  return NextResponse.json({
    status: "BETA",
    uploadUrl: signed.url.replace("/signed/", "/upload/"),
    viewUrl: signed.url,
    expiresAt: signed.expiresAt,
    documentId: body.documentId,
    message: "BETA — upload URL contract. Production = S3/Blob presigned PUT.",
  });
}
