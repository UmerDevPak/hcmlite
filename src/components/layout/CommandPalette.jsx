"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  CreditCard,
  Briefcase,
  TrendingUp,
  Receipt,
  FileText,
  BarChart3,
  Settings,
  ArrowRight,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { employeeService } from "@/services/employeeService";

export function CommandPalette({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      employeeService.getAllEmployees().then(setEmployees);
    }
  }, [isOpen]);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Employee Directory", href: "/employees", icon: Users },
    { label: "Time & Attendance", href: "/attendance", icon: Clock },
    { label: "Leave & Absence", href: "/leave", icon: CalendarDays },
    { label: "Payroll Processing", href: "/payroll", icon: CreditCard },
    { label: "Recruitment (ATS)", href: "/recruitment", icon: Briefcase },
    { label: "Performance & OKRs", href: "/performance", icon: TrendingUp },
    { label: "Expenses & Reimbursements", href: "/expenses", icon: Receipt },
    { label: "Documents & Handbooks", href: "/documents", icon: FileText },
    { label: "Reports & Analytics", href: "/reports", icon: BarChart3 },
    { label: "Enterprise Settings", href: "/settings", icon: Settings },
  ];

  const filteredNav = navItems.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredEmployees = employees
    .filter(
      (e) =>
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.email.toLowerCase().includes(query.toLowerCase()) ||
        e.department.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5);

  const navigateTo = (path) => {
    router.push(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      <div className="space-y-4">
        {/* Search input bar */}
        <div className="relative flex items-center">
          <Search className="w-5 h-5 absolute left-3.5 text-zinc-400" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search employees..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/80 py-3 pl-11 pr-4 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        {/* Quick Nav results */}
        <div className="space-y-1 max-h-72 overflow-y-auto">
          {filteredNav.length > 0 && (
            <div className="py-1">
              <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Navigation
              </span>
              <div className="mt-1 space-y-0.5">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => navigateTo(item.href)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                        <span>{item.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Employee search results */}
          {filteredEmployees.length > 0 && (
            <div className="py-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Employees
              </span>
              <div className="mt-1 space-y-0.5">
                {filteredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => navigateTo(`/employees/${emp.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={emp.avatar}
                        name={emp.name}
                        size="xs"
                        className="w-6 h-6 shrink-0"
                      />
                      <div className="text-left">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {emp.name}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {emp.jobTitle} • {emp.department}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {emp.id}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
