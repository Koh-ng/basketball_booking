"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitFeedbackAction } from "./actions";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "bug", label: "🐛 Báo lỗi" },
  { value: "feature", label: "💡 Đề xuất tính năng" },
  { value: "other", label: "💬 Góp ý khác" },
];

export function FeedbackForm({ authorName }: { authorName: string | null }) {
  const [state, formAction, pending] = useActionState(
    submitFeedbackAction,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl border border-ink/8 bg-white p-4"
    >
      <div>
        <label className="block text-[12px] font-bold text-ink/55">
          Loại góp ý
        </label>
        <select
          name="category"
          defaultValue="bug"
          className="mt-[5px] w-full rounded-[10px] border border-ink/15 bg-white px-3 py-2.5 text-sm font-semibold text-ink"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[12px] font-bold text-ink/55">
          Nội dung
        </label>
        <textarea
          name="message"
          rows={5}
          required
          placeholder="Mô tả lỗi bạn gặp, hoặc tính năng bạn muốn có..."
          className="mt-[5px] w-full rounded-[10px] border border-ink/15 px-3 py-2.5 text-sm text-ink placeholder:text-ink/35"
        />
      </div>

      <p className="text-[11.5px] font-semibold text-ink/40">
        {authorName
          ? `Gửi với tên: ${authorName}`
          : "Bạn chưa đăng nhập nên góp ý sẽ gửi ẩn danh."}
      </p>

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
        {pending ? "Đang gửi..." : "Gửi góp ý"}
      </button>
      {state?.ok && (
        <p className="text-center text-[12.5px] font-bold text-success">
          ✅ Đã nhận, cảm ơn bạn!
        </p>
      )}
    </form>
  );
}
