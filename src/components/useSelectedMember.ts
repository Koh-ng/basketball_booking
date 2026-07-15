"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "bb_member_id";

/** Nhớ thành viên đã chọn trên thiết bị này (localStorage). */
export function useSelectedMember(): [number | null, (id: number | null) => void] {
  const [memberId, setMemberId] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setMemberId(Number(saved));
  }, []);

  const update = (id: number | null) => {
    setMemberId(id);
    if (id === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, String(id));
  };

  return [memberId, update];
}
