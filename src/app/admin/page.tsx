import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { requireAdmin } from "@/lib/auth";
import { formatDateVN } from "@/lib/dates";
import {
  ensureUpcomingEvent,
  getEventVotes,
  getLatestPastEvent,
  getUpcomingEvent,
} from "@/lib/events";
import {
  gameDayMessage,
  paymentReminderMessage,
  voteReminderMessage,
} from "@/lib/messages";
import { formatVND, perPersonAmount } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import {
  cancelEventAction,
  logoutAction,
  settleEventAction,
  togglePaidAction,
  unsettleEventAction,
  updateNoteAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  await ensureUpcomingEvent();

  const [upcoming, pastEvent, settings] = await Promise.all([
    getUpcomingEvent(),
    getLatestPastEvent(),
    getSettings(),
  ]);
  const upcomingData = upcoming ? await getEventVotes(upcoming) : null;
  const pastData = pastEvent ? await getEventVotes(pastEvent) : null;

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <h1 className="text-[20px] font-extrabold text-ink">Trang quản lý</h1>
        <form action={logoutAction}>
          <button className="text-[13px] font-bold text-ink/50 hover:text-ink">
            Đăng xuất
          </button>
        </form>
      </div>

      <nav className="mb-4 flex gap-2.5">
        <Link
          href="/admin/members"
          className="flex-1 rounded-xl border border-ink/12 bg-white py-2.5 text-center text-[13px] font-bold text-ink hover:bg-ink/3"
        >
          👥 Thành viên
        </Link>
        <Link
          href="/admin/settings"
          className="flex-1 rounded-xl border border-ink/12 bg-white py-2.5 text-center text-[13px] font-bold text-ink hover:bg-ink/3"
        >
          ⚙️ Cài đặt
        </Link>
      </nav>

      {upcomingData && (
        <section className="rounded-2xl border border-ink/8 bg-white p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-[14.5px] font-extrabold text-ink">
              Kèo sắp tới — {formatDateVN(upcomingData.event.eventDate)}
            </h2>
            <span className="text-[12.5px] font-semibold text-ink/50">
              {upcomingData.headCount} người đi
            </span>
          </div>

          {upcomingData.event.status === "cancelled" ? (
            <div className="space-y-2.5">
              <p className="text-[13px] font-bold text-ink/50">
                ⚠️ Kèo này đã hủy
              </p>
              <form action={cancelEventAction}>
                <input
                  type="hidden"
                  name="eventId"
                  value={upcomingData.event.id}
                />
                <input type="hidden" name="cancel" value="false" />
                <button className="rounded-[10px] border border-ink/15 bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink hover:bg-ink/3">
                  Mở lại kèo
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="mb-2.5 flex flex-col gap-2">
                <CopyButton
                  className="w-full"
                  label="📋 Copy tin nhắc vote"
                  text={voteReminderMessage(upcomingData)}
                />
                <CopyButton
                  className="w-full"
                  label="📋 Copy tin nhắc giờ chơi"
                  text={gameDayMessage(upcomingData)}
                />
                <form action={cancelEventAction}>
                  <input
                    type="hidden"
                    name="eventId"
                    value={upcomingData.event.id}
                  />
                  <input type="hidden" name="cancel" value="true" />
                  <button className="w-full rounded-[10px] border border-danger-border bg-danger-bg px-3 py-2.5 text-[12.5px] font-bold text-danger">
                    Hủy kèo tuần này
                  </button>
                </form>
              </div>
              <p className="mb-2.5 text-[11.5px] font-semibold text-ink/40">
                Copy tin nhắn rồi dán vào group Messenger của đội.
              </p>
            </>
          )}

          <form action={updateNoteAction} className="flex gap-2">
            <input type="hidden" name="eventId" value={upcomingData.event.id} />
            <input
              type="text"
              name="note"
              defaultValue={upcomingData.event.note ?? ""}
              placeholder="Ghi chú (sân, lưu ý...)"
              className="flex-1 rounded-[10px] border border-ink/15 px-3 py-2.5 text-[13px]"
            />
            <button className="rounded-[10px] border border-ink/15 bg-white px-3.5 text-[12.5px] font-bold text-ink hover:bg-ink/3">
              Lưu
            </button>
          </form>
        </section>
      )}

      {pastData && pastData.event.status !== "cancelled" && (
        <section className="mt-3.5 rounded-2xl border border-ink/8 bg-white p-4">
          <h2 className="mb-2.5 text-[14.5px] font-extrabold text-ink">
            💸 Tiền sân — {formatDateVN(pastData.event.eventDate)}
          </h2>

          {pastData.event.status === "open" && (
            <>
              {pastData.goingCount === 0 ? (
                <p className="text-[13px] font-semibold text-ink/50">
                  Kèo này không có ai đăng ký đi nên không cần chia tiền.
                </p>
              ) : (
                <form action={settleEventAction} className="space-y-2">
                  <input
                    type="hidden"
                    name="eventId"
                    value={pastData.event.id}
                  />
                  <label className="block text-[12.5px] font-semibold text-ink/60">
                    Nhập tổng chi phí bạn đã trả (tiền sân, nước...) để chia đều
                    cho {pastData.headCount} người đi:
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
            </>
          )}

          {pastData.event.status === "settled" && pastData.event.totalCost && (
            <>
              <p className="mb-2 text-[13px] font-semibold text-ink/65">
                Tổng chi{" "}
                <b className="text-ink">{formatVND(pastData.event.totalCost)}</b>{" "}
                / {pastData.headCount} người ={" "}
                <b className="text-ink">
                  {formatVND(
                    perPersonAmount(
                      pastData.event.totalCost,
                      pastData.headCount,
                    ),
                  )}
                </b>
                /người
              </p>

              <div>
                {pastData.rows
                  .filter((r) => r.going === true)
                  .map((r) => (
                    <div
                      key={r.member.id}
                      className="flex items-center justify-between border-b border-ink/6 py-[7px] last:border-b-0"
                    >
                      <span className="text-[13.5px] font-semibold text-ink">
                        {r.member.name}
                        {r.guests > 0 && (
                          <span className="font-medium text-ink/50">
                            {" "}
                            (+{r.guests}) ·{" "}
                            {formatVND(
                              perPersonAmount(
                                pastData.event.totalCost ?? 0,
                                pastData.headCount,
                              ) *
                                (1 + r.guests),
                            )}
                          </span>
                        )}
                      </span>
                      <form action={togglePaidAction}>
                        <input
                          type="hidden"
                          name="eventId"
                          value={pastData.event.id}
                        />
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
                          className={`rounded-full border px-[11px] py-[5px] text-[11px] font-bold transition ${
                            r.paid
                              ? "border-success-border bg-success-bg text-success"
                              : "border-amber-border bg-amber-bg text-amber"
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

              <div className="mt-3 flex flex-wrap gap-2">
                <CopyButton
                  label="📋 Copy tin nhắc chuyển khoản"
                  text={paymentReminderMessage(pastData, settings)}
                />
                <form action={unsettleEventAction}>
                  <input
                    type="hidden"
                    name="eventId"
                    value={pastData.event.id}
                  />
                  <button className="rounded-[10px] border border-ink/15 bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink hover:bg-ink/3">
                    Sửa lại tổng chi phí
                  </button>
                </form>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
