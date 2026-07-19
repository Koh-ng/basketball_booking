const TZ = "Asia/Ho_Chi_Minh";

/** Trả về ngày hiện tại theo giờ VN dạng YYYY-MM-DD */
export function vnToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

/** Thứ trong tuần theo giờ VN: 0 = Chủ nhật ... 6 = Thứ bảy */
export function vnWeekday(): number {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
  }).format(new Date());
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
}

/**
 * Ngày Chủ nhật sắp tới (YYYY-MM-DD) theo giờ VN.
 * Nếu hôm nay là Chủ nhật thì trả về chính hôm nay
 * (kèo hôm nay vẫn là kèo "sắp tới" cho tới hết ngày).
 */
export function upcomingSunday(): string {
  const today = vnToday();
  const wd = vnWeekday();
  const daysUntil = (7 - wd) % 7;
  return addDays(today, daysUntil);
}

/**
 * Các ngày Chủ nhật còn lại trong tháng, tính từ Chủ nhật sắp tới.
 * (Nếu Chủ nhật sắp tới rơi sang tháng mới thì trả về các Chủ nhật
 * của tháng mới đó.)
 */
export function remainingSundaysOfMonth(): string[] {
  const first = upcomingSunday();
  const month = first.slice(0, 7); // YYYY-MM
  const sundays: string[] = [];
  for (let d = first; d.slice(0, 7) === month; d = addDays(d, 7)) {
    sundays.push(d);
  }
  return sundays;
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const WEEKDAY_VN = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];

/** "2026-07-19" -> "Chủ nhật 19/07/2026" */
export function formatDateVN(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  const wd = WEEKDAY_VN[d.getUTCDay()];
  const [y, m, day] = isoDate.split("-");
  return `${wd} ${day}/${m}/${y}`;
}

/** "2026-07-19" -> "Tháng 7/2026" */
export function formatMonthVN(isoDate: string): string {
  const [y, m] = isoDate.split("-");
  return `Tháng ${Number(m)}/${y}`;
}

/** "2026-07-19" -> "19/07" */
export function formatDateShort(isoDate: string): string {
  const [, m, day] = isoDate.split("-");
  return `${day}/${m}`;
}
