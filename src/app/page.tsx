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
import { vietQrUrl } from "@/lib/vietqr";

export const dynamic = "force-dynamic";

function AttendanceList({ data }: { data: EventWithVotes }) {
  const going = data.rows.filter((r) => r.going === true);
  const notGoing = data.rows.filter((r) => r.going === false);
  const notVoted = data.rows.filter((r) => r.going === null);
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-zinc-200 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-green-700">
          ✅ Đi ({going.length})
        </h3>
        <p className="text-sm text-zinc-700 mt-1">
          {going.map((r) => r.member.name).join(", ") || "Chưa có ai"}
        </p>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-zinc-500">
          ❌ Không đi ({notGoing.length})
        </h3>
        <p className="text-sm text-zinc-500 mt-1">
          {notGoing.map((r) => r.member.name).join(", ") || "—"}
        </p>
      </div>
      {notVoted.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-amber-600">
            ❓ Chưa vote ({notVoted.length})
          </h3>
          <p className="text-sm text-zinc-500 mt-1">
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
  let paymentRows: PaymentRowClient[] = [];
  let per = 0;
  if (pastData && pastData.event.totalCost) {
    per = perPersonAmount(pastData.event.totalCost, pastData.goingCount);
    paymentRows = pastData.rows
      .filter((r) => r.going === true)
      .map((r) => ({
        memberId: r.member.id,
        name: r.member.name,
        paid: r.paid,
        qrUrl: bank
          ? vietQrUrl(
              bank,
              per,
              `BongRo ${pastData.event.eventDate} ${r.member.name}`,
            )
          : null,
      }));
  }

  return (
    <div className="space-y-6">
      {upcomingData && (
        <section className="space-y-4">
          <div className="rounded-xl bg-orange-600 text-white p-5 shadow">
            <p className="text-orange-100 text-sm">Kèo tuần này</p>
            <h1 className="text-2xl font-bold mt-1">
              {formatDateVN(upcomingData.event.eventDate)}
            </h1>
            <p className="mt-1 text-orange-100">
              ⏰ {upcomingData.event.startTime}–{upcomingData.event.endTime} ·{" "}
              {upcomingData.goingCount} người đã chốt đi
            </p>
            {upcomingData.event.status === "cancelled" && (
              <p className="mt-2 rounded bg-white/20 px-2 py-1 text-sm font-semibold">
                ⚠️ Kèo tuần này đã HỦY
              </p>
            )}
            {upcomingData.event.note && (
              <p className="mt-2 text-sm text-orange-100">
                📝 {upcomingData.event.note}
              </p>
            )}
          </div>

          {upcomingData.event.status !== "cancelled" && (
            <VotePanel
              eventId={upcomingData.event.id}
              rows={upcomingData.rows.map((r) => ({
                memberId: r.member.id,
                name: r.member.name,
                going: r.going,
              }))}
              locked={upcomingData.event.status === "settled"}
            />
          )}

          <AttendanceList data={upcomingData} />
        </section>
      )}

      {pastData && (
        <section className="space-y-3">
          <h2 className="font-bold text-lg">
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
