"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useWaterStore } from "@/store/useWaterStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { ExportPayload } from "@/types";

export function DataSection() {
  const logs = useWaterStore((s) => s.logs);
  const importLogs = useWaterStore((s) => s.importLogs);
  const clearLogs = useWaterStore((s) => s.clearLogs);
  const settings = useSettingsStore((s) => s.settings);
  const drinkTypes = useSettingsStore((s) => s.drinkTypes);
  const importAll = useSettingsStore((s) => s.importAll);
  const resetAll = useSettingsStore((s) => s.resetAll);

  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const exportJson = () => {
    const payload: ExportPayload = {
      app: "waterminder",
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      drinkTypes,
      logs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waterminder-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file: File) => {
    try {
      const payload = JSON.parse(await file.text()) as ExportPayload;
      if (payload.app !== "waterminder" || !Array.isArray(payload.logs)) {
        throw new Error("format");
      }
      importLogs(payload.logs);
      importAll(payload.settings, payload.drinkTypes);
      setMessage(`已匯入 ${payload.logs.length} 筆記錄`);
    } catch {
      setMessage("匯入失敗：檔案格式不符");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="ghost" onClick={exportJson}>
          匯出備份
        </Button>
        <Button variant="ghost" onClick={() => fileRef.current?.click()}>
          匯入備份
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void importJson(f);
          e.target.value = "";
        }}
      />

      {!confirmClear ? (
        <Button variant="danger" onClick={() => setConfirmClear(true)}>
          清除全部資料
        </Button>
      ) : (
        <div className="flex flex-col gap-2.5 rounded-2xl border border-rose-500/25 bg-rose-500/5 p-4">
          <p className="text-sm font-semibold text-rose-400">
            將刪除所有記錄與設定，且無法復原。建議先匯出備份。
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              取消
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clearLogs();
                resetAll();
                setConfirmClear(false);
                setMessage("已清除全部資料");
              }}
            >
              確認清除
            </Button>
          </div>
        </div>
      )}

      {message && <p className="text-xs font-semibold text-ink-2">{message}</p>}
    </div>
  );
}
