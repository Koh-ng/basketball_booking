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

function escapeIcs(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
}

/** Nội dung file .ics (Apple Calendar / lịch điện thoại) cho 1 buổi. */
export function icsContent(ev: Event): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//bong-ro-chu-nhat//VN",
    "BEGIN:VEVENT",
    `UID:bongro-${ev.id}-${ev.eventDate}@bong-ro-chu-nhat`,
    `DTSTAMP:${toUtcStamp(ev.eventDate, ev.startTime)}`,
    `DTSTART:${toUtcStamp(ev.eventDate, ev.startTime)}`,
    `DTEND:${toUtcStamp(ev.eventDate, ev.endTime)}`,
    `SUMMARY:${escapeIcs(TITLE)}`,
    `LOCATION:${escapeIcs(`${VENUE.name}, ${VENUE.address}`)}`,
    `DESCRIPTION:${escapeIcs(`Vote & chia tiền sân: ${appUrl()}\nBản đồ: ${VENUE.mapsUrl}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
