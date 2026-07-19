import Link from "next/link";
import type { Event } from "@/db/schema";
import { formatDateVN, formatMonthVN } from "@/lib/dates";
import {
  ensureMonthEvents,
  isEventFinished,
  listEventsSummary,
} from "@/lib/events";
import { formatVND } from "@/lib/money";
import { STATUS_BADGE, STATUS_LABEL } from "@/lib/status";

export const dynamic = "force-dynamic";

type HistoryRow = {
  event: Event;
  goingCount: number;
  guestCount: number;
  paidCount: number;
};

function EventCard({
  row,
  upcoming,
}: {
  row: HistoryRow;
  upcoming: boolean;
}) {
  const { event, goingCount, guestCount, paidCount } = row;
  // "open" tách thành 2 sắc thái tuỳ đã tới ngày hay chưa; các trạng thái
  // khác (settled/completed/cancelled) dùng nhãn/màu dùng chung.
  const statusLabel =
    event.status === "open"
      ? upcoming
        ? "Sắp tới"
        : "Chờ chốt tiền"
      : STATUS_LABEL[event.status];
  const statusBadge =
    event.status === "open"
      ? upcoming
        ? "bg-brand-soft text-brand"
        : "bg-amber-bg text-amber"
      : STATUS_BADGE[event.status];
  return (
    <Link
      href={`/events/${event.id}`}
      className="mb-2.5 block rounded-2xl border border-ink/8 bg-white p-[15px] transition hover:border-brand/40"
    >
      <div className="flex items-center justify-between">
        <span className="text-[14.5px] font-bold text-ink">
          {formatDateVN(event.eventDate)}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusBadge}`}
        >
          {statusLabel}
        </span>
      </div>
      <p className="mt-[5px] text-[12.5px] font-semibold text-ink/55">
        {goingCount + guestCount} người đi
        {event.totalCost
          ? ` · Tổng chi ${formatVND(event.totalCost)} · Đã thu ${paidCount}/${goingCount}`
          : ""}
      </p>
    </Link>
  );
}

function MonthGroups({
  rows,
  upcoming,
}: {
  rows: HistoryRow[];
  upcoming: boolean;
}) {
  let lastMonth = "";
  return (
    <>
      {rows.map((row) => {
        const month = row.event.eventDate.slice(0, 7);
        const showHeader = month !== lastMonth;
        lastMonth = month;
        return (
          <div key={row.event.id}>
            {showHeader && (
              <h2 className="mt-1 mb-2 text-[12.5px] font-extrabold tracking-wide text-ink/45 uppercase">
                {formatMonthVN(row.event.eventDate)}
              </h2>
            )}
            <EventCard row={row} upcoming={upcoming} />
          </div>
        );
      })}
    </>
  );
}

export default async function HistoryPage() {
  await ensureMonthEvents();

  const rows = await listEventsSummary();

  // Tính theo giờ thực tế VN: buổi hôm nay đã quá giờ kết thúc là "đã qua"
  // Buổi sắp tới: gần nhất trên đầu, các Chủ nhật sau xếp dần xuống dưới
  const upcoming = rows
    .filter((r) => !isEventFinished(r.event))
    .sort((a, b) => a.event.eventDate.localeCompare(b.event.eventDate));
  // Buổi đã qua: giữ nguyên dữ liệu, mới nhất trước, nhóm theo tháng
  const past = rows.filter((r) => isEventFinished(r.event));

  return (
    <div>
      <h1 className="mb-3.5 text-[20px] font-extrabold text-ink">
        Lịch sử các buổi
      </h1>

      {upcoming.length > 0 && (
        <section className="mb-4">
          <h2 className="mb-2 text-[15px] font-extrabold text-ink">
            🔜 Sắp tới
          </h2>
          <MonthGroups rows={upcoming} upcoming />
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="mb-2 text-[15px] font-extrabold text-ink">
            ✅ Đã qua
          </h2>
          <MonthGroups rows={past} upcoming={false} />
        </section>
      )}

      {rows.length === 0 && (
        <p className="text-[13px] font-semibold text-ink/50">
          Chưa có buổi nào.
        </p>
      )}
    </div>
  );
}
