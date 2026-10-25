"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  icon: Icon,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-sm focus:ring-indigo-500 border border-indigo-500/20",
    secondary:
      "bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 text-zinc-100 shadow-sm focus:ring-zinc-600 border border-zinc-700/60 dark:bg-zinc-800 dark:hover:bg-zinc-700",
    outline:
      "border border-zinc-300 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-200 dark:active:bg-zinc-700 text-zinc-800 dark:text-zinc-200 focus:ring-zinc-400",
    ghost:
      "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 active:bg-zinc-200 dark:active:bg-zinc-800 focus:ring-zinc-400",
    danger:
      "bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-sm focus:ring-rose-500 border border-rose-500/20",
    success:
      "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500 border border-emerald-500/20",
  };

  const sizes = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-sm px-3.5 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2.5",
    icon: "p-2 aspect-square",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-0.5 mr-1.5 h-4 w-4 text-current shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0 text-current" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
