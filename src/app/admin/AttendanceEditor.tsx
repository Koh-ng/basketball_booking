import type { VoteRow } from "@/lib/events";
import { AddParticipantForm } from "./AddParticipantForm";
import { adminSetVoteAction } from "./actions";

/**
 * Cho admin sửa danh sách người tham gia của 1 buổi — dùng khi có người
 * tham gia thực tế nhưng chưa vote (hoặc vote nhầm), để tính chia tiền
 * đúng số người thực đi. Chỉ hiện những người đang "Đi" (gọn), thêm người
 * mới qua ô tìm kiếm bên dưới.
 */
export function AttendanceEditor({
  eventId,
  rows,
}: {
  eventId: number;
  rows: VoteRow[];
}) {
  const goingRows = rows.filter((r) => r.going === true);
  const candidates = rows
    .filter((r) => r.going !== true)
    .map((r) => ({ id: r.member.id, name: r.member.name }));

  return (
    <div className="rounded-xl border border-ink/8 bg-ink/2 p-3">
      {candidates.length > 0 && (
        <AddParticipantForm eventId={eventId} candidates={candidates} />
      )}

      {goingRows.length === 0 ? (
        <p className="mt-2.5 text-[12px] font-semibold text-ink/40">
          Chưa có ai được thêm.
        </p>
      ) : (
        <div className="mt-2.5">
          {goingRows.map((r) => (
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
                  <input type="hidden" name="going" value="false" />
                  <input type="hidden" name="guests" value="0" />
                  <input type="hidden" name="guestNames" value="" />
                  <button className="rounded-full border border-ink/15 bg-white px-[10px] py-[4px] text-[11px] font-bold text-ink/55 transition-all duration-150 hover:border-ink/30 hover:bg-ink/6 active:scale-[0.94]">
                    Bỏ khỏi buổi
                  </button>
                </form>
              </div>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
