import Link from "next/link";
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
    ? perPersonAmount(event.totalCost, data.headCount)
    : 0;

  return (
    <div>
      <Link
        href="/history"
        className="mb-3.5 inline-block text-[13px] font-bold text-ink/50"
      >
        ← Lịch sử
      </Link>
      <div className="rounded-2xl border border-ink/8 bg-white p-4">
        <h1 className="text-[19px] font-extrabold text-ink">
          {formatDateVN(event.eventDate)}
        </h1>
        <p className="mt-1 text-[13px] font-semibold text-ink/60">
          ⏰ {event.startTime}–{event.endTime}
        </p>
        {event.status === "cancelled" && (
          <p className="mt-2 text-[13px] font-bold text-ink/45">
            ⚠️ Kèo này đã hủy
          </p>
        )}
        {event.note && (
          <p className="mt-2 text-[12.5px] text-ink/55">📝 {event.note}</p>
        )}
        {event.totalCost != null && (
          <p className="mt-2 text-[13px] font-semibold text-ink/65">
            Tổng chi <b className="text-ink">{formatVND(event.totalCost)}</b>{" "}
            / {data.headCount} người ={" "}
            <b className="text-ink">{formatVND(per)}</b>/người
          </p>
        )}
      </div>

      <div className="mt-3.5 rounded-2xl border border-ink/8 bg-white p-4">
        <h2 className="mb-2 text-[14px] font-extrabold text-ink">
          Người đi ({data.headCount})
        </h2>
        {going.length === 0 && (
          <p className="text-[13px] font-semibold text-ink/50">
            Không có ai tham gia.
          </p>
        )}
        <div>
          {going.map((r) => (
            <div
              key={r.member.id}
              className="flex items-center justify-between border-b border-ink/6 py-2 last:border-b-0"
            >
              <span className="text-[13.5px] font-semibold text-ink">
                {r.member.name}
                {r.guests > 0 && (
                  <span className="font-medium text-ink/50">
                    {" "}
                    (+{r.guests} khách)
                  </span>
                )}
              </span>
              {event.status === "settled" &&
                (r.paid ? (
                  <span className="rounded-full bg-success-bg px-2.5 py-1 text-[11px] font-bold text-success">
                    Đã chuyển ✓
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-bg px-2.5 py-1 text-[11px] font-bold text-amber">
                    Chưa chuyển
                  </span>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
