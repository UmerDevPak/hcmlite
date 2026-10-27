"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const PALETTE = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#f59e0b", // Amber
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#3b82f6", // Blue
];

/**
 * Custom Dark Theme Tooltip
 */
function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-md p-3 shadow-2xl text-xs space-y-1 z-50">
      <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: data.fillColor || "#6366f1" }}
        />
        {data.name}
      </div>
      <div className="text-zinc-400">
        Personnel: <span className="font-mono text-zinc-200 font-semibold">{data.headcount} members</span>
      </div>
      <div className="text-zinc-400">
        Monthly Payroll:{" "}
        <span className="font-mono text-emerald-400 font-semibold">
          {formatCurrency(data.totalSalary)}/mo
        </span>
      </div>
      <div className="text-zinc-500 text-[10px]">
        Avg Salary: {formatCurrency(data.averageSalary || 0)}/mo
      </div>
    </div>
  );
}

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-md p-3 shadow-2xl text-xs space-y-1 z-50">
      <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: data.fillColor || "#6366f1" }}
        />
        {data.name}
      </div>
      <div className="text-zinc-400">
        Workforce Share:{" "}
        <span className="font-mono text-indigo-400 font-semibold">{data.percent}%</span> (
        {data.headcount} members)
      </div>
      <div className="text-zinc-400">
        Monthly Allocation:{" "}
        <span className="font-mono text-emerald-400 font-semibold">
          {formatCurrency(data.totalSalary)}/mo
        </span>
      </div>
    </div>
  );
}

export function WorkforceDistributionChart({ departmentStats = [], totalHeadcount = 1 }) {
  const [chartMode, setChartMode] = useState("bar"); // "bar" | "pie"
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = departmentStats.map((dept, idx) => ({
    ...dept,
    percent: Math.round((dept.headcount / (totalHeadcount || 1)) * 100),
    fillColor: PALETTE[idx % PALETTE.length],
  }));

  if (!mounted) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-xs text-zinc-500">
        Loading interactive chart...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Chart mode toggle button group */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
        <div className="text-xs text-zinc-400">
          Showing <strong className="text-zinc-200">{departmentStats.length}</strong> enterprise divisions
        </div>

        <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/80 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setChartMode("bar")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
              chartMode === "bar"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Bar View
          </button>
          <button
            type="button"
            onClick={() => setChartMode("pie")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
              chartMode === "pie"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" /> Donut View
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {chartMode === "bar" ? (
          <motion.div
            key="bar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="w-full"
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  axisLine={{ stroke: "#27272a" }}
                  tickLine={false}
                  unit="%"
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: "#d4d4d8", fontSize: 11 }}
                  axisLine={{ stroke: "#27272a" }}
                  tickLine={false}
                  width={90}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.04)" }} />
                <Bar
                  dataKey="percent"
                  radius={[0, 6, 6, 0]}
                  isAnimationActive={true}
                  animationDuration={450}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fillColor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        ) : (
          <motion.div
            key="pie"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="w-full flex flex-col md:flex-row items-center justify-between"
          >
            <div className="w-full md:w-1/2">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={chartData}
                    dataKey="headcount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    isAnimationActive={true}
                    animationDuration={450}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`pie-cell-${index}`}
                        fill={entry.fillColor}
                        stroke="#09090b"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Side Legend */}
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-2 text-xs pr-2">
              {chartData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.fillColor }}
                  />
                  <div className="truncate">
                    <div className="font-medium text-zinc-200 truncate">{entry.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">
                      {entry.headcount} members ({entry.percent}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
