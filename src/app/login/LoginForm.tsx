"use client";

import { useActionState } from "react";
import { memberLoginAction } from "../memberActions";
import type { Member } from "@/db/schema";

export function LoginForm({
  members,
  next,
}: {
  members: Member[];
  next: string;
}) {
  const [state, formAction, pending] = useActionState(memberLoginAction, null);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl border border-ink/8 bg-white p-4"
    >
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="block text-[12px] font-bold text-ink/55">
          Bạn là ai?
        </label>
        <select
          name="memberId"
          defaultValue=""
          required
          className="mt-[5px] w-full rounded-[10px] border border-ink/15 bg-white px-3 py-2.5 text-sm font-semibold text-ink"
        >
          <option value="" disabled>
            — Chọn tên của bạn —
          </option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[12px] font-bold text-ink/55">
          Mã PIN
        </label>
        <input
          type="password"
          name="pin"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Mặc định 123456"
          className="mt-[5px] w-full rounded-[10px] border border-ink/15 px-3 py-2.5 text-sm font-semibold tracking-widest text-ink"
        />
        <p className="mt-1.5 text-[11.5px] font-semibold text-ink/40">
          Chưa từng đổi PIN thì cứ nhập 123456.
        </p>
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
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
