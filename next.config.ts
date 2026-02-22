import type { NextConfig } from "next";

const imagePatterns = [] as Array<{
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
}>;

const r2PublicBaseUrl = process.env.R2_PUBLIC_BASE_URL;
if (r2PublicBaseUrl) {
  try {
    const parsed = new URL(r2PublicBaseUrl);
    const pathnameBase = parsed.pathname.replace(/\/+$/, "");
    imagePatterns.push({
      protocol: parsed.protocol.replace(":", "") as "http" | "https",
      hostname: parsed.hostname,
      port: parsed.port || undefined,
      pathname: `${pathnameBase}/**`,
    });
  } catch {
    // Ignore invalid config; fall back to no remote patterns.
  }
}

const nextConfig: NextConfig = {
  generateEtags: false,
  poweredByHeader: false,
  images: imagePatterns.length > 0 ? { remotePatterns: imagePatterns } : undefined,
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  async headers() {
    const isHttps = process.env.SITE_URL?.startsWith("https://");
    const csp = [
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
    ].join("; ");

    const baseHeaders = [
      { key: "Content-Security-Policy", value: csp },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-XSS-Protection", value: "1; mode=block" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    
    // Only add HTTPS-only headers when using HTTPS
    if (isHttps) {
      baseHeaders.push(
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        { key: "Cross-Origin-Resource-Policy", value: "same-site" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }
      );
    }
    
    return [
      {
        source: "/(.*)",
        headers: baseHeaders,
      },
    ];
  },
};

export default nextConfig;
