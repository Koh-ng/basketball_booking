"use client";

import { useActionState, useRef } from "react";
import { adminAddParticipantAction } from "./actions";

export function AddParticipantForm({
  eventId,
  candidates,
}: {
  eventId: number;
  candidates: { id: number; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    adminAddParticipantAction,
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = `attendance-candidates-${eventId}`;

  return (
    <form
      action={(formData) => {
        formAction(formData);
        if (inputRef.current) inputRef.current.value = "";
      }}
      className="flex flex-col gap-1.5"
    >
      <input type="hidden" name="eventId" value={eventId} />
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          list={listId}
          name="memberName"
          placeholder="🔍 Tìm tên để thêm vào buổi..."
          autoComplete="off"
          className="flex-1 rounded-lg border border-ink/15 px-2.5 py-1.5 text-[12.5px]"
        />
        <datalist id={listId}>
          {candidates.map((m) => (
            <option key={m.id} value={m.name} />
          ))}
        </datalist>
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-bold text-white transition-all duration-150 hover:brightness-95 active:scale-[0.96] disabled:opacity-50"
        >
          {pending ? "Đang thêm..." : "+ Thêm"}
        </button>
      </div>
      {state?.error && (
        <p className="text-[11.5px] font-semibold text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
