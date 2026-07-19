import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import Link from "next/link";
import { VENUE } from "@/lib/venue";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Bóng Rổ Chủ Nhật",
  description:
    "Vote buổi bóng rổ hàng tuần, chia tiền sân và tracking chuyển khoản",
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
                aria-label="Trang chủ"
                className="flex shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/15 px-2.5 py-1.5 text-sm transition hover:bg-white/25 active:scale-95"
              >
                🏀
              </Link>
              <nav className="flex shrink-0 gap-3">
                <Link
                  href="/history"
                  className="whitespace-nowrap text-[13px] font-bold text-white/92 transition hover:text-white active:opacity-60"
                >
                  Lịch sử
                </Link>
                <Link
                  href="/stats"
                  className="whitespace-nowrap text-[13px] font-bold text-white/92 transition hover:text-white active:opacity-60"
                >
                  Thống kê
                </Link>
                <Link
                  href="/rules"
                  className="whitespace-nowrap text-[13px] font-bold text-white/92 transition hover:text-white active:opacity-60"
                >
                  Luật
                </Link>
                <Link
                  href="/admin"
                  className="whitespace-nowrap text-[13px] font-bold text-white/92 transition hover:text-white active:opacity-60"
                >
                  Quản lý
                </Link>
              </nav>
            </header>
            <main className="flex-1 px-[18px] pt-5 pb-[30px]">
              {children}
            </main>
            <footer className="px-4 py-4 text-center text-[11.5px] font-bold text-ink/35">
              {VENUE.schedule}
              <a
                href={VENUE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 block font-semibold text-ink/45 underline decoration-ink/20 underline-offset-2"
              >
                📍 {VENUE.name} — {VENUE.address}
              </a>
              <p className="mt-2 font-semibold text-ink/30">
                Built by @xuanbach02 &amp; @koh.nguyen for the boys 🏀
                <span className="block">© Copyright reserved</span>
              </p>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
