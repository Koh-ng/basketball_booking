import { db } from "@/db";
import { events, members, votes, type Event, type Member } from "@/db/schema";
import { and, desc, eq, gt, lte } from "drizzle-orm";
import {
  addDays,
  remainingSundaysOfMonth,
  upcomingSunday,
  vnTimeHM,
  vnToday,
} from "./dates";
import { perPersonAmount } from "./money";

/** Dưới số người này thì thứ 7 tự hủy buổi Chủ nhật. */
export const MIN_PLAYERS = 8;

export type VoteRow = {
  member: Member;
  going: boolean | null; // null = chưa vote
  guests: number; // số khách đi kèm
  guestNames: string | null; // tên khách (không bắt buộc)
  paid: boolean;
};

export type EventWithVotes = {
  event: Event;
  rows: VoteRow[];
  goingCount: number; // số thành viên chốt đi
  guestCount: number; // tổng số khách đi kèm
  headCount: number; // goingCount + guestCount
};

/** Đảm bảo luôn tồn tại buổi cho Chủ nhật sắp tới (idempotent). */
export async function ensureUpcomingEvent(): Promise<void> {
  await db
    .insert(events)
    .values({ eventDate: upcomingSunday() })
    .onConflictDoNothing({ target: events.eventDate });
}

/** Đảm bảo tồn tại buổi cho mọi Chủ nhật còn lại trong tháng (idempotent). */
export async function ensureMonthEvents(): Promise<void> {
  await db
    .insert(events)
    .values(remainingSundaysOfMonth().map((eventDate) => ({ eventDate })))
    .onConflictDoNothing({ target: events.eventDate });
}

/**
 * Buổi đã kết thúc chưa, theo giờ thực tế VN:
 * ngày đã qua, hoặc hôm nay nhưng đã quá giờ kết thúc.
 */
export function isEventFinished(ev: Event): boolean {
  const today = vnToday();
  if (ev.eventDate < today) return true;
  return ev.eventDate === today && vnTimeHM() >= ev.endTime;
}

export async function getUpcomingEvent(): Promise<Event | null> {
  const date = upcomingSunday();
  const rows = await db
    .select()
    .from(events)
    .where(eq(events.eventDate, date))
    .limit(1);
  const ev = rows[0] ?? null;
  // Buổi hôm nay đã đá xong -> buổi sắp tới là Chủ nhật tuần sau
  if (ev && isEventFinished(ev)) {
    const nextDate = addDays(date, 7);
    await db
      .insert(events)
      .values({ eventDate: nextDate })
      .onConflictDoNothing({ target: events.eventDate });
    const next = await db
      .select()
      .from(events)
      .where(eq(events.eventDate, nextDate))
      .limit(1);
    return next[0] ?? null;
  }
  return ev;
}

/** Buổi gần nhất đã kết thúc (để chốt tiền / nhắc chuyển khoản). */
export async function getLatestPastEvent(): Promise<Event | null> {
  const rows = await db
    .select()
    .from(events)
    .where(lte(events.eventDate, vnToday()))
    .orderBy(desc(events.eventDate))
    .limit(2);
  return rows.find(isEventFinished) ?? null;
}

export async function getEventById(id: number): Promise<Event | null> {
  const rows = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return rows[0] ?? null;
}

/**
 * Ghép danh sách thành viên active với vote của họ cho 1 buổi.
 * Thành viên đã nghỉ (inactive) vẫn hiện nếu họ có vote trong buổi đó.
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
      return {
        member: m,
        going: v ? v.going : null,
        guests: v?.going ? v.guests : 0,
        guestNames: v?.going ? v.guestNames : null,
        paid: v?.paid ?? false,
      };
    });
  const goingCount = rows.filter((r) => r.going === true).length;
  const guestCount = rows.reduce((sum, r) => sum + r.guests, 0);
  return {
    event,
    rows,
    goingCount,
    guestCount,
    headCount: goingCount + guestCount,
  };
}

export async function castVote(
  eventId: number,
  memberId: number,
  going: boolean,
  guests: number,
  guestNames: string | null,
) {
  await db
    .insert(votes)
    .values({ eventId, memberId, going, guests, guestNames })
    .onConflictDoUpdate({
      target: [votes.eventId, votes.memberId],
      set: { going, guests, guestNames, updatedAt: new Date() },
    });
}

/** Các buổi sau buổi sắp tới (để vote trước), sắp theo ngày tăng dần. */
export async function getFutureEvents(afterDate: string): Promise<Event[]> {
  return db
    .select()
    .from(events)
    .where(gt(events.eventDate, afterDate))
    .orderBy(events.eventDate);
}

export type MemberDebt = {
  member: Member;
  total: number;
  items: { eventId: number; eventDate: string; amount: number }[];
};

/**
 * Công nợ: tiền chưa chuyển của từng người, gộp từ mọi buổi đã chốt tiền.
 */
export async function getOutstandingDebts(): Promise<MemberDebt[]> {
  const settled = await db
    .select()
    .from(events)
    .where(eq(events.status, "settled"))
    .orderBy(desc(events.eventDate));
  const byMember = new Map<number, MemberDebt>();
  for (const ev of settled) {
    if (!ev.totalCost) continue;
    const data = await getEventVotes(ev);
    const per = perPersonAmount(ev.totalCost, data.headCount);
    for (const r of data.rows) {
      if (r.going !== true || r.paid) continue;
      const amount = per * (1 + r.guests);
      const entry = byMember.get(r.member.id) ?? {
        member: r.member,
        total: 0,
        items: [],
      };
      entry.total += amount;
      entry.items.push({
        eventId: ev.id,
        eventDate: ev.eventDate,
        amount,
      });
      byMember.set(r.member.id, entry);
    }
  }
  return [...byMember.values()].sort((a, b) => b.total - a.total);
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

/** Tự hủy buổi (dùng cho cron thứ 7 khi không đủ người). */
export async function autoCancelEvent(ev: Event, headCount: number) {
  const reason = `Tự hủy do không đủ người (${headCount}/${MIN_PLAYERS})`;
  await db
    .update(events)
    .set({ status: "cancelled", note: ev.note ? `${ev.note} · ${reason}` : reason })
    .where(eq(events.id, ev.id));
}
