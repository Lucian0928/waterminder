export type VolumeUnit = "ml" | "L" | "oz";
export type WeightUnit = "kg" | "lb";
export type ThemeMode = "dark" | "light";
export type ReminderInterval = 30 | 60 | 90 | 120;

/** 一種飲品類別（Drinks）：只有名稱/圖示/顏色/水合，不含容量 */
export interface DrinkType {
  id: string;
  name: string;
  /** 建立 Cup 時的預設容量（ml）；Drinks 清單本身不顯示容量 */
  defaultVolumeMl: number;
  /** icon registry key（或舊資料的 emoji） */
  icon: string;
  /** hex 色碼，用於圖示與底色 */
  color: string;
  /** 水合係數 0–1，effectiveMl = volumeMl * hydrationFactor */
  hydrationFactor: number;
  /** 是否在 Other Drinks 記錄器中顯示 */
  active: boolean;
  isBuiltIn: boolean;
}

/** 一個 Home 捷徑（My Cup）：綁定一個 DrinkType + 指定容量 */
export interface Cup {
  id: string;
  /** 對應的 DrinkType id（決定圖示/顏色/水合） */
  drinkTypeId: string;
  /** 顯示名稱，預設沿用類別名稱、可覆寫 */
  name: string;
  /** 這個杯子的容量（ml） */
  volumeMl: number;
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
  /** My Cup：Home 上的捷徑杯子，依顯示順序 */
  cups: Cup[];
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
