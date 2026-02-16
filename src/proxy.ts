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

const COOKIE_NAME =
  process.env.NODE_ENV === "production" ? "__Host-admin_token" : "admin_token";

const PUBLIC_PATHS = new Set([
  "/admin",
  "/admin/unblock",
  "/login",
  "/unsubscribe",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/alerts/unsubscribe",
]);

function buildCsp() {
  const scriptSrc = "script-src 'self' 'unsafe-inline'";

  return [
    "default-src 'self'",
    "object-src 'none'",
    scriptSrc,
    "script-src-attr 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://nominatim.openstreetmap.org",
    "frame-src https://www.google.com https://maps.google.com",
    "base-uri 'self'",
    "frame-ancestors 'self'",
  ]
    .filter(Boolean)
    .join("; ");
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

  const expected = base64urlEncodeBytes(new Uint8Array(signature));
  if (expected !== signaturePart) {
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

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const isApiRoute = pathname.startsWith("/api/");
    const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin";

    if (
      pathname.startsWith("/_next/") ||
      pathname.startsWith("/uploads/") ||
      pathname === "/favicon.ico"
    ) {
      return NextResponse.next();
    }

    if (PUBLIC_PATHS.has(pathname)) {
      return NextResponse.next();
    }

    const secret = process.env.AUTH_SECRET;
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const payload = token && secret ? await verifyJwt(token, secret) : null;

    if (!payload) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAdminRoute && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const csp = buildCsp();

    const response = NextResponse.next();

    response.headers.set("Content-Security-Policy", csp);

    return response;
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
