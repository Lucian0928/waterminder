import type { DrinkType, Settings } from "@/types";

export const DEFAULT_DRINK_TYPES: DrinkType[] = [
  {
    id: "water",
    name: "Water",
    defaultVolumeMl: 350,
    icon: "water",
    color: "#3B82F6",
    hydrationFactor: 1,
    isBuiltIn: true,
  },
  {
    id: "sparkling",
    name: "Sparkling Water",
    defaultVolumeMl: 330,
    icon: "sparkling",
    color: "#60A5FA",
    hydrationFactor: 1,
    isBuiltIn: true,
  },
  {
    id: "tea",
    name: "Tea",
    defaultVolumeMl: 300,
    icon: "tea",
    color: "#F59E0B",
    hydrationFactor: 0.95,
    isBuiltIn: true,
  },
  {
    id: "coffee",
    name: "Coffee",
    defaultVolumeMl: 240,
    icon: "coffee",
    color: "#92400E",
    hydrationFactor: 0.9,
    isBuiltIn: true,
  },
  {
    id: "juice",
    name: "Juice",
    defaultVolumeMl: 250,
    icon: "juice",
    color: "#22C55E",
    hydrationFactor: 0.85,
    isBuiltIn: true,
  },
  {
    id: "milk",
    name: "Milk",
    defaultVolumeMl: 250,
    icon: "milk",
    color: "#94A3B8",
    hydrationFactor: 0.9,
    isBuiltIn: true,
  },
];

/**
 * Other Drinks 的擴充目錄：不佔 Home 的小工具格，
 * 但在輸入頁一律可選（記錄時冗餘存名稱/圖示/顏色，所以不必寫進使用者的杯型清單）。
 */
export const CATALOG_DRINK_TYPES: DrinkType[] = [
  { id: "soda", name: "Soda", defaultVolumeMl: 330, icon: "soda", color: "#F97316", hydrationFactor: 0.85, isBuiltIn: true },
  { id: "boba", name: "Bubble Tea", defaultVolumeMl: 500, icon: "boba", color: "#B45309", hydrationFactor: 0.8, isBuiltIn: true },
  { id: "iced-tea", name: "Iced Tea", defaultVolumeMl: 350, icon: "iced-tea", color: "#FB923C", hydrationFactor: 0.9, isBuiltIn: true },
  { id: "smoothie", name: "Smoothie", defaultVolumeMl: 300, icon: "smoothie", color: "#EC4899", hydrationFactor: 0.8, isBuiltIn: true },
  { id: "sports", name: "Sports Drink", defaultVolumeMl: 500, icon: "sports", color: "#06B6D4", hydrationFactor: 0.95, isBuiltIn: true },
  { id: "energy", name: "Energy Drink", defaultVolumeMl: 250, icon: "energy", color: "#8B5CF6", hydrationFactor: 0.8, isBuiltIn: true },
  { id: "coconut", name: "Coconut Water", defaultVolumeMl: 330, icon: "coconut", color: "#14B8A6", hydrationFactor: 0.95, isBuiltIn: true },
  { id: "lemonade", name: "Lemonade", defaultVolumeMl: 300, icon: "lemonade", color: "#EAB308", hydrationFactor: 0.85, isBuiltIn: true },
  { id: "hot-chocolate", name: "Hot Chocolate", defaultVolumeMl: 250, icon: "hot-chocolate", color: "#A16207", hydrationFactor: 0.8, isBuiltIn: true },
  { id: "yogurt", name: "Yogurt Drink", defaultVolumeMl: 200, icon: "yogurt", color: "#F43F5E", hydrationFactor: 0.85, isBuiltIn: true },
  { id: "soup", name: "Soup", defaultVolumeMl: 300, icon: "soup", color: "#EF4444", hydrationFactor: 0.9, isBuiltIn: true },
  { id: "beer", name: "Beer", defaultVolumeMl: 500, icon: "beer", color: "#CA8A04", hydrationFactor: 0.6, isBuiltIn: true },
  { id: "wine", name: "Wine", defaultVolumeMl: 150, icon: "wine", color: "#9F1239", hydrationFactor: 0.4, isBuiltIn: true },
];

/** 使用者杯型 + 目錄（同 id 以使用者設定優先） */
export function mergeWithCatalog(userTypes: DrinkType[]): DrinkType[] {
  const ids = new Set(userTypes.map((t) => t.id));
  return [...userTypes, ...CATALOG_DRINK_TYPES.filter((t) => !ids.has(t.id))];
}

/* 舊版（中文名稱 + emoji）→ 新版的一次性遷移對照 */
export const LEGACY_NAME_MAP: Record<string, string> = {
  水: "Water",
  氣泡水: "Sparkling Water",
  茶: "Tea",
  咖啡: "Coffee",
  果汁: "Juice",
  牛奶: "Milk",
};
export const LEGACY_ICON_MAP: Record<string, string> = {
  "💧": "water",
  "🫧": "sparkling",
  "🍵": "tea",
  "☕": "coffee",
  "🧃": "juice",
  "🥛": "milk",
  "🥤": "soda",
  "🧋": "boba",
  "🍺": "beer",
  "🍶": "yogurt",
  "🥥": "coconut",
  "🍋": "lemonade",
};

export const DEFAULT_SETTINGS: Settings = {
  goal: { dailyTargetMl: 2000 },
  volumeUnit: "ml",
  theme: "light",
  reminder: {
    enabled: false,
    wakeTime: "08:00",
    sleepTime: "23:00",
    intervalMinutes: 90,
  },
  quickVolumesMl: [250, 350, 500],
};

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
