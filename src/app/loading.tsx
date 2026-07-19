/** Skeleton hiện ngay khi chuyển trang, trong lúc chờ server trả dữ liệu. */
export default function Loading() {
  return (
    <div className="animate-pulse" aria-busy="true">
      <div className="h-[150px] rounded-[22px] bg-ink/8" />
      <div className="mt-4 h-[120px] rounded-2xl bg-ink/6" />
      <div className="mt-3.5 h-[140px] rounded-2xl bg-ink/6" />
    </div>
  );
}
