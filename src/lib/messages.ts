import type { EventWithVotes } from "./events";
import { formatDateVN } from "./dates";
import type { HostProfile } from "./hostProfiles";
import { formatVND, perPersonAmount } from "./money";
import { VENUE } from "./venue";

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "";
}

/** Tin nhắn nhắc vote (thứ 6) — dán vào group Messenger. */
function nameWithGuests(
  name: string,
  guests: number,
  guestNames: string | null,
): string {
  if (guests <= 0) return name;
  return `${name} (+${guests}${guestNames ? `: ${guestNames}` : ""})`;
}

export function voteReminderMessage(data: EventWithVotes): string {
  const { event, rows, headCount } = data;
  const going = rows
    .filter((r) => r.going === true)
    .map((r) => nameWithGuests(r.member.name, r.guests, r.guestNames));
  const notVoted = rows
    .filter((r) => r.going === null)
    .map((r) => r.member.name);
  const lines = [
    `🏀 BÓNG RỔ CHỦ NHẬT — ${formatDateVN(event.eventDate)}, ${event.startTime}–${event.endTime}`,
    `📍 ${VENUE.name}: ${VENUE.mapsUrl}`,
    ``,
    `Anh em vào vote để chốt sân nhé: ${appUrl()}`,
    ``,
    `✅ Đã chốt đi (${headCount}): ${going.join(", ") || "chưa có ai"}`,
  ];
  if (notVoted.length > 0) {
    lines.push(`❓ Chưa vote: ${notVoted.join(", ")}`);
  }
  return lines.join("\n");
}

/** Tin nhắn nhắc giờ chơi (sáng Chủ nhật). */
export function gameDayMessage(data: EventWithVotes): string {
  const { event, rows, headCount } = data;
  const going = rows
    .filter((r) => r.going === true)
    .map((r) => nameWithGuests(r.member.name, r.guests, r.guestNames));
  return [
    `🏀 HÔM NAY CHƠI BÓNG — ${formatDateVN(event.eventDate)}`,
    ``,
    `⏰ ${event.startTime}–${event.endTime}, anh em đến đúng giờ nhé!`,
    `📍 ${VENUE.name}: ${VENUE.mapsUrl}`,
    ``,
    `Danh sách đi (${headCount}): ${going.join(", ") || "chưa có ai"}`,
  ].join("\n");
}

/** Tin nhắn nhắc chuyển khoản cho buổi đã chốt tiền. */
export function paymentReminderMessage(
  data: EventWithVotes,
  host: HostProfile | null,
): string {
  const { event, rows, headCount } = data;
  const total = event.totalCost ?? 0;
  const per = perPersonAmount(total, headCount);
  const unpaid = rows
    .filter((r) => r.going === true && !r.paid)
    .map((r) =>
      r.guests > 0
        ? `${r.member.name} (+${r.guests}: ${formatVND(per * (1 + r.guests))})`
        : r.member.name,
    );
  const lines = [
    `💸 TIỀN SÂN — ${formatDateVN(event.eventDate)}`,
    ``,
    `Tổng chi: ${formatVND(total)} / ${headCount} người = ${formatVND(per)}/người`,
  ];
  if (host?.bankAccountNo) {
    lines.push(
      ``,
      `Chuyển khoản: ${host.bankCode} ${host.bankAccountNo} (${host.bankAccountName})`,
    );
  }
  if (host?.bankAccountNo || host?.qrImage) {
    lines.push(`Quét mã QR trên app: ${appUrl()}`);
  }
  if (unpaid.length > 0) {
    lines.push(``, `⏳ Chưa chuyển (${unpaid.length}): ${unpaid.join(", ")}`);
  } else {
    lines.push(``, `✅ Tất cả đã chuyển khoản, cảm ơn anh em!`);
  }
  return lines.join("\n");
}
