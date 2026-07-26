export type PaymentRowClient = {
  memberId: number;
  name: string;
  guests: number;
  amountLabel: string;
  paid: boolean;
  qrUrl: string | null;
  bankDeepLinks: { label: string; href: string }[];
};

export function PaymentSection({
  rows,
  me,
  perPersonLabel,
  totalLabel,
  bankLine,
}: {
  rows: PaymentRowClient[];
  me: PaymentRowClient | null;
  perPersonLabel: string;
  totalLabel: string;
  bankLine: string | null;
}) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-white p-4">
      <p className="text-[13px] font-semibold text-ink/65">
        Tổng chi: <b className="text-ink">{totalLabel}</b> · Mỗi người:{" "}
        <b className="text-ink">{perPersonLabel}</b>
      </p>
      {bankLine && (
        <p className="mt-1 text-[12.5px] font-semibold text-ink/50">
          {bankLine}
        </p>
      )}

      {me && !me.paid && me.qrUrl && (
        <div className="mt-3.5 text-center">
          <p className="mb-2 text-[13px] font-bold text-ink">
            {me.name} ơi, quét QR để chuyển {me.amountLabel}
            {me.guests > 0 ? ` (bạn + ${me.guests} khách)` : ""} nhé:
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={me.qrUrl}
            alt="QR chuyển khoản"
            className="mx-auto block h-[180px] w-[180px] rounded-[14px] border border-ink/8"
          />
          {me.bankDeepLinks.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-[12px] font-semibold text-ink/45">
                Hoặc bấm mở thẳng app ngân hàng (khỏi quét):
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {me.bankDeepLinks.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    className="rounded-full border border-brand/30 bg-brand-soft px-3 py-1.5 text-[12px] font-bold text-brand-dark transition hover:brightness-95 active:scale-[0.96]"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {me && me.paid && (
        <p className="mt-3 text-[13px] font-bold text-success">
          ✅ {me.name} đã chuyển khoản, cảm ơn bạn!
        </p>
      )}

      <div className="mt-3.5 flex flex-col">
        {rows.map((r) => (
          <div
            key={r.memberId}
            className="flex items-center justify-between border-b border-ink/6 py-2 last:border-b-0"
          >
            <span className="text-[13.5px] font-semibold text-ink">
              {r.name}
              {r.guests > 0 && (
                <span className="font-medium text-ink/50">
                  {" "}
                  (+{r.guests}) · {r.amountLabel}
                </span>
              )}
            </span>
            {r.paid ? (
              <span className="rounded-full bg-success-bg px-2.5 py-1 text-[11px] font-bold text-success">
                Đã chuyển ✓
              </span>
            ) : (
              <span className="rounded-full bg-amber-bg px-2.5 py-1 text-[11px] font-bold text-amber">
                Chưa chuyển
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
