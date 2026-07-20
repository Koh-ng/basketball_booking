"use server";

import { revalidatePath } from "next/cache";
import { castVote, getEventById } from "@/lib/events";
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
  if (!event || event.status === "cancelled") {
    return { ok: false, error: "Buổi không tồn tại hoặc đã hủy" };
  }
  if (event.status === "settled" || event.status === "completed") {
    return { ok: false, error: "Buổi đã chốt tiền, không đổi vote được nữa" };
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
