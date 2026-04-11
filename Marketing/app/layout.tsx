import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpendTab - Accounting Software for SMEs & Business Owners in Nigeria",
  description:
    "SpendTab is the simplest accounting software for Nigerian business owners and SMEs. Track expenses, manage budgets, generate tax-ready reports. Start your free 14-day trial.",
  keywords:
    "accounting software Nigeria, SME accounting, business expense tracker, Nigerian bookkeeping software, small business accounting, expense management Nigeria, tax-ready reports Nigeria, budget management software",
  openGraph: {
    title: "SpendTab - Accounting Software for Nigerian SMEs",
    description:
      "Track every naira. Manage multiple businesses. Generate tax-ready reports in one click. Built for Nigerian entrepreneurs.",
    type: "website",
    url: "https://spendtab.com",
  },
  alternates: {
    canonical: "https://spendtab.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Warm up the Google Fonts connection before the browser needs it */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Non-blocking font load — <link> is fetched in parallel, unlike CSS @import */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
