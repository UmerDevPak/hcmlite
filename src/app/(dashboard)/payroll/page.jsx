"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { containerStagger, itemFadeUp, scrollViewport } from "@/lib/animationVariants";
import {
  CreditCard,
  Plus,
  FileSpreadsheet,
  Download,
  Eye,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  PieChart,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { payrollService } from "@/services/payrollService";
import { employeeService } from "@/services/employeeService";
import { formatCurrency, formatDate, exportToCSV } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRouter } from "next/navigation";
import { RunPayrollModal } from "@/components/payroll/RunPayrollModal";
import { PayslipModal } from "@/components/payroll/PayslipModal";

export default function PayrollPage() {
  const router = useRouter();
  const { user, isAdmin, isHR, loading: authLoading } = useAuth();
  const { notifySuccess } = useNotification();

  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [selectedRunInfo, setSelectedRunInfo] = useState(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

  const isManagement = isAdmin || isHR;

  const fetchPayroll = async () => {
    try {
      const data = await payrollService.getAllPayrollRuns();
      setRuns(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  if (!authLoading && !user) {
    return null;
  }

  const handleInspectPayslip = async (run) => {
    // If run has payslips, show current user's or the first employee's payslip
    if (run.payslips && run.payslips.length > 0) {
      const targetEmp = run.payslips.find((p) => p.employeeId === user?.employeeId) || run.payslips[0];
      setSelectedPayslip(targetEmp);
      setSelectedRunInfo(run);
      setIsPayslipModalOpen(true);
    } else {
      // Mock generate
      const emp = await employeeService.getEmployeeById(user?.employeeId || "EMP-001");
      const breakdown = await payrollService.calculateEmployeePayroll(emp || { annualSalary: 185000 });
      setSelectedPayslip({
        employeeId: emp?.id || "EMP-001",
        employeeName: emp?.name || user?.displayName || "Sarah Connor",
        jobTitle: emp?.jobTitle || "VP of People",
        department: emp?.department || "Human Resources",
        ...breakdown,
      });
      setSelectedRunInfo(run);
      setIsPayslipModalOpen(true);
    }
  };

  const handleExportPayroll = (run) => {
    exportToCSV(`payroll-run-${run.id}`, [run], {
      id: "Batch ID",
      period: "Pay Period",
      payDate: "Disbursement Date",
      totalGross: "Total Gross ($)",
      totalTaxes: "Total Taxes ($)",
      totalDeductions: "Total Deductions ($)",
      totalNet: "Net Disbursed ($)",
      employeeCount: "Headcount",
      processedBy: "Processed By",
    });
    notifySuccess("Export Ready", `Exported direct deposit file for batch ${run.id}.`);
  };

  const latestGross = runs[0]?.totalGross || 48250;
  const latestNet = runs[0]?.totalNet || 35120.45;
  const latestTaxes = runs[0]?.totalTaxes || 10425.3;
  const latestDeductions = runs[0]?.totalDeductions || Math.max(0, latestGross - latestNet - latestTaxes);
  const netPercent = Math.round((latestNet / latestGross) * 100) || 72;
  const taxPercent = Math.round((latestTaxes / latestGross) * 100) || 22;
  const deductPercent = Math.max(0, 100 - netPercent - taxPercent);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerStagger}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={itemFadeUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {isManagement ? "Payroll Processing & Direct Deposit" : "My Earnings Statements & Payslip History"}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {isManagement
              ? "Automated gross-to-net tax calculations, direct deposit vouchers, and compliance reports."
              : "Official bi-weekly pay vouchers, federal & state tax withholdings, and compensation statements."}
          </p>
        </div>

        {isAdmin && (
          <Button size="sm" icon={Plus} onClick={() => setIsRunModalOpen(true)}>
            Execute Payroll Batch
          </Button>
        )}
      </motion.div>

      {/* KPI Stats (Staggered Pop-In) */}
      <motion.div
        variants={containerStagger}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemFadeUp}>
          <StatCard
            title={isManagement ? "Last Run Disbursed (Net)" : "Latest Net Paycheck"}
            value={formatCurrency(isManagement ? (runs[0]?.totalNet || 35120.45) : (runs[0]?.payslips?.[0]?.netSalary || 5640))}
            subtext={isManagement ? `Gross: ${formatCurrency(runs[0]?.totalGross || 48250)}` : "Disbursed via Direct Deposit"}
            icon={CreditCard}
            iconColor="text-indigo-400"
            iconBg="bg-indigo-500/10"
          />
        </motion.div>

        <motion.div variants={itemFadeUp}>
          <StatCard
            title="Withholding & Taxes"
            value={formatCurrency(isManagement ? (runs[0]?.totalTaxes || 10425.3) : (runs[0]?.payslips?.[0]?.taxWithheld || 1280))}
            subtext="Federal, FICA, and State"
            icon={DollarSign}
            iconColor="text-rose-400"
            iconBg="bg-rose-500/10"
          />
        </motion.div>

        <motion.div variants={itemFadeUp}>
          <StatCard
            title={isManagement ? "Completed Batches" : "Direct Deposit Account"}
            value={isManagement ? runs.length : "Verified (Active)"}
            subtext={isManagement ? "100% on-time settlement" : "Chase Bank (•••• 4821)"}
            icon={CheckCircle2}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/10"
          />
        </motion.div>

        <motion.div variants={itemFadeUp}>
          <StatCard
            title="Next Scheduled Cycle"
            value="Oct 31, 2026"
            subtext="Bi-weekly cadence"
            icon={TrendingUp}
            iconColor="text-purple-400"
            iconBg="bg-purple-500/10"
          />
        </motion.div>
      </motion.div>

      {/* Gross-to-Net Capital Allocation Telemetry Bar (Trigger on Scroll into View) */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={scrollViewport}
        variants={itemFadeUp}
        whileHover={{ y: -3, transition: { duration: 0.16 } }}
        className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
                Gross-to-Net Capital Distribution
              </h3>
              <p className="text-[11px] text-zinc-400">
                Active settlement breakdown across take-home wages, tax withholdings, and statutory reserves.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-zinc-300">
            Total Batch: {formatCurrency(latestGross)}
          </span>
        </div>

        {/* Multi-segment Animated Progress Bar */}
        <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden flex gap-1 p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${netPercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
            title={`Net Take-Home: ${netPercent}%`}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${taxPercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400"
            title={`Tax Withholdings: ${taxPercent}%`}
          />
          {deductPercent > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${deductPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
              title={`Voluntary Deductions: ${deductPercent}%`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-zinc-400 text-[11px]">Net Take-Home:</span>
            <span className="font-mono font-semibold text-emerald-400">{formatCurrency(latestNet)} ({netPercent}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="text-zinc-400 text-[11px]">Tax Withholding:</span>
            <span className="font-mono font-semibold text-rose-400">{formatCurrency(latestTaxes)} ({taxPercent}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-zinc-400 text-[11px]">Benefits & Reserves:</span>
            <span className="font-mono font-semibold text-amber-400">{formatCurrency(latestDeductions)} ({deductPercent}%)</span>
          </div>
        </div>
      </motion.div>

      {/* Runs Table (Trigger on Scroll into View) */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={scrollViewport}
        variants={itemFadeUp}
      >
        <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>
            {isManagement ? "Historical Payroll Disbursal Batches" : "My Historical Payslips & Compensation Ledger"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {runs.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={CreditCard}
                title="Oops! There is nothing to see here"
                description="No payroll batches found. Click 'Run Payroll' to initiate a new calculation batch."
                actionLabel={isAdmin ? "Run Payroll Batch" : undefined}
                onAction={isAdmin ? () => setIsRunModalOpen(true) : undefined}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                  <TableRow>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Pay Period</TableHead>
                    <TableHead>Settlement Date</TableHead>
                    <TableHead>Personnel</TableHead>
                    <TableHead>Gross Wages</TableHead>
                    <TableHead>Net Disbursed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                        {r.id}
                      </TableCell>
                      <TableCell className="font-medium text-zinc-800 dark:text-zinc-200">
                        {r.period}
                      </TableCell>
                      <TableCell className="text-zinc-400 text-xs">
                        {formatDate(r.payDate)}
                      </TableCell>
                      <TableCell className="text-zinc-300">
                        {r.employeeCount} active
                      </TableCell>
                      <TableCell className="font-mono font-medium text-zinc-300">
                        {formatCurrency(r.totalGross)}
                      </TableCell>
                      <TableCell className="font-mono font-bold text-emerald-400">
                        {formatCurrency(r.totalNet)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="success" dot>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={() => handleInspectPayslip(r)}
                          >
                            Payslip
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Download}
                            onClick={() => handleExportPayroll(r)}
                          >
                            Direct Deposit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </motion.div>

      {/* Modals */}
      <RunPayrollModal
        isOpen={isRunModalOpen}
        onClose={() => setIsRunModalOpen(false)}
        onCompleted={fetchPayroll}
      />

      <PayslipModal
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        payslip={selectedPayslip}
        runInfo={selectedRunInfo}
      />
    </motion.div>
  );
}
