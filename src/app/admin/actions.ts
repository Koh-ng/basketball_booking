"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { events, members } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  clearAdminCookie,
  requireAdmin,
  setAdminCookie,
  verifyPin,
} from "@/lib/auth";
import { setPaid } from "@/lib/events";
import { saveSettings } from "@/lib/settings";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/history");
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
  revalidateAll();
}

export async function unsettleEventAction(formData: FormData) {
  await requireAdmin();
  const eventId = Number(formData.get("eventId"));
  if (!eventId) return;
  await db
    .update(events)
    .set({ totalCost: null, status: "open" })
    .where(eq(events.id, eventId));
  revalidateAll();
}

export async function togglePaidAction(formData: FormData) {
  await requireAdmin();
  const eventId = Number(formData.get("eventId"));
  const memberId = Number(formData.get("memberId"));
  const paid = formData.get("paid") === "true";
  if (!eventId || !memberId) return;
  await setPaid(eventId, memberId, paid);
  revalidateAll();
}

export async function cancelEventAction(formData: FormData) {
  await requireAdmin();
  const eventId = Number(formData.get("eventId"));
  const cancel = formData.get("cancel") === "true";
  if (!eventId) return;
  await db
    .update(events)
    .set({ status: cancel ? "cancelled" : "open" })
    .where(eq(events.id, eventId));
  revalidateAll();
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
  revalidateAll();
}

export async function addMemberAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await db.insert(members).values({ name }).onConflictDoNothing();
  revalidateAll();
  revalidatePath("/admin/members");
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
