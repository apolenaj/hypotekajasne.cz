import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  isLeadSource,
  LEAD_SOURCE_LABELS,
  type LeadPayload,
} from "@/lib/leads";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Chybí Supabase credentials (URL / klíč).");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function normalizePayload(body: unknown): LeadPayload | null {
  if (!body || typeof body !== "object") return null;
  const data = body as Record<string, unknown>;

  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim().toLowerCase();
  const phone = String(data.phone ?? "").trim();
  const source = String(data.source ?? "").trim();
  const country = String(data.country ?? "").trim() || undefined;
  const notes = String(data.notes ?? "").trim() || undefined;
  const metadata =
    data.metadata && typeof data.metadata === "object"
      ? (data.metadata as Record<string, unknown>)
      : undefined;

  if (!name || !email || !email.includes("@")) return null;
  if (!isLeadSource(source)) return null;

  // Newsletter stačí s e-mailem; ostatní zdroje vyžadují telefon
  if (source !== "newsletter" && phone.length < 6) return null;

  return {
    name: source === "newsletter" && name === "—" ? "Newsletter" : name,
    email,
    phone: phone || undefined,
    source,
    country,
    notes,
    metadata,
  };
}

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const payload = normalizePayload(raw);

    if (!payload) {
      return NextResponse.json(
        {
          error:
            "Neplatná data. Vyplňte jméno, e-mail a telefon (u newsletteru stačí e-mail).",
        },
        { status: 400 }
      );
    }

    const sourceLabel = LEAD_SOURCE_LABELS[payload.source];
    const composedNotes = [
      `Zdroj: ${sourceLabel}`,
      payload.country ? `Zájem o: ${payload.country}` : null,
      payload.notes || null,
    ]
      .filter(Boolean)
      .join("\n");

    const row = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone ?? null,
      source: payload.source,
      country: payload.country ?? null,
      notes: composedNotes,
      metadata: {
        ...(payload.metadata ?? {}),
        source_label: sourceLabel,
        submitted_at: new Date().toISOString(),
        user_agent:
          request.headers.get("user-agent")?.slice(0, 200) ?? undefined,
      },
    };

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("leads").insert(row);

    if (error) {
      console.error("Supabase leads insert error:", error.message);
      return NextResponse.json(
        {
          error:
            "Lead se nepodařilo uložit. Zkontrolujte tabulku `leads` a RLS policy.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("API /api/leads:", err);
    return NextResponse.json(
      { error: "Interní chyba při ukládání leadu." },
      { status: 500 }
    );
  }
}
