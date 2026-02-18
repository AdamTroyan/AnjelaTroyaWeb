import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserFromRequestCookie } from "@/lib/auth";

const COOKIE_NAME =
  process.env.SITE_URL?.startsWith("https://")
    ? "__Host-admin_token"
    : "admin_token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to public routes
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/") ||  // Allow all API routes
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap")
  ) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const user = await getUserFromRequestCookie(token);

  // If not authenticated, redirect to login
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
