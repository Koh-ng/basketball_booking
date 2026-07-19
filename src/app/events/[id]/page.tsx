import Link from "next/link";
import { notFound } from "next/navigation";
import { VotePanel } from "@/components/VotePanel";
import { googleCalendarUrl } from "@/lib/calendar";
import { formatDateVN } from "@/lib/dates";
import { getEventById, getEventVotes, isEventFinished } from "@/lib/events";
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
  // Buổi chưa diễn ra và còn mở -> cho vote trước ngay tại đây
  const votable = event.status === "open" && !isEventFinished(event);

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
            ⚠️ Buổi này đã hủy
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
        {votable && (
          <div className="mt-3 flex gap-2">
            <a
              href={googleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-[12px] font-bold text-ink/70 transition hover:border-ink/30"
            >
              📅 Thêm vào Google Calendar
            </a>
          </div>
        )}
      </div>

      {votable && (
        <div className="mt-3.5">
          <VotePanel
            eventId={event.id}
            rows={data.rows.map((r) => ({
              memberId: r.member.id,
              name: r.member.name,
              going: r.going,
              guests: r.guests,
              guestNames: r.guestNames,
            }))}
            locked={false}
          />
        </div>
      )}

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
                    (+{r.guests} khách
                    {r.guestNames ? `: ${r.guestNames}` : ""})
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
