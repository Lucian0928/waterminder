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
      setMessage(`Imported ${payload.logs.length} logs`);
    } catch {
      setMessage("Import failed: unrecognized file format");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="ghost" onClick={exportJson}>
          Export backup
        </Button>
        <Button variant="ghost" onClick={() => fileRef.current?.click()}>
          Import backup
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
          Erase all data
        </Button>
      ) : (
        <div className="flex flex-col gap-2.5 rounded-2xl border border-rose-500/25 bg-rose-500/5 p-4">
          <p className="text-sm font-semibold text-rose-400">
            This deletes all logs and settings and cannot be undone. Export a backup first.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clearLogs();
                resetAll();
                setConfirmClear(false);
                setMessage("All data erased");
              }}
            >
              Erase everything
            </Button>
          </div>
        </div>
      )}

      {message && <p className="text-xs font-semibold text-ink-2">{message}</p>}
    </div>
  );
}
