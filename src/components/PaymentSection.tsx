"use client";

import { useSelectedMember } from "./useSelectedMember";

export type PaymentRowClient = {
  memberId: number;
  name: string;
  paid: boolean;
  qrUrl: string | null;
};

export function PaymentSection({
  rows,
  perPersonLabel,
  totalLabel,
  bankLine,
}: {
  rows: PaymentRowClient[];
  perPersonLabel: string;
  totalLabel: string;
  bankLine: string | null;
}) {
  const [memberId] = useSelectedMember();
  const me = rows.find((r) => r.memberId === memberId) ?? null;

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
            {me.name} ơi, quét QR để chuyển {perPersonLabel} nhé:
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={me.qrUrl}
            alt="QR chuyển khoản VietQR"
            className="mx-auto block h-[180px] w-[180px] rounded-[14px] border border-ink/8"
          />
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
