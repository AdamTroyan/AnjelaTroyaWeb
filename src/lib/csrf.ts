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

  if (!origin && !referer) {
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

  if (!origin && !referer) {
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
