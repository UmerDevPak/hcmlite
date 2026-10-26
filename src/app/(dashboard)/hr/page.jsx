"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Check,
  X,
  UserCheck,
  AlertTriangle,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { reportService } from "@/services/reportService";
import { leaveService } from "@/services/leaveService";
import { formatDate } from "@/lib/utils";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmployeeModal } from "@/components/employees/EmployeeModal";

export default function HrDashboardPage() {
  const { user } = useAuth();
  const { notifySuccess, notifyInfo, notifyError } = useNotification();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingItems, setPendingItems] = useState([]);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const data = await reportService.getHrDashboardMetrics();
      setMetrics(data);
      // Combine pending leaves and attendance corrections into one unified action inbox
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
      }
      setPendingItems((prev) => prev.filter((p) => p.id !== item.id));
      notifySuccess("Request Approved", `${item.employeeName}'s ${item.category} has been approved.`);
    } catch (err) {
      notifyError("Action failed", err.message);
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
      }
      setPendingItems((prev) => prev.filter((p) => p.id !== item.id));
      notifyInfo("Request Rejected", `${item.employeeName}'s ${item.category} has been declined.`);
    } catch (err) {
      notifyError("Action failed", err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header: People Operations Dashboard with date and Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-emerald-950/30 border border-zinc-800 shadow-elevated">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-glow">
              <UserCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-50">
              People Operations Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {formatDate(new Date().toISOString())}
            </span>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            Real-time daily presence, shift check-ins, pending employee approvals, and lateness tracking for people teams.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
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
      </div>

      {/* 2. Daily Snapshot Cards (5 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Employees */}
        <Card className="p-4 flex flex-col justify-between h-full min-h-[120px] transition-all hover:border-zinc-700/80">
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
        </Card>

        {/* Card 2: Present Today */}
        <Card className="p-4 flex flex-col justify-between h-full min-h-[120px] transition-all hover:border-zinc-700/80">
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
              <span>{Math.round((presentToday / totalEmployees) * 100)}% attendance rate</span>
            </div>
          </div>
        </Card>

        {/* Card 3: Late Today */}
        <Card className="p-4 flex flex-col justify-between h-full min-h-[120px] transition-all hover:border-zinc-700/80">
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
        </Card>

        {/* Card 4: On Leave Today */}
        <Card className="p-4 flex flex-col justify-between h-full min-h-[120px] transition-all hover:border-zinc-700/80">
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
        </Card>

        {/* Card 5: Pending Approvals */}
        <Card className="p-4 flex flex-col justify-between h-full min-h-[120px] transition-all hover:border-zinc-700/80">
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
        </Card>
      </div>

      {/* 3. Operational Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section A: Pending Action Inbox (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Pending Action Inbox</CardTitle>
              <p className="text-xs text-zinc-400 mt-0.5">
                One-click review and decision workflow for employee leaves and attendance adjustments.
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
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-xs text-zinc-100">
                        {item.employeeName}
                        <span className="block text-[10px] text-zinc-400 font-mono">
                          {item.employeeId}
                        </span>
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Section B: Watchlist Widget (Top 5 frequent late-comers) */}
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
      </div>

      {/* Section C: Attendance & Absenteeism summary by department */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Attendance & Absenteeism Summary by Department</CardTitle>
          <p className="text-xs text-zinc-400 mt-0.5">
            Operational presence distribution and sick/casual absence ratios across teams.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
        </CardContent>
      </Card>

      {/* Onboard Employee Modal */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSaved={loadData}
      />
    </div>
  );
}