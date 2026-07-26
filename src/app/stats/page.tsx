import { db } from "@/db";
import { events, members, votes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isEventFinished } from "@/lib/events";
import { formatDateVN, toVnDateString } from "@/lib/dates";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Thống kê — Bóng Rổ Chủ Nhật",
};

// Theo luật: vắng liên tục từ mốc này trở lên thì cần cân nhắc tạm ẩn khỏi nhóm.
const INACTIVE_THRESHOLD_SESSIONS = 4;

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

  const perMember = new Map<number, { sessions: number }>();
  const lastPlayedByMember = new Map<number, string>();
  const eventById = new Map(finished.map((e) => [e.id, e]));
  for (const v of playedVotes) {
    const entry = perMember.get(v.memberId) ?? { sessions: 0 };
    entry.sessions += 1;
    perMember.set(v.memberId, entry);

    const ev = eventById.get(v.eventId);
    if (!ev) continue;
    const cur = lastPlayedByMember.get(v.memberId);
    if (!cur || ev.eventDate > cur) lastPlayedByMember.set(v.memberId, ev.eventDate);
  }

  // Bảng vàng chuyên cần: xếp theo tổng số buổi tham gia, kèm lần cuối tham
  // gia + số buổi vắng liên tục tính từ đó, để xét luật vắng 4 buổi liên tục.
  const leaderboard = allMembers
    .filter((m) => m.active)
    .map((m) => {
      const entry = perMember.get(m.id) ?? { sessions: 0 };
      const joinedDate = toVnDateString(m.createdAt);
      // Chỉ tính các buổi từ lúc thành viên tham gia nhóm trở đi.
      const eligible = finished.filter((e) => e.eventDate >= joinedDate);
      const lastPlayed = lastPlayedByMember.get(m.id) ?? null;
      const missed = lastPlayed
        ? eligible.filter((e) => e.eventDate > lastPlayed)
        : eligible;
      return {
        id: m.id,
        name: m.name,
        sessions: entry.sessions,
        lastPlayed,
        missedCount: missed.length,
      };
    })
    .sort((a, b) => b.sessions - a.sessions || a.name.localeCompare(b.name));

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
        <p className="mb-2.5 text-[12px] font-semibold text-ink/45">
          Theo luật, vắng liên tục từ {INACTIVE_THRESHOLD_SESSIONS} buổi trở
          lên sẽ được cân nhắc tạm ẩn khỏi nhóm — xem lại{" "}
          <a
            href="/rules"
            className="underline decoration-ink/20 underline-offset-2"
          >
            luật của hội
          </a>
          .
        </p>
        {leaderboard.length === 0 && (
          <p className="text-[13px] font-semibold text-ink/50">
            Chưa có dữ liệu.
          </p>
        )}
        {leaderboard.map((m, i) => {
          const overThreshold = m.missedCount >= INACTIVE_THRESHOLD_SESSIONS;
          return (
            <div
              key={m.id}
              className="border-b border-ink/6 py-2 last:border-b-0"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13.5px] font-semibold text-ink">
                  {medals[i] ?? `${i + 1}.`} {m.name}
                </span>
                <span className="shrink-0 text-[13px] font-bold text-ink/60">
                  {m.sessions} buổi
                </span>
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <span className="text-[11.5px] font-medium text-ink/45">
                  {m.lastPlayed
                    ? `Lần cuối tham gia: ${formatDateVN(m.lastPlayed)}`
                    : "Chưa từng tham gia"}
                </span>
                {m.missedCount >= 2 && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-[3px] text-[10.5px] font-bold ${
                      overThreshold
                        ? "bg-danger-bg text-danger"
                        : "bg-ink/5 text-ink/50"
                    }`}
                  >
                    {overThreshold && "⚠️ "}
                    Vắng {m.missedCount} buổi liên tiếp
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
