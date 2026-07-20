"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  clearMemberCookie,
  getCurrentMember,
  setMemberCookie,
  setMemberPin,
  verifyMemberPin,
} from "@/lib/memberAuth";

export async function memberLoginAction(
  _prev: { error: string } | null,
  formData: FormData,
) {
  const memberId = Number(formData.get("memberId"));
  const pin = String(formData.get("pin") ?? "");
  const next = String(formData.get("next") ?? "/");
  if (!memberId) return { error: "Chọn tên của bạn" };

  const rows = await db
    .select()
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1);
  const member = rows[0];
  if (!member) return { error: "Không tìm thấy thành viên này" };
  if (!verifyMemberPin(member, pin)) return { error: "Sai mã PIN" };

  await setMemberCookie(member.id);
  revalidatePath("/", "layout");
  redirect(next || "/");
}

export async function memberLogoutAction(formData: FormData) {
  await clearMemberCookie();
  const next = String(formData.get("next") ?? "/");
  revalidatePath("/", "layout");
  redirect(next || "/");
}

export async function changeMemberPinAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
) {
  const member = await getCurrentMember();
  if (!member) return { ok: false, error: "Bạn chưa đăng nhập" };

  const newPin = String(formData.get("newPin") ?? "").trim();
  const confirmPin = String(formData.get("confirmPin") ?? "").trim();
  if (!/^\d{4,6}$/.test(newPin)) {
    return { ok: false, error: "Mã PIN phải là 4-6 chữ số" };
  }
  if (newPin !== confirmPin) {
    return { ok: false, error: "Hai mã PIN chưa khớp nhau" };
  }

  await setMemberPin(member.id, newPin);
  revalidatePath("/account");
  return { ok: true };
}
