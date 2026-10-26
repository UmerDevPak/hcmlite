"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Plus,
  FileSpreadsheet,
  Download,
  Eye,
  CheckCircle2,
  DollarSign,
  TrendingUp,
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
import { RunPayrollModal } from "@/components/payroll/RunPayrollModal";
import { PayslipModal } from "@/components/payroll/PayslipModal";

export default function PayrollPage() {
  const { user, isAdmin, isHR } = useAuth();
  const { notifySuccess } = useNotification();

  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [selectedRunInfo, setSelectedRunInfo] = useState(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

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
    notifySuccess("Export Ready", `Exported batch ${run.id} to CSV.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Payroll Processing & Direct Deposit
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Automated gross-to-net tax calculations, direct deposit vouchers, and compliance reports.
          </p>
        </div>

        {isAdmin && (
          <Button size="sm" icon={Plus} onClick={() => setIsRunModalOpen(true)}>
            Execute Payroll Batch
          </Button>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Last Run Disbursed (Net)"
          value={formatCurrency(runs[0]?.totalNet || 35120.45)}
          subtext={`Gross: ${formatCurrency(runs[0]?.totalGross || 48250)}`}
          icon={CreditCard}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/10"
        />

        <StatCard
          title="Withholding & Taxes"
          value={formatCurrency(runs[0]?.totalTaxes || 10425.3)}
          subtext="Federal, FICA, and State"
          icon={DollarSign}
          iconColor="text-rose-400"
          iconBg="bg-rose-500/10"
        />

        <StatCard
          title="Completed Batches"
          value={runs.length}
          subtext="100% on-time settlement"
          icon={CheckCircle2}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />

        <StatCard
          title="Next Scheduled Cycle"
          value="Oct 31, 2026"
          subtext="Bi-weekly cadence"
          icon={TrendingUp}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/10"
        />
      </div>

      {/* Runs Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Historical Payroll Disbursal Batches</CardTitle>
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
                            NACHA
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
    </div>
  );
}
