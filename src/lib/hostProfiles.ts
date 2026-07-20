import { db } from "@/db";
import { hostProfiles, type HostProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { BankInfo } from "./vietqr";

export type { HostProfile };

/** Tối đa 4 người host (đủ cho nhóm admin nhỏ). */
export const MAX_HOST_PROFILES = 4;

export async function listHostProfiles(): Promise<HostProfile[]> {
  return db.select().from(hostProfiles).orderBy(hostProfiles.id);
}

export async function getHostProfile(
  id: number,
): Promise<HostProfile | null> {
  const rows = await db
    .select()
    .from(hostProfiles)
    .where(eq(hostProfiles.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export function bankInfoFromHost(h: HostProfile): BankInfo | null {
  if (!h.bankCode || !h.bankAccountNo) return null;
  return {
    bankCode: h.bankCode,
    accountNo: h.bankAccountNo,
    accountName: h.bankAccountName,
  };
}
