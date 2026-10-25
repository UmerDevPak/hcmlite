"use client";

import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  subtext,
  change,
  isPositive,
  icon: Icon,
  iconColor = "text-indigo-500",
  iconBg = "bg-indigo-500/10",
  className = "",
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/70 p-5 shadow-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700/80 group",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
        {Icon && (
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
              iconBg
            )}
          >
            <Icon className={cn("w-5 h-5", iconColor)} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              "inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded",
              isPositive
                ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400"
                : "text-rose-600 bg-rose-500/10 dark:text-rose-400"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3 mr-0.5 inline" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-0.5 inline" />
            )}
            {change}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtext}</p>
      )}
    </div>
  );
}
