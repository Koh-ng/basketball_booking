import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDateVN } from "@/lib/dates";
import { ensureMonthEvents, listEventsSummary } from "@/lib/events";
import { formatVND } from "@/lib/money";
import { STATUS_BADGE, STATUS_LABEL } from "@/lib/status";
import { CreateEventForm } from "./CreateEventForm";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  await requireAdmin();
  await ensureMonthEvents();
  const rows = await listEventsSummary();

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <h1 className="text-[19px] font-extrabold text-ink">📅 Tất cả buổi</h1>
        <Link href="/admin" className="text-[13px] font-bold text-ink/50">
          ← Quản lý
        </Link>
      </div>

      <CreateEventForm />

      {rows.length === 0 && (
        <p className="text-[13px] font-semibold text-ink/50">
          Chưa có buổi nào.
        </p>
      )}
      <div>
        {rows.map(({ event, goingCount, guestCount, paidCount }) => (
          <Link
            key={event.id}
            href={`/admin/events/${event.id}`}
            className="mb-2.5 block rounded-2xl border border-ink/8 bg-white p-[15px] transition hover:border-brand/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-[14.5px] font-bold text-ink">
                {formatDateVN(event.eventDate)}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_BADGE[event.status]}`}
              >
                {STATUS_LABEL[event.status]}
              </span>
            </div>
            <p className="mt-[5px] text-[12.5px] font-semibold text-ink/55">
              {goingCount + guestCount} người đi
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
