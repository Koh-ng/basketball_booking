import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bóng Rổ Chủ Nhật",
  description:
    "Vote kèo bóng rổ hàng tuần, chia tiền sân và tracking chuyển khoản",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <header className="bg-orange-600 text-white">
          <div className="mx-auto max-w-xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg">
              🏀 Bóng Rổ Chủ Nhật
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/history" className="hover:underline">
                Lịch sử
              </Link>
              <Link href="/admin" className="hover:underline">
                Quản lý
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-xl px-4 py-6 flex-1">
          {children}
        </main>
        <footer className="py-4 text-center text-xs text-zinc-400">
          Sáng Chủ nhật hàng tuần · 10:00–12:00
        </footer>
      </body>
    </html>
  );
}
