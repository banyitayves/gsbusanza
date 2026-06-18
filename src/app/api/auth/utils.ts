import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const COOKIE_NAME = "school_session";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const AUTH_SECRET = process.env.AUTH_SECRET || "school-portal-secret-key";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@school.com";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";

export type AuthUser = {
  id: number;
  email: string;
  role: "admin" | "staff";
};

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, storedHash] = stored.split(":");
  if (!salt || !storedHash) {
    return false;
  }

  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  const hashBuffer = Buffer.from(hash, "hex");
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (hashBuffer.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(hashBuffer, storedBuffer);
}

export function createSessionToken(user: AuthUser) {
  const payload = JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + COOKIE_MAX_AGE * 1000,
  });
  const payloadBase = Buffer.from(payload).toString("base64url");
  const signature = createHmac("sha256", AUTH_SECRET).update(payloadBase).digest("base64url");
  return `${payloadBase}.${signature}`;
}

export function parseSessionToken(token: string): AuthUser | null {
  const [payloadBase, signature] = token.split(".");
  if (!payloadBase || !signature) {
    return null;
  }

  const expectedSignature = createHmac("sha256", AUTH_SECRET).update(payloadBase).digest("base64url");
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(payloadBase, "base64url").toString("utf8"));
  if (!payload || payload.exp < Date.now()) {
    return null;
  }

  return payload as AuthUser;
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) {
    return null;
  }
  return parseSessionToken(cookie);
}

export function createSessionCookie(token: string) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}; ${process.env.NODE_ENV === "production" ? "Secure;" : ""}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${process.env.NODE_ENV === "production" ? "Secure;" : ""}`;
}
