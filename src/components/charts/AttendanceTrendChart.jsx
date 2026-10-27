"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const SAMPLE_WEEKLY_ATTENDANCE = [
  { day: "Mon", present: 7, remote: 4, onLeave: 1 },
  { day: "Tue", present: 8, remote: 3, onLeave: 1 },
  { day: "Wed", present: 8, remote: 4, onLeave: 0 },
  { day: "Thu", present: 7, remote: 5, onLeave: 1 },
  { day: "Fri", present: 6, remote: 5, onLeave: 1 },
];

function CustomAttendanceTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-md p-3 shadow-2xl text-xs space-y-1.5 z-50">
      <div className="font-bold text-zinc-100 border-b border-zinc-800 pb-1">{label} - Shift Summary</div>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.name}</span>
          </div>
          <span className="font-mono font-bold text-zinc-100">{item.value} staff</span>
        </div>
      ))}
    </div>
  );
}

export function AttendanceTrendChart({ data = SAMPLE_WEEKLY_ATTENDANCE }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-56 w-full flex items-center justify-center text-xs text-zinc-500">
        Loading attendance trends...
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="remoteGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={{ stroke: "#27272a" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={{ stroke: "#27272a" }}
            tickLine={false}
          />
          <Tooltip content={<CustomAttendanceTooltip />} />
          <Area
            type="monotone"
            dataKey="present"
            name="Office (HQ)"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#presentGrad)"
            isAnimationActive={true}
            animationDuration={800}
          />
          <Area
            type="monotone"
            dataKey="remote"
            name="Remote Staff"
            stroke="#6366f1"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#remoteGrad)"
            isAnimationActive={true}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
