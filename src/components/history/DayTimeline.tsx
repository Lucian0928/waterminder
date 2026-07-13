"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { DrinkLog, VolumeUnit } from "@/types";
import { formatTime } from "@/lib/dates";
import { formatVolume } from "@/lib/units";

export function DayTimeline({
  logs,
  unit,
  onDelete,
}: {
  logs: DrinkLog[];
  unit: VolumeUnit;
  onDelete: (id: string) => void;
}) {
  if (logs.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-ink-3">
        今天還沒有記錄。回到「今日」頁點一下，馬上開始。
      </div>
    );
  }

  return (
    <ul className="relative flex flex-col">
      {/* 時間軸豎線 */}
      <span
        aria-hidden
        className="absolute bottom-4 left-[21px] top-4 w-px bg-line"
      />
      <AnimatePresence initial={false}>
        {logs.map((log) => (
          <motion.li
            key={log.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative flex items-center gap-3.5 py-2.5"
          >
            <span
              className="relative z-10 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-lg"
              style={{
                backgroundColor: `${log.drinkColor}1f`,
                boxShadow: `0 0 12px ${log.drinkColor}33`,
              }}
            >
              {log.drinkIcon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-ink">{log.drinkName}</span>
                <span className="font-num text-xs font-semibold text-ink-3">
                  {formatTime(log.timestamp)}
                </span>
              </div>
              {log.effectiveMl !== log.volumeMl && (
                <div className="text-xs text-ink-3">
                  水合後計 {formatVolume(log.effectiveMl, unit)}
                </div>
              )}
            </div>
            <span className="font-num text-sm font-bold text-ink">
              {formatVolume(log.volumeMl, unit)}
            </span>
            <button
              onClick={() => onDelete(log.id)}
              aria-label={`刪除 ${formatTime(log.timestamp)} 的${log.drinkName}記錄`}
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M5 7h14M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7m-8.5 0 .8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
