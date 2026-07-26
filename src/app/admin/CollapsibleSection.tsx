"use client";

import { useState } from "react";

/** Khối thu gọn — chỉ hiện nút bấm, xổ xuống nội dung khi cần. */
export function CollapsibleSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-ink/8 bg-ink/2 px-3 py-2.5 text-[12.5px] font-bold text-ink/65 transition hover:bg-ink/4"
      >
        <span>{label}</span>
        <span
          className={`text-ink/40 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}
