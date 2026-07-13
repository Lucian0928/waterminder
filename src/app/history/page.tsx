import type { Metadata } from "next";
import { HistoryContent } from "@/components/history/HistoryContent";

export const metadata: Metadata = { title: "歷史統計 — WaterMinder" };

export default function HistoryPage() {
  return <HistoryContent />;
}
