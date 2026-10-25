"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Users,
  Building,
  Laptop,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { attendanceService } from "@/services/attendanceService";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AttendancePage() {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [todayPunch, setTodayPunch] = useState(null);
  const [locationType, setLocationType] = useState("Office (HQ)");
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const refreshData = async () => {
    const [allRecords, currentStats, punch] = await Promise.all([
      attendanceService.getTodayRecords(),
      attendanceService.getAttendanceStats(),
      attendanceService.getEmployeeTodayRecord(user?.employeeId || "EMP-001"),
    ]);
    setRecords(allRecords);
    setStats(currentStats);
    setTodayPunch(punch);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const handlePunchIn = async () => {
    setLoading(true);
    try {
      const punch = await attendanceService.clockIn({
        employeeId: user?.employeeId || "EMP-001",
        employeeName: user?.displayName || "Admin User",
        location: locationType,
      });
      setTodayPunch(punch);
      notifySuccess("Clock In Registered", `Recorded at ${punch.clockIn}`);
      refreshData();
    } catch (err) {
      notifyError("Clock In Rejected", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setLoading(true);
    try {
      const punch = await attendanceService.clockOut({
        employeeId: user?.employeeId || "EMP-001",
      });
      setTodayPunch(punch);
      notifySuccess("Clock Out Registered", `Recorded at ${punch.clockOut}`);
      refreshData();
    } catch (err) {
      notifyError("Clock Out Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const isClockedIn = Boolean(todayPunch?.clockIn && !todayPunch?.clockOut);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Attendance & Time Tracking
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Monitor real-time employee check-ins, remote hours, and shift compliance.
        </p>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="On-Duty Present"
          value={stats?.present || 7}
          subtext="Checked in today"
          icon={CheckCircle2}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          title="On Planned Leave"
          value={stats?.onLeave || 1}
          subtext="Approved absence"
          icon={Calendar}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats?.presentRate || 88}%`}
          subtext="Target: >85%"
          icon={Clock}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/10"
        />
        <StatCard
          title="Active Workforce"
          value={stats?.totalEmployees || 8}
          subtext="Headcount tracked"
          icon={Users}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10"
        />
      </div>

      {/* Punch Clock Station Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Clock className="w-3.5 h-3.5" />
              Live Terminal
            </div>
            <div className="text-4xl font-extrabold tracking-tight font-mono text-zinc-900 dark:text-zinc-50">
              {currentTime || "09:30:00 AM"}
            </div>
            <p className="text-xs text-zinc-400">
              Logged as <strong>{user?.displayName}</strong> ({user?.jobTitle})
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Work location choice */}
            <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800 p-1 bg-zinc-100 dark:bg-zinc-900 text-xs">
              <button
                type="button"
                onClick={() => setLocationType("Office (HQ)")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  locationType === "Office (HQ)"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Building className="w-3.5 h-3.5" /> Office
              </button>
              <button
                type="button"
                onClick={() => setLocationType("Remote")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  locationType === "Remote"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Laptop className="w-3.5 h-3.5" /> Remote
              </button>
            </div>

            {/* Punch action */}
            {!isClockedIn ? (
              <Button
                variant="primary"
                size="lg"
                icon={Clock}
                isLoading={loading}
                onClick={handlePunchIn}
              >
                Punch Clock In
              </Button>
            ) : (
              <Button
                variant="danger"
                size="lg"
                icon={Clock}
                isLoading={loading}
                onClick={handlePunchOut}
              >
                Punch Clock Out
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Attendance Log Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Today&apos;s Attendance Ledger</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {records.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Clock}
                title="Oops! There is nothing to see here"
                description="No employee attendance records logged yet for today. Use the terminal above to punch in."
                actionLabel="Punch Clock In"
                onAction={handlePunchIn}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Total Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={r.employeeName} size="sm" />
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {r.employeeName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.status === "Present"
                              ? "success"
                              : r.status === "On Leave"
                              ? "warning"
                              : "danger"
                          }
                          dot
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-400">{r.location}</TableCell>
                      <TableCell className="font-mono text-zinc-200">
                        {r.clockIn || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-zinc-200">
                        {r.clockOut || (r.clockIn ? "Working..." : "—")}
                      </TableCell>
                      <TableCell className="font-mono text-zinc-400">
                        {r.totalHours || (r.clockIn ? "In progress" : "0 hrs")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
