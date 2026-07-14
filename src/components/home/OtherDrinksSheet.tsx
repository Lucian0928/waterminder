"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { DrinkType } from "@/types";

const KEYPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "⌫"];

const nf = new Intl.NumberFormat("en-US");

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function BackspaceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M8.5 5h10A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-10L3 12l5.5-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="m11.5 9.5 5 5M16.5 9.5l-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function OtherDrinksSheet({
  open,
  onClose,
  drinkTypes,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  drinkTypes: DrinkType[];
  onAdd: (drink: DrinkType, volumeMl: number) => void;
}) {
  const [amount, setAmount] = useState("0");
  const [selectedId, setSelectedId] = useState(drinkTypes[0]?.id ?? "water");
  const [now, setNow] = useState(() => new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setAmount("0");
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [open]);

  const handleKey = useCallback((k: string) => {
    setAmount((prev) => {
      if (k === "⌫") {
        const next = prev.slice(0, -1);
        return next === "" ? "0" : next;
      }
      if (prev === "0") return k === "00" ? "0" : k;
      const next = prev + k;
      return next.length > 5 ? prev : next;
    });
  }, []);

  const selected = drinkTypes.find((d) => d.id === selectedId) ?? drinkTypes[0];
  const ml = parseInt(amount, 10) || 0;

  const dateStr = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (!mounted) return null;

  /* Portal 到 body：脫離頁面容器的堆疊上下文，才能蓋過 z-50 的 Tab Bar */
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-bg"
        >
          <div className="mx-auto flex h-full w-full max-w-lg flex-col md:max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 pt-[max(2.5rem,env(safe-area-inset-top))]">
              <span className="h-9 w-9" aria-hidden />
              <span className="text-base font-semibold text-ink">Other Drinks</span>
              <button
                onClick={onClose}
                aria-label="關閉"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-ink-2"
              >
                <XIcon />
              </button>
            </div>

            {/* Amount */}
            <div className="flex flex-col items-center py-3">
              <span className="font-num text-5xl font-extrabold tracking-tight text-ink">
                {nf.format(ml)}ml
              </span>
              <span className="mt-1 text-sm font-medium text-ink-2">
                {selected?.name ?? ""}
              </span>
            </div>

            {/* Drink type pills */}
            <div className="no-scrollbar shrink-0 overflow-x-auto px-4 pb-2">
              <div className="flex w-max gap-2">
                {drinkTypes.map((d) => {
                  const active = d.id === selectedId;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedId(d.id)}
                      className="flex items-center gap-1.5 whitespace-nowrap rounded-2xl px-3 py-2 text-xs font-semibold"
                      style={{
                        background: active ? "rgb(var(--c-surface))" : "rgb(var(--c-surface-2))",
                        color: active ? "rgb(var(--c-accent))" : "rgb(var(--c-ink-2))",
                        border: active
                          ? "2px solid rgb(var(--c-accent))"
                          : "2px solid transparent",
                        boxShadow: active ? "0 2px 8px rgba(59,130,246,0.15)" : "none",
                      }}
                    >
                      <span aria-hidden>{d.icon}</span>
                      <span>{d.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date / time */}
            <div className="flex justify-center gap-3 px-5 py-3">
              <div className="flex items-center gap-2 rounded-xl bg-surface px-4 py-2 text-sm font-medium text-ink-2">
                <span className="text-ink-3"><CalendarIcon /></span>
                {dateStr}
              </div>
              <div className="font-num flex items-center gap-2 rounded-xl bg-surface px-4 py-2 text-sm font-medium text-ink-2">
                <span className="text-ink-3"><ClockIcon /></span>
                {timeStr}
              </div>
            </div>

            {/* Keypad */}
            <div className="mt-1 flex-1 px-5">
              <div className="grid grid-cols-3 gap-2">
                {KEYPAD_KEYS.map((k) => (
                  <motion.button
                    key={k}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => handleKey(k)}
                    aria-label={k === "⌫" ? "刪除" : k}
                    className="font-num flex h-12 items-center justify-center rounded-xl bg-surface text-lg font-semibold text-ink"
                    style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}
                  >
                    {k === "⌫" ? <span className="text-ink-2"><BackspaceIcon /></span> : k}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Add */}
            <div className="mt-4 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={ml <= 0}
                onClick={() => {
                  if (selected && ml > 0) {
                    onAdd(selected, ml);
                    onClose();
                  }
                }}
                className="w-full rounded-2xl py-4 text-base font-bold text-white transition-colors"
                style={{
                  background: ml > 0 ? "rgb(var(--c-accent))" : "var(--ring-track)",
                }}
              >
                Add
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
