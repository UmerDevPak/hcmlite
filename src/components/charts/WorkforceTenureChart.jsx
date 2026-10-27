"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { motion } from "framer-motion";

const TENURE_COLORS = [
  "#818cf8", // Indigo 400 (< 1 Year)
  "#34d399", // Emerald 400 (1 - 3 Years)
  "#38bdf8", // Sky 400 (> 3 Years)
];

function CustomTenureTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-md p-2.5 shadow-2xl text-xs space-y-0.5 z-50">
      <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.fill }} />
        {data.name}
      </div>
      <div className="text-zinc-400">
        Personnel: <span className="font-mono text-zinc-100 font-bold">{data.value} members</span>
      </div>
      <div className="text-zinc-500 text-[10px]">{data.description}</div>
    </div>
  );
}

export function WorkforceTenureChart({ tenureStats = {}, totalEmployees = 8 }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const under1 = tenureStats.under1Year || 0;
  const oneToThree = tenureStats.oneToThreeYears || 0;
  const overThree = tenureStats.overThreeYears || 0;
  const total = under1 + oneToThree + overThree || totalEmployees || 1;

  const data = [
    {
      name: "< 1 Year",
      label: "New Hires",
      value: under1,
      percent: Math.round((under1 / total) * 100),
      fill: TENURE_COLORS[0],
      description: "Recent onboarding and ramp-up phase",
    },
    {
      name: "1 - 3 Years",
      label: "Core Talent",
      value: oneToThree,
      percent: Math.round((oneToThree / total) * 100),
      fill: TENURE_COLORS[1],
      description: "Established contributors & mid-level",
    },
    {
      name: "> 3 Years",
      label: "Senior Veterans",
      value: overThree,
      percent: Math.round((overThree / total) * 100),
      fill: TENURE_COLORS[2],
      description: "Long-term institutional leadership",
    },
  ];

  if (!mounted) {
    return (
      <div className="h-44 w-full flex items-center justify-center text-xs text-zinc-500">
        Loading retention statistics...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Visual Donut Ring */}
      <div className="h-40 w-full relative">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Tooltip content={<CustomTenureTooltip />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={46}
              outerRadius={66}
              paddingAngle={4}
              isAnimationActive={true}
              animationDuration={450}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`tenure-cell-${index}`}
                  fill={entry.fill}
                  stroke="#09090b"
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Retention Summary */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold font-mono text-zinc-100">{total}</span>
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Total</span>
        </div>
      </div>

      {/* Breakdown Rows */}
      <div className="space-y-2.5">
        {data.map((item) => (
          <div
            key={item.name}
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
              <div>
                <span className="font-medium text-zinc-200">{item.name}</span>
                <span className="text-zinc-500 text-[10px] ml-1.5 font-normal">({item.label})</span>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="font-bold text-zinc-100">{item.value} members</span>
              <span className="text-zinc-400 text-[11px]">({item.percent}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
