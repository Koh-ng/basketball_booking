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
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Lịch sử các kèo</h1>
      {rows.length === 0 && (
        <p className="text-zinc-500">Chưa có kèo nào.</p>
      )}
      <ul className="space-y-3">
        {rows.map(({ event, goingCount, paidCount }) => (
          <li key={event.id}>
            <Link
              href={`/events/${event.id}`}
              className="block rounded-xl bg-white p-4 shadow-sm border border-zinc-200 hover:border-orange-400 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  {formatDateVN(event.eventDate)}
                </span>
                <span
                  className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
                    event.status === "settled"
                      ? "bg-green-50 text-green-700"
                      : event.status === "cancelled"
                        ? "bg-zinc-100 text-zinc-500"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {STATUS_LABEL[event.status]}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-600">
                {goingCount} người đi
                {event.totalCost
                  ? ` · Tổng chi ${formatVND(event.totalCost)} · Đã thu ${paidCount}/${goingCount}`
                  : ""}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
