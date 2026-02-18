import { NextResponse, type NextRequest } from "next/server";

type JwtPayload = {
  sub: string;
  role: string;
  tokenVersion: number;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
};

const JWT_ISSUER = "anjelaweb";
const JWT_AUDIENCE = "admin";

const USE_HTTPS = process.env.SITE_URL?.startsWith("https://") ?? false;
const COOKIE_NAME = USE_HTTPS ? "__Host-admin_token" : "admin_token";

const PUBLIC_PATHS = new Set([
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/alerts/unsubscribe",
  "/admin/unblock",
  "/unsubscribe",
]);

function buildCsp() {
  const cspDirectives = [
    "default-src 'self'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://nominatim.openstreetmap.org https://challenges.cloudflare.com",
    "frame-src https://www.google.com https://maps.google.com https://challenges.cloudflare.com",
    "base-uri 'self'",
    "frame-ancestors 'self'",
  ];
  return cspDirectives.join("; ");
}

function base64urlDecodeToBytes(value: string) {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const normalized = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64urlEncodeBytes(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [headerPart, payloadPart, signaturePart] = parts;
  const data = `${headerPart}.${payloadPart}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );

  const expectedBytes = new Uint8Array(signature);
  const actualBytes = base64urlDecodeToBytes(signaturePart);
  if (expectedBytes.length !== actualBytes.length) {
    return null;
  }
  let mismatch = 0;
  for (let i = 0; i < expectedBytes.length; i++) {
    mismatch |= expectedBytes[i] ^ actualBytes[i];
  }
  if (mismatch !== 0) {
    return null;
  }

  const payload = JSON.parse(
    new TextDecoder().decode(base64urlDecodeToBytes(payloadPart))
  ) as JwtPayload;
  const now = Math.floor(Date.now() / 1000);

  if (payload.iss !== JWT_ISSUER || payload.aud !== JWT_AUDIENCE) {
    return null;
  }

  if (payload.exp <= now) {
    return null;
  }

  return payload;
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const isApiRoute = pathname.startsWith("/api/");
    const isAdminApiRoute = pathname.startsWith("/api/admin/");
    const isAdminPageRoute = pathname.startsWith("/admin/") && pathname !== "/admin";

    // Allow Next.js internal routes and favicon
    if (
      pathname.startsWith("/_next/") ||
      pathname === "/favicon.ico" ||
      pathname.startsWith("/robots.txt") ||
      pathname.startsWith("/sitemap")
    ) {
      return NextResponse.next();
    }

    // Special handling for uploads
    if (pathname.startsWith("/uploads/")) {
      const response = NextResponse.next();
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("Content-Security-Policy", "default-src 'none'");
      response.headers.set("Content-Disposition", "inline");
      return response;
    }

    // Allow public paths without authentication
    if (PUBLIC_PATHS.has(pathname)) {
      return NextResponse.next();
    }

    // Allow all non-admin API routes (contact forms, public data, etc.)
    if (isApiRoute && !isAdminApiRoute) {
      return NextResponse.next();
    }

    // For protected routes (pages + admin APIs), check authentication
    const secret = process.env.AUTH_SECRET;
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const payload = token && secret ? await verifyJwt(token, secret) : null;

    // If not authenticated
    if (!payload) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // Redirect to login with the attempted path
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin role for admin routes
    if ((isAdminPageRoute || isAdminApiRoute) && payload.role !== "ADMIN") {
      if (isApiRoute) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    // User is authenticated, allow access
    const response = NextResponse.next();
    
    // Only apply security headers on non-API routes
    if (!isApiRoute) {
      const csp = buildCsp();
      response.headers.set("Content-Security-Policy", csp);
    }
    
    return response;
  } catch (error) {
    console.error("Proxy error:", error);
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
