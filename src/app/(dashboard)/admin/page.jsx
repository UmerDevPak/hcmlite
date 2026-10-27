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
  Plus,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/lib/constants";
import { reportService } from "@/services/reportService";
import { formatCurrency } from "@/lib/utils";
import { containerStagger, itemFadeUp } from "@/lib/animationVariants";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmployeeModal } from "@/components/employees/EmployeeModal";
import { WorkforceDistributionChart } from "@/components/charts/WorkforceDistributionChart";
import { WorkforceTenureChart } from "@/components/charts/WorkforceTenureChart";

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
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerStagger}
      className="space-y-6"
    >
      {/* 1. Header Card with Smooth Pop-In */}
      <motion.div
        variants={itemFadeUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-indigo-950/40 border border-zinc-800 shadow-elevated"
      >
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-glow shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-50">
              Enterprise Admin Portal
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live System Active
            </span>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            Welcome back, {user?.displayName || "Super Admin"}. Real-time analytics, automated payroll distributions, and synchronized workforce telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
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
      </motion.div>

      {/* 2. Top KPI Metric Cards (Staggered Children with Pop-In) */}
      <motion.div
        variants={containerStagger}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemFadeUp}>
          <StatCard
            title="Total Active Headcount"
            value={activeHeadcount || 0}
            change="+8.3%"
            changeType="positive"
            subtext="Net positive growth vs last quarter"
            icon={Users}
          />
        </motion.div>

        <motion.div variants={itemFadeUp}>
          <StatCard
            title="Attrition Rate YTD"
            value={`${attritionRate || 2.4}%`}
            change="-0.6%"
            changeType="positive"
            subtext="Healthy retention benchmark"
            icon={TrendingDown}
          />
        </motion.div>

        <motion.div variants={itemFadeUp}>
          <StatCard
            title="Total Monthly Payroll Cost"
            value={formatCurrency(totalMonthlyPayroll || 0)}
            change="+3.1%"
            changeType="neutral"
            subtext="Gross formula (Basic × 1.5)"
            icon={CreditCard}
          />
        </motion.div>

        <motion.div variants={itemFadeUp}>
          <StatCard
            title="Average Salary"
            value={formatCurrency(averageSalary || 0)}
            changeType="neutral"
            subtext="Across all company divisions"
            icon={DollarSign}
          />
        </motion.div>
      </motion.div>

      {/* 3. Visual Breakdown Grid with Interactive Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Workforce Distribution & Payroll Allocation Chart */}
        <motion.div variants={itemFadeUp} className="lg:col-span-2">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Department Headcount & Monthly Payroll Allocation</CardTitle>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Interactive real-time breakdown with animated morphing between Bar and Donut views.
                </p>
              </div>
              <Link
                href="/employees"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 shrink-0"
              >
                View Directory <ExternalLink className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {/* Interactive Recharts Component with smooth morphing */}
              <WorkforceDistributionChart
                departmentStats={departmentStats}
                totalHeadcount={totalHeadcount}
              />

              {/* Sequential Staggered Department List */}
              <div className="border-t border-zinc-800/80 pt-4 space-y-3">
                <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Division Personnel Detail
                </div>
                <motion.div
                  variants={containerStagger}
                  className="space-y-2.5"
                >
                  {departmentStats.map((dept) => {
                    const headcountPercent = Math.round(
                      (dept.headcount / totalHeadcount) * 100
                    );
                    return (
                      <motion.div
                        key={dept.name}
                        variants={itemFadeUp}
                        className="p-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800/40 transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-zinc-200">{dept.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-400">
                              {dept.headcount} {dept.headcount === 1 ? "member" : "members"} (
                              {headcountPercent}%)
                            </span>
                            <span className="font-mono font-semibold text-emerald-400">
                              {formatCurrency(dept.totalSalary)}/mo
                            </span>
                          </div>
                        </div>
                        {/* Animated Progress Bar */}
                        <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(headcountPercent, 6)}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Demographic Retention & Tenure Chart */}
        <motion.div variants={itemFadeUp}>
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="pb-3 flex flex-col items-start gap-1">
              <CardTitle>Workforce Tenure Distribution</CardTitle>
              <p className="text-xs text-zinc-400">
                Staff longevity, new hire onboarding, and seniority telemetry.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Recharts Tenure Ring & Breakdown */}
              <WorkforceTenureChart
                tenureStats={tenureStats}
                totalEmployees={totalHeadcount}
              />

              <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-950/20 text-xs text-indigo-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Administrative Policy Compliance
                </div>
                <p className="text-[11px] text-zinc-400">
                  Shift policies (09:00 start with 15m grace), tax slabs, and statutory leave quotas (14 Annual, 8 Sick, 10 Casual) are active and verified.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 4. Live Audit Feed Card with Motion */}
      <motion.div variants={itemFadeUp}>
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
