import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SEC,
} from "@/lib/admin/constants";
import { signAdminSessionPayload } from "@/lib/admin/session-crypto";
import { isAdminRequestAuthorized as verifyToken } from "@/lib/admin/verify-session";

function adminSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.AUTH_SECRET ??
    ""
  );
}

function adminPasswordConfigured(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function verifyAdminPassword(password: string): boolean {
  const expected = adminPasswordConfigured();
  if (!expected || !password) return false;

  const a = Buffer.from(password, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function createAdminSessionToken(): Promise<string> {
  const secret = adminSessionSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET or AUTH_SECRET is not set");
  const exp = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE_SEC;
  return signAdminSessionPayload(exp, secret);
}

export async function isValidAdminSessionToken(token: string): Promise<boolean> {
  return verifyToken(token);
}

export async function getAdminSessionFromCookies(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return false;
  return isValidAdminSessionToken(token);
}

export async function requireAdminSession(): Promise<void> {
  const ok = await getAdminSessionFromCookies();
  if (!ok) throw new AdminAuthError();
}

export class AdminAuthError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "AdminAuthError";
  }
}

export function adminSessionCookieOptions(token: string) {
  const secure = process.env.NODE_ENV === "production";
  return {
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SEC,
  };
}

export function clearAdminSessionCookieOptions() {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
