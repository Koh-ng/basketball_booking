import { notFound } from "next/navigation";
import { formatDateVN } from "@/lib/dates";
import { getEventById, getEventVotes } from "@/lib/events";
import { formatVND, perPersonAmount } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(Number(id));
  if (!event) notFound();

  const data = await getEventVotes(event);
  const going = data.rows.filter((r) => r.going === true);
  const per = event.totalCost
    ? perPersonAmount(event.totalCost, data.goingCount)
    : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-5 shadow-sm border border-zinc-200">
        <h1 className="text-xl font-bold">{formatDateVN(event.eventDate)}</h1>
        <p className="mt-1 text-zinc-600">
          ⏰ {event.startTime}–{event.endTime}
        </p>
        {event.status === "cancelled" && (
          <p className="mt-2 text-sm font-semibold text-zinc-500">
            ⚠️ Kèo này đã hủy
          </p>
        )}
        {event.note && (
          <p className="mt-2 text-sm text-zinc-500">📝 {event.note}</p>
        )}
        {event.totalCost != null && (
          <p className="mt-2 text-sm text-zinc-600">
            Tổng chi <b>{formatVND(event.totalCost)}</b> / {data.goingCount}{" "}
            người = <b>{formatVND(per)}</b>/người
          </p>
        )}
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm border border-zinc-200">
        <h2 className="font-semibold mb-2">Người đi ({going.length})</h2>
        {going.length === 0 && (
          <p className="text-sm text-zinc-500">Không có ai tham gia.</p>
        )}
        <ul className="divide-y divide-zinc-100">
          {going.map((r) => (
            <li
              key={r.member.id}
              className="flex items-center justify-between py-2"
            >
              <span>{r.member.name}</span>
              {event.status === "settled" &&
                (r.paid ? (
                  <span className="text-xs font-semibold text-green-700 bg-green-50 rounded-full px-2.5 py-1">
                    Đã chuyển ✓
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 rounded-full px-2.5 py-1">
                    Chưa chuyển
                  </span>
                ))}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
