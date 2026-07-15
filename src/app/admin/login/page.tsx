"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="max-w-sm mx-auto mt-10">
      <form
        action={formAction}
        className="rounded-xl bg-white p-6 shadow-sm border border-zinc-200 space-y-4"
      >
        <h1 className="text-lg font-bold">🔐 Đăng nhập quản lý</h1>
        <input
          type="password"
          name="pin"
          inputMode="numeric"
          placeholder="Nhập mã PIN"
          autoFocus
          className="w-full rounded-lg border border-zinc-300 px-3 py-2.5"
        />
        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-orange-600 text-white py-2.5 font-semibold hover:bg-orange-700 transition disabled:opacity-50"
        >
          {pending ? "Đang kiểm tra..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
