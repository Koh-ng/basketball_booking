"use client";

import { useActionState, useEffect, useState } from "react";
import { saveHostProfileAction } from "../actions";
import type { HostProfile } from "@/lib/hostProfiles";

const inputClass =
  "mt-[5px] w-full rounded-[10px] border border-ink/15 px-3 py-2.5 text-[13px]";
const labelClass = "block text-[12px] font-bold text-ink/55";

export function HostProfileForm({
  initial,
}: {
  initial: HostProfile | null;
}) {
  const [state, formAction, pending] = useActionState(
    saveHostProfileAction,
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
      {initial && <input type="hidden" name="hostId" value={initial.id} />}
      <div>
        <label className={labelClass}>Tên người quản lý</label>
        <input
          type="text"
          name="name"
          defaultValue={initial?.name ?? ""}
          placeholder="VD: Khôi"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Mã ngân hàng (VD: MB, VCB...)</label>
        <input
          type="text"
          name="bankCode"
          defaultValue={initial?.bankCode ?? ""}
          placeholder="VCB"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Số tài khoản</label>
        <input
          type="text"
          name="bankAccountNo"
          defaultValue={initial?.bankAccountNo ?? ""}
          placeholder="0123456789"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Tên chủ tài khoản</label>
        <input
          type="text"
          name="bankAccountName"
          defaultValue={initial?.bankAccountName ?? ""}
          placeholder="NGUYEN VAN A"
          className={inputClass}
        />
      </div>

      {state?.error && (
        <p className="text-[12.5px] font-semibold text-danger">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-xl bg-brand py-3 text-[14px] font-extrabold text-white transition hover:brightness-95 disabled:opacity-50"
        >
          {pending
            ? "Đang lưu..."
            : initial
              ? "Lưu thay đổi"
              : "Thêm người quản lý"}
        </button>
      </div>
      {showFlash && (
        <p className="text-center text-[12.5px] font-bold text-success">
          ✅ Đã lưu
        </p>
      )}
    </form>
  );
}
