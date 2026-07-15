import { db } from "@/db";
import { events, members, votes, type Event, type Member } from "@/db/schema";
import { and, desc, eq, lt } from "drizzle-orm";
import { upcomingSunday, vnToday } from "./dates";

export type VoteRow = {
  member: Member;
  going: boolean | null; // null = chưa vote
  paid: boolean;
};

export type EventWithVotes = {
  event: Event;
  rows: VoteRow[];
  goingCount: number;
};

/** Đảm bảo luôn tồn tại kèo cho Chủ nhật sắp tới (idempotent). */
export async function ensureUpcomingEvent(): Promise<void> {
  await db
    .insert(events)
    .values({ eventDate: upcomingSunday() })
    .onConflictDoNothing({ target: events.eventDate });
}

export async function getUpcomingEvent(): Promise<Event | null> {
  const rows = await db
    .select()
    .from(events)
    .where(eq(events.eventDate, upcomingSunday()))
    .limit(1);
  return rows[0] ?? null;
}

/** Kèo gần nhất đã qua (để chốt tiền / nhắc chuyển khoản). */
export async function getLatestPastEvent(): Promise<Event | null> {
  const rows = await db
    .select()
    .from(events)
    .where(lt(events.eventDate, vnToday()))
    .orderBy(desc(events.eventDate))
    .limit(1);
  return rows[0] ?? null;
}

export async function getEventById(id: number): Promise<Event | null> {
  const rows = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return rows[0] ?? null;
}

/**
 * Ghép danh sách thành viên active với vote của họ cho 1 kèo.
 * Thành viên đã nghỉ (inactive) vẫn hiện nếu họ có vote trong kèo đó.
 */
export async function getEventVotes(event: Event): Promise<EventWithVotes> {
  const [allMembers, eventVotes] = await Promise.all([
    db.select().from(members).orderBy(members.name),
    db.select().from(votes).where(eq(votes.eventId, event.id)),
  ]);
  const voteByMember = new Map(eventVotes.map((v) => [v.memberId, v]));
  const rows: VoteRow[] = allMembers
    .filter((m) => m.active || voteByMember.has(m.id))
    .map((m) => {
      const v = voteByMember.get(m.id);
      return { member: m, going: v ? v.going : null, paid: v?.paid ?? false };
    });
  return {
    event,
    rows,
    goingCount: rows.filter((r) => r.going === true).length,
  };
}

export async function castVote(
  eventId: number,
  memberId: number,
  going: boolean,
) {
  await db
    .insert(votes)
    .values({ eventId, memberId, going })
    .onConflictDoUpdate({
      target: [votes.eventId, votes.memberId],
      set: { going, updatedAt: new Date() },
    });
}

export async function setPaid(eventId: number, memberId: number, paid: boolean) {
  await db
    .update(votes)
    .set({ paid, paidAt: paid ? new Date() : null })
    .where(and(eq(votes.eventId, eventId), eq(votes.memberId, memberId)));
}

export async function listEvents(): Promise<Event[]> {
  return db.select().from(events).orderBy(desc(events.eventDate));
}
