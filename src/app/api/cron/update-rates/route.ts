import { NextResponse } from "next/server";

/**
 * Legacy cron endpoint — přesměrován na /api/scrape-rates.
 * Zachováno kvůli starým Vercel cron konfiguracím.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = new URL("/api/scrape-rates", url.origin);
  const auth = request.headers.get("authorization");

  const res = await fetch(target, {
    headers: auth ? { authorization: auth } : {},
    cache: "no-store",
  });

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
