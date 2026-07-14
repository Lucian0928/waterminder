"use client";

import { useMemo } from "react";
import type { VolumeUnit } from "@/types";
import { toUnitValue, unitLabel } from "@/lib/units";

const SIZE = 320;
const C = 160; // 圓心
const RING_R = 142;
const RING_W = 16;
const INNER_R = 118;
const CIRCUM = 2 * Math.PI * RING_R;

// 波形：波長 170、振幅 8，總寬 680（平移 340 = 兩個週期，無縫循環）
const WAVE_PATH =
  "M0 8 Q42.5 0 85 8 T170 8 T255 8 T340 8 T425 8 T510 8 T595 8 T680 8 V300 H0 Z";

interface Stage {
  from: string;
  to: string;
}

// 水青藍恆定不變（WaterMinder 式）：水就是水的顏色，進度由水位與環表達
function stageOf(_pct: number): Stage {
  return { from: "#0e8fd6", to: "#3fc3f9" };
}

export function ProgressRing({
  currentMl,
  goalMl,
  unit,
  emptyHint,
}: {
  currentMl: number;
  goalMl: number;
  unit: VolumeUnit;
  emptyHint?: string;
}) {
  const pct = goalMl > 0 ? currentMl / goalMl : 0;
  const clamped = Math.min(1, Math.max(0, pct));
  const complete = pct >= 1;
  const stage = useMemo(() => stageOf(pct), [pct]);

  // 內圈水位：pct=0 時整個藏到內圈底下（避免露出一截波峰），pct=1 淹過頂部
  const top = C - INNER_R;
  const bottom = C + INNER_R;
  const levelY =
    clamped === 0 ? bottom + 12 : bottom - (bottom - top + 16) * clamped;

  return (
    <div
      className="relative mx-auto w-full max-w-[320px]"
      role="img"
      aria-label={`今日已喝 ${Math.round(currentMl)} ml，目標 ${goalMl} ml，達成 ${Math.round(pct * 100)}%`}
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="block w-full">
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={stage.from} />
            <stop offset="100%" stopColor={stage.to} />
          </linearGradient>
          <clipPath id="ring-inner-clip">
            <circle cx={C} cy={C} r={INNER_R} />
          </clipPath>
        </defs>

        {/* 內圈水波 */}
        <g clipPath="url(#ring-inner-clip)">
          <circle cx={C} cy={C} r={INNER_R} fill="var(--ring-inner)" />
          <g
            style={{
              transform: `translateY(${levelY - 8}px)`,
              transition: "transform 0.5s ease-out",
            }}
          >
            <g className="wave-layer wave-layer--back">
              <path d={WAVE_PATH} fill={stage.to} opacity={0.3} />
            </g>
            <g className="wave-layer" style={{ transform: "translateX(-85px)" }}>
              <path d={WAVE_PATH} fill={stage.from} opacity={0.45} />
            </g>
          </g>
        </g>

        {/* 軌道 */}
        <circle
          cx={C}
          cy={C}
          r={RING_R}
          fill="none"
          stroke="var(--ring-track)"
          strokeWidth={RING_W}
        />

        {/* 進度弧 */}
        <circle
          cx={C}
          cy={C}
          r={RING_R}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth={RING_W}
          strokeLinecap="round"
          strokeDasharray={CIRCUM}
          strokeDashoffset={CIRCUM * (1 - clamped)}
          transform={`rotate(-90 ${C} ${C})`}
          className={complete ? "ring-complete" : undefined}
          style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
        />
      </svg>

      {/* 中心數字（HTML 疊層，字體更銳利） */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="font-num text-5xl font-bold leading-none tracking-tight">
          {toUnitValue(currentMl, unit)}
        </div>
        <div className="mt-2 text-sm font-semibold text-ink-2">
          / {toUnitValue(goalMl, unit)} {unitLabel(unit)}
        </div>
        <div
          className={`font-num mt-3 rounded-full px-3 py-1 text-sm font-bold ${
            complete
              ? "bg-black/15 text-white"
              : "bg-surface-2 text-ink-2"
          }`}
        >
          {Math.round(pct * 100)}%
        </div>
        {emptyHint && (
          <div className="mt-2 max-w-[180px] text-xs font-medium text-ink-3">
            {emptyHint}
          </div>
        )}
      </div>
    </div>
  );
}
