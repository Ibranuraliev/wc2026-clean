import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware entirely for static assets in /public (audio, images, etc.)
  // and Next internals — otherwise next-intl rewrites e.g. /audio/x.mp3 to /ru/audio/x.mp3.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/og") ||
    pathname.startsWith("/audio/") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Auth callback is handled by its own route
  if (pathname.includes("/auth/callback")) {
    return NextResponse.next();
  }

  // Update Supabase session
  const supabaseResponse = await updateSession(request);

  // Run intl middleware
  const intlResponse = intlMiddleware(request);

  // Merge cookies from supabase into intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  // Skip Next internals, audio files in /public/audio, and any path with a
  // file extension (.mp3, .wav, .png, .ico, ...) so the i18n middleware
  // doesn't rewrite static assets under /<locale>/.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|audio/|.*\\..*).*)",
  ],
};
