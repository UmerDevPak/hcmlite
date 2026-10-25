"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { payrollService } from "@/services/payrollService";
import { employeeService } from "@/services/employeeService";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

export function RunPayrollModal({ isOpen, onClose, onCompleted }) {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const [loading, setLoading] = useState(false);

  const [period, setPeriod] = useState("Oct 16, 2026 - Oct 31, 2026");
  const [payDate, setPayDate] = useState("2026-10-31");

  const handleRun = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const employees = await employeeService.getAllEmployees();
      const run = await payrollService.runPayroll({
        period,
        payDate,
        processedBy: user?.displayName || "Sarah Connor",
        employees,
      });

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });

      notifySuccess("Payroll Executed Successfully", `Generated payslips for ${run.employeeCount} employees.`);
      onCompleted();
      onClose();
    } catch (err) {
      notifyError("Payroll execution failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Execute Payroll Batch"
      description="Calculate wages, tax withholdings, and ACH direct deposit vouchers."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleRun} className="space-y-4">
        <Input
          label="Pay Period Range"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          placeholder="e.g. Oct 16, 2026 - Oct 31, 2026"
          required
        />

        <Input
          label="Direct Deposit Settlement Date"
          type="date"
          value={payDate}
          onChange={(e) => setPayDate(e.target.value)}
          required
        />

        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-400">Target Workforce</span>
            <span className="font-semibold text-zinc-200">8 Active Personnel</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Calculation Engine</span>
            <span className="font-mono text-zinc-300">Gross = Basic × 1.5 (Tax Slabs)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Lock Policy</span>
            <span className="text-amber-400 font-medium">Permanently Locked upon Finalization</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Direct Deposit</span>
            <span className="text-emerald-400 font-medium">Automated NACHA File</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Execute & Disburse
          </Button>
        </div>
      </form>
    </Modal>
  );
}
