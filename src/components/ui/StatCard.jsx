"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  subtext,
  change,
  changeType, // "positive" | "negative" | "neutral"
  isPositive,
  icon: Icon,
  iconColor = "text-indigo-500",
  iconBg = "bg-indigo-500/10",
  className = "",
}) {
  // Determine badge styling
  let variant = "neutral";
  if (changeType === "positive" || isPositive === true) {
    variant = "positive";
  } else if (changeType === "negative" || isPositive === false) {
    variant = "negative";
  } else if (changeType === "neutral" || isPositive === null || isPositive === undefined) {
    variant = "neutral";
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/70 p-5 shadow-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700/80 group flex flex-col justify-between h-full min-h-[140px]",
        className
      )}
    >
      <div>
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

        <div className="mt-3 flex items-baseline justify-between gap-2 flex-wrap">
          <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {value}
          </span>
          {change && (
            <span
              className={cn(
                "inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full shrink-0",
                variant === "positive" &&
                  "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 border border-emerald-500/20",
                variant === "negative" &&
                  "text-rose-600 bg-rose-500/10 dark:text-rose-400 border border-rose-500/20",
                variant === "neutral" &&
                  "text-zinc-600 bg-zinc-100 dark:bg-zinc-800/80 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/80"
              )}
            >
              {variant === "positive" && <TrendingUp className="w-3 h-3 mr-1 inline" />}
              {variant === "negative" && <TrendingDown className="w-3 h-3 mr-1 inline" />}
              {variant === "neutral" && <Minus className="w-3 h-3 mr-1 inline opacity-60" />}
              {change}
            </span>
          )}
        </div>
      </div>

      {subtext && (
        <p className="mt-2.5 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/60 pt-2">
          {subtext}
        </p>
      )}
    </div>
  );
}
