import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { TabBar } from "@/components/layout/TabBar";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "WaterMinder — 喝水提醒與追蹤",
  description: "記錄快、回饋爽的每日喝水追蹤 App",
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
  themeColor: "#181d2b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-TW" data-theme="dark" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} font-body`}>
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
