"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Printer, Download, Building2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export function PayslipModal({ isOpen, onClose, payslip, runInfo }) {
  if (!isOpen || !payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Employee Earnings Statement (Payslip)"
      description={`Pay Period: ${runInfo?.period || "Oct 01 - Oct 15, 2026"} • Disbursed ${runInfo?.payDate || "2026-10-15"}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 text-xs">
        {/* Company & Employee Header */}
        <div className="flex items-start justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100">
              <Building2 className="w-4 h-4 text-indigo-500" />
              HCM Lite Corporation
            </div>
            <p className="text-zinc-400">100 Market St, Suite 400, San Francisco, CA</p>
            <p className="text-zinc-400 font-mono">EIN: 94-3829102</p>
          </div>

          <div className="text-right space-y-1">
            <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              {payslip.employeeName}
            </div>
            <p className="text-zinc-400">{payslip.jobTitle} • {payslip.department}</p>
            <p className="text-zinc-400 font-mono">ID: {payslip.employeeId}</p>
          </div>
        </div>

        {/* Earnings & Deductions Tables (PROJECT_SPEC.md Rule 6) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Earnings: Gross = Basic * 1.5 (40% HRA, 10% Medical) */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
            <h4 className="font-semibold uppercase tracking-wider text-zinc-400 text-[11px]">
              Gross Earnings (Basic × 1.5)
            </h4>
            <div className="space-y-1.5">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span>Basic Salary</span>
                <span className="font-mono font-medium">{formatCurrency(payslip.basicSalary || payslip.periodGross / 1.5)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span>HRA (House Rent Allowance 40%)</span>
                <span className="font-mono font-medium">{formatCurrency(payslip.hra || (payslip.basicSalary || payslip.periodGross / 1.5) * 0.4)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                <span>Medical Allowance (10%)</span>
                <span className="font-mono font-medium">{formatCurrency(payslip.medical || (payslip.basicSalary || payslip.periodGross / 1.5) * 0.1)}</span>
              </div>
              <div className="flex justify-between py-1 font-semibold text-zinc-900 dark:text-zinc-100 pt-1">
                <span>Total Monthly Gross</span>
                <span className="font-mono text-indigo-400">{formatCurrency(payslip.totalGross)}</span>
              </div>
            </div>
          </div>

          {/* Deductions: Attendance Penalties + Tax Slabs */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
            <h4 className="font-semibold uppercase tracking-wider text-zinc-400 text-[11px]">
              Deductions & Tax Slabs
            </h4>
            <div className="space-y-1.5">
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-400">Attendance Penalty (Absent/Unpaid/Half-days)</span>
                <span className="font-mono text-rose-400">{formatCurrency(payslip.attendanceDeduction || 0)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-400">Annualized Income Tax Slab</span>
                <span className="font-mono">{formatCurrency(payslip.tax || payslip.totalTaxes)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-zinc-400">Per-Day Wage Rate</span>
                <span className="font-mono text-zinc-400">{formatCurrency(payslip.perDayDeduction || payslip.totalGross / 22)}/day</span>
              </div>
              <div className="flex justify-between py-1 font-semibold text-zinc-900 dark:text-zinc-100 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <span>Total Deductions</span>
                <span className="font-mono text-rose-400">{formatCurrency(payslip.totalDeductions)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Pay Callout */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold">Net Pay Distribution</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Direct deposit to Chase Bank NA ending in 4481</div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {formatCurrency(payslip.netPay)}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint}>
            Print Statement
          </Button>
          <Button size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
