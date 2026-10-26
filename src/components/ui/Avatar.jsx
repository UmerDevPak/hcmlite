"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getInitials, cn } from "@/lib/utils";
import { User } from "lucide-react";
import { resolveAvatar } from "@/lib/avatarSystem";

export function Avatar({
  src,
  name = "User",
  id,
  email,
  gender,
  size = "md",
  className = "",
  shape = "circle",
}) {
  const [imageError, setImageError] = useState(false);

  // Automatically resolve to illustrated vector avatar matching gender & persona
  const effectiveSrc = useMemo(() => {
    return resolveAvatar({ src, name, id, email, gender });
  }, [src, name, id, email, gender]);

  // Reset image error state whenever effectiveSrc updates
  useEffect(() => {
    setImageError(false);
  }, [effectiveSrc]);

  const sizes = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-xs",
    lg: "w-12 h-12 text-sm",
    xl: "w-16 h-16 text-lg",
    "2xl": "w-20 h-20 text-xl font-bold",
    "3xl": "w-24 h-24 text-2xl font-bold",
  };

  const shapes = {
    circle: "rounded-full",
    square: size === "2xl" || size === "3xl" ? "rounded-2xl" : "rounded-xl",
  };

  const initials = getInitials(name);
  const isImageValid = Boolean(effectiveSrc && !imageError && String(effectiveSrc).trim() !== "");

  return (
    <div
      className={cn(
        "relative shrink-0 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm select-none transition-transform bg-zinc-100 dark:bg-zinc-800",
        sizes[size] || sizes.md,
        shapes[shape] || shapes.circle,
        className
      )}
    >
      {isImageValid ? (
        <img
          src={effectiveSrc}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : initials ? (
        <span className="font-bold tracking-tight drop-shadow-sm text-zinc-700 dark:text-zinc-200">{initials}</span>
      ) : (
        <User className="w-1/2 h-1/2 text-zinc-400" />
      )}
    </div>
  );
}
