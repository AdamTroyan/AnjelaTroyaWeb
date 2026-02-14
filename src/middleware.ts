import { NextResponse } from "next/server";

function buildCsp(nonce: string, isProd: boolean) {
  const scriptSrc = isProd
    ? `script-src 'self' 'nonce-${nonce}'`
    : "script-src 'self' 'unsafe-inline'";

  return [
    "default-src 'self'",
    "object-src 'none'",
    scriptSrc,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://nominatim.openstreetmap.org",
    "frame-src https://www.google.com https://maps.google.com",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    isProd ? "upgrade-insecure-requests" : "",
  ].filter(Boolean).join("; ");
}

export function middleware(request: Request) {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const isProd = process.env.NODE_ENV === "production";
  const csp = buildCsp(nonce, isProd);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("x-nonce", nonce);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
