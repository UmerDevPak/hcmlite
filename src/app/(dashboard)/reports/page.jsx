"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  Users,
  DollarSign,
  TrendingUp,
  PieChart,
  Calendar,
  Building,
} from "lucide-react";
import { reportService } from "@/services/reportService";
import { employeeService } from "@/services/employeeService";
import { useNotification } from "@/context/NotificationContext";
import { formatCurrency, exportToCSV } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";

export default function ReportsPage() {
  const { notifySuccess } = useNotification();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getExecutiveDashboardMetrics().then((m) => {
      setMetrics(m);
      setLoading(false);
    });
  }, []);

  const handleExportFullAudit = async () => {
    const employees = await employeeService.getAllEmployees();
    exportToCSV(`enterprise-hr-audit-${new Date().toISOString().split("T")[0]}`, employees, {
      id: "Employee ID",
      name: "Full Name",
      email: "Email Address",
      department: "Department",
      jobTitle: "Title",
      role: "System Role",
      annualSalary: "Salary ($)",
      hireDate: "Hire Date",
      status: "Status",
    });
    notifySuccess("Audit File Generated", "Comprehensive HR audit report downloaded.");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Reports & Executive Analytics
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Workforce metrics, department budget allocations, attrition rates, and audit extracts.
          </p>
        </div>

        <Button size="sm" icon={Download} onClick={handleExportFullAudit}>
          Export Enterprise Audit
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Workforce Size"
          value={metrics?.headcount?.total || 8}
          change="+12.5%"
          isPositive={true}
          subtext="Net positive headcount change"
          icon={Users}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/10"
        />

        <StatCard
          title="Average Compensation"
          value={formatCurrency(162500)}
          subtext="Annual median salary"
          icon={DollarSign}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />

        <StatCard
          title="Quarterly Attrition"
          value="0.0%"
          isPositive={true}
          change="0 Leavers"
          subtext="High retention benchmark"
          icon={TrendingUp}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10"
        />

        <StatCard
          title="Attendance Reliability"
          value={`${metrics?.attendance?.presentRate || 88}%`}
          subtext="Across all office and remote teams"
          icon={Calendar}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
        />
      </div>

      {/* Department Distribution Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Department Headcount Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(metrics?.departmentDistribution || {}).map(([dept, count]) => {
              const total = metrics?.headcount?.total || 8;
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={dept} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-300">{dept}</span>
                    <span className="text-zinc-400">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget & Payroll Spend Allocation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Engineering & Tech</span>
                <span className="font-mono font-medium text-zinc-200">55.2% ($26,634 / run)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Product & Design</span>
                <span className="font-mono font-medium text-zinc-200">22.8% ($11,000 / run)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">People & Talent</span>
                <span className="font-mono font-medium text-zinc-200">14.1% ($6,802 / run)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-400">Finance & Operations</span>
                <span className="font-mono font-medium text-zinc-200">7.9% ($3,814 / run)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-800 text-xs text-zinc-400">
              💡 <strong>Executive Insight:</strong> Engineering represents the largest capital allocation, maintaining average compensation at competitive market 75th percentile.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
