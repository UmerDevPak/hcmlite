"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  CalendarDays,
  Calendar,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  CreditCard,
  Download,
  Plus,
  ArrowRight,
  Building2,
  Briefcase,
  User,
  ExternalLink,
  Printer,
  Sparkles,
  Check,
  Megaphone,
  BellRing,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { reportService } from "@/services/reportService";
import { attendanceService } from "@/services/attendanceService";
import { leaveService } from "@/services/leaveService";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { LeaveRequestModal } from "@/components/leave/LeaveRequestModal";
import { PayslipModal } from "@/components/payroll/PayslipModal";

export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const { notifySuccess, notifyError, notifyInfo } = useNotification();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [punchLoading, setPunchLoading] = useState(false);
  const [liveTime, setLiveTime] = useState("");
  const [todayPunch, setTodayPunch] = useState(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);

  // Live Digital Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Dashboard Metrics
  const loadData = async () => {
    try {
      const targetEmpId = user?.employeeId || "EMP-003";
      const data = await reportService.getEmployeeDashboardMetrics(targetEmpId, user);
      setMetrics(data);
      setTodayPunch(data.todayPunch);
      // Default selected calendar day to today or the last active working day
      const currentDay = new Date().getDate();
      const todayCell = data.calendarDays.find((d) => d.day === currentDay) || data.calendarDays[0];
      setSelectedCalendarDay(todayCell);
    } catch (err) {
      console.warn("[EmployeeDashboard] Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCancelLeave = async (id) => {
    if (confirm("Are you sure you want to cancel and delete this leave application?")) {
      try {
        await leaveService.deleteRequest(id);
        notifySuccess("Leave Cancelled", "Your leave application has been withdrawn.");
        loadData();
      } catch (err) {
        notifyError("Failed to cancel leave", err.message);
      }
    }
  };

  // Attendance Web Check-In / Check-Out Toggle
  const handlePunchToggle = async () => {
    const targetEmpId = user?.employeeId || "EMP-003";
    const targetEmpName = user?.displayName || "Elena Rostova";
    setPunchLoading(true);

    try {
      if (!todayPunch || !todayPunch.clockIn) {
        const punch = await attendanceService.clockIn({
          employeeId: targetEmpId,
          employeeName: targetEmpName,
          location: "Office (HQ)",
        });
        setTodayPunch(punch);
        notifySuccess("Web Check-In Confirmed", `Registered today at ${punch.clockIn}`);
      } else if (!todayPunch.clockOut) {
        const punch = await attendanceService.clockOut({
          employeeId: targetEmpId,
        });
        setTodayPunch(punch);
        notifySuccess("Web Check-Out Confirmed", `Registered check-out at ${punch.clockOut}`);
      }
      // Refresh metrics after punch
      loadData();
    } catch (err) {
      notifyError("Attendance Action Failed", err.message);
    } finally {
      setPunchLoading(false);
    }
  };

  // Instant Payslip PDF Download handler
  const handleDownloadPayslip = () => {
    setIsPayslipModalOpen(true);
    notifyInfo("Payslip Ready", "Opening printable payslip statement. Use Print/Save as PDF.");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  const {
    balances = { annual: 10, sick: 7, casual: 8 },
    leaveRequests = [],
    weeklyHours = { logged: 34.5, target: 40, percentage: 86, remaining: 5.5 },
    latesThisMonth = 1,
    lateThreshold = 3,
    calendarDays = [],
    latestPayslip = null,
    announcements = [],
    employee = {},
  } = metrics || {};

  const isClockedIn = Boolean(todayPunch?.clockIn && !todayPunch?.clockOut);
  const isClockedOut = Boolean(todayPunch?.clockIn && todayPunch?.clockOut);

  // Status badge logic for attendance widget
  let statusBadgeVariant = "secondary";
  let statusText = "Not Checked In";
  if (isClockedIn) {
    statusBadgeVariant = "success";
    statusText = `Checked In at ${todayPunch.clockIn}`;
  } else if (isClockedOut) {
    statusBadgeVariant = "info";
    statusText = `Checked Out at ${todayPunch.clockOut}`;
  }

  // Lateness penalty warning level
  const isNearLatePenalty = latesThisMonth >= lateThreshold - 1;
  const isLatePenaltyReached = latesThisMonth >= lateThreshold;

  // Recent verified shift logs for left-column balance
  const recentShifts = calendarDays
    .filter((d) => !d.isWeekend && d.status !== "Upcoming" && d.clockIn)
    .slice(-5)
    .reverse();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header: Welcome back, Employee Name, Department & Designation */}
      <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-indigo-950/40 border border-zinc-800 shadow-elevated">
        {/* Subtle decorative vector backdrop pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-20 [mask-image:radial-gradient(ellipse_at_top_right,white,transparent_75%)]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="emp-header-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="currentColor" className="text-indigo-400" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#emp-header-grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <Avatar
            src={user?.photoURL || employee.avatar}
            name={user?.displayName || employee.name || "Elena Rostova"}
            size="lg"
            className="ring-2 ring-indigo-500/40"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-50">
                Welcome back, {user?.displayName?.split(" ")[0] || employee.name?.split(" ")[0] || "Elena"}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                {user?.employeeId || employee.id || "EMP-003"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-zinc-400">
              <Badge variant="purple" size="sm" className="gap-1">
                <Building2 className="w-3 h-3" />
                {user?.department || employee.department || "Engineering"}
              </Badge>
              <Badge variant="secondary" size="sm" className="gap-1">
                <Briefcase className="w-3 h-3" />
                {user?.jobTitle || employee.jobTitle || "Staff Software Engineer"}
              </Badge>
              <span className="text-zinc-500 hidden sm:inline">•</span>
              <span className="text-zinc-400 text-[11px] font-medium">
                {formatDate(new Date().toISOString())}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/profile">
            <Button variant="secondary" size="sm" icon={User}>
              My Profile
            </Button>
          </Link>
          <Button
            size="sm"
            icon={Plus}
            onClick={() => setIsLeaveModalOpen(true)}
          >
            Apply Leave
          </Button>
        </div>
      </div>

      {/* 2. Top Action & Metrics Cards (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {/* Card 1: Attendance Action Widget */}
        <Card className="p-4 flex flex-col justify-between h-full min-h-[220px] relative overflow-hidden border-indigo-500/30 bg-gradient-to-b from-zinc-900 to-indigo-950/20">
          <div>
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-medium text-zinc-400">Web Punch Clock</span>
              <Badge variant={statusBadgeVariant} dot size="sm">
                {isClockedIn ? "Active Shift" : isClockedOut ? "Completed" : "Offline"}
              </Badge>
            </div>

            {/* Live Monospace Clock */}
            <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-zinc-100 flex items-baseline gap-1.5">
              <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span>{liveTime || "09:00:00 AM"}</span>
            </div>

            <p className="text-[11px] text-zinc-400 mt-1 font-medium truncate">
              {statusText}
            </p>
          </div>

          <div className="mt-auto pt-3 border-t border-zinc-800">
            <Button
              className="w-full font-semibold text-xs"
              variant={isClockedIn ? "danger" : "primary"}
              icon={Clock}
              isLoading={punchLoading}
              disabled={isClockedOut}
              onClick={handlePunchToggle}
            >
              {isClockedOut
                ? "Shift Completed"
                : isClockedIn
                ? "Web Check-Out"
                : "Web Check-In"}
            </Button>
          </div>
        </Card>

        {/* Card 2: Weekly Hours Logged */}
        <Card className="p-4 flex flex-col justify-between h-full min-h-[220px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Weekly Hours Logged</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-zinc-100">
                {weeklyHours.logged}
              </span>
              <span className="text-sm font-semibold text-zinc-400 font-mono">
                / {weeklyHours.target} hrs
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 space-y-1">
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, weeklyHours.percentage)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-400 pt-0.5">
                <span>{weeklyHours.percentage}% logged</span>
                <span>{weeklyHours.remaining}h remaining</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80 mt-auto">
            Target: 40 hrs/week • Standard shift
          </div>
        </Card>

        {/* Card 3: Lates This Month */}
        <Card className="p-4 flex flex-col justify-between h-full min-h-[220px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Lates This Month</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="text-2xl font-bold font-mono text-amber-400">
                {latesThisMonth}
              </span>
              <Badge
                variant={isLatePenaltyReached ? "danger" : isNearLatePenalty ? "warning" : "success"}
                size="sm"
              >
                {isLatePenaltyReached
                  ? "Penalty Applied"
                  : isNearLatePenalty
                  ? "Near Limit"
                  : "Good Standing"}
              </Badge>
            </div>

            {/* Warning indicator */}
            <div className="mt-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] leading-tight">
              {isLatePenaltyReached ? (
                <p className="text-rose-400 font-medium">
                  3 lates reached: 1 half-day deduction applied per Rule 6.
                </p>
              ) : isNearLatePenalty ? (
                <p className="text-amber-400 font-medium">
                  Warning: 1 more check-in after 09:15 triggers a half-day penalty.
                </p>
              ) : (
                <p className="text-zinc-400">
                  Office starts 09:00 (15m grace). {lateThreshold - latesThisMonth} late check-ins remaining before penalty.
                </p>
              )}
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-800/80 mt-auto">
            Rule 6: 3 lates (&gt; 09:15) = 1 half-day deduction
          </div>
        </Card>

        {/* Card 4: Leave Balance Summary */}
        <Card className="p-4 flex flex-col justify-between h-full min-h-[220px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Leave Balance Summary</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CalendarDays className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2 text-2xl font-bold font-mono text-zinc-100">
              {(balances.annual || 0) + (balances.sick || 0) + (balances.casual || 0)}{" "}
              <span className="text-sm font-normal text-zinc-400">Days Available</span>
            </div>

            {/* Quota breakdown items */}
            <div className="mt-2.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-[11px]">Annual Leave</span>
                <span className="font-mono font-semibold text-emerald-400">
                  {balances.annual} / 14 left
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-[11px]">Sick Leave</span>
                <span className="font-mono font-semibold text-amber-400">
                  {balances.sick} / 8 left
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-[11px]">Casual Leave</span>
                <span className="font-mono font-semibold text-indigo-400">
                  {balances.casual} / 10 left
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-800/80 mt-auto">
            Rule 5: 14 Annual • 8 Sick • 10 Casual quota
          </div>
        </Card>
      </div>

      {/* 3. Primary Attendance & Compensation Row (Calendar + Payslip) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Column (lg:col-span-2): Monthly Attendance Calendar */}
        <Card className="lg:col-span-2 flex flex-col justify-between h-full">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>My Monthly Attendance Calendar</span>
              </CardTitle>
              <p className="text-xs text-zinc-400 mt-0.5">
                Color-coded presence record for October 2026. Click any day to inspect check-in timestamps.
              </p>
            </div>
            <Badge variant="secondary" size="sm" className="font-mono shrink-0">
              October 2026
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-zinc-400 pb-1 border-b border-zinc-800">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((item) => {
                const isSelected = selectedCalendarDay?.day === item.day;

                let cellColor = "border-zinc-800 bg-zinc-900/40 text-zinc-400";
                let dotColor = "bg-zinc-600";

                if (item.status === "Present") {
                  cellColor = "border-emerald-500/30 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/30";
                  dotColor = "bg-emerald-400";
                } else if (item.status === "Late") {
                  cellColor = "border-amber-500/30 bg-amber-950/20 text-amber-300 hover:bg-amber-900/30";
                  dotColor = "bg-amber-400";
                } else if (item.status === "Half-Day") {
                  cellColor = "border-purple-500/30 bg-purple-950/20 text-purple-300 hover:bg-purple-900/30";
                  dotColor = "bg-purple-400";
                } else if (item.status === "Leave") {
                  cellColor = "border-blue-500/30 bg-blue-950/20 text-blue-300 hover:bg-blue-900/30";
                  dotColor = "bg-blue-400";
                } else if (item.status === "Absent") {
                  cellColor = "border-rose-500/30 bg-rose-950/20 text-rose-300 hover:bg-rose-900/30";
                  dotColor = "bg-rose-400";
                } else if (item.status === "Weekend") {
                  cellColor = "border-zinc-900 bg-zinc-950/50 text-zinc-600";
                  dotColor = "bg-zinc-700";
                }

                return (
                  <button
                    key={item.day}
                    onClick={() => setSelectedCalendarDay(item)}
                    className={`relative flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-mono transition-all duration-150 ${cellColor} ${
                      isSelected ? "ring-2 ring-indigo-500 shadow-glow" : ""
                    }`}
                  >
                    <span className="font-semibold">{item.day}</span>
                    {!item.isWeekend && item.status !== "Upcoming" && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-1 ${dotColor}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Day Inspection Drawer */}
            {selectedCalendarDay && (
              <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-100 font-mono">
                      {selectedCalendarDay.date} ({selectedCalendarDay.dayOfWeek})
                    </span>
                    <Badge
                      variant={
                        selectedCalendarDay.status === "Present"
                          ? "success"
                          : selectedCalendarDay.status === "Late"
                          ? "warning"
                          : selectedCalendarDay.status === "Half-Day"
                          ? "purple"
                          : selectedCalendarDay.status === "Leave"
                          ? "info"
                          : "secondary"
                      }
                      size="sm"
                    >
                      {selectedCalendarDay.status}
                    </Badge>
                  </div>
                  <p className="text-zinc-400">{selectedCalendarDay.details}</p>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-mono shrink-0">
                  <div>
                    <span className="text-zinc-500 block">Check-In</span>
                    <span className="text-zinc-200 font-semibold">
                      {selectedCalendarDay.clockIn || "--:--"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Check-Out</span>
                    <span className="text-zinc-200 font-semibold">
                      {selectedCalendarDay.clockOut || "--:--"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Duration</span>
                    <span className="text-indigo-400 font-semibold">
                      {selectedCalendarDay.totalHours || "--"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Color Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 mt-auto">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Present</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Late (&gt;09:15)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Half-Day (&lt;5h)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Leave</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Absent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                <span>Weekend</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column (lg:col-span-1): Latest Payslip Card */}
        <Card className="lg:col-span-1 flex flex-col justify-between h-full border-indigo-500/20 bg-gradient-to-b from-zinc-900 via-zinc-900 to-indigo-950/20">
          <CardHeader className="flex flex-col items-start gap-1 pb-3">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Latest Payslip</span>
              </CardTitle>
              <Badge variant="success" size="sm" className="shrink-0">
                Disbursed
              </Badge>
            </div>
            <p className="text-xs text-zinc-400">
              {latestPayslip?.period || "Oct 01, 2026 - Oct 15, 2026"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-zinc-400">Net Take-Home Pay</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {formatCurrency(latestPayslip?.netPay || 4390)}
                </span>
              </div>

              <div className="space-y-1.5 text-xs pt-2 border-t border-zinc-800/80">
                <div className="flex justify-between text-zinc-400">
                  <span>Gross Earnings (Basic × 1.5)</span>
                  <span className="font-mono text-zinc-200">
                    {formatCurrency(latestPayslip?.totalGross || 6041.67)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Tax Slabs & Withholding</span>
                  <span className="font-mono text-rose-400">
                    -{formatCurrency(latestPayslip?.totalTaxes || 1313.22)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Attendance Deductions</span>
                  <span className="font-mono text-rose-400">
                    -{formatCurrency(latestPayslip?.attendanceDeduction || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Instant Action Buttons & Link pinned at bottom */}
            <div className="mt-auto space-y-2 pt-2">
              <Button
                className="w-full text-xs font-semibold"
                icon={Download}
                onClick={handleDownloadPayslip}
              >
                Download PDF Payslip
              </Button>
              <Button
                variant="outline"
                className="w-full text-xs"
                icon={Printer}
                onClick={() => setIsPayslipModalOpen(true)}
              >
                View Full Earnings Statement
              </Button>

              <div className="text-center pt-1">
                <Link
                  href="/payroll"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                >
                  Browse Past Payslips <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Secondary Operations & Noticeboard Tier (Leave Requests, Shift Logs + Company Noticeboard) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Column (lg:col-span-2): Leave Requests & Verified Shifts */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          {/* Section B: Quick Leave Application Shortcut & Recent Requests */}
          <Card className="flex-1 flex flex-col justify-between">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>My Leave Requests</span>
                </CardTitle>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Quick leave application shortcut and status of your active submissions.
                </p>
              </div>
              <Button
                size="sm"
                icon={Plus}
                onClick={() => setIsLeaveModalOpen(true)}
                className="shrink-0"
              >
                Apply Leave
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              {leaveRequests.length === 0 ? (
                <EmptyState
                  compact
                  avatarUrl={user?.photoURL || employee.avatar}
                  title="Oops! There is nothing to see here"
                  description="You have no pending or active leave requests. Your PTO balance is intact and ready whenever you need time off."
                  actionLabel="Apply for Leave"
                  actionIcon={Plus}
                  onAction={() => setIsLeaveModalOpen(true)}
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Duration & Dates</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium text-xs text-zinc-100">
                            {req.leaveType}
                          </TableCell>
                          <TableCell className="text-xs text-zinc-300">
                            {req.startDate} to {req.endDate}{" "}
                            <span className="text-[10px] text-zinc-500 font-mono">
                              ({req.daysCount} working days)
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-zinc-400 max-w-xs truncate">
                            {req.reason}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                req.status === "Approved"
                                  ? "success"
                                  : req.status === "Rejected"
                                  ? "danger"
                                  : "warning"
                              }
                              size="sm"
                            >
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <button
                              type="button"
                              onClick={() => handleCancelLeave(req.id)}
                              title="Cancel / Delete leave application"
                              className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section C: Recent Verified Shift Logs */}
          <Card className="flex-1 flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Recent Verified Shift Logs</span>
                </CardTitle>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Detailed timestamps, work durations, and status badges from your latest office shifts.
                </p>
              </div>
              <Link
                href="/attendance"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 shrink-0"
              >
                Full Board <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentShifts.map((shift) => (
                      <TableRow key={shift.day}>
                        <TableCell className="font-mono text-xs font-semibold text-zinc-200">
                          {shift.date}{" "}
                          <span className="text-[10px] text-zinc-500 font-normal">({shift.dayOfWeek})</span>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-300 font-mono">
                          {shift.clockIn || "--:--"}
                        </TableCell>
                        <TableCell className="text-xs text-zinc-300 font-mono">
                          {shift.clockOut || "--:--"}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-medium text-indigo-400">
                          {shift.totalHours || "--"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              shift.status === "Present"
                                ? "success"
                                : shift.status === "Late"
                                ? "warning"
                                : shift.status === "Half-Day"
                                ? "purple"
                                : "secondary"
                            }
                            size="sm"
                          >
                            {shift.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (lg:col-span-1): Company Announcements Noticeboard */}
        <Card className="lg:col-span-1 flex flex-col justify-between h-full">
          <CardHeader className="pb-3 flex flex-col items-start gap-1">
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Company Noticeboard</span>
              </CardTitle>
              <Badge variant="warning" size="sm" className="shrink-0">
                {announcements.length} New
              </Badge>
            </div>
            <p className="text-xs text-zinc-400">
              Official company updates, holiday closures, and benefits alerts.
            </p>
          </CardHeader>
          <CardContent className="space-y-3.5 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${ann.badgeColor}`}
                    >
                      {ann.category}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {ann.date}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-zinc-100 leading-snug">
                    {ann.title}
                  </h4>

                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {ann.summary}
                  </p>

                  <div className="text-[10px] text-zinc-500 font-medium pt-1">
                    Posted by {ann.author}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 text-center border-t border-zinc-800/80 mt-auto">
              <Link
                href="/documents"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
              >
                View All Announcements & Docs <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSubmitted={loadData}
      />

      <PayslipModal
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        payslip={latestPayslip}
        runInfo={{
          period: latestPayslip?.period || "Oct 01, 2026 - Oct 15, 2026",
          payDate: latestPayslip?.payDate || "2026-10-15",
        }}
      />
    </div>
  );
}
