import { CopyButton } from "@/components/CopyButton";
import type { EventWithVotes } from "@/lib/events";
import type { HostProfile } from "@/lib/hostProfiles";
import {
  courtBookingMessage,
  gameDayMessage,
  paymentReminderMessage,
  voteReminderMessage,
} from "@/lib/messages";
import { formatVND, perPersonAmount } from "@/lib/money";
import { STATUS_BADGE, STATUS_LABEL } from "@/lib/status";
import { AttendanceEditor } from "./AttendanceEditor";
import {
  setEventHostAction,
  setEventStatusAction,
  settleEventAction,
  togglePaidAction,
  unsettleEventAction,
  updateNoteAction,
} from "./actions";

function StatusForm({
  eventId,
  status,
  label,
  className,
}: {
  eventId: number;
  status: "open" | "settled" | "completed" | "cancelled";
  label: string;
  className: string;
}) {
  return (
    <form action={setEventStatusAction}>
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="status" value={status} />
      <button className={className}>{label}</button>
    </form>
  );
}

/**
 * Khối quản lý đầy đủ cho 1 buổi: chốt thu tiền, kết thúc, hủy/mở lại, ghi chú,
 * danh sách thanh toán. Dùng ở dashboard admin (buổi tuần này / buổi gần nhất)
 * và trang quản lý từng buổi trong lịch sử.
 */
