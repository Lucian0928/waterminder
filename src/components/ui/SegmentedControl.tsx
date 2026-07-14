"use client";

import { motion } from "framer-motion";
import { useId } from "react";

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  className = "",
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  const groupId = useId();
  return (
    <div
      role="tablist"
      className={`glass-pill flex rounded-full p-[3px] ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`relative flex-1 rounded-full px-3 py-1.5 text-sm transition-colors duration-200 ${
              active ? "font-bold text-ink" : "font-semibold text-ink-2 hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`segment-${groupId}`}
                className="tab-bubble absolute inset-0"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10 whitespace-nowrap">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
