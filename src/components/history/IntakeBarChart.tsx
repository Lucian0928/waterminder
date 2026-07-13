"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SeriesPoint } from "@/lib/stats";
import type { VolumeUnit } from "@/types";
import { formatVolume } from "@/lib/units";

const MET = "#00d4b8";
const NOT_MET = "#3a4a74";
const NOT_MET_LIGHT = "#b9c9dd";

function ChartTooltip({
  active,
  payload,
  unit,
  goalMl,
}: {
  active?: boolean;
  payload?: Array<{ payload: SeriesPoint }>;
  unit: VolumeUnit;
  goalMl: number;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const pct = goalMl > 0 ? Math.round((p.total / goalMl) * 100) : 0;
  return (
    <div className="glow-card rounded-xl px-3.5 py-2.5 text-sm">
      <div className="font-semibold text-ink-2">{p.dateKey}</div>
      <div className="font-num mt-0.5 font-bold text-ink">
        {formatVolume(p.total, unit)}
        <span className="ml-1.5 font-semibold text-ink-2">{pct}%</span>
      </div>
    </div>
  );
}

export function IntakeBarChart({
  data,
  goalMl,
  unit,
  dark,
  compact = false,
}: {
  data: SeriesPoint[];
  goalMl: number;
  unit: VolumeUnit;
  dark: boolean;
  compact?: boolean;
}) {
  const notMet = dark ? NOT_MET : NOT_MET_LIGHT;
  const gridStroke = dark ? "rgba(255,255,255,0.06)" : "rgba(14,26,42,0.08)";
  const tickFill = dark ? "#5e6a82" : "#808ea6";

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 12, right: 4, bottom: 0, left: -14 }}
          barCategoryGap={compact ? "18%" : "28%"}
        >
          <CartesianGrid vertical={false} stroke={gridStroke} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval={compact ? 4 : 0}
            tick={{ fill: tickFill, fontSize: 11, fontWeight: 600 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={46}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(1)}L` : String(v)
            }
            tick={{ fill: tickFill, fontSize: 11, fontWeight: 600 }}
          />
          <Tooltip
            cursor={{ fill: dark ? "rgba(255,255,255,0.04)" : "rgba(14,26,42,0.05)" }}
            content={<ChartTooltip unit={unit} goalMl={goalMl} />}
          />
          <ReferenceLine
            y={goalMl}
            ifOverflow="extendDomain"
            stroke={tickFill}
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: "目標",
              position: "insideTopRight",
              fill: tickFill,
              fontSize: 11,
              fontWeight: 600,
            }}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={compact ? 10 : 28}>
            {data.map((d) => (
              <Cell
                key={d.dateKey}
                fill={d.total >= goalMl ? MET : notMet}
                fillOpacity={d.isToday || d.total >= goalMl ? 1 : 0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
