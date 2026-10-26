"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { normalizeRole } from "@/lib/constants";
import { ShieldCheck, UserCheck, User, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function RoleSwitcher() {
  const router = useRouter();
  const { role, switchDemoRole, user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    {
      id: "ADMIN",
      label: "Admin",
      desc: "Full access to all modules, settings & payroll runs",
      icon: ShieldCheck,
      color: "text-indigo-400",
      path: "/admin",
    },
    {
      id: "HR",
      label: "HR",
      desc: "Employee onboarding, leave approvals, recruitment",
      icon: UserCheck,
      color: "text-emerald-400",
      path: "/hr",
    },
    {
      id: "EMPLOYEE",
      label: "Employee",
      desc: "Self-service portal, punch clock, payslips, leaves",
      icon: User,
      color: "text-cyan-400",
      path: "/employee",
    },
  ];

  // Derive the canonical active role directly from the authenticated session
  const activeRoleCanonical = normalizeRole(user?.role || role);
  const currentRoleObj = roles.find((r) => r.id === activeRoleCanonical) || roles[0];
  const CurrentIcon = currentRoleObj.icon;

  const handleRoleSelect = async (roleObj) => {
    setIsOpen(false);
    if (roleObj.id === activeRoleCanonical) {
      router.push(roleObj.path);
      return;
    }
    try {
      await switchDemoRole(roleObj.id);
      const loginMsg = `Authenticated as ${roleObj.label}`;
      notifySuccess("Session Verified", loginMsg);
      router.push(roleObj.path);
    } catch (err) {
      notifyError("Authentication Failed", `Could not verify credentials for ${roleObj.label}`);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 active:scale-[0.98] text-xs font-medium text-zinc-700 dark:text-zinc-200"
      >
        <CurrentIcon className={cn("w-3.5 h-3.5", currentRoleObj.color)} />
        <span className="hidden sm:inline">Role:</span>
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {currentRoleObj.label}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-elevated p-1.5 z-40 animate-scale-in">
            <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
              Switch Interactive Persona
            </div>
            <div className="py-1 space-y-0.5">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = r.id === activeRoleCanonical;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleRoleSelect(r)}
                    className={cn(
                      "w-full flex items-start gap-3 p-2 rounded-lg text-left transition-all duration-200 active:scale-[0.98] text-xs",
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", r.color)} />
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        {r.label}
                        {isSelected && (
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.2 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-normal leading-tight mt-0.5">
                        {r.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
