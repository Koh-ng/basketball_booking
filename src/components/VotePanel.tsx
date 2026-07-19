"use client";

import { useState, useTransition } from "react";
import { voteAction } from "@/app/actions";
import { useSelectedMember } from "./useSelectedMember";

export type VoteRowClient = {
  memberId: number;
  name: string;
  going: boolean | null;
  guests: number;
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

  const vote = (going: boolean, guests: number = 0) => {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const res = await voteAction(eventId, selected.memberId, going, guests);
      if (!res.ok) setError(res.error ?? "Có lỗi xảy ra");
    });
  };

  return (
    <div className="rounded-2xl border border-ink/8 bg-white p-4">
      <label className="mb-2 block text-[13px] font-bold text-ink/60">
        Bạn là ai?
      </label>
      <select
        className="w-full rounded-[10px] border border-ink/15 bg-white px-3 py-2.5 text-sm font-semibold text-ink"
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
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <button
            onClick={() => vote(true, selected.guests)}
            disabled={pending}
            className={`rounded-xl py-3.5 text-[14.5px] font-extrabold transition disabled:opacity-50 ${
              selected.going === true
                ? "border-[1.5px] border-success bg-success-bg text-success"
                : "border-[1.5px] border-success/25 bg-white text-success"
            }`}
          >
            ✅ Đi
          </button>
          <button
            onClick={() => vote(false)}
            disabled={pending}
            className={`rounded-xl py-3.5 text-[14.5px] font-extrabold transition disabled:opacity-50 ${
              selected.going === false
                ? "border-[1.5px] border-ink/40 bg-ink/8 text-ink/60"
                : "border-[1.5px] border-ink/15 bg-white text-ink/60"
            }`}
          >
            ❌ Không đi
          </button>
        </div>
      )}

      {selected && selected.going === true && !locked && (
        <div className="mt-3 rounded-xl border border-ink/8 bg-ink/2 p-3">
          <p className="text-[13px] font-bold text-ink/60">
            Bạn có dẫn thêm ai đi không?
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            <button
              onClick={() => vote(true, selected.guests > 0 ? selected.guests : 1)}
              disabled={pending}
              className={`rounded-[10px] py-2.5 text-[13px] font-extrabold transition disabled:opacity-50 ${
                selected.guests > 0
                  ? "border-[1.5px] border-success bg-success-bg text-success"
                  : "border-[1.5px] border-ink/15 bg-white text-ink/60"
              }`}
            >
              Có
            </button>
            <button
              onClick={() => vote(true, 0)}
              disabled={pending}
              className={`rounded-[10px] py-2.5 text-[13px] font-extrabold transition disabled:opacity-50 ${
                selected.guests === 0
                  ? "border-[1.5px] border-ink/40 bg-ink/8 text-ink/60"
                  : "border-[1.5px] border-ink/15 bg-white text-ink/60"
              }`}
            >
              Không
            </button>
          </div>
          {selected.guests > 0 && (
            <div className="mt-2.5">
              <label className="mb-1.5 block text-[12.5px] font-bold text-ink/60">
                Bao nhiêu người?
              </label>
              <select
                className="w-full rounded-[10px] border border-ink/15 bg-white px-3 py-2.5 text-sm font-semibold text-ink"
                value={selected.guests}
                disabled={pending}
                onChange={(e) => vote(true, Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} người
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {selected && locked && (
        <p className="mt-3 text-[12.5px] font-semibold text-ink/50">
          Kèo này đã chốt, không vote được nữa.
        </p>
      )}

      {selected && selected.going !== null && !locked && (
        <p className="mt-2 text-[12.5px] font-semibold text-ink/50">
          Vote hiện tại của bạn:{" "}
          <b className="text-ink">
            {selected.going
              ? `Đi ✅${selected.guests > 0 ? ` (+${selected.guests} khách)` : ""}`
              : "Không đi ❌"}
          </b>{" "}
          (bấm nút để đổi)
        </p>
      )}

      {error && (
        <p className="mt-2 text-[12.5px] font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
