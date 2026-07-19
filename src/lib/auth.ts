import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "bb_admin";

function expectedToken(): string {
  const pin = process.env.ADMIN_PIN ?? "";
  const secret = process.env.CRON_SECRET ?? "bb-fallback-secret";
  return createHmac("sha256", secret).update(`admin:${pin}`).digest("hex");
}

export function verifyPin(pin: string): boolean {
  const expected = process.env.ADMIN_PIN ?? "";
  if (!expected) return false;
  const a = Buffer.from(pin);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function setAdminCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 90, // 90 ngày
    path: "/",
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === expectedToken();
}

/** Dùng ở đầu mỗi server action / page của admin. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
