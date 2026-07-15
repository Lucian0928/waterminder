"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import {
  ML_PER_OZ,
  formatVolume,
  fromUnitValue,
  toUnitValue,
  unitLabel,
} from "@/lib/units";
import type { VolumeUnit } from "@/types";

/** ml → 該單位的原始數值（不含千分位，供 input value 使用） */
function rawUnitValue(ml: number, unit: VolumeUnit): number {
  if (unit === "L") return Math.round((ml / 1000) * 100) / 100;
  if (unit === "oz") return Math.round((ml / ML_PER_OZ) * 10) / 10;
  return Math.round(ml);
}

/** 目前的容量單位與換算輔助（內部一律以 ml 儲存，顯示/輸入依此單位換算） */
export function useVolumeUnit() {
  const unit = useSettingsStore((s) => s.settings.volumeUnit);
  return {
    unit,
    label: unitLabel(unit),
    /** ml → "250 ml" / "0.25 L" / "8.5 oz" */
    fmt: (ml: number) => formatVolume(ml, unit),
    /** ml → 顯示用數字字串（含千分位），供文字顯示 */
    val: (ml: number) => toUnitValue(ml, unit),
    /** ml → 原始數值（無千分位），供 input value */
    raw: (ml: number) => rawUnitValue(ml, unit),
    /** 使用者輸入（該單位）→ ml */
    toMl: (value: number) => fromUnitValue(value, unit),
    /** L 需要小數輸入，ml/oz 用整數 */
    step: unit === "L" ? "0.01" : "1",
  } as const;
}

export type { VolumeUnit };
