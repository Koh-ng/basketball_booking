import { VotePanel } from "@/components/VotePanel";
import {
  PaymentSection,
  type PaymentRowClient,
} from "@/components/PaymentSection";
import { formatDateVN } from "@/lib/dates";
import {
  ensureUpcomingEvent,
  getEventVotes,
  getLatestPastEvent,
  getUpcomingEvent,
  type EventWithVotes,
} from "@/lib/events";
import { formatVND, perPersonAmount } from "@/lib/money";
import { bankInfoFrom, getSettings } from "@/lib/settings";
import { VENUE } from "@/lib/venue";
import { vietQrUrl } from "@/lib/vietqr";

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
                `${r.member.name}${r.guests > 0 ? ` (+${r.guests})` : ""}`,
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
  await ensureUpcomingEvent();
  const [upcoming, pastEvent, settings] = await Promise.all([
    getUpcomingEvent(),
    getLatestPastEvent(),
    getSettings(),
  ]);

  const upcomingData = upcoming ? await getEventVotes(upcoming) : null;
  const pastData =
    pastEvent && pastEvent.status === "settled"
      ? await getEventVotes(pastEvent)
      : null;

  const bank = bankInfoFrom(settings);
  const staticQr = settings.qrImage || null;
  let paymentRows: PaymentRowClient[] = [];
  let per = 0;
  if (pastData && pastData.event.totalCost) {
    per = perPersonAmount(pastData.event.totalCost, pastData.headCount);
    paymentRows = pastData.rows
      .filter((r) => r.going === true)
      .map((r) => ({
        memberId: r.member.id,
        name: r.member.name,
        guests: r.guests,
        amountLabel: formatVND(per * (1 + r.guests)),
        paid: r.paid,
        qrUrl:
          staticQr ??
          (bank
            ? vietQrUrl(
                bank,
                per * (1 + r.guests),
                `BongRo ${pastData.event.eventDate} ${r.member.name}`,
              )
            : null),
      }));
  }

  return (
    <div>
      {upcomingData && (
        <section>
          <div className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,var(--color-brand-light),var(--color-brand-light2))] p-5 shadow-[0_12px_24px_-8px_oklch(60%_0.19_42_/_0.4)]">
            <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(115deg,rgba(255,255,255,0.07)_0_2px,transparent_2px_26px)]" />
            <div className="relative">
              <div className="text-[11.5px] font-bold tracking-wide text-white/85 uppercase">
                Kèo sắp tới
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
                  ⚠️ Kèo tuần này đã HỦY
                </p>
              )}
              {upcomingData.event.note && (
                <p className="mt-2 text-[12.5px] text-white/85">
                  📝 {upcomingData.event.note}
                </p>
              )}
            </div>
          </div>

          {upcomingData.event.status !== "cancelled" && (
            <div className="mt-4">
              <VotePanel
                eventId={upcomingData.event.id}
                rows={upcomingData.rows.map((r) => ({
                  memberId: r.member.id,
                  name: r.member.name,
                  going: r.going,
                  guests: r.guests,
                }))}
                locked={upcomingData.event.status === "settled"}
              />
            </div>
          )}

          <AttendanceList data={upcomingData} />
        </section>
      )}

      {pastData && (
        <section className="mt-[22px]">
          <h2 className="mb-2.5 text-[15px] font-extrabold text-ink">
            💸 Tiền sân {formatDateVN(pastData.event.eventDate)}
          </h2>
          <PaymentSection
            rows={paymentRows}
            totalLabel={formatVND(pastData.event.totalCost ?? 0)}
            perPersonLabel={formatVND(per)}
            bankLine={
              bank
                ? `CK: ${bank.bankCode} ${bank.accountNo} (${bank.accountName})`
                : null
            }
          />
        </section>
      )}
    </div>
  );
}
