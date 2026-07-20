"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveHostProfileAction } from "../actions";
import type { HostProfile } from "@/lib/hostProfiles";
import { fileToQrDataUrl } from "@/lib/compressImage.client";

const inputClass =
  "mt-[5px] w-full rounded-[10px] border border-ink/15 px-3 py-2.5 text-[13px]";
const labelClass = "block text-[12px] font-bold text-ink/55";

export function HostProfileForm({
  initial,
}: {
  initial: HostProfile | null;
}) {
  const [state, formAction, pending] = useActionState(
    saveHostProfileAction,
    null,
  );
  const [showFlash, setShowFlash] = useState(false);
  const [qrImage, setQrImage] = useState(initial?.qrImage ?? "");
  const [qrError, setQrError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state?.ok) return;
    setShowFlash(true);
    const t = setTimeout(() => setShowFlash(false), 2000);
    return () => clearTimeout(t);
  }, [state]);

  const onPickFile = async (file: File | undefined) => {
    if (!file) return;
    setQrError(null);
    setUploading(true);
    try {
      setQrImage(await fileToQrDataUrl(file));
    } catch {
      setQrError("Không đọc được ảnh, thử ảnh khác nhé.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-2xl border border-ink/8 bg-white p-4"
    >
      {initial && <input type="hidden" name="hostId" value={initial.id} />}
      <div>
        <label className={labelClass}>Tên người quản lý</label>
        <input
          type="text"
          name="name"
          defaultValue={initial?.name ?? ""}
          placeholder="VD: Khôi"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Mã ngân hàng (VD: MB, VCB...)</label>
        <input
          type="text"
          name="bankCode"
          defaultValue={initial?.bankCode ?? ""}
          placeholder="VCB"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Số tài khoản</label>
        <input
          type="text"
          name="bankAccountNo"
          defaultValue={initial?.bankAccountNo ?? ""}
          placeholder="0123456789"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Tên chủ tài khoản</label>
        <input
          type="text"
          name="bankAccountName"
          defaultValue={initial?.bankAccountName ?? ""}
          placeholder="NGUYEN VAN A"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Mã QR chuyển khoản (tuỳ chọn)</label>
        <input type="hidden" name="qrImage" value={qrImage} />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPickFile(e.target.files?.[0])}
        />
        <div className="mt-[5px] flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-[80px] w-[80px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-dashed border-ink/20 bg-ink/3 text-center text-[10.5px] font-semibold text-ink/45"
          >
            {uploading ? (
              "Đang xử lý..."
            ) : qrImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrImage}
                alt="Ảnh QR chuyển khoản đã tải lên"
                className="h-full w-full object-contain"
              />
            ) : (
              "Thả ảnh QR"
            )}
          </button>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-[10px] border border-ink/15 bg-white px-3 py-1.5 text-[12px] font-bold text-ink hover:bg-ink/3"
            >
              {qrImage ? "Đổi ảnh khác" : "Tải ảnh lên"}
            </button>
            {qrImage && (
              <button
                type="button"
                onClick={() => setQrImage("")}
                className="rounded-[10px] border border-danger-border bg-danger-bg px-3 py-1.5 text-[12px] font-bold text-danger"
              >
                Xoá ảnh
              </button>
            )}
          </div>
        </div>
        {qrError && (
          <p className="mt-1.5 text-[11.5px] font-semibold text-danger">
            {qrError}
          </p>
        )}
      </div>

      {state?.error && (
        <p className="text-[12.5px] font-semibold text-danger">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending || uploading}
          className="flex-1 rounded-xl bg-brand py-3 text-[14px] font-extrabold text-white transition hover:brightness-95 disabled:opacity-50"
        >
          {pending
            ? "Đang lưu..."
            : initial
              ? "Lưu thay đổi"
              : "Thêm người quản lý"}
        </button>
      </div>
      {showFlash && (
        <p className="text-center text-[12.5px] font-bold text-success">
          ✅ Đã lưu
        </p>
      )}
    </form>
  );
}
