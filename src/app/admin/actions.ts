"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { events, hostProfiles, members } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";
import {
  clearAdminCookie,
  requireAdmin,
  setAdminCookie,
  verifyPin,
} from "@/lib/auth";
import { setPaid } from "@/lib/events";
import { MAX_HOST_PROFILES } from "@/lib/hostProfiles";
import { saveSettings } from "@/lib/settings";
import type { EventStatus } from "@/lib/status";

const EVENT_STATUSES: readonly EventStatus[] = [
  "open",
  "settled",
  "completed",
  "cancelled",
];

function revalidateAll(eventId?: number) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/history");
  revalidatePath("/admin/events");
  if (eventId) {
    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath(`/events/${eventId}`);
  }
}

/** Admin chọn ai host buổi này -> QR chuyển khoản dùng tài khoản của người đó. */
export async function setEventHostAction(formData: FormData) {
  await requireAdmin();
  const eventId = Number(formData.get("eventId"));
  const hostIdRaw = String(formData.get("hostId") ?? "");
  if (!eventId) return;
  const hostId = hostIdRaw ? Number(hostIdRaw) : null;
  await db.update(events).set({ hostId }).where(eq(events.id, eventId));
  revalidateAll(eventId);
}

export async function loginAction(
  _prev: { error: string } | null,
  formData: FormData,
) {
  const pin = String(formData.get("pin") ?? "");
  if (!verifyPin(pin)) {
    return { error: "Sai mã PIN" };
  }
  await setAdminCookie();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminCookie();
  redirect("/");
}

export async function settleEventAction(formData: FormData) {
  await requireAdmin();
  const eventId = Number(formData.get("eventId"));
  const totalCost = Number(
    String(formData.get("totalCost") ?? "").replace(/[^\d]/g, ""),
  );
  if (!eventId || !totalCost || totalCost <= 0) return;
  await db
    .update(events)
    .set({ totalCost, status: "settled" })
    .where(eq(events.id, eventId));
  revalidateAll(eventId);
}

export async function unsettleEventAction(formData: FormData) {
  await requireAdmin();
  const eventId = Number(formData.get("eventId"));
  if (!eventId) return;
  await db
    .update(events)
    .set({ totalCost: null, status: "open" })
    .where(eq(events.id, eventId));
  revalidateAll(eventId);
}

export async function togglePaidAction(formData: FormData) {
  await requireAdmin();
  const eventId = Number(formData.get("eventId"));
  const memberId = Number(formData.get("memberId"));
  const paid = formData.get("paid") === "true";
  if (!eventId || !memberId) return;
  await setPaid(eventId, memberId, paid);
  revalidateAll(eventId);
}

/** Chuyển trạng thái buổi: mở lại (open), kết thúc (completed), hoặc hủy (cancelled). */
export async function setEventStatusAction(formData: FormData) {
  await requireAdmin();
  const eventId = Number(formData.get("eventId"));
  const status = String(formData.get("status") ?? "") as EventStatus;
  if (!eventId || !EVENT_STATUSES.includes(status)) return;
  await db.update(events).set({ status }).where(eq(events.id, eventId));
  revalidateAll(eventId);
}

export async function updateNoteAction(formData: FormData) {
  await requireAdmin();
  const eventId = Number(formData.get("eventId"));
  const note = String(formData.get("note") ?? "").trim();
  if (!eventId) return;
  await db
    .update(events)
    .set({ note: note || null })
    .where(eq(events.id, eventId));
  revalidateAll(eventId);
}

/** Admin tự tạo buổi mới cho một ngày bất kỳ (ngoài lịch Chủ nhật tự động). */
export async function createEventAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
) {
  await requireAdmin();
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const hostIdRaw = String(formData.get("hostId") ?? "");
  if (!eventDate) return { ok: false, error: "Chọn ngày cho buổi mới" };

  const existing = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.eventDate, eventDate))
    .limit(1);
  if (existing[0]) {
    return { ok: false, error: "Đã có buổi vào ngày này rồi" };
  }

  const [created] = await db
    .insert(events)
    .values({
      eventDate,
      note: note || null,
      hostId: hostIdRaw ? Number(hostIdRaw) : null,
    })
    .returning({ id: events.id });
  revalidateAll(created.id);
  redirect(`/admin/events/${created.id}`);
}

