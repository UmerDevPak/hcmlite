"use client";

import React, { useMemo } from "react";
import { Sparkles, ArrowRight, FolderOpen } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import { resolveAvatar, ANONYMOUS_DATA_URIS } from "@/lib/avatarSystem";

export function EmptyState({
  icon: Icon,
  avatarUrl,
  avatarEmoji = "✨",
  title = "Oops! There is nothing to see here",
  description = "No records or activity found for this view. Everything is up to date!",
  actionLabel,
  actionIcon,
  onAction,
  compact = false,
  className = "",
}) {
  const effectiveAvatar = useMemo(() => {
    if (avatarUrl) return resolveAvatar(avatarUrl);
    if (!Icon) return ANONYMOUS_DATA_URIS[0];
    return null;
  }, [avatarUrl, Icon]);
  return (
    <div
      className={cn(
        "relative overflow-hidden flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-zinc-50/70 via-zinc-50/30 to-transparent dark:from-zinc-900/40 dark:via-zinc-900/20 dark:to-transparent animate-fade-in",
        compact ? "p-6" : "p-10 sm:p-14",
        className
      )}
    >
      {/* Decorative ambient background vector grid glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="empty-state-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" className="text-zinc-400 dark:text-zinc-600" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#empty-state-dots)" />
        </svg>
      </div>

      {/* Central Vector Art / Avatar Badge */}
      <div className="relative mb-4">
        {/* Ambient Ring Glow */}
        <div className="absolute -inset-2 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-md" />

        {effectiveAvatar ? (
          <div className="relative w-16 h-16 rounded-full ring-4 ring-indigo-500/20 shadow-elevated overflow-hidden bg-zinc-800">
            <img src={effectiveAvatar} alt="Empty state avatar" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-zinc-900 flex items-center justify-center text-[10px] text-white">
              ✓
            </div>
          </div>
        ) : Icon ? (
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-glow">
            <Icon className="w-7 h-7" />
          </div>
        ) : (
          /* Default Friendly Vector Illustration Avatar */
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/10 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-elevated">
            <span role="img" aria-label="avatar">{avatarEmoji}</span>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] shadow-sm animate-pulse">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>

      {/* Headline & Description */}
      <h3 className="relative text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
        {title}
      </h3>
      <p className="relative text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1.5 leading-relaxed">
        {description}
      </p>

      {/* Interactive Action Button */}
      {actionLabel && onAction && (
        <div className="relative mt-5">
          <Button
            onClick={onAction}
            size="sm"
            icon={actionIcon || ArrowRight}
            className="shadow-sm"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
