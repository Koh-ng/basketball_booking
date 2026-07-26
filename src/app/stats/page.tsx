import { db } from "@/db";
import { events, members, votes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isEventFinished } from "@/lib/events";
import { daysSince, formatDateVN, toVnDateString } from "@/lib/dates";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Thống kê — Bóng Rổ Chủ Nhật",
};

// Ngưỡng "off liên tục hơn 1 tháng" theo luật — quá mốc này thì cần cân nhắc.
const INACTIVE_THRESHOLD_DAYS = 30;

export default async function StatsPage() {
  const [allEvents, allVotes, allMembers] = await Promise.all([
    db.select().from(events),
    db.select().from(votes).where(eq(votes.going, true)),
    db.select().from(members),
  ]);

  // Chỉ tính các buổi đã diễn ra xong và không bị hủy
  const finished = allEvents
    .filter((e) => e.status !== "cancelled" && isEventFinished(e))
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
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

  // Lần cuối tham gia + số buổi bỏ lỡ liên tiếp, để xét luật "off hơn 1 tháng".
  const eventById = new Map(finished.map((e) => [e.id, e]));
  const lastPlayedByMember = new Map<number, string>();
  for (const v of playedVotes) {
    const ev = eventById.get(v.eventId);
    if (!ev) continue;
    const cur = lastPlayedByMember.get(v.memberId);
    if (!cur || ev.eventDate > cur) lastPlayedByMember.set(v.memberId, ev.eventDate);
  }

  const attendanceTracking = allMembers
    .filter((m) => m.active)
    .map((m) => {
      const joinedDate = toVnDateString(m.createdAt);
      // Chỉ tính các buổi từ lúc thành viên tham gia nhóm trở đi.
      const eligible = finished.filter((e) => e.eventDate >= joinedDate);
      const lastPlayed = lastPlayedByMember.get(m.id) ?? null;
      const missed = lastPlayed
        ? eligible.filter((e) => e.eventDate > lastPlayed)
        : eligible;
      const since = lastPlayed ? daysSince(lastPlayed) : daysSince(joinedDate);
      return {
        id: m.id,
        name: m.name,
        lastPlayed,
        missedCount: missed.length,
        daysSinceLastPlayed: since,
      };
    })
    .sort((a, b) => b.daysSinceLastPlayed - a.daysSinceLastPlayed);

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

      <div className="mt-3.5 rounded-2xl border border-ink/8 bg-white p-4">
        <h2 className="mb-1.5 text-[14px] font-extrabold text-ink">
          🕐 Theo dõi chuyên cần
        </h2>
        <p className="mb-2.5 text-[12px] font-semibold text-ink/45">
          Theo luật, off liên tục hơn 30 ngày sẽ được cân nhắc tạm ẩn khỏi
          nhóm — xem lại{" "}
          <a href="/rules" className="underline decoration-ink/20 underline-offset-2">
            luật của hội
          </a>
          .
        </p>
        {attendanceTracking.length === 0 && (
          <p className="text-[13px] font-semibold text-ink/50">
            Chưa có dữ liệu.
          </p>
        )}
        {attendanceTracking.map((m) => {
          const overThreshold = m.daysSinceLastPlayed > INACTIVE_THRESHOLD_DAYS;
          return (
            <div
              key={m.id}
              className="flex items-center justify-between gap-2 border-b border-ink/6 py-2 last:border-b-0"
            >
              <span className="text-[13.5px] font-semibold text-ink">
                {m.name}
                <span className="block text-[11.5px] font-medium text-ink/45">
                  {m.lastPlayed
                    ? `Buổi cuối: ${formatDateVN(m.lastPlayed)}`
                    : "Chưa từng tham gia"}
                </span>
              </span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-right text-[11px] font-bold ${
                  overThreshold
                    ? "bg-danger-bg text-danger"
                    : "bg-ink/5 text-ink/55"
                }`}
              >
                {overThreshold && "⚠️ "}
                {m.daysSinceLastPlayed} ngày · {m.missedCount} buổi
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
