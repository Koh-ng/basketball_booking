"use server";

import { revalidatePath } from "next/cache";
import { castVote, getEventById } from "@/lib/events";

export async function voteAction(
  eventId: number,
  memberId: number,
  going: boolean,
  guests: number = 0,
) {
  const event = await getEventById(eventId);
  if (!event || event.status === "cancelled") {
    return { ok: false, error: "Kèo không tồn tại hoặc đã hủy" };
  }
  if (event.status === "settled") {
    return { ok: false, error: "Kèo đã chốt tiền, không đổi vote được nữa" };
  }
  const safeGuests = going
    ? Math.min(5, Math.max(0, Math.floor(guests) || 0))
    : 0;
  await castVote(eventId, memberId, going, safeGuests);
  revalidatePath("/");
  return { ok: true };
}
