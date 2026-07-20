import { db } from "@/db";
import { feedback, members, type Feedback, type Member } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export type FeedbackCategory = "bug" | "feature" | "other";
export type FeedbackStatus = "new" | "reviewed";

export const FEEDBACK_CATEGORY_LABEL: Record<FeedbackCategory, string> = {
  bug: "🐛 Báo lỗi",
  feature: "💡 Đề xuất tính năng",
  other: "💬 Góp ý khác",
};

export const FEEDBACK_STATUS_LABEL: Record<FeedbackStatus, string> = {
  new: "Mới",
  reviewed: "Đã ghi nhận",
};

export const FEEDBACK_STATUS_BADGE: Record<FeedbackStatus, string> = {
  new: "bg-amber-bg text-amber",
  reviewed: "bg-success-bg text-success",
};

export type FeedbackWithMember = {
  feedback: Feedback;
  member: Member | null;
};

export async function createFeedback(
  memberId: number | null,
  category: FeedbackCategory,
  message: string,
) {
  await db.insert(feedback).values({ memberId, category, message });
}

export async function listFeedback(): Promise<FeedbackWithMember[]> {
  const rows = await db
    .select({ feedback, member: members })
    .from(feedback)
    .leftJoin(members, eq(feedback.memberId, members.id))
    .orderBy(desc(feedback.createdAt));
  return rows;
}

export async function countNewFeedback(): Promise<number> {
  return db.$count(feedback, eq(feedback.status, "new"));
}
