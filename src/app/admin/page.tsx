import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDateShort, formatDateVN } from "@/lib/dates";
import {
  ensureUpcomingEvent,
  getEventVotes,
  getLatestPastEvent,
  getOutstandingDebts,
  getUpcomingEvent,
} from "@/lib/events";
import { countNewFeedback } from "@/lib/feedback";
import { listHostProfiles } from "@/lib/hostProfiles";
import { formatVND } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import { EventAdminPanel } from "./EventAdminPanel";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  await ensureUpcomingEvent();

  const [upcoming, pastEvent, settings, hosts, newFeedbackCount] =
    await Promise.all([
      getUpcomingEvent(),
      getLatestPastEvent(),
      getSettings(),
      listHostProfiles(),
      countNewFeedback(),
    ]);
  const upcomingData = upcoming ? await getEventVotes(upcoming) : null;
  const pastData = pastEvent ? await getEventVotes(pastEvent) : null;
  const debts = await getOutstandingDebts();

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

      <nav className="mb-4 grid grid-cols-2 gap-2.5">
        <Link
          href="/admin/events"
          className="rounded-xl border border-ink/12 bg-white py-2.5 text-center text-[13px] font-bold text-ink hover:bg-ink/3"
        >
          📅 Tất cả buổi
        </Link>
        <Link
          href="/admin/members"
          className="rounded-xl border border-ink/12 bg-white py-2.5 text-center text-[13px] font-bold text-ink hover:bg-ink/3"
        >
          👥 Thành viên
        </Link>
        <Link
          href="/admin/hosts"
          className="rounded-xl border border-ink/12 bg-white py-2.5 text-center text-[13px] font-bold text-ink hover:bg-ink/3"
        >
          🧑‍💼 Quản lý
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-xl border border-ink/12 bg-white py-2.5 text-center text-[13px] font-bold text-ink hover:bg-ink/3"
        >
          ⚙️ Cài đặt
        </Link>
        <Link
          href="/admin/feedback"
          className="relative rounded-xl border border-ink/12 bg-white py-2.5 text-center text-[13px] font-bold text-ink hover:bg-ink/3"
        >
          💬 Góp ý
          {newFeedbackCount > 0 && (
            <span className="ml-1.5 rounded-full bg-danger px-[7px] py-[1px] text-[10.5px] font-extrabold text-white">
              {newFeedbackCount}
            </span>
          )}
        </Link>
      </nav>

      {upcomingData && (
        <div className="mb-3.5">
          <h2 className="mb-2 text-[14.5px] font-extrabold text-ink">
            Buổi sắp tới — {formatDateVN(upcomingData.event.eventDate)}
          </h2>
          <EventAdminPanel
            data={upcomingData}
            defaultHostId={settings.defaultHostId}
            hosts={hosts}
            showVoteReminders
          />
        </div>
      )}

      {pastData && (
        <div>
          <h2 className="mb-2 text-[14.5px] font-extrabold text-ink">
            💸 Buổi gần nhất — {formatDateVN(pastData.event.eventDate)}
          </h2>
          <EventAdminPanel
            data={pastData}
            defaultHostId={settings.defaultHostId}
            hosts={hosts}
            showVoteReminders={false}
          />
        </div>
      )}

      {debts.length > 0 && (
        <section className="mt-3.5 rounded-2xl border border-ink/8 bg-white p-4">
          <h2 className="mb-1 text-[14.5px] font-extrabold text-ink">
            💳 Công nợ
          </h2>
          <p className="mb-1.5 text-[11.5px] font-semibold text-ink/40">
            Tiền chưa chuyển, gộp từ mọi buổi đã chốt.
          </p>
          {debts.map((d) => (
            <div
              key={d.member.id}
              className="border-b border-ink/6 py-2 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13.5px] font-semibold text-ink">
                  {d.member.name}
                </span>
                <span className="text-[13px] font-extrabold text-danger">
                  {formatVND(d.total)}
                </span>
              </div>
              <p className="mt-0.5 text-[11.5px] font-semibold text-ink/40">
                {d.items
                  .map(
                    (it) =>
                      `${formatDateShort(it.eventDate)}: ${formatVND(it.amount)}`,
                  )
                  .join(" · ")}
              </p>
            </div>
          ))}
        </section>
      )}

      <p className="mt-3.5 text-center text-[12px] font-semibold text-ink/40">
        Cần sửa buổi cũ hơn?{" "}
        <Link href="/admin/events" className="text-brand-dark underline">
          Xem tất cả buổi trong lịch sử
        </Link>
      </p>
    </div>
  );
}
