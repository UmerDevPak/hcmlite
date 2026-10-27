"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  Check,
  X,
  UserCheck,
  Building2,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { reportService } from "@/services/reportService";
import { leaveService } from "@/services/leaveService";
import { formatDate } from "@/lib/utils";
import { containerStagger, itemFadeUp, scrollViewport } from "@/lib/animationVariants";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmployeeModal } from "@/components/employees/EmployeeModal";
import { AttendanceTrendChart } from "@/components/charts/AttendanceTrendChart";

export default function HrDashboardPage() {
  const router = useRouter();
  const { user, isHR, loading: authLoading } = useAuth();
  const { notifySuccess, notifyInfo, notifyError } = useNotification();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingItems, setPendingItems] = useState([]);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && user && !isHR) {
      router.replace("/employee");
    }
  }, [user, isHR, authLoading, router]);

  const loadData = async () => {
    if (!isHR) return;
    try {
      const data = await reportService.getHrDashboardMetrics();
      setMetrics(data);
      const combined = [
        ...(data.pendingLeaves || []).map((l) => ({
          id: l.id,
          sourceType: "LEAVE",
          employeeId: l.employeeId,
          employeeName: l.employeeName,
          category: `${l.leaveType} Leave`,
          details: `${l.startDate} to ${l.endDate} (${l.daysCount} days)`,
          reason: l.reason,
          appliedAt: l.appliedAt,
        })),
        ...(data.attendanceCorrections || []).map((c) => ({
          id: c.id,
          sourceType: "CORRECTION",
          employeeId: c.employeeId,
          employeeName: c.employeeName,
          category: c.requestType,
          details: `${c.date} • Check-in: ${c.requestedTime}`,
          reason: c.reason,
          appliedAt: c.appliedAt,
        })),
      ];
      setPendingItems(combined);
    } catch (err) {
      console.warn("[HrDashboard] Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (item) => {
    try {
      if (item.sourceType === "LEAVE") {
        await leaveService.updateRequestStatus(
          item.id,
          "Approved",
          user?.displayName || "Aaliyah Patel"
        );
        notifySuccess("Leave Approved", `Approved request for ${item.employeeName}. Days deducted.`);
      } else {
        notifySuccess("Attendance Adjusted", `Approved time correction for ${item.employeeName}.`);
      }
      setPendingItems((prev) => prev.filter((p) => p.id !== item.id));
      loadData();
    } catch (err) {
      notifyError("Action Failed", err.message);
    }
  };

  const handleReject = async (item) => {
    try {
      if (item.sourceType === "LEAVE") {
        await leaveService.updateRequestStatus(
          item.id,
          "Rejected",
          user?.displayName || "Aaliyah Patel"
        );
        notifyInfo("Leave Rejected", `Leave request for ${item.employeeName} was marked rejected.`);
      } else {
        notifyInfo("Adjustment Rejected", `Correction request rejected.`);
      }
      setPendingItems((prev) => prev.filter((p) => p.id !== item.id));
      loadData();
    } catch (err) {
      notifyError("Action Failed", err.message);
    }
  };

  const handleDeleteInboxItem = async (item) => {
    if (confirm(`Remove this pending ${item.category} request for ${item.employeeName}?`)) {
      try {
        if (item.sourceType === "LEAVE") {
          await leaveService.deleteRequest(item.id);
        }
        setPendingItems((prev) => prev.filter((p) => p.id !== item.id));
        notifySuccess("Item Removed", `Pending request removed.`);
        loadData();
      } catch (err) {
        notifyError("Removal Failed", err.message);
      }
    }
  };

  if (!authLoading && (!user || !isHR)) {
    return null;
  }

  if (loading && !metrics) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  const {
    totalEmployees = 8,
    presentToday = 6,
    lateToday = 2,
    onLeaveToday = 1,
    lateWatchlist = [],
    departmentAttendance = [],
  } = metrics || {};

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerStagger}
      className="space-y-6"
    >
      {/* 1. Header: People Operations Dashboard with Smooth Entrance */}
      <motion.div
        variants={itemFadeUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-emerald-950/30 border border-zinc-800 shadow-elevated"
      >
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-glow shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-50">
              People Operations Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              {formatDate(new Date().toISOString())}
            </span>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            Real-time daily presence, shift check-ins, pending employee approvals, and lateness tracking for people teams.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
          <Button
            size="sm"
            icon={Plus}
            onClick={() => setIsEmployeeModalOpen(true)}
          >
            Add Employee
          </Button>

          <Link href="/payroll">
            <Button variant="secondary" size="sm" icon={CreditCard}>
              Run Payroll Draft
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* 2. Daily Snapshot Cards (Staggered Children with Pop-In & Spring Hover) */}
      <motion.div
        variants={containerStagger}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5"
      >
        <motion.div
          variants={itemFadeUp}
          whileHover={{ y: -4, transition: { duration: 0.16 } }}
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-4 flex flex-col justify-between h-full min-h-[120px] transition-colors hover:border-zinc-700/80 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2 min-h-[28px]">
            <span className="text-xs font-medium text-zinc-400">Total Workforce</span>
            <Users className="w-4 h-4 text-zinc-400 shrink-0" />
          </div>
          <div className="mt-auto pt-2">
            <div className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
              {totalEmployees}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1 truncate">Across 5 departments</div>
          </div>
        </motion.div>

        <motion.div
          variants={itemFadeUp}
          whileHover={{ y: -4, transition: { duration: 0.16 } }}
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-4 flex flex-col justify-between h-full min-h-[120px] transition-colors hover:border-emerald-500/30 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2 min-h-[28px]">
            <span className="text-xs font-medium text-zinc-400">Present Today</span>
            <Badge variant="success" dot size="sm" className="shrink-0">
              On-Duty
            </Badge>
          </div>
          <div className="mt-auto pt-2">
            <div className="text-2xl font-bold font-mono tracking-tight text-emerald-400">
              {presentToday}
            </div>
            <div className="text-[11px] text-emerald-500/80 mt-1 flex items-center gap-1 truncate">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span>{Math.round((presentToday / (totalEmployees || 1)) * 100)}% attendance</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemFadeUp}
          whileHover={{ y: -4, transition: { duration: 0.16 } }}
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-4 flex flex-col justify-between h-full min-h-[120px] transition-colors hover:border-amber-500/30 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2 min-h-[28px]">
            <span className="text-xs font-medium text-zinc-400">Late Today</span>
            <Badge variant="warning" dot size="sm" className="shrink-0">
              &gt; 09:15
            </Badge>
          </div>
          <div className="mt-auto pt-2">
            <div className="text-2xl font-bold font-mono tracking-tight text-amber-400">
              {lateToday}
            </div>
            <div className="text-[11px] text-amber-500/80 mt-1 truncate">Grace 15m elapsed</div>
          </div>
        </motion.div>

        <motion.div
          variants={itemFadeUp}
          whileHover={{ y: -4, transition: { duration: 0.16 } }}
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-4 flex flex-col justify-between h-full min-h-[120px] transition-colors hover:border-indigo-500/30 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2 min-h-[28px]">
            <span className="text-xs font-medium text-zinc-400">On Leave Today</span>
            <Badge variant="info" dot size="sm" className="shrink-0">
              Approved
            </Badge>
          </div>
          <div className="mt-auto pt-2">
            <div className="text-2xl font-bold font-mono tracking-tight text-indigo-400">
              {onLeaveToday}
            </div>
            <div className="text-[11px] text-indigo-400/80 mt-1 truncate">Vacation & sick leave</div>
          </div>
        </motion.div>

        <motion.div
          variants={itemFadeUp}
          whileHover={{ y: -4, transition: { duration: 0.16 } }}
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-4 flex flex-col justify-between h-full min-h-[120px] transition-colors hover:border-purple-500/30 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2 min-h-[28px]">
            <span className="text-xs font-medium text-zinc-400 leading-tight">Pending Approvals</span>
            <Badge variant="purple" dot size="sm" className="shrink-0">
              Action Req
            </Badge>
          </div>
          <div className="mt-auto pt-2">
            <div className="text-2xl font-bold font-mono tracking-tight text-purple-400">
              {pendingItems.length}
            </div>
            <div className="text-[11px] text-purple-400/80 mt-1 truncate">Leaves + Corrections</div>
          </div>
        </motion.div>
      </motion.div>

      {/* 3. Operational Sections (Trigger on Scroll into View) */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={scrollViewport}
        variants={containerStagger}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Section A: Pending Action Inbox (2 cols) */}
        <motion.div variants={itemFadeUp} className="lg:col-span-2">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Pending Action Inbox</CardTitle>
                <p className="text-xs text-zinc-400 mt-0.5">
                  One-click review and decision workflow with instant balance adjustment.
                </p>
              </div>
              <Link
                href="/leave"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
              >
                All Requests <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {pendingItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400 space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-70 mb-2" />
                  <p className="font-semibold text-zinc-200">Inbox Zero!</p>
                  <p>All employee leave requests and attendance adjustments have been reviewed.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Request Type</TableHead>
                      <TableHead>Dates & Duration</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                        <TableCell className="font-medium text-xs text-zinc-100">
                          <div className="flex items-center gap-2">
                            <Avatar name={item.employeeName} id={item.employeeId} size="sm" />
                            <div>
                              <div>{item.employeeName}</div>
                              <span className="block text-[10px] text-zinc-400 font-mono">
                                {item.employeeId}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.sourceType === "LEAVE" ? "info" : "warning"}
                            size="sm"
                          >
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-300">
                          {item.details}
                        </TableCell>
                        <TableCell className="text-xs text-zinc-400 max-w-xs truncate">
                          {item.reason}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/40 text-xs px-2 py-1"
                              icon={Check}
                              onClick={() => handleApprove(item)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-rose-400 hover:bg-rose-950/40 text-xs px-2 py-1"
                              icon={X}
                              onClick={() => handleReject(item)}
                            >
                              Reject
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleDeleteInboxItem(item)}
                              title="Delete / Dismiss request"
                              className="p-1 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Section B: Watchlist Widget */}
        <motion.div variants={itemFadeUp}>
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 flex flex-col items-start gap-1">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-base font-semibold text-zinc-100">
                  Lateness Watchlist
                </CardTitle>
                <Badge variant="warning" size="sm" className="shrink-0">
                  This Month
                </Badge>
              </div>
              <p className="text-xs text-zinc-400">
                Frequent check-ins after 09:15 office threshold.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {lateWatchlist.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar src={emp.avatar} name={emp.name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-100 truncate">
                        {emp.name}
                      </p>
                      <p className="text-[10px] text-zinc-400 truncate">
                        {emp.department} • Avg: {emp.avgCheckIn}
                      </p>
                    </div>
                  </div>

                  <Badge variant="warning" size="sm" className="shrink-0 font-mono">
                    {emp.lateCount}x Late
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Section C: Attendance & Absenteeism Trend Chart (Trigger on Scroll into View) */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={scrollViewport}
        variants={itemFadeUp}
      >
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Weekly Workforce Attendance & Shift Telemetry</CardTitle>
              <p className="text-xs text-zinc-400 mt-0.5">
                Comparison of On-Duty HQ Presence vs Remote Shift Staff across Monday – Friday.
              </p>
            </div>
            <Badge variant="success" dot>Live Sync</Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recharts Smooth Animated Area Chart */}
            <AttendanceTrendChart />

            {/* Department Breakdown Grid */}
            <div className="border-t border-zinc-800/80 pt-4">
              <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
                Presence Ratios by Department
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {departmentAttendance.map((d) => (
                  <div
                    key={d.department}
                    className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2.5"
                  >
                    <div className="font-semibold text-xs text-zinc-200">
                      {d.department}
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Present</span>
                        <span className="font-semibold text-emerald-400">{d.presentRate}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${d.presentRate}%` }}
                        />
                      </div>

                      <div className="flex justify-between pt-1">
                        <span className="text-zinc-400">On Leave</span>
                        <span className="text-indigo-400">{d.leaveRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Absent / Unpaid</span>
                        <span className="text-rose-400">{d.absentRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Onboard Employee Modal */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSaved={loadData}
      />
    </motion.div>
  );
}
