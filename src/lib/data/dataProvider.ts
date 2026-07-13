import type { DrinkLog, DrinkType, Settings } from "@/types";

/**
 * 資料層抽象介面。目前唯一實作為 IndexedDB（離線優先）；
 * 之後要接雲端同步，新增一個實作並在 lib/data/index.ts 切換即可。
 */
export interface DataProvider {
  getAllLogs(): Promise<DrinkLog[]>;
  addLog(log: DrinkLog): Promise<void>;
  deleteLog(id: string): Promise<void>;
  replaceLogs(logs: DrinkLog[]): Promise<void>;

  getSettings(): Promise<Settings | null>;
  saveSettings(settings: Settings): Promise<void>;

  getDrinkTypes(): Promise<DrinkType[] | null>;
  saveDrinkTypes(types: DrinkType[]): Promise<void>;

  clearAll(): Promise<void>;
}
