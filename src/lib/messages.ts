import type { Event } from "@/db/schema";
import type { EventWithVotes } from "./events";
import { formatDateVN } from "./dates";
import type { HostProfile } from "./hostProfiles";
import { formatVND, perPersonAmount } from "./money";
import { VENUE } from "./venue";

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "";
}

/** "10:00" -> "10h", "10:30" -> "10h30" */
function formatHourVN(time: string): string {
  const [h, m] = time.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

/** Tin nhắn nhắn admin sân xin đặt sân cho buổi — dán vào chat với admin sân. */
export function courtBookingMessage(event: Event): string {
  const [, m, day] = event.eventDate.split("-");
  const start = formatHourVN(event.startTime);
  const end = formatHourVN(event.endTime);
  return `cho mình đặt sân ngày ${Number(day)}/${Number(m)} bóng rổ ${start}-${end} 1 rổ quận 8 nha ad`;
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

/** Tóm tắt số người tham gia (thứ 5) — cho admin nắm trước buổi. */
export function participationSummaryMessage(data: EventWithVotes): string {
  const { event, rows, headCount, goingCount, guestCount } = data;
  const going = rows
    .filter((r) => r.going === true)
    .map((r) => nameWithGuests(r.member.name, r.guests, r.guestNames));
  const notVoted = rows
    .filter((r) => r.going === null)
    .map((r) => r.member.name);
  const notGoing = rows
    .filter((r) => r.going === false)
    .map((r) => r.member.name);
  const lines = [
    `🏀 BUỔI CHỦ NHẬT ${formatDateVN(event.eventDate)} — hiện có ${headCount} người tham gia` +
      (guestCount > 0
        ? ` (${goingCount} thành viên + ${guestCount} khách)`
        : ""),
    ``,
    `✅ Đi (${headCount}): ${going.join(", ") || "chưa có ai"}`,
  ];
  if (notVoted.length > 0) {
    lines.push(`❓ Chưa vote (${notVoted.length}): ${notVoted.join(", ")}`);
  }
  if (notGoing.length > 0) {
    lines.push(`❌ Không đi (${notGoing.length}): ${notGoing.join(", ")}`);
  }
  return lines.join("\n");
}

/** Ai đã / chưa chuyển tiền (thứ 2) — cho admin theo dõi sau buổi. */
export function paymentStatusMessage(data: EventWithVotes): string {
  const { event, rows, headCount } = data;
  const total = event.totalCost ?? 0;
  const per = perPersonAmount(total, headCount);
  const going = rows.filter((r) => r.going === true);
  const paid = going.filter((r) => r.paid).map((r) => r.member.name);
  const transferred = going
    .filter((r) => r.transferred && !r.paid)
    .map((r) => r.member.name);
  const unpaid = going
    .filter((r) => !r.transferred && !r.paid)
    .map((r) => `${r.member.name} (${formatVND(per * (1 + r.guests))})`);
  const lines = [
    `💸 TIỀN SÂN ${formatDateVN(event.eventDate)} — đã thu ${paid.length}/${going.length} người`,
    ``,
  ];
  if (unpaid.length > 0) {
    lines.push(`⏳ Chưa chuyển (${unpaid.length}): ${unpaid.join(", ")}`);
  } else {
    lines.push(`✅ Tất cả đã chuyển khoản, xong xuôi!`);
  }
  if (paid.length > 0) {
    lines.push(`✅ Đã nhận (${paid.length}): ${paid.join(", ")}`);
  }
  if (transferred.length > 0) {
    lines.push(
      `✔️ Đã chuyển, chờ xác nhận (${transferred.length}): ${transferred.join(", ")}`,
    );
  }
  return lines.join("\n");
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
    .filter((r) => r.going === true && !r.transferred && !r.paid)
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
  if (host?.bankAccountNo) {
    lines.push(`Quét mã QR trên app: ${appUrl()}`);
  }
  if (unpaid.length > 0) {
    lines.push(``, `⏳ Chưa chuyển (${unpaid.length}): ${unpaid.join(", ")}`);
  } else {
    lines.push(``, `✅ Tất cả đã chuyển khoản, cảm ơn anh em!`);
  }
  return lines.join("\n");
}
