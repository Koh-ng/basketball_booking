export type EventStatus = "open" | "settled" | "completed" | "cancelled";

export const STATUS_LABEL: Record<EventStatus, string> = {
  open: "Đang mở",
  settled: "Thu tiền",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

/** Tailwind classes cho badge trạng thái, dùng chung mọi nơi hiển thị buổi. */
export const STATUS_BADGE: Record<EventStatus, string> = {
  open: "bg-amber-bg text-amber",
  settled: "bg-brand-soft text-brand-dark",
  completed: "bg-success-bg text-success",
  cancelled: "bg-ink/5 text-ink/45",
};
