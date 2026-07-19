"use client";

import { useActionState } from "react";
import { createEventAction } from "../actions";

export function CreateEventForm() {
  const [state, formAction, pending] = useActionState(
    createEventAction,
    null,
  );

  return (
    <form
      action={formAction}
      className="mb-3.5 flex flex-col gap-2 rounded-2xl border border-ink/8 bg-white p-3.5"
    >
      <label className="block text-[12px] font-bold text-ink/55">
        Mở buổi mới cho ngày
      </label>
      <div className="flex gap-2">
        <input
          type="date"
          name="eventDate"
          required
          className="flex-1 rounded-[10px] border border-ink/15 px-3 py-2.5 text-[13px]"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-[10px] bg-brand px-4 text-[13px] font-extrabold text-white hover:brightness-95 disabled:opacity-50"
        >
          {pending ? "Đang tạo..." : "Tạo buổi"}
        </button>
      </div>
      {state?.error && (
        <p className="text-[12.5px] font-semibold text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