export function EventAdminPanel({
  data,
  defaultHostId,
  hosts,
  showVoteReminders,
}: {
  data: EventWithVotes;
  defaultHostId: string;
  hosts: HostProfile[];
  showVoteReminders: boolean;
}) {
  const { event } = data;
  const per = event.totalCost
    ? perPersonAmount(event.totalCost, data.headCount)
    : 0;
  const going = data.rows.filter((r) => r.going === true);
  const defaultHost =
    hosts.find((h) => h.id === Number(defaultHostId)) ?? null;
  const effectiveHostId = event.hostId ?? defaultHost?.id ?? null;
  const effectiveHost =
    hosts.find((h) => h.id === effectiveHostId) ?? null;
  // Người đã là mặc định thì bỏ khỏi danh sách chọn riêng — chọn "Mặc định" là đủ.
  const selectableHosts = hosts.filter((h) => h.id !== defaultHost?.id);

  return (
    <section className="rounded-2xl border border-ink/8 bg-white p-4">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="text-[12.5px] font-semibold text-ink/50">
          {data.headCount} người đi
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_BADGE[event.status]}`}
        >
          {STATUS_LABEL[event.status]}
        </span>
      </div>

      {hosts.length > 0 && (
        <form
          action={setEventHostAction}
          className="mb-3 flex items-center gap-2"
        >
          <input type="hidden" name="eventId" value={event.id} />
          <label className="shrink-0 text-[12px] font-bold text-ink/55">
            🧑‍💼 Quản lý nhận tiền:
          </label>
          <select
            name="hostId"
            defaultValue={event.hostId ?? ""}
            className="flex-1 rounded-[10px] border border-ink/15 px-2.5 py-2 text-[12.5px]"
          >
            <option value="">
              — Mặc định{defaultHost ? ` (${defaultHost.name})` : ""} —
            </option>
            {selectableHosts.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
          <button className="shrink-0 rounded-[10px] border border-ink/15 bg-white px-3 py-2 text-[12px] font-bold text-ink hover:bg-ink/3">
            Lưu
          </button>
        </form>
      )}

      {event.status !== "cancelled" && (
        <AttendanceEditor eventId={event.id} rows={data.rows} />
      )}

      {event.status === "cancelled" && (
        <div className="space-y-2.5">
          <p className="text-[13px] font-bold text-ink/50">
            ⚠️ Buổi này đã hủy
          </p>
          <StatusForm
            eventId={event.id}
            status="open"
            label="Mở lại buổi"
            className="rounded-[10px] border border-ink/15 bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink hover:bg-ink/3"
          />
        </div>
      )}

      {event.status === "open" && (
        <div className="space-y-3">
          {showVoteReminders && (
            <div className="flex flex-col gap-2">
              <CopyButton
                className="w-full"
                label="📋 Copy tin đặt sân"
                text={courtBookingMessage(event)}
              />
              <CopyButton
                className="w-full"
                label="📋 Copy tin nhắc vote"
                text={voteReminderMessage(data)}
              />
              <CopyButton
                className="w-full"
                label="📋 Copy tin nhắc giờ chơi"
                text={gameDayMessage(data)}
              />
            </div>
          )}

          {data.goingCount > 0 && (
            <form action={settleEventAction} className="space-y-2">
              <input type="hidden" name="eventId" value={event.id} />
              <label className="block text-[12.5px] font-semibold text-ink/60">
                Nhập tổng chi phí (tiền sân, nước...) để chia đều cho{" "}
                {data.headCount} người đi:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="totalCost"
                  inputMode="numeric"
                  placeholder="VD: 500000"
                  className="flex-1 rounded-[10px] border border-ink/15 px-3 py-2.5 text-[13px]"
                />
                <button className="rounded-[10px] bg-brand px-4 text-[13px] font-extrabold text-white hover:brightness-95">
                  Chốt chia tiền
                </button>
              </div>
            </form>
          )}

          <div className="flex flex-wrap gap-2">
            <StatusForm
              eventId={event.id}
              status="completed"
              label="✅ Kết thúc buổi"
              className="rounded-[10px] border border-success-border bg-success-bg px-3 py-2.5 text-[12.5px] font-bold text-success hover:brightness-95"
            />
            <StatusForm
              eventId={event.id}
              status="cancelled"
              label="Hủy buổi"
              className="rounded-[10px] border border-danger-border bg-danger-bg px-3 py-2.5 text-[12.5px] font-bold text-danger hover:brightness-95"
            />
          </div>
        </div>
      )}

      {(event.status === "settled" || event.status === "completed") &&
        event.totalCost != null && (
          <div className="space-y-3">
            <p className="text-[13px] font-semibold text-ink/65">
              Tổng chi <b className="text-ink">{formatVND(event.totalCost)}</b>{" "}
              / {data.headCount} người ={" "}
              <b className="text-ink">{formatVND(per)}</b>/người
            </p>

            <div>
              {going.map((r) => (
                <div
                  key={r.member.id}
                  className="flex items-center justify-between border-b border-ink/6 py-[7px] last:border-b-0"
                >
                  <span className="text-[13.5px] font-semibold text-ink">
                    {r.member.name}
                    {r.guests > 0 && (
                      <span className="font-medium text-ink/50">
                        {" "}
                        (+{r.guests}) · {formatVND(per * (1 + r.guests))}
                      </span>
                    )}
                  </span>
                  <form action={togglePaidAction}>
                    <input type="hidden" name="eventId" value={event.id} />
                    <input
                      type="hidden"
                      name="memberId"
                      value={r.member.id}
                    />
                    <input
                      type="hidden"
                      name="paid"
                      value={r.paid ? "false" : "true"}
                    />
                    <button
                      className={`rounded-full border px-[11px] py-[5px] text-[11px] font-bold transition-all duration-150 active:scale-[0.94] ${
                        r.paid
                          ? "border-success-border bg-success-bg text-success hover:border-success/60 hover:bg-success-bg/70"
                          : "border-amber-border bg-amber-bg text-amber hover:border-amber/60 hover:bg-amber-bg/70"
                      }`}
                    >
                      {r.paid
                        ? "Đã chuyển ✓ (bấm để bỏ)"
                        : "Chưa chuyển (bấm khi đã nhận)"}
                    </button>
                  </form>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <CopyButton
                label="📋 Copy tin nhắc chuyển khoản"
                text={paymentReminderMessage(data, effectiveHost)}
              />
              {event.status === "settled" && (
                <form action={unsettleEventAction}>
                  <input type="hidden" name="eventId" value={event.id} />
                  <button className="rounded-[10px] border border-ink/15 bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink hover:bg-ink/3">
                    Sửa lại tổng chi phí
                  </button>
                </form>
              )}
              {event.status === "settled" && (
                <StatusForm
                  eventId={event.id}
                  status="completed"
                  label="✅ Kết thúc buổi"
                  className="rounded-[10px] border border-success-border bg-success-bg px-3 py-2.5 text-[12.5px] font-bold text-success hover:brightness-95"
                />
              )}
              {event.status === "completed" && (
                <StatusForm
                  eventId={event.id}
                  status="open"
                  label="Mở lại buổi"
                  className="rounded-[10px] border border-ink/15 bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink hover:bg-ink/3"
                />
              )}
            </div>
          </div>
        )}

      {event.status === "completed" && event.totalCost == null && (
        <div className="space-y-2.5">
          <p className="text-[13px] font-semibold text-success">
            ✅ Buổi đã kết thúc (không thu tiền)
          </p>
          <StatusForm
            eventId={event.id}
            status="open"
            label="Mở lại buổi"
            className="rounded-[10px] border border-ink/15 bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink hover:bg-ink/3"
          />
        </div>
      )}

      <form action={updateNoteAction} className="mt-3 flex gap-2">
        <input type="hidden" name="eventId" value={event.id} />
        <input
          type="text"
          name="note"
          defaultValue={event.note ?? ""}
          placeholder="Ghi chú (sân, lưu ý...)"
          className="flex-1 rounded-[10px] border border-ink/15 px-3 py-2.5 text-[13px]"
        />
        <button className="rounded-[10px] border border-ink/15 bg-white px-3.5 text-[12.5px] font-bold text-ink hover:bg-ink/3">
          Lưu
        </button>
      </form>
    </section>
  );
}
