"use server";

import { revalidatePath } from "next/cache";
import { createFeedback, type FeedbackCategory } from "@/lib/feedback";
import { getCurrentMember } from "@/lib/memberAuth";

const CATEGORIES: readonly FeedbackCategory[] = ["bug", "feature", "other"];

export async function submitFeedbackAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData,
) {
  const category = String(formData.get("category") ?? "") as FeedbackCategory;
  const message = String(formData.get("message") ?? "").trim();
  if (!CATEGORIES.includes(category)) {
    return { ok: false, error: "Chọn loại góp ý" };
  }
  if (!message) {
    return { ok: false, error: "Nhập nội dung góp ý" };
  }
  if (message.length > 2000) {
    return { ok: false, error: "Nội dung quá dài (tối đa 2000 ký tự)" };
  }

  const me = await getCurrentMember();
  await createFeedback(me?.id ?? null, category, message);
  revalidatePath("/admin/feedback");
  return { ok: true };
}
