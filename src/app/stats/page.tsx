import { db } from "@/db";
import { events, members, votes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isEventFinished } from "@/lib/events";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Thống kê — Bóng Rổ Chủ Nhật",
};

export default async function StatsPage() {
  const [allEvents, allVotes, allMembers] = await Promise.all([
    db.select().from(events),
    db.select().from(votes).where(eq(votes.going, true)),
    db.select().from(members),
  ]);

  // Chỉ tính các buổi đã diễn ra xong và không bị hủy
  const finished = allEvents.filter(
    (e) => e.status !== "cancelled" && isEventFinished(e),
  );
  const finishedIds = new Set(finished.map((e) => e.id));
  const playedVotes = allVotes.filter((v) => finishedIds.has(v.eventId));

  const memberById = new Map(allMembers.map((m) => [m.id, m]));
  const perMember = new Map<
    number,
    { name: string; sessions: number; guests: number }
  >();
  for (const v of playedVotes) {
    const m = memberById.get(v.memberId);
    if (!m) continue;
    const entry = perMember.get(v.memberId) ?? {
      name: m.name,
      sessions: 0,
      guests: 0,
    };
    entry.sessions += 1;
    entry.guests += v.guests;
    perMember.set(v.memberId, entry);
  }
  const leaderboard = [...perMember.values()].sort(
    (a, b) => b.sessions - a.sessions || a.name.localeCompare(b.name),
  );

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <h1 className="mb-3.5 text-[20px] font-extrabold text-ink">
        📊 Thống kê
      </h1>

      <div className="rounded-2xl border border-ink/8 bg-white p-4">
        <h2 className="mb-1.5 text-[14px] font-extrabold text-ink">
          🏅 Bảng vàng chuyên cần
        </h2>
        {leaderboard.length === 0 && (
          <p className="text-[13px] font-semibold text-ink/50">
            Chưa có dữ liệu.
          </p>
        )}
        {leaderboard.map((m, i) => (
          <div
            key={m.name}
            className="flex items-center justify-between border-b border-ink/6 py-2 last:border-b-0"
          >
            <span className="text-[13.5px] font-semibold text-ink">
              {medals[i] ?? `${i + 1}.`} {m.name}
              {m.guests > 0 && (
                <span className="font-medium text-ink/45">
                  {" "}
                  · dẫn {m.guests} khách
                </span>
              )}
            </span>
            <span className="text-[13px] font-bold text-ink/60">
              {m.sessions} buổi
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
