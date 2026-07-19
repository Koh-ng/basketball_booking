"use client";

import { useOptimistic, useState, useTransition } from "react";
import { voteAction } from "@/app/actions";
import { useSelectedMember } from "./useSelectedMember";

export type VoteRowClient = {
  memberId: number;
  name: string;
  going: boolean | null;
  guests: number;
  guestNames: string | null;
};

type OptimisticVote = {
  memberId: number;
  going: boolean;
  guests: number;
  guestNames: string | null;
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
  // Hiển thị vote ngay khi bấm, không chờ server trả lời
  const [optimisticRows, applyVote] = useOptimistic(
    rows,
    (state: VoteRowClient[], v: OptimisticVote) =>
      state.map((r) =>
        r.memberId === v.memberId
          ? { ...r, going: v.going, guests: v.guests, guestNames: v.guestNames }
          : r,
      ),
  );

  const selected =
    optimisticRows.find((r) => r.memberId === memberId) ?? null;

  const vote = (
    going: boolean,
    guests: number = 0,
    guestNames: string | null = null,
  ) => {
    if (!selected) return;
    const target = selected.memberId;
    const names = guests > 0 ? guestNames : null;
    setError(null);
    startTransition(async () => {
      applyVote({ memberId: target, going, guests, guestNames: names });
      const res = await voteAction(eventId, target, going, guests, names);
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
            onClick={() => vote(true, selected.guests, selected.guestNames)}
            className={`rounded-xl border-[1.5px] py-3.5 text-[14.5px] font-extrabold transition-all duration-150 active:scale-[0.96] ${
              selected.going === true
                ? "border-success bg-success-bg text-success shadow-[0_2px_10px_-2px_oklch(52%_0.16_152_/_0.35)]"
                : "border-success/25 bg-white text-success hover:border-success/50 hover:bg-success-bg/40"
            }`}
          >
            ✅ Đi
          </button>
          <button
            onClick={() => vote(false)}
            className={`rounded-xl border-[1.5px] py-3.5 text-[14.5px] font-extrabold transition-all duration-150 active:scale-[0.96] ${
              selected.going === false
                ? "border-ink/40 bg-ink/8 text-ink/60"
                : "border-ink/15 bg-white text-ink/60 hover:border-ink/30 hover:bg-ink/4"
            }`}
          >
            ❌ Không đi
          </button>
        </div>
      )}

      {selected && selected.going === true && !locked && (
        <div className="mt-3 animate-rise rounded-xl border border-ink/8 bg-ink/2 p-3">
          <p className="text-[13px] font-bold text-ink/60">
            Bạn có dẫn thêm ai đi không?
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            <button
              onClick={() =>
                vote(
                  true,
                  selected.guests > 0 ? selected.guests : 1,
                  selected.guestNames,
                )
              }
              className={`rounded-[10px] border-[1.5px] py-2.5 text-[13px] font-extrabold transition-all duration-150 active:scale-[0.96] ${
                selected.guests > 0
                  ? "border-success bg-success-bg text-success"
                  : "border-ink/15 bg-white text-ink/60 hover:border-ink/30"
              }`}
            >
              Có
            </button>
            <button
              onClick={() => vote(true, 0)}
              className={`rounded-[10px] border-[1.5px] py-2.5 text-[13px] font-extrabold transition-all duration-150 active:scale-[0.96] ${
                selected.guests === 0
                  ? "border-ink/40 bg-ink/8 text-ink/60"
                  : "border-ink/15 bg-white text-ink/60 hover:border-ink/30"
              }`}
            >
              Không
            </button>
          </div>
          {selected.guests > 0 && (
            <div className="mt-2.5 animate-rise">
              <label className="mb-1.5 block text-[12.5px] font-bold text-ink/60">
                Bao nhiêu người?
              </label>
              <select
                className="w-full rounded-[10px] border border-ink/15 bg-white px-3 py-2.5 text-sm font-semibold text-ink"
                value={selected.guests}
                onChange={(e) =>
                  vote(true, Number(e.target.value), selected.guestNames)
                }
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} người
                  </option>
                ))}
              </select>
              <label className="mt-2 mb-1.5 block text-[12.5px] font-bold text-ink/60">
                Tên người đi cùng{" "}
                <span className="font-medium text-ink/40">
                  (không bắt buộc)
                </span>
              </label>
              <input
                type="text"
                key={selected.memberId}
                defaultValue={selected.guestNames ?? ""}
                placeholder="VD: Tuấn, Minh"
                className="w-full rounded-[10px] border border-ink/15 bg-white px-3 py-2.5 text-sm font-semibold text-ink placeholder:font-medium placeholder:text-ink/30"
                onBlur={(e) => {
                  const v = e.target.value.trim() || null;
                  if (v !== selected.guestNames) {
                    vote(true, selected.guests, v);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
              />
            </div>
          )}
        </div>
      )}

      {selected && locked && (
        <p className="mt-3 text-[12.5px] font-semibold text-ink/50">
          Buổi này đã chốt, không vote được nữa.
        </p>
      )}

      {selected && selected.going !== null && !locked && (
        <p className="mt-2 text-[12.5px] font-semibold text-ink/50">
          Vote hiện tại của bạn:{" "}
          <b className="text-ink">
            {selected.going
              ? `Đi ✅${
                  selected.guests > 0
                    ? ` (+${selected.guests} khách${selected.guestNames ? `: ${selected.guestNames}` : ""})`
                    : ""
                }`
              : "Không đi ❌"}
          </b>{" "}
          {pending ? (
            <span className="text-ink/40">· đang lưu…</span>
          ) : (
            <span>(bấm nút để đổi)</span>
          )}
        </p>
      )}

      {error && (
        <p className="mt-2 animate-rise text-[12.5px] font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
