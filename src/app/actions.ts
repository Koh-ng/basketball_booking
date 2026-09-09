"use server";

import { revalidatePath } from "next/cache";
import { castVote, getEventById, voteLockState } from "@/lib/events";
import { getCurrentMember } from "@/lib/memberAuth";

export async function voteAction(
  eventId: number,
  memberId: number,
  going: boolean,
  guests: number = 0,
  guestNames: string | null = null,
) {
  const me = await getCurrentMember();
  if (!me || me.id !== memberId) {
    return { ok: false, error: "Bạn cần đăng nhập đúng tên của mình để vote" };
  }
  const event = await getEventById(eventId);
  if (!event) {
    return { ok: false, error: "Buổi không tồn tại" };
  }
  const lock = voteLockState(event);
  if (lock.locked) {
    return { ok: false, error: lock.message ?? "Vote đã khoá" };
  }
  const safeGuests = going
    ? Math.min(5, Math.max(0, Math.floor(guests) || 0))
    : 0;
  const safeNames =
    safeGuests > 0 && guestNames
      ? guestNames.trim().slice(0, 200) || null
      : null;
  await castVote(eventId, memberId, going, safeGuests, safeNames);
  revalidatePath("/");
  revalidatePath(`/events/${eventId}`);
  return { ok: true };
}
