"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  renameMemberAction,
  resetMemberPinAction,
  toggleMemberAction,
} from "../actions";
import type { Member } from "@/db/schema";

export function MemberRow({ member }: { member: Member }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    renameMemberAction,
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.ok) setEditing(false);
  }, [state]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  if (editing) {
    return (
      <div className="border-b border-ink/6 px-3.5 py-3 last:border-b-0">
        <form action={formAction} className="flex gap-2">
          <input type="hidden" name="memberId" value={member.id} />
          <input
            ref={inputRef}
            type="text"
            name="name"
            defaultValue={member.name}
            className="min-w-0 flex-1 rounded-[10px] border border-ink/15 px-3 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 rounded-[10px] bg-brand px-3 py-1.5 text-[11.5px] font-bold text-white hover:brightness-95 disabled:opacity-50"
          >
            Lưu
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="shrink-0 rounded-[10px] border border-ink/15 bg-white px-3 py-1.5 text-[11.5px] font-bold text-ink hover:bg-ink/3"
          >
            Huỷ
          </button>
        </form>
        {state?.error && (
          <p className="mt-1.5 text-[11.5px] font-semibold text-danger">
            {state.error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="border-b border-ink/6 px-3.5 py-3 last:border-b-0">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`min-w-0 flex-1 truncate text-sm font-semibold ${
            member.active ? "text-ink" : "text-ink/35 line-through"
          }`}
        >
          {member.name}
          {member.pinHash === null && (
            <span className="ml-1.5 text-[10.5px] font-semibold text-ink/35">
              (PIN mặc định)
            </span>
          )}
        </span>
        <div className="flex shrink-0 gap-1.5">
          <button
            onClick={() => setEditing(true)}
            className="rounded-[10px] border border-ink/15 bg-white px-3 py-1.5 text-[11.5px] font-bold text-ink hover:bg-ink/3"
          >
            ✏️ Sửa
          </button>
          <form action={toggleMemberAction}>
            <input type="hidden" name="memberId" value={member.id} />
            <input
              type="hidden"
              name="active"
              value={member.active ? "false" : "true"}
            />
            <button className="rounded-[10px] border border-ink/15 bg-white px-3 py-1.5 text-[11.5px] font-bold text-ink hover:bg-ink/3">
              {member.active ? "Ẩn khỏi danh sách" : "Kích hoạt lại"}
            </button>
          </form>
        </div>
      </div>
      {member.pinHash !== null && (
        <form action={resetMemberPinAction} className="mt-1.5">
          <input type="hidden" name="memberId" value={member.id} />
          <button className="text-[11px] font-semibold text-ink/40 underline decoration-ink/20 underline-offset-2 hover:text-ink/60">
            Đặt lại PIN về mặc định (123456)
          </button>
        </form>
      )}
    </div>
  );
}
