import type { Cup, DrinkType, Settings } from "@/types";

type RawType = Omit<DrinkType, "active" | "isBuiltIn">;

function builtIn(list: RawType[]): DrinkType[] {
  return list.map((t) => ({ ...t, active: true, isBuiltIn: true }));
}

export const DEFAULT_DRINK_TYPES: DrinkType[] = builtIn([
  { id: "water", name: "Water", defaultVolumeMl: 350, icon: "water", color: "#3B82F6", hydrationFactor: 1 },
  { id: "sparkling", name: "Sparkling Water", defaultVolumeMl: 330, icon: "sparkling", color: "#60A5FA", hydrationFactor: 1 },
  { id: "tea", name: "Tea", defaultVolumeMl: 300, icon: "tea", color: "#F59E0B", hydrationFactor: 0.95 },
  { id: "coffee", name: "Coffee", defaultVolumeMl: 240, icon: "coffee", color: "#92400E", hydrationFactor: 0.9 },
  { id: "juice", name: "Juice", defaultVolumeMl: 250, icon: "juice", color: "#22C55E", hydrationFactor: 0.85 },
  { id: "milk", name: "Milk", defaultVolumeMl: 250, icon: "milk", color: "#94A3B8", hydrationFactor: 0.9 },
]);

/** 擴充目錄：預設也在 Drinks 類別清單中，可記錄、可加入 My Cup */
export const CATALOG_DRINK_TYPES: DrinkType[] = builtIn([
  { id: "soda", name: "Soda", defaultVolumeMl: 330, icon: "soda", color: "#F97316", hydrationFactor: 0.85 },
  { id: "boba", name: "Bubble Tea", defaultVolumeMl: 500, icon: "boba", color: "#B45309", hydrationFactor: 0.8 },
  { id: "iced-tea", name: "Iced Tea", defaultVolumeMl: 350, icon: "iced-tea", color: "#FB923C", hydrationFactor: 0.9 },
  { id: "smoothie", name: "Smoothie", defaultVolumeMl: 300, icon: "smoothie", color: "#EC4899", hydrationFactor: 0.8 },
  { id: "sports", name: "Sports Drink", defaultVolumeMl: 500, icon: "sports", color: "#06B6D4", hydrationFactor: 0.95 },
  { id: "energy", name: "Energy Drink", defaultVolumeMl: 250, icon: "energy", color: "#8B5CF6", hydrationFactor: 0.8 },
  { id: "coconut", name: "Coconut Water", defaultVolumeMl: 330, icon: "coconut", color: "#14B8A6", hydrationFactor: 0.95 },
  { id: "lemonade", name: "Lemonade", defaultVolumeMl: 300, icon: "lemonade", color: "#EAB308", hydrationFactor: 0.85 },
  { id: "hot-chocolate", name: "Hot Chocolate", defaultVolumeMl: 250, icon: "hot-chocolate", color: "#A16207", hydrationFactor: 0.8 },
  { id: "yogurt", name: "Yogurt Drink", defaultVolumeMl: 200, icon: "yogurt", color: "#F43F5E", hydrationFactor: 0.85 },
  { id: "soup", name: "Soup", defaultVolumeMl: 300, icon: "soup", color: "#EF4444", hydrationFactor: 0.9 },
  { id: "beer", name: "Beer", defaultVolumeMl: 500, icon: "beer", color: "#CA8A04", hydrationFactor: 0.6 },
  { id: "wine", name: "Wine", defaultVolumeMl: 150, icon: "wine", color: "#9F1239", hydrationFactor: 0.4 },
]);

/** 使用者杯型 + 目錄（同 id 以使用者設定優先） */
export function mergeWithCatalog(userTypes: DrinkType[]): DrinkType[] {
  const ids = new Set(userTypes.map((t) => t.id));
  return [...userTypes, ...CATALOG_DRINK_TYPES.filter((t) => !ids.has(t.id))];
}

/** 所有內建飲品類別（預設 + 目錄，依 id 去重） */
export const ALL_CATALOG: DrinkType[] = (() => {
  const seen = new Set<string>();
  const out: DrinkType[] = [];
  for (const t of [...DEFAULT_DRINK_TYPES, ...CATALOG_DRINK_TYPES]) {
    if (!seen.has(t.id)) {
      seen.add(t.id);
      out.push(t);
    }
  }
  return out;
})();

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

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** 由一個飲品類別建立一個 Cup（沿用類別名稱與預設容量） */
export function cupFromType(type: DrinkType, volumeMl?: number): Cup {
  return {
    id: newId(),
    drinkTypeId: type.id,
    name: type.name,
    volumeMl: volumeMl ?? type.defaultVolumeMl,
  };
}

/** 預設 My Cup：前 5 個內建類別各一個杯子（穩定 id） */
export const DEFAULT_CUPS: Cup[] = DEFAULT_DRINK_TYPES.slice(0, 5).map((t) => ({
  id: `cup-${t.id}`,
  drinkTypeId: t.id,
  name: t.name,
  volumeMl: t.defaultVolumeMl,
}));

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
  cups: DEFAULT_CUPS,
};
