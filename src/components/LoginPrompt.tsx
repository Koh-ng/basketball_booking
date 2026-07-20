import Link from "next/link";

/** Nhắc đăng nhập trước khi vote/xem QR cá nhân — chặn vote nhầm người khác. */
export function LoginPrompt({ next }: { next: string }) {
  return (
    <div className="rounded-2xl border border-amber-border bg-amber-bg p-4 text-center">
      <p className="text-[13.5px] font-bold text-ink">🔒 Đăng nhập để vote</p>
      <p className="mt-1 text-[12px] font-semibold text-ink/55">
        Chọn tên của bạn + mã PIN (mặc định 123456) để tránh vote nhầm người
        khác.
      </p>
      <Link
        href={`/login?next=${encodeURIComponent(next)}`}
        className="mt-3 inline-block rounded-xl bg-brand px-5 py-2.5 text-[13px] font-extrabold text-white transition hover:brightness-95 active:scale-[0.97]"
      >
        Đăng nhập
      </Link>
    </div>
  );
}
