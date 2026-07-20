"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { voteAction } from "@/app/actions";

export type MyVote = {
  memberId: number;
  name: string;
  going: boolean | null;
  guests: number;
  guestNames: string | null;
};

type OptimisticVote = {
  going: boolean;
  guests: number;
  guestNames: string | null;
};

export function VotePanel({
  eventId,
  me,
  locked,
}: {
  eventId: number;
  me: MyVote;
  locked: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // Hiển thị vote ngay khi bấm, không chờ server trả lời
  const [optimistic, applyVote] = useOptimistic(
    me,
    (state: MyVote, v: OptimisticVote): MyVote => ({ ...state, ...v }),
  );

  const vote = (
    going: boolean,
    guests: number = 0,
    guestNames: string | null = null,
  ) => {
    const names = guests > 0 ? guestNames : null;
    setError(null);
    startTransition(async () => {
      applyVote({ going, guests, guestNames: names });
      const res = await voteAction(eventId, me.memberId, going, guests, names);
      if (!res.ok) setError(res.error ?? "Có lỗi xảy ra");
    });
  };

  return (
    <div className="rounded-2xl border border-ink/8 bg-white p-4">
      <p className="mb-2 text-[13px] font-bold text-ink/60">
        Bạn là <b className="text-ink">{me.name}</b>{" "}
        <Link
          href="/login"
          className="font-semibold text-ink/40 underline decoration-ink/20 underline-offset-2"
        >
          (không phải bạn?)
        </Link>
      </p>

      {!locked && (
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => vote(true, optimistic.guests, optimistic.guestNames)}
            className={`rounded-xl border-[1.5px] py-3.5 text-[14.5px] font-extrabold transition-all duration-150 active:scale-[0.96] ${
              optimistic.going === true
                ? "border-success bg-success-bg text-success shadow-[0_2px_10px_-2px_oklch(52%_0.16_152_/_0.35)]"
                : "border-success/25 bg-white text-success hover:border-success/50 hover:bg-success-bg/40"
            }`}
          >
            ✅ Đi
          </button>
          <button
            onClick={() => vote(false)}
            className={`rounded-xl border-[1.5px] py-3.5 text-[14.5px] font-extrabold transition-all duration-150 active:scale-[0.96] ${
              optimistic.going === false
                ? "border-ink/40 bg-ink/8 text-ink/60"
                : "border-ink/15 bg-white text-ink/60 hover:border-ink/30 hover:bg-ink/4"
            }`}
          >
            ❌ Không đi
          </button>
        </div>
      )}

      {optimistic.going === true && !locked && (
        <div className="mt-3 animate-rise rounded-xl border border-ink/8 bg-ink/2 p-3">
          <p className="text-[13px] font-bold text-ink/60">
            Bạn có dẫn thêm ai đi không?
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            <button
              onClick={() =>
                vote(
                  true,
                  optimistic.guests > 0 ? optimistic.guests : 1,
                  optimistic.guestNames,
                )
              }
              className={`rounded-[10px] border-[1.5px] py-2.5 text-[13px] font-extrabold transition-all duration-150 active:scale-[0.96] ${
                optimistic.guests > 0
                  ? "border-success bg-success-bg text-success"
                  : "border-ink/15 bg-white text-ink/60 hover:border-ink/30"
              }`}
            >
              Có
            </button>
            <button
              onClick={() => vote(true, 0)}
              className={`rounded-[10px] border-[1.5px] py-2.5 text-[13px] font-extrabold transition-all duration-150 active:scale-[0.96] ${
                optimistic.guests === 0
                  ? "border-ink/40 bg-ink/8 text-ink/60"
                  : "border-ink/15 bg-white text-ink/60 hover:border-ink/30"
              }`}
            >
              Không
            </button>
          </div>
          {optimistic.guests > 0 && (
            <div className="mt-2.5 animate-rise">
              <label className="mb-1.5 block text-[12.5px] font-bold text-ink/60">
                Bao nhiêu người?
              </label>
              <select
                className="w-full rounded-[10px] border border-ink/15 bg-white px-3 py-2.5 text-sm font-semibold text-ink"
                value={optimistic.guests}
                onChange={(e) =>
                  vote(true, Number(e.target.value), optimistic.guestNames)
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
                key={me.memberId}
                defaultValue={optimistic.guestNames ?? ""}
                placeholder="VD: Tuấn, Minh"
                className="w-full rounded-[10px] border border-ink/15 bg-white px-3 py-2.5 text-sm font-semibold text-ink placeholder:font-medium placeholder:text-ink/30"
                onBlur={(e) => {
                  const v = e.target.value.trim() || null;
                  if (v !== optimistic.guestNames) {
                    vote(true, optimistic.guests, v);
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

      {locked && (
        <p className="mt-3 text-[12.5px] font-semibold text-ink/50">
          Buổi này đã chốt, không vote được nữa.
        </p>
      )}

      {optimistic.going !== null && !locked && (
        <p className="mt-2 text-[12.5px] font-semibold text-ink/50">
          Vote hiện tại của bạn:{" "}
          <b className="text-ink">
            {optimistic.going
              ? `Đi ✅${
                  optimistic.guests > 0
                    ? ` (+${optimistic.guests} khách${optimistic.guestNames ? `: ${optimistic.guestNames}` : ""})`
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
