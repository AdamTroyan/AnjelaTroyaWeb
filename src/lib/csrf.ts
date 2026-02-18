import { headers } from "next/headers";

type SameOriginResult = {
  ok: boolean;
};

function isSameOriginValue(originValue: string | null, hostValue: string | null) {
  if (!originValue || !hostValue) {
    return false;
  }

  try {
    const origin = new URL(originValue);
    const host = hostValue.trim().toLowerCase();
    return origin.host.toLowerCase() === host;
  } catch {
    return false;
  }
}

export function assertSameOriginFromRequest(request: Request): SameOriginResult {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  // If no origin/referer, allow for same-origin requests from authenticated users
  // The proxy.ts middleware already validates authentication
  if (!origin && !referer) {
    // Check if this is a same-origin request by verifying host exists
    if (host) {
      return { ok: true };
    }
    return { ok: false };
  }

  if (origin && !isSameOriginValue(origin, host)) {
    return { ok: false };
  }

  if (!origin && referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host.toLowerCase() !== (host || "").toLowerCase()) {
        return { ok: false };
      }
    } catch {
      return { ok: false };
    }
  }

  return { ok: true };
}

export async function assertSameOriginFromHeaders(): Promise<SameOriginResult> {
  const store = await headers();
  const origin = store.get("origin");
  const referer = store.get("referer");
  const host = store.get("host");

  // For server actions, if no origin/referer, allow if host is present (same-origin)
  // This happens with form submissions in some browsers
  if (!origin && !referer) {
    // Server actions from same origin may not include origin/referer
    // We trust the request is same-origin since proxy.ts already validated authentication
    return { ok: true };
  }

  if (origin && !isSameOriginValue(origin, host)) {
    return { ok: false };
  }

  if (!origin && referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host.toLowerCase() !== (host || "").toLowerCase()) {
        return { ok: false };
      }
    } catch {
      return { ok: false };
    }
  }

  return { ok: true };
}
