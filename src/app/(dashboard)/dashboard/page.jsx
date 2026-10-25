"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Clock,
  CalendarDays,
  CreditCard,
  Plus,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { reportService } from "@/services/reportService";
import { attendanceService } from "@/services/attendanceService";
import { leaveService } from "@/services/leaveService";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardPage() {
  const router = useRouter();
  const { user, role, isAdmin, isHR } = useAuth();
  const { notifySuccess } = useNotification();

  // Role-based smart forwarder: route directly to dedicated role dashboard
  useEffect(() => {
    if (role) {
      const norm = (role || "").toUpperCase();
      if (norm === "ADMIN" || norm === "SUPER_ADMIN") {
        router.replace("/admin");
      } else if (norm === "HR" || norm === "HR_MANAGER") {
        router.replace("/hr");
      } else {
        router.replace("/employee");
      }
    }
  }, [role, router]);

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayPunch, setTodayPunch] = useState(null);
  const [punchLoading, setPunchLoading] = useState(false);
  const [recentLeaves, setRecentLeaves] = useState([]);

  const loadData = async () => {
    try {
      const [dashMetrics, punchRecord, leaves] = await Promise.all([
        reportService.getExecutiveDashboardMetrics(),
        attendanceService.getEmployeeTodayRecord(user?.employeeId || "EMP-001"),
        leaveService.getAllRequests(),
      ]);
      setMetrics(dashMetrics);
      setTodayPunch(punchRecord);
      setRecentLeaves(leaves.slice(0, 4));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handlePunchToggle = async () => {
    setPunchLoading(true);
    try {
      if (!todayPunch || !todayPunch.clockIn) {
        const punch = await attendanceService.clockIn({
          employeeId: user?.employeeId || "EMP-001",
          employeeName: user?.displayName || "Current User",
        });
        setTodayPunch(punch);
        notifySuccess("Clocked In", `Registered at ${punch.clockIn}`);
      } else if (!todayPunch.clockOut) {
        const punch = await attendanceService.clockOut({
          employeeId: user?.employeeId || "EMP-001",
        });
        setTodayPunch(punch);
        notifySuccess("Clocked Out", `Registered at ${punch.clockOut}`);
      }
    } finally {
      setPunchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const isClockedIn = Boolean(todayPunch?.clockIn && !todayPunch?.clockOut);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back, {user?.displayName?.split(" ")[0] || "Sarah"}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Enterprise overview for {formatDate(new Date().toISOString())} • Logged as{" "}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {user?.jobTitle || "VP of People & Culture"}
            </span>
          </p>
        </div>

        {/* Quick Punch / Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant={isClockedIn ? "danger" : "primary"}
            size="sm"
            icon={Clock}
            isLoading={punchLoading}
            onClick={handlePunchToggle}
          >
            {isClockedIn ? "Clock Out" : "Clock In"}
          </Button>

          {isHR && (
            <Link href="/employees">
              <Button variant="secondary" size="sm" icon={Plus}>
                New Employee
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Admin Executive Portal Shortcut */}
      {isAdmin && (
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                Executive Admin Portal Active
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                  Role: Admin
                </span>
              </p>
              <p className="text-[11px] text-zinc-400">
                View top KPI cards, headcount & payroll costs by department, tenure demographics, and live audit feed.
              </p>
            </div>
          </div>
          <Link href="/admin">
            <Button size="sm" icon={ExternalLink}>
              Open Admin Portal
            </Button>
          </Link>
        </div>
      )}

      {/* HR People Operations Portal Shortcut */}
      {isHR && !isAdmin && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                People Operations Dashboard Available
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                  Role: HR
                </span>
              </p>
              <p className="text-[11px] text-zinc-400">
                Action pending employee leave requests, view daily attendance check-ins, and inspect late-comers watchlist.
              </p>
            </div>
          </div>
          <Link href="/hr">
            <Button size="sm" icon={ExternalLink}>
              Open HR Dashboard
            </Button>
          </Link>
        </div>
      )}

      {/* Employee Self-Service Portal Shortcut */}
      {!isAdmin && !isHR && (
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                Employee Self-Service Dashboard Active
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                  Role: Employee
                </span>
              </p>
              <p className="text-[11px] text-zinc-400">
                Web punch clock, monthly attendance calendar, leave balance quotas, latest payslips, and company noticeboard.
              </p>
            </div>
          </div>
          <Link href="/employee">
            <Button size="sm" icon={ExternalLink}>
              Open Self-Service Portal
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Workforce"
          value={metrics?.headcount?.total || 8}
          change="+12.5%"
          isPositive={true}
          subtext={`${metrics?.headcount?.active || 7} active, ${metrics?.headcount?.onLeave || 1} on leave`}
          icon={Users}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/10"
        />

        <StatCard
          title="Today's Attendance"
          value={`${metrics?.attendance?.presentRate || 88}%`}
          change={`${metrics?.attendance?.present || 7}/8 Present`}
          isPositive={true}
          subtext={`${metrics?.attendance?.onLeave || 1} planned absence`}
          icon={Clock}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />

        <StatCard
          title="Pending Leave Requests"
          value={metrics?.leave?.pending || 1}
          subtext={`${metrics?.leave?.approved || 2} approved this month`}
          icon={CalendarDays}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
        />

        <StatCard
          title="Latest Payroll Outlay"
          value={formatCurrency(metrics?.payroll?.latestRunNet || 35120.45)}
          subtext={`Gross: ${formatCurrency(metrics?.payroll?.latestRunGross || 48250)}`}
          icon={CreditCard}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10"
        />
      </div>

      {/* Main Grid: Department Distribution & Pending Approvals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Department Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Workforce by Department</CardTitle>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Distribution across engineering, product, design, and operations
              </p>
            </div>
            <Link
              href="/employees"
              className="text-xs text-indigo-500 hover:text-indigo-400 font-medium inline-flex items-center gap-1"
            >
              Directory <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(metrics?.departmentDistribution || {}).map(
              ([dept, count]) => {
                const total = metrics?.headcount?.total || 8;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={dept} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {dept}
                      </span>
                      <span className="text-zinc-400">
                        {count} {count === 1 ? "member" : "members"} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </CardContent>
        </Card>

        {/* Quick Punch Terminal Status */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Terminal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
              <div
                className={`w-3 h-3 rounded-full ${
                  isClockedIn ? "bg-emerald-500 animate-ping" : "bg-zinc-500"
                }`}
              />
              <div className="flex-1 text-xs">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {isClockedIn ? "Status: Currently Clocked In" : "Status: Off the Clock"}
                </div>
                <div className="text-zinc-400 mt-0.5">
                  {todayPunch?.clockIn
                    ? `Clocked in at ${todayPunch.clockIn}`
                    : "No punch recorded today"}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Employee</span>
                <span className="font-medium">{user?.displayName || "Sarah Connor"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Department</span>
                <span className="font-medium">{user?.department || "Human Resources"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Work Location</span>
                <span className="font-medium">San Francisco, CA (HQ)</span>
              </div>
            </div>

            <Button
              variant={isClockedIn ? "danger" : "primary"}
              className="w-full"
              size="sm"
              isLoading={punchLoading}
              onClick={handlePunchToggle}
            >
              {isClockedIn ? "Punch Clock Out" : "Punch Clock In"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leave Requests Ribbon */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent Leave & Absence Activity</CardTitle>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Time-off submissions pending management sign-off
            </p>
          </div>
          <Link
            href="/leave"
            className="text-xs text-indigo-500 hover:text-indigo-400 font-medium inline-flex items-center gap-1"
          >
            Manage All <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentLeaves.map((req) => (
              <div
                key={req.id}
                className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={req.employeeName} size="sm" />
                  <div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {req.employeeName}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {req.leaveType} • {formatDate(req.startDate)} to{" "}
                      {formatDate(req.endDate)} ({req.daysCount} days)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      req.status === "Approved"
                        ? "success"
                        : req.status === "Pending"
                        ? "warning"
                        : "danger"
                    }
                    dot
                  >
                    {req.status}
                  </Badge>
                  <Link href="/leave">
                    <Button variant="ghost" size="sm">
                      Review
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
