"use client";

import { useActionState, useEffect, useState } from "react";
import { sendCourtBookingEmailAction } from "./actions";

export function SendBookingEmailButton({ eventId }: { eventId: number }) {
  const [state, formAction, pending] = useActionState(
    sendCourtBookingEmailAction,
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
    <form action={formAction} className="flex-1">
      <input type="hidden" name="eventId" value={eventId} />
      <button
        disabled={pending}
        className="w-full rounded-[10px] bg-brand-soft px-3 py-2.5 text-[12.5px] font-bold whitespace-nowrap text-brand-dark transition-all duration-150 hover:brightness-95 active:scale-[0.96] disabled:opacity-50"
      >
        {pending
          ? "Đang gửi..."
          : showFlash
            ? "✓ Đã gửi email!"
            : "📧 Gửi email đặt sân"}
      </button>
      {state?.error && (
        <p className="mt-1 text-[11.5px] font-semibold text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
