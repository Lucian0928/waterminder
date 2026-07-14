import type { DrinkType, Settings } from "@/types";

export const DEFAULT_DRINK_TYPES: DrinkType[] = [
  {
    id: "water",
    name: "水",
    defaultVolumeMl: 350,
    icon: "💧",
    color: "#38bdf8",
    hydrationFactor: 1,
    isBuiltIn: true,
  },
  {
    id: "sparkling",
    name: "氣泡水",
    defaultVolumeMl: 330,
    icon: "🫧",
    color: "#38bdf8",
    hydrationFactor: 1,
    isBuiltIn: true,
  },
  {
    id: "tea",
    name: "茶",
    defaultVolumeMl: 300,
    icon: "🍵",
    color: "#a3e635",
    hydrationFactor: 0.95,
    isBuiltIn: true,
  },
  {
    id: "coffee",
    name: "咖啡",
    defaultVolumeMl: 240,
    icon: "☕",
    color: "#f59e0b",
    hydrationFactor: 0.9,
    isBuiltIn: true,
  },
  {
    id: "juice",
    name: "果汁",
    defaultVolumeMl: 250,
    icon: "🧃",
    color: "#fb7185",
    hydrationFactor: 0.85,
    isBuiltIn: true,
  },
  {
    id: "milk",
    name: "牛奶",
    defaultVolumeMl: 250,
    icon: "🥛",
    color: "#e2e8f0",
    hydrationFactor: 0.9,
    isBuiltIn: true,
  },
];

export const DEFAULT_SETTINGS: Settings = {
  goal: { dailyTargetMl: 2000 },
  volumeUnit: "ml",
  theme: "dark",
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
