"use client";

const SIZE = 260;
const C = 130;
const R = 108;
const RING_W = 18;
const CIRCUM = 2 * Math.PI * R;

const nf = new Intl.NumberFormat("en-US");

export function ProgressRing({
  currentMl,
  goalMl,
}: {
  currentMl: number;
  goalMl: number;
}) {
  const pct = goalMl > 0 ? currentMl / goalMl : 0;
  const clamped = Math.min(1, Math.max(0, pct));

  return (
    <div
      className="relative mx-auto"
      style={{ width: SIZE, height: SIZE }}
      role="img"
      aria-label={`今日已喝 ${Math.round(currentMl)} ml，目標 ${goalMl} ml，達成 ${Math.round(pct * 100)}%`}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke="var(--ring-track)"
          strokeWidth={RING_W}
          strokeLinecap="round"
        />
        <circle
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke="rgb(var(--c-accent))"
          strokeWidth={RING_W}
          strokeLinecap="round"
          strokeDasharray={CIRCUM}
          strokeDashoffset={CIRCUM * (1 - clamped)}
          style={{ transition: "stroke-dashoffset 0.9s ease-out" }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center select-none">
        <span className="text-lg font-semibold text-ink-2">
          {Math.round(pct * 100)}%
        </span>
        <span className="font-num text-4xl font-extrabold tracking-tight text-ink">
          {nf.format(Math.round(currentMl))}ml
        </span>
      </div>
    </div>
  );
}
