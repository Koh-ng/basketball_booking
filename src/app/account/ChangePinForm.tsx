"use client";

import { useActionState, useEffect, useState } from "react";
import { changeMemberPinAction } from "../memberActions";

export function ChangePinForm() {
  const [state, formAction, pending] = useActionState(
    changeMemberPinAction,
    null,
  );
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (!state?.ok) return;
    setShowFlash(true);
    const t = setTimeout(() => setShowFlash(false), 2500);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl border border-ink/8 bg-white p-4"
    >
      <div>
        <label className="block text-[12px] font-bold text-ink/55">
          Mã PIN mới (4-6 chữ số)
        </label>
        <input
          type="password"
          name="newPin"
          inputMode="numeric"
          autoComplete="off"
          className="mt-[5px] w-full rounded-[10px] border border-ink/15 px-3 py-2.5 text-sm font-semibold tracking-widest text-ink"
        />
      </div>
      <div>
        <label className="block text-[12px] font-bold text-ink/55">
          Nhập lại mã PIN mới
        </label>
        <input
          type="password"
          name="confirmPin"
          inputMode="numeric"
          autoComplete="off"
          className="mt-[5px] w-full rounded-[10px] border border-ink/15 px-3 py-2.5 text-sm font-semibold tracking-widest text-ink"
        />
      </div>

      {state?.error && (
        <p className="text-[12.5px] font-semibold text-danger">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-xl bg-brand py-3 text-[14px] font-extrabold text-white transition hover:brightness-95 active:scale-[0.98] disabled:opacity-50"
      >
        {pending ? "Đang lưu..." : "Đổi mã PIN"}
      </button>
      {showFlash && (
        <p className="text-center text-[12.5px] font-bold text-success">
          ✅ Đã đổi mã PIN
        </p>
      )}
    </form>
  );
}
