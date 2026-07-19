"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="mx-auto mt-10 max-w-[320px] rounded-[18px] border border-ink/8 bg-white p-[22px]">
      <form action={formAction}>
        <h1 className="mb-3.5 text-[17px] font-extrabold text-ink">
          🔐 Đăng nhập quản lý
        </h1>
        <input
          type="password"
          name="pin"
          inputMode="numeric"
          placeholder="Nhập mã PIN"
          autoFocus
          className="w-full rounded-[10px] border border-ink/15 px-3 py-[11px] text-sm"
        />
        {state?.error && (
          <p className="mt-2 text-[12.5px] font-bold text-danger">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="mt-3.5 w-full rounded-xl bg-brand py-3 text-[14.5px] font-extrabold text-white transition hover:brightness-95 disabled:opacity-50"
        >
          {pending ? "Đang kiểm tra..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
