import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/db";
import { members, type Member } from "@/db/schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "bb_member";
export const DEFAULT_PIN = "123456";

function secret(): string {
  return process.env.CRON_SECRET ?? "bb-fallback-secret";
}

function hashPin(pin: string): string {
  return createHmac("sha256", secret()).update(`pin:${pin}`).digest("hex");
}

function signMemberId(memberId: number): string {
  return createHmac("sha256", secret())
    .update(`member:${memberId}`)
    .digest("hex");
}

/** So khớp PIN nhập vào với PIN của thành viên (null = đang dùng PIN mặc định). */
export function verifyMemberPin(member: Member, pin: string): boolean {
  const expected = member.pinHash ?? hashPin(DEFAULT_PIN);
  const actual = hashPin(pin);
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function setMemberPin(memberId: number, pin: string) {
  await db
    .update(members)
    .set({ pinHash: hashPin(pin) })
    .where(eq(members.id, memberId));
}

/** Admin đặt lại PIN của 1 thành viên về mặc định (123456). */
export async function resetMemberPin(memberId: number) {
  await db
    .update(members)
    .set({ pinHash: null })
    .where(eq(members.id, memberId));
}

export async function setMemberCookie(memberId: number) {
  const store = await cookies();
  store.set(COOKIE_NAME, `${memberId}.${signMemberId(memberId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}

export async function clearMemberCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Thành viên đang đăng nhập trên thiết bị này (đọc từ cookie đã ký), null nếu chưa. */
export async function getCurrentMember(): Promise<Member | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const [idStr, token] = raw.split(".");
  const id = Number(idStr);
  if (!id || !token || token !== signMemberId(id)) return null;
  const rows = await db.select().from(members).where(eq(members.id, id)).limit(1);
  return rows[0] ?? null;
}
