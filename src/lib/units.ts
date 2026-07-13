import type { VolumeUnit } from "@/types";

export const ML_PER_OZ = 29.5735;

const nf0 = new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("zh-TW", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const nf2 = new Intl.NumberFormat("zh-TW", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** ml → 顯示用數值（不含單位） */
export function toUnitValue(ml: number, unit: VolumeUnit): string {
  switch (unit) {
    case "ml":
      return nf0.format(Math.round(ml));
    case "L":
      return nf2.format(ml / 1000);
    case "oz":
      return nf1.format(ml / ML_PER_OZ);
  }
}

export function unitLabel(unit: VolumeUnit): string {
  return unit === "oz" ? "oz" : unit;
}

/** ml → "1,250 ml" / "1.25 L" / "42.3 oz" */
export function formatVolume(ml: number, unit: VolumeUnit): string {
  return `${toUnitValue(ml, unit)} ${unitLabel(unit)}`;
}

/** 顯示單位的輸入值 → ml */
export function fromUnitValue(value: number, unit: VolumeUnit): number {
  switch (unit) {
    case "ml":
      return Math.round(value);
    case "L":
      return Math.round(value * 1000);
    case "oz":
      return Math.round(value * ML_PER_OZ);
  }
}
