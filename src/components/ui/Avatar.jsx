"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getInitials, cn } from "@/lib/utils";
import { User } from "lucide-react";

const GRADIENT_PALETTES = [
  "from-indigo-500 to-purple-600 text-white",
  "from-blue-500 to-indigo-600 text-white",
  "from-emerald-500 to-teal-600 text-white",
  "from-violet-500 to-fuchsia-600 text-white",
  "from-rose-500 to-pink-600 text-white",
  "from-amber-500 to-orange-600 text-white",
  "from-cyan-500 to-blue-600 text-white",
];

function getGradientForName(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index];
}

export function Avatar({
  src,
  name = "User",
  size = "md",
  className = "",
  shape = "circle",
}) {
  const [imageError, setImageError] = useState(false);

  // Reset image error state whenever src prop updates
  useEffect(() => {
    setImageError(false);
  }, [src]);

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
  const gradient = useMemo(() => getGradientForName(name), [name]);

  const isImageValid = Boolean(src && !imageError && String(src).trim() !== "");

  return (
    <div
      className={cn(
        "relative shrink-0 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm select-none transition-transform",
        sizes[size] || sizes.md,
        shapes[shape] || shapes.circle,
        !isImageValid && `bg-gradient-to-br ${gradient}`,
        className
      )}
    >
      {isImageValid ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : initials ? (
        <span className="font-bold tracking-tight drop-shadow-sm">{initials}</span>
      ) : (
        <User className="w-1/2 h-1/2 text-white/90" />
      )}
    </div>
  );
}
