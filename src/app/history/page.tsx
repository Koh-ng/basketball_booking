import Link from "next/link";
import { db } from "@/db";
import { events, votes } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { formatDateVN } from "@/lib/dates";
import { formatVND } from "@/lib/money";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  open: "Đang mở",
  settled: "Đã chốt tiền",
  cancelled: "Đã hủy",
};

export default async function HistoryPage() {
  const rows = await db
    .select({
      event: events,
      goingCount: sql<number>`count(*) filter (where ${votes.going})`.mapWith(
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

  return (
    <div>
      <h1 className="mb-3.5 text-[20px] font-extrabold text-ink">
        Lịch sử các kèo
      </h1>
      {rows.length === 0 && (
        <p className="text-[13px] font-semibold text-ink/50">
          Chưa có kèo nào.
        </p>
      )}
      <div>
        {rows.map(({ event, goingCount, paidCount }) => (
          <Link
            key={event.id}
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
                      : "bg-amber-bg text-amber"
                }`}
              >
                {STATUS_LABEL[event.status]}
              </span>
            </div>
            <p className="mt-[5px] text-[12.5px] font-semibold text-ink/55">
              {goingCount} người đi
              {event.totalCost
                ? ` · Tổng chi ${formatVND(event.totalCost)} · Đã thu ${paidCount}/${goingCount}`
                : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
