"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveSettingsAction } from "../actions";
import type { AppSettings } from "@/lib/settings";
import { fileToQrDataUrl } from "@/lib/compressImage.client";

const inputClass =
  "mt-[5px] w-full rounded-[10px] border border-ink/15 px-3 py-2.5 text-[13px]";
const labelClass = "block text-[12px] font-bold text-ink/55";

export function SettingsForm({ initial }: { initial: AppSettings }) {
  const [state, formAction, pending] = useActionState(
    saveSettingsAction,
    null,
  );
  const [showFlash, setShowFlash] = useState(false);
  const [qrImage, setQrImage] = useState(initial.qrImage);
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
      <div>
        <label className={labelClass}>Mã ngân hàng (VD: MB, VCB...)</label>
        <input
          type="text"
          name="bankCode"
          defaultValue={initial.bankCode}
          placeholder="VCB"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Số tài khoản</label>
        <input
          type="text"
          name="bankAccountNo"
          defaultValue={initial.bankAccountNo}
          placeholder="0123456789"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Tên chủ tài khoản</label>
        <input
          type="text"
          name="bankAccountName"
          defaultValue={initial.bankAccountName}
          placeholder="NGUYEN VAN A"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Email nhận nhắc nhở</label>
        <input
          type="email"
          name="adminEmail"
          defaultValue={initial.adminEmail}
          placeholder="ban@email.com"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Mã QR chuyển khoản</label>
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
            className="flex h-[100px] w-[100px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-dashed border-ink/20 bg-ink/3 text-center text-[11px] font-semibold text-ink/45"
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
              "Thả ảnh mã QR ở đây"
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
        <p className="mt-1.5 text-[11.5px] font-semibold text-ink/45">
          Ảnh này sẽ hiện cho người chưa chuyển khoản ở trang chủ, thay cho mã
          QR tự tạo. Chưa upload thì app tự tạo QR từ thông tin ngân hàng ở
          trên.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending || uploading}
        className="mt-1 rounded-xl bg-brand py-3 text-[14px] font-extrabold text-white transition hover:brightness-95 disabled:opacity-50"
      >
        {pending ? "Đang lưu..." : "Lưu cài đặt"}
      </button>
      {showFlash && (
        <p className="text-center text-[12.5px] font-bold text-success">
          ✅ Đã lưu
        </p>
      )}
    </form>
  );
}
