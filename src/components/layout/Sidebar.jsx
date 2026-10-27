"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
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
  LogOut,
  Building2,
  Sparkles,
  User,
  ShieldAlert,
  CheckSquare,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ROLE_LABELS, normalizeRole } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (e) {
      console.error("Sign out error", e);
    }
  };

  const adminNavigation = [
    {
      group: "Executive Command",
      items: [
        { name: "Overview", href: "/admin", icon: LayoutDashboard },
        { name: "Organization Setup", href: "/settings", icon: Settings },
        { name: "All Employees", href: "/employees", icon: Users },
      ],
    },
    {
      group: "Workforce & Operations",
      items: [
        { name: "Tasks & OKRs", href: "/tasks", icon: CheckSquare },
        { name: "Company Attendance", href: "/attendance", icon: Clock },
        { name: "Leaves & Absence", href: "/leave", icon: CalendarDays },
        { name: "Finalize Payroll", href: "/payroll", icon: CreditCard },
      ],
    },
    {
      group: "Compliance & Audit",
      items: [
        { name: "Audit Log & Reports", href: "/reports", icon: BarChart3 },
        { name: "Documents", href: "/documents", icon: FileText },
        { name: "Recruitment (ATS)", href: "/recruitment", icon: Briefcase },
        { name: "Grievances & Complaints", href: "/complaints", icon: ShieldAlert },
      ],
    },
  ];

  const hrNavigation = [
    {
      group: "People Operations",
      items: [
        { name: "Dashboard", href: "/hr", icon: LayoutDashboard },
        { name: "Employee Directory", href: "/employees", icon: Users },
      ],
    },
    {
      group: "Workforce Tracking",
      items: [
        { name: "Task Review Queue", href: "/tasks", icon: CheckSquare },
        { name: "Daily Attendance Board", href: "/attendance", icon: Clock },
        { name: "Leave Approvals", href: "/leave", icon: CalendarDays },
      ],
    },
    {
      group: "Compensation & Culture",
      items: [
        { name: "Monthly Payroll Draft", href: "/payroll", icon: CreditCard },
        { name: "Announcements & Docs", href: "/documents", icon: FileText },
        { name: "Recruitment (ATS)", href: "/recruitment", icon: Briefcase },
        { name: "Grievances & Complaints", href: "/complaints", icon: ShieldAlert },
      ],
    },
  ];

  const employeeNavigation = [
    {
      group: "Self-Service",
      items: [
        { name: "My Dashboard", href: "/employee", icon: LayoutDashboard },
        { name: "My Tasks & Deliverables", href: "/tasks", icon: CheckSquare },
        { name: "My Attendance", href: "/attendance", icon: Clock },
        { name: "Apply Leave", href: "/leave", icon: CalendarDays },
        { name: "My Payslips", href: "/employee", icon: CreditCard },
        { name: "Grievances & Complaints", href: "/complaints", icon: ShieldAlert },
        { name: "My Profile", href: "/profile", icon: User },
      ],
    },
    {
      group: "Company Resources",
      items: [
        { name: "Announcements & Docs", href: "/documents", icon: FileText },
        { name: "Team Directory", href: "/employees", icon: Users },
      ],
    },
  ];

  const standardNavigation = [
    {
      group: "Core",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Profile", href: "/profile", icon: User },
        { name: "Employees", href: "/employees", icon: Users },
      ],
    },
    {
      group: "Workforce",
      items: [
        { name: "Attendance & Shifts", href: "/attendance", icon: Clock },
        { name: "Leave & Absence", href: "/leave", icon: CalendarDays },
      ],
    },
    {
      group: "Finance & Operations",
      items: [
        { name: "Payroll", href: "/payroll", icon: CreditCard },
        { name: "Expenses", href: "/expenses", icon: Receipt },
      ],
    },
    {
      group: "Talent Management",
      items: [
        { name: "Tasks & Deliverables", href: "/tasks", icon: CheckSquare },
        { name: "Recruitment (ATS)", href: "/recruitment", icon: Briefcase },
        { name: "Performance & OKRs", href: "/performance", icon: TrendingUp },
      ],
    },
    {
      group: "Organization",
      items: [
        { name: "Documents", href: "/documents", icon: FileText },
        { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
        { name: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  const canonicalRole = normalizeRole(user?.role || role);
  const isAdmin = canonicalRole === "ADMIN";
  const isHR = canonicalRole === "HR";
  const isEmployee = canonicalRole === "EMPLOYEE";

  const navigation = isAdmin ? adminNavigation : isHR ? hrNavigation : employeeNavigation;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/90 backdrop-blur-md transition-transform duration-200 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* App Logo & Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-zinc-200 dark:border-zinc-800">
          <Link
            href="/dashboard"
            onClick={() => onClose && onClose()}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-glow group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-50">
                HCM Lite
                <span className="text-[10px] px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-500 font-semibold uppercase tracking-wider">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">Enterprise HR Suite</p>
            </div>
          </Link>

          {/* Close drawer button for mobile screens */}
          <button
            onClick={onClose}
            aria-label="Close sidebar navigation"
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {navigation.map((section) => (
            <div key={section.group}>
              <h4 className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {section.group}
              </h4>
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && item.href !== "/admin" && item.href !== "/hr" && item.href !== "/employee" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => onClose && onClose()}
                      className={cn(
                        "group flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                        isActive
                          ? "bg-zinc-100 dark:bg-zinc-800/90 text-indigo-600 dark:text-indigo-400 shadow-subtle font-semibold"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/70 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-colors",
                          isActive
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                        )}
                      />
                      <span className="flex-1">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* User Card & Sign Out */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 flex-1 min-w-0 group"
                title="View My Profile"
              >
                <Avatar
                  src={user?.avatar || user?.photoURL}
                  name={user?.displayName || "Admin"}
                  id={user?.employeeId}
                  email={user?.email}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-400 transition-colors">
                    {user?.displayName || "Sarah Connor"}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">
                    {user?.jobTitle || ROLE_LABELS[role] || "VP of People & Culture"}
                  </p>
                </div>
              </Link>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
