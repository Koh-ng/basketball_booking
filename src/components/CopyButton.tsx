"use client";

import { useState } from "react";

export function CopyButton({
  text,
  label,
  className = "",
}: {
  text: string;
  label: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback cho trình duyệt không hỗ trợ clipboard API
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className={`rounded-[10px] bg-brand-soft px-3 py-2.5 text-[12.5px] font-bold whitespace-nowrap text-brand-dark transition hover:brightness-95 ${className}`}
    >
      {copied ? "✓ Đã copy!" : label}
    </button>
  );
}
