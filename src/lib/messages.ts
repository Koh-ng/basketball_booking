import type { EventWithVotes } from "./events";
import { formatDateVN } from "./dates";
import { formatVND, perPersonAmount } from "./money";
import type { AppSettings } from "./settings";

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "";
}

/** Tin nhắn nhắc vote (thứ 6) — dán vào group Messenger. */
export function voteReminderMessage(data: EventWithVotes): string {
  const { event, rows, goingCount } = data;
  const going = rows.filter((r) => r.going === true).map((r) => r.member.name);
  const notVoted = rows
    .filter((r) => r.going === null)
    .map((r) => r.member.name);
  const lines = [
    `🏀 KÈO BÓNG RỔ — ${formatDateVN(event.eventDate)}, ${event.startTime}–${event.endTime}`,
    ``,
    `Anh em vào vote để chốt sân nhé: ${appUrl()}`,
    ``,
    `✅ Đã chốt đi (${goingCount}): ${going.join(", ") || "chưa có ai"}`,
  ];
  if (notVoted.length > 0) {
    lines.push(`❓ Chưa vote: ${notVoted.join(", ")}`);
  }
  return lines.join("\n");
}

/** Tin nhắn nhắc giờ chơi (sáng Chủ nhật). */
export function gameDayMessage(data: EventWithVotes): string {
  const { event, rows, goingCount } = data;
  const going = rows.filter((r) => r.going === true).map((r) => r.member.name);
  return [
    `🏀 HÔM NAY CHƠI BÓNG — ${formatDateVN(event.eventDate)}`,
    ``,
    `⏰ ${event.startTime}–${event.endTime}, anh em đến đúng giờ nhé!`,
    ``,
    `Danh sách đi (${goingCount}): ${going.join(", ") || "chưa có ai"}`,
  ].join("\n");
}

/** Tin nhắn nhắc chuyển khoản cho kèo đã chốt tiền. */
export function paymentReminderMessage(
  data: EventWithVotes,
  settings: AppSettings,
): string {
  const { event, rows, goingCount } = data;
  const total = event.totalCost ?? 0;
  const per = perPersonAmount(total, goingCount);
  const unpaid = rows
    .filter((r) => r.going === true && !r.paid)
    .map((r) => r.member.name);
  const lines = [
    `💸 TIỀN SÂN — ${formatDateVN(event.eventDate)}`,
    ``,
    `Tổng chi: ${formatVND(total)} / ${goingCount} người = ${formatVND(per)}/người`,
  ];
  if (settings.bankAccountNo) {
    lines.push(
      ``,
      `Chuyển khoản: ${settings.bankCode} ${settings.bankAccountNo} (${settings.bankAccountName})`,
    );
  }
  if (settings.bankAccountNo || settings.qrImage) {
    lines.push(`Quét mã QR trên app: ${appUrl()}`);
  }
  if (unpaid.length > 0) {
    lines.push(``, `⏳ Chưa chuyển (${unpaid.length}): ${unpaid.join(", ")}`);
  } else {
    lines.push(``, `✅ Tất cả đã chuyển khoản, cảm ơn anh em!`);
  }
  return lines.join("\n");
}
