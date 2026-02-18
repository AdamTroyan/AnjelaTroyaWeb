import crypto from "node:crypto";
import { cookies as getCookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_SECONDS = 60 * 30; // 30 minutes
const USE_HTTPS = process.env.SITE_URL?.startsWith("https://") ?? false;
export const COOKIE_NAME = USE_HTTPS ? "__Host-admin_token" : "admin_token";
const JWT_ISSUER = "anjelaweb";
const JWT_AUDIENCE = "admin";
const JWT_ALG = "HS256";

type JwtPayload = {
  sub: string;
  role: string;
  tokenVersion: number;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
};

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return secret;
}

function base64url(input: Buffer | string): string {
  const buffer = typeof input === "string" ? Buffer.from(input) : input;
  return buffer
    .toString("base64")
    .replaceAll("=", "")
    .replaceAll("+", "-")
    .replaceAll("/", "_");
}

function base64urlToBuffer(input: string): Buffer {
  const padded = input.padEnd(input.length + ((4 - (input.length % 4)) % 4), "=");
  const normalized = padded.replaceAll("-", "+").replaceAll("_", "/");
  return Buffer.from(normalized, "base64");
}

function signJwt(payload: Omit<JwtPayload, "iat" | "exp" | "iss" | "aud">): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: JWT_ALG, typ: "JWT" };
  const body: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
    iss: JWT_ISSUER,
    aud: JWT_AUDIENCE,
  };

  const headerPart = base64url(JSON.stringify(header));
  const payloadPart = base64url(JSON.stringify(body));
  const data = `${headerPart}.${payloadPart}`;
  const signature = crypto
    .createHmac("sha256", getAuthSecret())
    .update(data)
    .digest();

  return `${data}.${base64url(signature)}`;
}

function verifyJwt(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [headerPart, payloadPart, signaturePart] = parts;
  const data = `${headerPart}.${payloadPart}`;
  const signatureCheck = crypto
    .createHmac("sha256", getAuthSecret())
    .update(data)
    .digest();
  const signatureExpected = base64url(signatureCheck);

  if (signatureExpected.length !== signaturePart.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(Buffer.from(signatureExpected), Buffer.from(signaturePart))) {
    return null;
  }

  try {
    const payload = JSON.parse(base64urlToBuffer(payloadPart).toString("utf8")) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);

    if (payload.iss !== JWT_ISSUER || payload.aud !== JWT_AUDIENCE) {
      return null;
    }

    if (payload.exp <= now) {
      return null;
    }

    return payload;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Invalid auth token payload", error);
    }
    return null;
  }
}

export function buildAuthCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "strict" as const,
    secure: USE_HTTPS,
    path: "/",
    maxAge: TOKEN_TTL_SECONDS,
  };
}

export function buildLogoutCookie() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "strict" as const,
    secure: USE_HTTPS,
    path: "/",
    maxAge: 0,
  };
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const [method, salt, storedHash] = passwordHash.split("$");
  if (method !== "scrypt" || !salt || !storedHash) {
    return false;
  }

  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  if (derived.length !== storedHash.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(derived), Buffer.from(storedHash));
}

export async function createAuthToken(userId: string, role: string, tokenVersion: number) {
  return signJwt({ sub: userId, role, tokenVersion });
}

export async function getUserFromRequestCookie(token: string | undefined) {
  if (!token) {
    return null;
  }

  const payload = verifyJwt(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, isActive: true, tokenVersion: true },
  });
  if (!user?.isActive) {
    return null;
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    return null;
  }

  return user;
}

export async function getUserFromCookies() {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return null;
  }
  const store = await getCookies();
  const token = store.get(COOKIE_NAME)?.value;
  return getUserFromRequestCookie(token);
}
