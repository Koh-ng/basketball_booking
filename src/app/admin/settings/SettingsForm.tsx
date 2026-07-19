"use client";

import { useActionState, useEffect, useState } from "react";
import { saveSettingsAction } from "../actions";
import type { AppSettings } from "@/lib/settings";

const inputClass =
  "mt-[5px] w-full rounded-[10px] border border-ink/15 px-3 py-2.5 text-[13px]";
const labelClass = "block text-[12px] font-bold text-ink/55";

export function SettingsForm({ initial }: { initial: AppSettings }) {
  const [state, formAction, pending] = useActionState(
    saveSettingsAction,
    null,
  );
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (!state?.ok) return;
    setShowFlash(true);
    const t = setTimeout(() => setShowFlash(false), 2000);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl border border-ink/8 bg-white p-4"
    >
      <div>
        <label className={labelClass}>Mã ngân hàng (VD: MB, VCB...)</label>
        <input
          type="text"
          name="bankCode"
          defaultValue={initial.bankCode}
          placeholder="VCB"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Số tài khoản</label>
        <input
          type="text"
          name="bankAccountNo"
          defaultValue={initial.bankAccountNo}
          placeholder="0123456789"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Tên chủ tài khoản</label>
        <input
          type="text"
          name="bankAccountName"
          defaultValue={initial.bankAccountName}
          placeholder="NGUYEN VAN A"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Email nhận nhắc nhở</label>
        <input
          type="email"
          name="adminEmail"
          defaultValue={initial.adminEmail}
          placeholder="ban@email.com"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-xl bg-brand py-3 text-[14px] font-extrabold text-white transition hover:brightness-95 disabled:opacity-50"
      >
        {pending ? "Đang lưu..." : "Lưu cài đặt"}
      </button>
      {showFlash && (
        <p className="text-center text-[12.5px] font-bold text-success">
          ✅ Đã lưu
        </p>
      )}
    </form>
  );
}
