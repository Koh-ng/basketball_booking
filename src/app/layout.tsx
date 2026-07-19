import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-manrope",
});

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
    <html lang="vi" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full bg-page font-sans text-ink">
        <div className="flex min-h-screen justify-center bg-page">
          <div className="flex w-full max-w-[460px] flex-col bg-card shadow-[0_0_0_1px_rgba(28,25,23,0.06)]">
            <header className="sticky top-0 z-10 flex items-center justify-between bg-[linear-gradient(120deg,var(--color-brand),var(--color-brand-dark))] px-[18px] py-3.5">
              <Link
                href="/"
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-extrabold text-white"
              >
                🏀 Bóng Rổ CN
              </Link>
              <nav className="flex shrink-0 gap-3.5">
                <Link
                  href="/history"
                  className="whitespace-nowrap text-[13px] font-bold text-white/92"
                >
                  Lịch sử
                </Link>
                <Link
                  href="/admin"
                  className="whitespace-nowrap text-[13px] font-bold text-white/92"
                >
                  Quản lý
                </Link>
              </nav>
            </header>
            <main className="flex-1 px-[18px] pt-5 pb-[30px]">
              {children}
            </main>
            <footer className="px-4 py-4 text-center text-[11.5px] font-bold text-ink/35">
              Sáng Chủ nhật hàng tuần · 10:00–12:00
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
