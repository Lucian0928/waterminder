import type { WeightUnit } from "@/types";
import { ML_PER_OZ } from "./units";

/**
 * 依體重試算建議每日攝取量：
 * kg → 33 ml / kg；lb → 0.5 oz / lb。結果取整到 50 ml。
 */
export function suggestedIntakeMl(weight: number, unit: WeightUnit): number {
  const ml = unit === "kg" ? weight * 33 : weight * 0.5 * ML_PER_OZ;
  return Math.max(500, Math.round(ml / 50) * 50);
}
