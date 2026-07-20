import { NextRequest, NextResponse } from "next/server";
import { vnWeekday } from "@/lib/dates";
import { sendAdminEmail } from "@/lib/email";
import {
  autoCancelEvent,
  deleteOldCancelledEvents,
  ensureUpcomingEvent,
  getEventVotes,
  getLatestPastEvent,
  getUpcomingEvent,
  MIN_PLAYERS,
} from "@/lib/events";
import { getEffectiveHost } from "@/lib/hostProfiles";
import {
  gameDayMessage,
  paymentReminderMessage,
  voteReminderMessage,
} from "@/lib/messages";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

/**
 * Cron chạy MỖI NGÀY lúc 01:00 UTC = 8:00 sáng VN (vercel.json).
 * Tự quyết định việc theo thứ trong tuần (giờ VN):
 *  - Hàng ngày: đảm bảo tồn tại buổi cho Chủ nhật sắp tới
 *  - Hàng ngày: xoá vĩnh viễn các buổi đã hủy quá 30 ngày
 *  - Thứ 6: email nhắc admin đăng tin vote + book sân
 *  - Chủ nhật: email nhắc giờ chơi (8h sáng, chơi lúc 10h)
 *  - Thứ 3: email nhắc thu tiền nếu còn người chưa chuyển khoản
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cho phép giả lập thứ trong tuần khi test ở môi trường dev
  const simulate = req.nextUrl.searchParams.get("simulate");
  const weekday =
    simulate !== null && process.env.NODE_ENV !== "production"
      ? Number(simulate)
      : vnWeekday();

  await ensureUpcomingEvent();
  const deletedCount = await deleteOldCancelledEvents();

  const settings = await getSettings();
  const adminEmail = settings.adminEmail || process.env.ADMIN_EMAIL || "";
  const actions: string[] = [
    "ensured upcoming event",
    `deleted ${deletedCount} old cancelled event(s)`,
  ];

  if (weekday === 5) {
    // Thứ 6: nhắc vote + book sân
    const event = await getUpcomingEvent();
    if (event && event.status === "open") {
      const data = await getEventVotes(event);
      const sent = await sendAdminEmail(
        adminEmail,
        `🏀 Nhắc vote buổi bóng rổ Chủ nhật (đã có ${data.headCount} người)`,
        [
          `Hiện có ${data.headCount} người chốt đi. Nhớ book sân và trả tiền trước nhé!`,
          ``,
          `Tin nhắn soạn sẵn để dán vào group Messenger:`,
          `----------`,
          voteReminderMessage(data),
        ].join("\n"),
      );
      actions.push(`vote reminder email: ${sent ? "sent" : "skipped"}`);
    }
  }

  if (weekday === 6) {
    // Thứ 7: không đủ người thì tự hủy buổi Chủ nhật
    const event = await getUpcomingEvent();
    if (event && event.status === "open") {
      const data = await getEventVotes(event);
      if (data.headCount < MIN_PLAYERS) {
        await autoCancelEvent(event, data.headCount);
        const sent = await sendAdminEmail(
          adminEmail,
          `⚠️ Buổi Chủ nhật đã tự hủy (chỉ có ${data.headCount}/${MIN_PLAYERS} người)`,
          [
            `Buổi ${event.eventDate} chỉ có ${data.headCount} người chốt đi (tối thiểu ${MIN_PLAYERS}) nên app đã tự hủy.`,
            ``,
            `Nếu vẫn muốn chơi, vào trang Quản lý bấm "Mở lại buổi" nhé: ${process.env.NEXT_PUBLIC_APP_URL ?? ""}/admin`,
          ].join("\n"),
        );
        actions.push(
          `auto-cancelled (${data.headCount}/${MIN_PLAYERS}), email: ${sent ? "sent" : "skipped"}`,
        );
      } else {
        actions.push(`headcount ok (${data.headCount}/${MIN_PLAYERS})`);
      }
    }
  }

  if (weekday === 0) {
    // Chủ nhật: nhắc giờ chơi
    const event = await getUpcomingEvent();
    if (event && event.status === "open") {
      const data = await getEventVotes(event);
      const sent = await sendAdminEmail(
        adminEmail,
        `🏀 Hôm nay chơi bóng ${event.startTime} (${data.headCount} người đi)`,
        [
          `Sáng nay chơi bóng lúc ${event.startTime}–${event.endTime}.`,
          ``,
          `Tin nhắn soạn sẵn để dán vào group Messenger:`,
          `----------`,
          gameDayMessage(data),
        ].join("\n"),
      );
      actions.push(`game day email: ${sent ? "sent" : "skipped"}`);
    }
  }

  if (weekday === 2) {
    // Thứ 3: nhắc thu tiền
    const event = await getLatestPastEvent();
    if (event && event.status === "settled") {
      const data = await getEventVotes(event);
      const unpaid = data.rows.filter((r) => r.going === true && !r.paid);
      if (unpaid.length > 0) {
        const host = await getEffectiveHost(
          event.hostId,
          settings.defaultHostId,
        );
        const sent = await sendAdminEmail(
          adminEmail,
          `💸 Còn ${unpaid.length} người chưa chuyển tiền sân`,
          [
            `Chưa chuyển: ${unpaid.map((r) => r.member.name).join(", ")}`,
            ``,
            `Tin nhắn soạn sẵn để dán vào group Messenger:`,
            `----------`,
            paymentReminderMessage(data, host),
          ].join("\n"),
        );
        actions.push(`payment reminder email: ${sent ? "sent" : "skipped"}`);
      }
    }
  }

  return NextResponse.json({ ok: true, weekday, actions });
}
