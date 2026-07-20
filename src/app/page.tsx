import { LoginPrompt } from "@/components/LoginPrompt";
import { VotePanel } from "@/components/VotePanel";
import Link from "next/link";
import { formatDateShort, formatDateVN } from "@/lib/dates";
import { googleCalendarUrl } from "@/lib/calendar";
import {
  ensureMonthEvents,
  getEventVotes,
  getFutureEvents,
  getLatestPastEvent,
  getUpcomingEvent,
  type EventWithVotes,
} from "@/lib/events";
import { getCurrentMember } from "@/lib/memberAuth";
import { formatVND } from "@/lib/money";
import { VENUE } from "@/lib/venue";

export const dynamic = "force-dynamic";

function AttendanceList({ data }: { data: EventWithVotes }) {
  const going = data.rows.filter((r) => r.going === true);
  const notGoing = data.rows.filter((r) => r.going === false);
  const notVoted = data.rows.filter((r) => r.going === null);
  return (
    <div className="mt-3.5 flex flex-col gap-3 rounded-2xl border border-ink/8 bg-white p-4">
      <div>
        <h3 className="text-[13px] font-extrabold text-success">
          ✅ Đi ({data.headCount})
        </h3>
        <p className="mt-0.5 text-[13px] font-medium text-ink">
          {going
            .map(
              (r) =>
                `${r.member.name}${
                  r.guests > 0
                    ? ` (+${r.guests}${r.guestNames ? `: ${r.guestNames}` : ""})`
                    : ""
                }`,
            )
            .join(", ") || "Chưa có ai"}
        </p>
      </div>
      <div>
        <h3 className="text-[13px] font-extrabold text-ink/45">
          ❌ Không đi ({notGoing.length})
        </h3>
        <p className="mt-0.5 text-[13px] font-medium text-ink/55">
          {notGoing.map((r) => r.member.name).join(", ") || "—"}
        </p>
      </div>
      {notVoted.length > 0 && (
        <div>
          <h3 className="text-[13px] font-extrabold text-amber">
            ❓ Chưa vote ({notVoted.length})
          </h3>
          <p className="mt-0.5 text-[13px] font-medium text-ink/55">
            {notVoted.map((r) => r.member.name).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

export default async function HomePage() {
  await ensureMonthEvents();
  const [upcoming, pastEvent, me] = await Promise.all([
    getUpcomingEvent(),
    getLatestPastEvent(),
    getCurrentMember(),
  ]);

  const upcomingData = upcoming ? await getEventVotes(upcoming) : null;
  const myRow = me
    ? (upcomingData?.rows.find((r) => r.member.id === me.id) ?? null)
    : null;
  const futureEvents = upcoming
    ? (await getFutureEvents(upcoming.eventDate)).filter(
        (e) => e.status === "open",
      )
    : [];
  // Buổi vừa rồi đã chốt tiền -> dẫn sang trang buổi đó để quét QR
  const payableEvent =
    pastEvent &&
    (pastEvent.status === "settled" || pastEvent.status === "completed") &&
    pastEvent.totalCost != null
      ? pastEvent
      : null;

  return (
    <div>
      {upcomingData && (
        <section>
          <div className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,var(--color-brand-light),var(--color-brand-light2))] p-5 shadow-[0_12px_24px_-8px_oklch(60%_0.19_42_/_0.4)]">
            <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(115deg,rgba(255,255,255,0.07)_0_2px,transparent_2px_26px)]" />
            <div className="relative">
              <div className="text-[11.5px] font-bold tracking-wide text-white/85 uppercase">
                Buổi sắp tới
              </div>
              <h1 className="mt-[5px] text-[23px] font-extrabold text-white">
                {formatDateVN(upcomingData.event.eventDate)}
              </h1>
              <p className="mt-1 text-[13.5px] font-semibold text-white/92">
                ⏰ {upcomingData.event.startTime}–{upcomingData.event.endTime}{" "}
                · {upcomingData.headCount} người đã chốt đi
              </p>
              <a
                href={VENUE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 block text-[13px] font-semibold text-white/92 underline decoration-white/40 underline-offset-2"
              >
                📍 {VENUE.name}
                <span className="block text-[11.5px] font-medium text-white/75 no-underline">
                  {VENUE.address}
                </span>
              </a>
              {upcomingData.event.status === "cancelled" && (
                <p className="mt-2.5 rounded-lg bg-white/20 px-2.5 py-2 text-[13px] font-bold text-white">
                  ⚠️ Buổi tuần này đã HỦY
                </p>
              )}
              {upcomingData.event.note && (
                <p className="mt-2 text-[12.5px] text-white/85">
                  📝 {upcomingData.event.note}
                </p>
              )}
              {upcomingData.event.status !== "cancelled" && (
                <div className="mt-3 flex gap-2">
                  <a
                    href={googleCalendarUrl(upcomingData.event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-[12px] font-bold text-white transition hover:bg-white/25"
                  >
                    📅 Thêm vào Google Calendar
                  </a>
                </div>
              )}
            </div>
          </div>

          {upcomingData.event.status !== "cancelled" && (
            <div className="mt-4">
              {me ? (
                <VotePanel
                  eventId={upcomingData.event.id}
                  me={{
                    memberId: me.id,
                    name: me.name,
                    going: myRow?.going ?? null,
                    guests: myRow?.guests ?? 0,
                    guestNames: myRow?.guestNames ?? null,
                  }}
                  locked={
                    upcomingData.event.status === "settled" ||
                    upcomingData.event.status === "completed"
                  }
                />
              ) : (
                <LoginPrompt next="/" />
              )}
            </div>
          )}

          <AttendanceList data={upcomingData} />

          {futureEvents.length > 0 && (
            <div className="mt-3.5 rounded-2xl border border-ink/8 bg-white p-4">
              <p className="text-[13px] font-bold text-ink/60">
                🗓 Vote trước cho các buổi sau:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {futureEvents.map((e) => (
                  <Link
                    key={e.id}
                    href={`/events/${e.id}`}
                    className="rounded-full border border-brand/30 bg-brand-soft px-3.5 py-2 text-[13px] font-bold text-brand transition hover:border-brand/60 active:scale-95"
                  >
                    CN {formatDateShort(e.eventDate)}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {payableEvent && (
        <section className="mt-[22px]">
          <Link
            href={`/events/${payableEvent.id}`}
            className="block rounded-2xl border border-amber-border bg-amber-bg p-4 transition hover:brightness-[0.98] active:scale-[0.99]"
          >
            <p className="text-[14px] font-extrabold text-ink">
              💸 Tiền sân {formatDateVN(payableEvent.eventDate)}
            </p>
            <p className="mt-1 text-[12.5px] font-semibold text-ink/60">
              Tổng chi {formatVND(payableEvent.totalCost ?? 0)} · Bấm để xem
              QR &amp; chuyển khoản →
            </p>
          </Link>
        </section>
      )}
    </div>
  );
}
