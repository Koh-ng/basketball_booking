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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Trang quản lý</h1>
        <form action={logoutAction}>
          <button className="text-sm text-zinc-500 hover:text-zinc-800 underline">
            Đăng xuất
          </button>
        </form>
      </div>

      <nav className="flex gap-3">
        <Link
          href="/admin/members"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          👥 Thành viên
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          ⚙️ Cài đặt
        </Link>
      </nav>

      {upcomingData && (
        <section className="rounded-xl bg-white p-4 shadow-sm border border-zinc-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">
              Kèo tuần này — {formatDateVN(upcomingData.event.eventDate)}
            </h2>
            <span className="text-sm text-zinc-500">
              {upcomingData.goingCount} người đi
            </span>
          </div>

          {upcomingData.event.status === "cancelled" ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-zinc-500">
                ⚠️ Kèo này đã hủy
              </p>
              <form action={cancelEventAction}>
                <input
                  type="hidden"
                  name="eventId"
                  value={upcomingData.event.id}
                />
                <input type="hidden" name="cancel" value="false" />
                <button className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50">
                  Mở lại kèo
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <CopyButton
                  label="📋 Copy tin nhắc vote"
                  text={voteReminderMessage(upcomingData)}
                />
                <CopyButton
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
                  <button className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm font-medium hover:bg-red-100">
                    Hủy kèo tuần này
                  </button>
                </form>
              </div>
              <p className="text-xs text-zinc-400">
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
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
            <button className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50">
              Lưu
            </button>
          </form>
        </section>
      )}

      {pastData && pastData.event.status !== "cancelled" && (
        <section className="rounded-xl bg-white p-4 shadow-sm border border-zinc-200 space-y-4">
          <h2 className="font-bold">
            💸 Tiền sân — {formatDateVN(pastData.event.eventDate)}
          </h2>

          {pastData.event.status === "open" && (
            <>
              {pastData.goingCount === 0 ? (
                <p className="text-sm text-zinc-500">
                  Kèo này không có ai đăng ký đi nên không cần chia tiền.
                </p>
              ) : (
                <form action={settleEventAction} className="space-y-3">
                  <input
                    type="hidden"
                    name="eventId"
                    value={pastData.event.id}
                  />
                  <label className="block text-sm text-zinc-600">
                    Nhập tổng chi phí bạn đã trả (tiền sân, nước...) để chia đều
                    cho {pastData.goingCount} người đi:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="totalCost"
                      inputMode="numeric"
                      placeholder="VD: 500000"
                      className="flex-1 rounded-lg border border-zinc-300 px-3 py-2"
                    />
                    <button className="rounded-lg bg-orange-600 text-white px-4 py-2 font-semibold hover:bg-orange-700">
                      Chốt chia tiền
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {pastData.event.status === "settled" && pastData.event.totalCost && (
            <>
              <p className="text-sm text-zinc-600">
                Tổng chi <b>{formatVND(pastData.event.totalCost)}</b> /{" "}
                {pastData.goingCount} người ={" "}
                <b>
                  {formatVND(
                    perPersonAmount(
                      pastData.event.totalCost,
                      pastData.goingCount,
                    ),
                  )}
                </b>
                /người
              </p>

              <ul className="divide-y divide-zinc-100">
                {pastData.rows
                  .filter((r) => r.going === true)
                  .map((r) => (
                    <li
                      key={r.member.id}
                      className="flex items-center justify-between py-2"
                    >
                      <span>{r.member.name}</span>
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
                          className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition ${
                            r.paid
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          {r.paid ? "Đã chuyển ✓ (bấm để bỏ)" : "Chưa chuyển (bấm khi đã nhận)"}
                        </button>
                      </form>
                    </li>
                  ))}
              </ul>

              <div className="flex flex-wrap gap-2">
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
                  <button className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50">
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
