import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { TabBar } from "@/components/layout/TabBar";

/* 設計稿字體：Inter（display 與 body 共用） */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "WaterMinder — Water Reminder & Tracker",
  description: "Fast, satisfying daily water tracking",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WaterMinder",
  },
};

export const viewport: Viewport = {
  themeColor: "#EEF4FB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-body`}
        style={{ ["--font-display" as string]: "var(--font-body)" }}
      >
        <Providers>
          <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-32 pt-6 md:max-w-2xl">
            {children}
          </div>
          <TabBar />
        </Providers>
      </body>
    </html>
  );
}
