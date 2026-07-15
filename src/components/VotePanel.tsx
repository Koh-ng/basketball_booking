"use client";

import { useState, useTransition } from "react";
import { voteAction } from "@/app/actions";
import { useSelectedMember } from "./useSelectedMember";

export type VoteRowClient = {
  memberId: number;
  name: string;
  going: boolean | null;
};

export function VotePanel({
  eventId,
  rows,
  locked,
}: {
  eventId: number;
  rows: VoteRowClient[];
  locked: boolean;
}) {
  const [memberId, setMemberId] = useSelectedMember();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const selected = rows.find((r) => r.memberId === memberId) ?? null;

  const vote = (going: boolean) => {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const res = await voteAction(eventId, selected.memberId, going);
      if (!res.ok) setError(res.error ?? "Có lỗi xảy ra");
    });
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-zinc-200">
      <label className="block text-sm font-medium text-zinc-600 mb-2">
        Bạn là ai?
      </label>
      <select
        className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 bg-white"
        value={memberId ?? ""}
        onChange={(e) =>
          setMemberId(e.target.value ? Number(e.target.value) : null)
        }
      >
        <option value="">— Chọn tên của bạn —</option>
        {rows.map((r) => (
          <option key={r.memberId} value={r.memberId}>
            {r.name}
          </option>
        ))}
      </select>

      {selected && !locked && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            onClick={() => vote(true)}
            disabled={pending}
            className={`rounded-lg py-3 font-semibold transition ${
              selected.going === true
                ? "bg-green-600 text-white"
                : "bg-green-50 text-green-700 border border-green-300 hover:bg-green-100"
            } disabled:opacity-50`}
          >
            ✅ Đi
          </button>
          <button
            onClick={() => vote(false)}
            disabled={pending}
            className={`rounded-lg py-3 font-semibold transition ${
              selected.going === false
                ? "bg-zinc-600 text-white"
                : "bg-zinc-50 text-zinc-600 border border-zinc-300 hover:bg-zinc-100"
            } disabled:opacity-50`}
          >
            ❌ Không đi
          </button>
        </div>
      )}

      {selected && locked && (
        <p className="mt-3 text-sm text-zinc-500">
          Kèo này đã chốt, không vote được nữa.
        </p>
      )}

      {selected && selected.going !== null && !locked && (
        <p className="mt-2 text-sm text-zinc-500">
          Vote hiện tại của bạn:{" "}
          <b>{selected.going ? "Đi ✅" : "Không đi ❌"}</b> (bấm nút để đổi)
        </p>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
