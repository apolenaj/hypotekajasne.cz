import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Preview / force-noindex: X-Robots-Tag.
 * Canonical always comes from metadata (production host).
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const isPreview = process.env.VERCEL_ENV === "preview";
  const force = process.env.SEO_FORCE_NOINDEX === "1";

  if (isPreview || force) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  // Clean trailing slash except root
  const { pathname } = request.nextUrl;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/\/+$/, "");
    return NextResponse.redirect(url, 308);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
