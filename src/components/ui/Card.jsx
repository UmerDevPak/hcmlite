"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/70 shadow-sm backdrop-blur-sm transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div
      className={cn(
        "px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/70 flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  return (
    <h3
      className={cn(
        "text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "", ...props }) {
  return (
    <p
      className={cn("text-xs text-zinc-500 dark:text-zinc-400 mt-1", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-t border-zinc-100 dark:border-zinc-800/70 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-b-xl flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
