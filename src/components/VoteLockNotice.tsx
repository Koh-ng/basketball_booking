/**
 * Thông báo cho cả nhóm khi vote đã khoá theo lịch (12h trưa thứ 5).
 * Hiện cho mọi người xem trang, kể cả người chưa đăng nhập — vì lúc này
 * việc cần làm không còn nằm trong app nữa mà là nhắn lên group.
 */
export function VoteLockNotice({ deadlineLabel }: { deadlineLabel: string }) {
  return (
    <div className="mt-3.5 rounded-2xl border border-amber-border bg-amber-bg p-4">
      <p className="text-[13.5px] font-extrabold text-ink">
        🔒 Vote đã khoá lúc {deadlineLabel}
      </p>
      <p className="mt-1 text-[12.5px] leading-relaxed font-semibold text-ink/65">
        Danh sách đi bên dưới đã chốt, app không đổi vote được nữa.{" "}
        <b className="text-ink">
          Nếu bạn đi được hoặc đổi ý, nhắn lên group nhé
        </b>{" "}
        — ai đã vote đi mà không đi thì vẫn tính và đóng tiền như thường.
      </p>
    </div>
  );
}
