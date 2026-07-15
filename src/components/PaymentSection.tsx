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
    <div className="rounded-xl bg-white p-4 shadow-sm border border-zinc-200">
      <p className="text-sm text-zinc-600">
        Tổng chi: <b>{totalLabel}</b> · Mỗi người: <b>{perPersonLabel}</b>
      </p>
      {bankLine && <p className="mt-1 text-sm text-zinc-600">{bankLine}</p>}

      {me && !me.paid && me.qrUrl && (
        <div className="mt-4 text-center">
          <p className="text-sm font-medium mb-2">
            {me.name} ơi, quét QR để chuyển {perPersonLabel} nhé:
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={me.qrUrl}
            alt="QR chuyển khoản VietQR"
            className="mx-auto w-56 max-w-full rounded-lg border border-zinc-200"
          />
        </div>
      )}
      {me && me.paid && (
        <p className="mt-3 text-sm text-green-700 font-medium">
          ✅ {me.name} đã chuyển khoản, cảm ơn bạn!
        </p>
      )}

      <ul className="mt-4 divide-y divide-zinc-100">
        {rows.map((r) => (
          <li key={r.memberId} className="flex items-center justify-between py-2">
            <span>{r.name}</span>
            {r.paid ? (
              <span className="text-xs font-semibold text-green-700 bg-green-50 rounded-full px-2.5 py-1">
                Đã chuyển ✓
              </span>
            ) : (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 rounded-full px-2.5 py-1">
                Chưa chuyển
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
