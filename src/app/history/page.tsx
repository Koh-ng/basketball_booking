import Link from "next/link";
import { db } from "@/db";
import { events, votes, type Event } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { formatDateVN, formatMonthVN, vnToday } from "@/lib/dates";
import { ensureMonthEvents } from "@/lib/events";
import { formatVND } from "@/lib/money";

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
  const statusLabel =
    event.status === "settled"
      ? "Đã chốt tiền"
      : event.status === "cancelled"
        ? "Đã hủy"
        : upcoming
          ? "Sắp tới"
          : "Đang mở";
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
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
            event.status === "settled"
              ? "bg-success-bg text-success"
              : event.status === "cancelled"
                ? "bg-ink/5 text-ink/45"
                : upcoming
                  ? "bg-brand-soft text-brand"
                  : "bg-amber-bg text-amber"
          }`}
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

  const rows: HistoryRow[] = await db
    .select({
      event: events,
      goingCount: sql<number>`count(*) filter (where ${votes.going})`.mapWith(
        Number,
      ),
      guestCount: sql<number>`coalesce(sum(${votes.guests}) filter (where ${votes.going}), 0)`.mapWith(
        Number,
      ),
      paidCount: sql<number>`count(*) filter (where ${votes.going} and ${votes.paid})`.mapWith(
        Number,
      ),
    })
    .from(events)
    .leftJoin(votes, eq(votes.eventId, events.id))
    .groupBy(events.id)
    .orderBy(desc(events.eventDate));

  const today = vnToday();
  // Kèo sắp tới: gần nhất trên đầu, các Chủ nhật sau xếp dần xuống dưới
  const upcoming = rows
    .filter((r) => r.event.eventDate >= today)
    .sort((a, b) => a.event.eventDate.localeCompare(b.event.eventDate));
  // Kèo đã qua: giữ nguyên dữ liệu, mới nhất trước, nhóm theo tháng
  const past = rows.filter((r) => r.event.eventDate < today);

  return (
    <div>
      <h1 className="mb-3.5 text-[20px] font-extrabold text-ink">
        Lịch sử các kèo
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
          Chưa có kèo nào.
        </p>
      )}
    </div>
  );
}
