import type { Event } from "@/db/schema";
import { VENUE } from "./venue";

const TITLE = "🏀 Bóng rổ Chủ nhật";

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "";
}

/** "2026-07-26" + "10:00" (giờ VN) -> "20260726T030000Z" (UTC) */
function toUtcStamp(isoDate: string, timeHM: string): string {
  const d = new Date(`${isoDate}T${timeHM}:00+07:00`);
  return d
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z")
    .replace(/[-:]/g, "");
}

/** Link "Thêm vào Google Calendar" cho 1 buổi. */
export function googleCalendarUrl(ev: Event): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: TITLE,
    dates: `${toUtcStamp(ev.eventDate, ev.startTime)}/${toUtcStamp(ev.eventDate, ev.endTime)}`,
    location: `${VENUE.name}, ${VENUE.address}`,
    details: `Vote & chia tiền sân: ${appUrl()}\nBản đồ: ${VENUE.mapsUrl}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
