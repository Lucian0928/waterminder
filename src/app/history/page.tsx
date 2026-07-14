import type { Metadata } from "next";
import { HistoryContent } from "@/components/history/HistoryContent";

export const metadata: Metadata = { title: "History — WaterMinder" };

export default function HistoryPage() {
  return <HistoryContent />;
}
