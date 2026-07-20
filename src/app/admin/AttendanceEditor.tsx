import type { VoteRow } from "@/lib/events";
import { adminSetVoteAction } from "./actions";

const GOING_STYLE: Record<string, string> = {
  true: "border-success-border bg-success-bg text-success hover:border-success/60 hover:bg-success-bg/70",
  false: "border-ink/15 bg-ink/4 text-ink/50 hover:border-ink/30 hover:bg-ink/8",
  null: "border-amber-border bg-amber-bg text-amber hover:border-amber/60 hover:bg-amber-bg/70",
};

function goingLabel(going: boolean | null): string {
  if (going === true) return "Đi ✅ (bấm để bỏ)";
  if (going === false) return "Không đi (bấm để thêm)";
  return "Chưa vote (bấm để thêm)";
}

/**
 * Cho admin sửa danh sách người tham gia của 1 buổi — dùng khi có người
 * tham gia thực tế nhưng chưa vote (hoặc vote nhầm), để tính chia tiền
 * đúng số người thực đi.
 */
export function AttendanceEditor({
  eventId,
  rows,
}: {
  eventId: number;
  rows: VoteRow[];
}) {
  return (
    <div className="mb-3 rounded-xl border border-ink/8 bg-ink/2 p-3">
      <p className="mb-2 text-[12px] font-bold text-ink/55">
        🧑‍🤝‍🧑 Người tham gia — chỉnh nếu có người đi mà chưa vote
      </p>
      <div>
        {rows.map((r) => (
          <div
            key={r.member.id}
            className="border-b border-ink/6 py-1.5 last:border-b-0"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-semibold text-ink">
                {r.member.name}
              </span>
              <form action={adminSetVoteAction}>
                <input type="hidden" name="eventId" value={eventId} />
                <input type="hidden" name="memberId" value={r.member.id} />
                <input
                  type="hidden"
                  name="going"
                  value={r.going === true ? "false" : "true"}
                />
                <input
                  type="hidden"
                  name="guests"
                  value={r.going === true ? r.guests : 0}
                />
                <input
                  type="hidden"
                  name="guestNames"
                  value={r.going === true ? (r.guestNames ?? "") : ""}
                />
                <button
                  className={`rounded-full border px-[10px] py-[4px] text-[11px] font-bold transition-all duration-150 active:scale-[0.94] ${
                    GOING_STYLE[String(r.going)]
                  }`}
                >
                  {goingLabel(r.going)}
                </button>
              </form>
            </div>
            {r.going === true && (
              <form
                action={adminSetVoteAction}
                className="mt-1.5 flex items-center gap-1.5"
              >
                <input type="hidden" name="eventId" value={eventId} />
                <input type="hidden" name="memberId" value={r.member.id} />
                <input type="hidden" name="going" value="true" />
                <label className="shrink-0 text-[11px] font-semibold text-ink/45">
                  +khách
                </label>
                <input
                  type="number"
                  name="guests"
                  min={0}
                  max={5}
                  defaultValue={r.guests}
                  className="w-14 rounded-lg border border-ink/15 px-2 py-1 text-[12px]"
                />
                <input
                  type="text"
                  name="guestNames"
                  defaultValue={r.guestNames ?? ""}
                  placeholder="Tên khách (nếu có)"
                  className="flex-1 rounded-lg border border-ink/15 px-2 py-1 text-[12px]"
                />
                <button className="shrink-0 rounded-lg border border-ink/15 bg-white px-2.5 py-1 text-[11px] font-bold text-ink transition hover:bg-ink/5 active:scale-[0.96]">
                  Lưu
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
