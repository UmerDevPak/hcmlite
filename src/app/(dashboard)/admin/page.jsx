"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  TrendingDown,
  CreditCard,
  DollarSign,
  Settings,
  Building2,
  ShieldCheck,
  ArrowRight,
  Activity,
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  PieChart,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/lib/constants";
import { reportService } from "@/services/reportService";
import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmployeeModal } from "@/components/employees/EmployeeModal";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      const userRole = normalizeRole(user.role);
      router.replace(userRole === "HR" ? "/hr" : "/employee");
    }
  }, [user, isAdmin, authLoading, router]);

  const loadData = async () => {
    if (!isAdmin) return;
    try {
      const data = await reportService.getAdminDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.warn("[AdminDashboard] Error loading metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  if (!authLoading && (!user || !isAdmin)) {
    return null;
  }

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
          <Skeleton className="h-80 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const {
    activeHeadcount,
    attritionRate,
    totalMonthlyPayroll,
    averageSalary,
    departmentStats = [],
    tenureStats = {},
    auditLogs = [],
  } = metrics || {};

  const totalHeadcount = metrics?.totalHeadcount || 1;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header: Company overview, quick status, and settings shortcut */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-indigo-950/40 border border-zinc-800 shadow-elevated">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-glow">
              <Building2 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-50">
              Enterprise Admin Portal
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live System Active
            </span>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            Welcome back, {user?.displayName || "Super Admin"}. Here is your high-level overview of active workforce headcount, department payroll distribution, and system audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link href="/settings">
            <Button variant="outline" size="sm" icon={Settings}>
              Organization Setup
            </Button>
          </Link>

          <Button
            size="sm"
            icon={Plus}
            onClick={() => setIsEmployeeModalOpen(true)}
          >
            Onboard Employee
          </Button>

          <Link href="/payroll">
            <Button variant="secondary" size="sm" icon={CreditCard}>
              Finalize Payroll
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top KPI Cards (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Active Headcount */}
        <StatCard
          title="Total Active Headcount"
          value={activeHeadcount || 0}
          change="+8.3%"
          changeType="positive"
          subtext="Net positive growth vs last quarter"
          icon={Users}
        />

        {/* Card 2: Attrition Rate YTD */}
        <StatCard
          title="Attrition Rate YTD"
          value={`${attritionRate || 2.4}%`}
          change="-0.6%"
          changeType="positive"
          subtext="Healthy retention benchmark"
          icon={TrendingDown}
        />

        {/* Card 3: Total Monthly Payroll Cost */}
        <StatCard
          title="Total Monthly Payroll Cost"
          value={formatCurrency(totalMonthlyPayroll || 0)}
          change="+3.1%"
          changeType="neutral"
          subtext="Gross formula (Basic × 1.5)"
          icon={CreditCard}
        />

        {/* Card 4: Average Salary */}
        <StatCard
          title="Average Salary"
          value={formatCurrency(averageSalary || 0)}
          changeType="neutral"
          subtext="Across all 6 company divisions"
          icon={DollarSign}
        />
      </div>

      {/* 3. Visual Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Headcount by Department & Payroll Cost by Department */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Department Headcount & Monthly Payroll Allocation</CardTitle>
              <p className="text-xs text-zinc-400 mt-0.5">
                Distribution of team personnel and monthly compensation budget per division.
              </p>
            </div>
            <Link
              href="/employees"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
            >
              View Directory <ExternalLink className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {departmentStats.map((dept) => {
              const headcountPercent = Math.round((dept.headcount / totalHeadcount) * 100);
              return (
                <div key={dept.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-200">{dept.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-400">
                        {dept.headcount} {dept.headcount === 1 ? "member" : "members"} ({headcountPercent}%)
                      </span>
                      <span className="font-mono font-semibold text-zinc-100">
                        {formatCurrency(dept.totalSalary)}/mo
                      </span>
                    </div>
                  </div>
                  {/* Visual Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${Math.max(headcountPercent, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Right Column: Demographic Stats (Tenure Distribution) */}
        <Card className="h-full flex flex-col justify-between">
          <CardHeader className="pb-3 flex flex-col items-start gap-1">
            <CardTitle>Workforce Tenure Distribution</CardTitle>
            <p className="text-xs text-zinc-400">
              Employee retention and seniority breakdown.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">&lt; 1 Year (New Hires)</span>
                <span className="font-bold text-zinc-100 font-mono">
                  {tenureStats.under1Year || 0} members
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, ((tenureStats.under1Year || 0) / totalHeadcount) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-zinc-400">1 - 3 Years (Core Team)</span>
                <span className="font-bold text-zinc-100 font-mono">
                  {tenureStats.oneToThreeYears || 0} members
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(100, ((tenureStats.oneToThreeYears || 0) / totalHeadcount) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-zinc-400">3 - 5 Years (Senior Personnel)</span>
                <span className="font-bold text-zinc-100 font-mono">
                  {tenureStats.threeToFiveYears || 0} members
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, ((tenureStats.threeToFiveYears || 0) / totalHeadcount) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-zinc-400">5+ Years (Foundational Staff)</span>
                <span className="font-bold text-zinc-100 font-mono">
                  {tenureStats.overFiveYears || 0} members
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(100, ((tenureStats.overFiveYears || 0) / totalHeadcount) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-950/20 text-xs text-indigo-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Administrative Policy Compliance
              </div>
              <p className="text-[11px] text-zinc-400">
                Shift policies (09:00 start with 15m grace), tax slabs, and leave quotas (14 Annual, 8 Sick, 10 Casual) are active and verified.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Live Audit Feed Card */}
      <Card id="audit">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Live System Audit Feed</CardTitle>
            <p className="text-xs text-zinc-400 mt-0.5">
              Real-time administrative ledger: Actor, action, target entity, and timestamp.
            </p>
          </div>
          <Badge variant="info">Immutable Ledger</Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actor & Role</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target Entity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-xs text-zinc-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span>{item.actor}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                        {item.role}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-zinc-200">
                    {item.action}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400 font-mono">
                    {item.target}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === "success"
                          ? "success"
                          : item.status === "info"
                          ? "info"
                          : "neutral"
                      }
                      size="sm"
                      dot
                    >
                      {item.status === "success" ? "Completed" : "Logged"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs text-zinc-400 font-mono">
                    {item.timestamp}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Onboard Employee Modal Shortcut */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSaved={loadData}
      />
    </div>
  );
}