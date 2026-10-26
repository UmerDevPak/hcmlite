"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function Table({ children, className = "" }) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar rounded-xl border border-zinc-200 dark:border-zinc-800">
      <table className={cn("w-full text-left text-sm text-zinc-600 dark:text-zinc-300", className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = "" }) {
  return (
    <thead
      className={cn(
        "bg-zinc-50 dark:bg-zinc-900/80 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800",
        className
      )}
    >
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "" }) {
  return (
    <tbody
      className={cn("divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900/40", className)}
    >
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = "", onClick }) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "transition-colors duration-150 hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "" }) {
  return (
    <th className={cn("px-4 py-3.5 select-none font-semibold text-zinc-700 dark:text-zinc-300", className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }) {
  return <td className={cn("px-4 py-3.5 whitespace-nowrap text-xs", className)}>{children}</td>;
}
