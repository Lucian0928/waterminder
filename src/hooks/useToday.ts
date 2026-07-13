"use client";

import { useEffect, useState } from "react";
import { todayKey } from "@/lib/dates";

/** 回傳今日 dateKey，跨午夜自動更新 */
export function useToday(): string {
  const [key, setKey] = useState(() => todayKey());
  useEffect(() => {
    const id = setInterval(() => {
      const next = todayKey();
      setKey((prev) => (prev === next ? prev : next));
    }, 30_000);
    return () => clearInterval(id);
  }, []);
  return key;
}
