export type VolumeUnit = "ml" | "L" | "oz";
export type WeightUnit = "kg" | "lb";
export type ThemeMode = "dark" | "light";
export type ReminderInterval = 30 | 60 | 90 | 120;

/** 一種可記錄的飲品/杯型 */
export interface DrinkType {
  id: string;
  name: string;
  /** 預設容量，一律以 ml 儲存 */
  defaultVolumeMl: number;
  /** emoji 圖示 */
  icon: string;
  /** hex 色碼，用於時間軸與圖示底色 */
  color: string;
  /** 水合係數 0–1，effectiveMl = volumeMl * hydrationFactor */
  hydrationFactor: number;
  isBuiltIn: boolean;
}

/** 一筆飲水記錄（冗餘存入飲品名稱/圖示/顏色，刪除杯型後歷史仍完整） */
export interface DrinkLog {
  id: string;
  /** epoch ms */
  timestamp: number;
  /** 本地時區 "YYYY-MM-DD" */
  dateKey: string;
  volumeMl: number;
  effectiveMl: number;
  drinkTypeId: string;
  drinkName: string;
  drinkIcon: string;
  drinkColor: string;
}

export interface UserGoal {
  dailyTargetMl: number;
  weightValue?: number;
  weightUnit?: WeightUnit;
}

export interface ReminderSettings {
  enabled: boolean;
  /** "HH:mm" */
  wakeTime: string;
  /** "HH:mm" */
  sleepTime: string;
  intervalMinutes: ReminderInterval;
}

export interface Settings {
  goal: UserGoal;
  volumeUnit: VolumeUnit;
  theme: ThemeMode;
  reminder: ReminderSettings;
  /** Home 快速記錄按鈕的容量（ml） */
  quickVolumesMl: number[];
}

/** 單日彙總，供統計與圖表使用 */
export interface DailySummary {
  dateKey: string;
  totalMl: number;
  effectiveMl: number;
  goalMl: number;
  achieved: boolean;
  count: number;
}

/** 匯出檔格式 */
export interface ExportPayload {
  app: "waterminder";
  version: 1;
  exportedAt: string;
  settings: Settings;
  drinkTypes: DrinkType[];
  logs: DrinkLog[];
}
