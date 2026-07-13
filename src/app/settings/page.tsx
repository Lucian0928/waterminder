import type { Metadata } from "next";
import { SettingsContent } from "@/components/settings/SettingsContent";

export const metadata: Metadata = { title: "設定 — WaterMinder" };

export default function SettingsPage() {
  return <SettingsContent />;
}
