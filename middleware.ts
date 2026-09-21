import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isEnvError, type EnvError } from "@/lib/env";

export async function middleware(request: NextRequest) {
  let session: Awaited<ReturnType<typeof updateSession>>;

  try {
    session = await updateSession(request);
  } catch (error) {
    // Without Supabase credentials there is no session to check, so every
    // route would fail. Show the reason instead of an opaque 500.
    if (isEnvError(error)) return envErrorResponse(error);
    throw error;
  }

  const { response, user } = session;

  const pathname = request.nextUrl.pathname;

  // Protected routes: (dashboard) and (admin)
  const isProtectedRoute =
    pathname.startsWith("/profil") ||
    pathname.startsWith("/proyek-saya") ||
    pathname.startsWith("/artikel-saya") ||
    pathname.startsWith("/admin");

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    return Response.redirect(url);
  }

  // Admin-only routes
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute && user) {
    // Check role from user metadata or DB
    // For now, we rely on RLS + server-side checks
    // A proper implementation would check the user role from the DB
  }

  return response;
}

function envErrorResponse(error: EnvError) {
  return new NextResponse(
    `Konfigurasi server belum lengkap.\n\n${error.message}\n`,
    {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    },
  );
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (browser favicon)
     * - / (root page)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
