"use client";

import { useWaterStore } from "@/store/useWaterStore";
import { useSettingsStore } from "@/store/useSettingsStore";

/** 兩個 store 都完成 IndexedDB 載入後才為 true，避免 SSR/首屏閃爍 */
export function useHydrated(): boolean {
  const water = useWaterStore((s) => s.hydrated);
  const settings = useSettingsStore((s) => s.hydrated);
  return water && settings;
}
