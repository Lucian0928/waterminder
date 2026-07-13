# WaterMinder — 喝水提醒與追蹤 PWA

深色主題、記錄快、回饋爽的每日喝水追蹤 App。

**技術棧**：Next.js 14 (App Router) · TypeScript · Tailwind CSS · Zustand · Framer Motion · Recharts · IndexedDB (idb-keyval)

## 開發

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run icons      # 重新產生 PWA icons（scripts/generate-icons.mjs）
```

## 部署到 Vercel

```bash
npx vercel
```

無需任何環境變數，資料全部存在使用者裝置的 IndexedDB。

## 架構重點

- **資料層**：`src/lib/data/dataProvider.ts` 定義 `DataProvider` 介面，目前實作為 IndexedDB（`indexedDbProvider.ts`）。之後要接雲端同步，新增一個實作並在 `src/lib/data/index.ts` 的工廠切換即可，store 與 UI 不用改。
- **狀態**：Zustand 兩個 store — `useWaterStore`（記錄）、`useSettingsStore`（目標/單位/杯型/提醒/主題），所有寫入動作同步持久化到 provider。
- **水合係數**：每筆記錄同時存 `volumeMl` 與 `effectiveMl`（× hydrationFactor），所有統計以有效量計算；記錄冗餘存杯型名稱/圖示/顏色，刪除杯型不影響歷史。
- **進度環**：`ProgressRing.tsx` 手刻 SVG — 漸層 stroke、圓角端點、內圈水波動畫，0–30% 藍紫 / 30–70% 青色 / 70%+ 青綠，達標時光暈脈動。
- **PWA**：`public/manifest.json` + `public/sw.js`（導航 network-first、靜態 cache-first、通知點擊聚焦）。提醒用 Notification API + 前景 setTimeout 排程；`push` 事件已預留，接後端推播時直接可用。
- **提醒限制**：瀏覽器分頁完全關閉後，部分平台（尤其 iOS）無法在背景觸發本機通知，這是平台限制；App 開啟或 PWA 於前景時最可靠。
