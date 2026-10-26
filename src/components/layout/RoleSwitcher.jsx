"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/lib/constants";
import { ShieldCheck, UserCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function RoleSwitcher() {
  const { role, user } = useAuth();

  const roles = [
    {
      id: "ADMIN",
      label: "Admin",
      desc: "Full access to all modules, settings & payroll runs",
      icon: ShieldCheck,
      color: "text-indigo-400",
    },
    {
      id: "HR",
      label: "HR",
      desc: "Employee onboarding, leave approvals, recruitment",
      icon: UserCheck,
      color: "text-emerald-400",
    },
    {
      id: "EMPLOYEE",
      label: "Employee",
      desc: "Self-service portal, punch clock, payslips, leaves",
      icon: User,
      color: "text-cyan-400",
    },
  ];

  // Derive the canonical active role directly from the authenticated session
  const activeRoleCanonical = normalizeRole(user?.role || role);
  const currentRoleObj = roles.find((r) => r.id === activeRoleCanonical) || roles[2];
  const CurrentIcon = currentRoleObj.icon;

  // The role indicator strictly displays the authenticated role only.
  // Role switching is strictly prohibited — users must authenticate with proper role credentials.
  return (
    <div
      title={`Active Role: ${currentRoleObj.label} (Protected session - role switching restricted)`}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-xs font-medium text-zinc-700 dark:text-zinc-200 cursor-default select-none shadow-sm"
    >
      <CurrentIcon className={cn("w-3.5 h-3.5", currentRoleObj.color)} />
      <span className="hidden sm:inline text-zinc-400">Role:</span>
      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
        {currentRoleObj.label}
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" title="Verified Session" />
    </div>
  );
}