export async function addMemberAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await db.insert(members).values({ name }).onConflictDoNothing();
  revalidateAll();
  revalidatePath("/admin/members");
}

export async function renameMemberAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
) {
  await requireAdmin();
  const memberId = Number(formData.get("memberId"));
  const name = String(formData.get("name") ?? "").trim();
  if (!memberId) return { ok: false, error: "Thiếu thành viên" };
  if (!name) return { ok: false, error: "Tên không được để trống" };

  const existing = await db
    .select()
    .from(members)
    .where(eq(members.name, name))
    .limit(1);
  if (existing[0] && existing[0].id !== memberId) {
    return { ok: false, error: "Đã có thành viên tên này rồi" };
  }

  await db.update(members).set({ name }).where(eq(members.id, memberId));
  revalidateAll();
  revalidatePath("/admin/members");
  return { ok: true };
}

export async function toggleMemberAction(formData: FormData) {
  await requireAdmin();
  const memberId = Number(formData.get("memberId"));
  const active = formData.get("active") === "true";
  if (!memberId) return;
  await db.update(members).set({ active }).where(eq(members.id, memberId));
  revalidateAll();
  revalidatePath("/admin/members");
}

export async function saveSettingsAction(
  _prev: { ok: boolean } | null,
  formData: FormData,
) {
  await requireAdmin();
  await saveSettings({
    bankCode: String(formData.get("bankCode") ?? "").trim(),
    bankAccountNo: String(formData.get("bankAccountNo") ?? "").trim(),
    bankAccountName: String(formData.get("bankAccountName") ?? "").trim(),
    adminEmail: String(formData.get("adminEmail") ?? "").trim(),
    qrImage: String(formData.get("qrImage") ?? "").trim(),
  });
  revalidateAll();
  revalidatePath("/admin/settings");
  return { ok: true };
}

/** Tạo mới (không có hostId) hoặc cập nhật (có hostId) 1 profile host. */
export async function saveHostProfileAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
) {
  await requireAdmin();
  const hostId = formData.get("hostId")
    ? Number(formData.get("hostId"))
    : null;
  const name = String(formData.get("name") ?? "").trim();
  const bankCode = String(formData.get("bankCode") ?? "").trim();
  const bankAccountNo = String(formData.get("bankAccountNo") ?? "").trim();
  const bankAccountName = String(formData.get("bankAccountName") ?? "").trim();
  const qrImage = String(formData.get("qrImage") ?? "").trim();
  if (!name) return { ok: false, error: "Tên không được để trống" };

  const dup = await db
    .select({ id: hostProfiles.id })
    .from(hostProfiles)
    .where(
      hostId
        ? and(eq(hostProfiles.name, name), ne(hostProfiles.id, hostId))
        : eq(hostProfiles.name, name),
    )
    .limit(1);
  if (dup[0]) return { ok: false, error: "Đã có người host tên này rồi" };

  if (hostId) {
    await db
      .update(hostProfiles)
      .set({ name, bankCode, bankAccountNo, bankAccountName, qrImage })
      .where(eq(hostProfiles.id, hostId));
  } else {
    const count = await db.$count(hostProfiles);
    if (count >= MAX_HOST_PROFILES) {
      return { ok: false, error: `Tối đa ${MAX_HOST_PROFILES} người host` };
    }
    await db
      .insert(hostProfiles)
      .values({ name, bankCode, bankAccountNo, bankAccountName, qrImage });
  }
  revalidateAll();
  revalidatePath("/admin/hosts");
  return { ok: true };
}

export async function deleteHostProfileAction(formData: FormData) {
  await requireAdmin();
  const hostId = Number(formData.get("hostId"));
  if (!hostId) return;
  await db.delete(hostProfiles).where(eq(hostProfiles.id, hostId));
  revalidateAll();
  revalidatePath("/admin/hosts");
}
