import { NextRequest, NextResponse } from "next/server";
import { vnWeekday } from "@/lib/dates";
import { sendAdminEmail } from "@/lib/email";
import {
  ensureUpcomingEvent,
  getEventVotes,
  getLatestPastEvent,
  getUpcomingEvent,
} from "@/lib/events";
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
 *  - Hàng ngày: đảm bảo tồn tại kèo cho Chủ nhật sắp tới
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

  const settings = await getSettings();
  const adminEmail = settings.adminEmail || process.env.ADMIN_EMAIL || "";
  const actions: string[] = ["ensured upcoming event"];

  if (weekday === 5) {
    // Thứ 6: nhắc vote + book sân
    const event = await getUpcomingEvent();
    if (event && event.status === "open") {
      const data = await getEventVotes(event);
      const sent = await sendAdminEmail(
        adminEmail,
        `🏀 Nhắc vote kèo bóng rổ Chủ nhật (đã có ${data.goingCount} người)`,
        [
          `Hiện có ${data.goingCount} người chốt đi. Nhớ book sân và trả tiền trước nhé!`,
          ``,
          `Tin nhắn soạn sẵn để dán vào group Messenger:`,
          `----------`,
          voteReminderMessage(data),
        ].join("\n"),
      );
      actions.push(`vote reminder email: ${sent ? "sent" : "skipped"}`);
    }
  }

  if (weekday === 0) {
    // Chủ nhật: nhắc giờ chơi
    const event = await getUpcomingEvent();
    if (event && event.status === "open") {
      const data = await getEventVotes(event);
      const sent = await sendAdminEmail(
        adminEmail,
        `🏀 Hôm nay chơi bóng ${event.startTime} (${data.goingCount} người đi)`,
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
        const sent = await sendAdminEmail(
          adminEmail,
          `💸 Còn ${unpaid.length} người chưa chuyển tiền sân`,
          [
            `Chưa chuyển: ${unpaid.map((r) => r.member.name).join(", ")}`,
            ``,
            `Tin nhắn soạn sẵn để dán vào group Messenger:`,
            `----------`,
            paymentReminderMessage(data, settings),
          ].join("\n"),
        );
        actions.push(`payment reminder email: ${sent ? "sent" : "skipped"}`);
      }
    }
  }

  return NextResponse.json({ ok: true, weekday, actions });
}
