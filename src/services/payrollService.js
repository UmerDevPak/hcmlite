/**
 * @file payrollService.js
 * @description Enterprise Payroll Engine & Gross-to-Net Tax Calculation
 * 
 * FORMULA & TAX SLABS:
 * - Gross = Basic * 1.5 (incorporates 40% HRA, 10% Medical allowance)
 * - Per-day wage = Gross / Working Days (default: 22 days)
 * - Attendance Deductions = Absent days + Unpaid leave + (0.5 * Half days)
 * - Tax Slabs (Annualized): 0-100k: 10%, 100k-200k: 20%, 200k+: 30%
 * - Disbursal: Direct deposit generation, payslip vouchers, CSV file export.
 */

import { INITIAL_PAYROLL_RUNS, INITIAL_EMPLOYEES } from "@/lib/seedData";
import { calculatePayrollBreakdown } from "@/lib/utils";
import { OFFICE_SETUP } from "@/lib/constants";

const STORAGE_PAYROLL = "hcm_lite_payroll_runs";

function getRuns() {
  if (typeof window === "undefined") return INITIAL_PAYROLL_RUNS;
  const stored = localStorage.getItem(STORAGE_PAYROLL);
  if (!stored) {
    localStorage.setItem(STORAGE_PAYROLL, JSON.stringify(INITIAL_PAYROLL_RUNS));
    return INITIAL_PAYROLL_RUNS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_PAYROLL_RUNS;
  }
}

function saveRuns(list) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_PAYROLL, JSON.stringify(list));
  }
}

export const payrollService = {
  async getAllPayrollRuns() {
    return getRuns();
  },

  async getPayrollRunById(id) {
    const runs = getRuns();
    return runs.find((r) => r.id === id) || null;
  },

  /**
   * PROJECT_SPEC.md Rule 6:
   * - Gross = Basic * 1.5 (40% HRA, 10% Medical)
   * - Per-day deduction = Gross / Working Days
   * - Deductions: absent + unpaid + (0.5 * half_days)
   * - Tax Slabs (Annualized)
   */
  async calculateEmployeePayroll(employee, attendanceSummary = {}) {
    const annualSalary = employee.annualSalary || 120000;
    const monthlyGross = annualSalary / 12;
    const basicSalary = monthlyGross / 1.5;

    return calculatePayrollBreakdown({
      basicSalary,
      annualSalary,
      workingDays: attendanceSummary.workingDays || OFFICE_SETUP.WORKING_DAYS_PER_MONTH,
      absentDays: attendanceSummary.absentDays || 0,
      unpaidDays: attendanceSummary.unpaidDays || 0,
      halfDays: attendanceSummary.halfDays || 0,
      payFrequency: "monthly",
    });
  },

  /**
   * PROJECT_SPEC.md Rule 6:
   * Finalized runs are permanently locked.
   */
  async runPayroll({
    period,
    payDate,
    processedBy = "Sarah Connor",
    employees = INITIAL_EMPLOYEES,
    attendanceRecords = [],
  }) {
    let totalGross = 0;
    let totalNet = 0;
    let totalTaxes = 0;
    let totalDeductions = 0;

    const payslips = employees.map((emp) => {
      // Find employee attendance penalties
      const empAttendance = attendanceRecords.filter((a) => a.employeeId === emp.id);
      const absentDays = empAttendance.filter((a) => a.status === "Absent").length;
      const unpaidDays = empAttendance.filter((a) => a.status === "Unpaid").length;
      const halfDays = empAttendance.filter((a) => a.isHalfDay || a.status === "Half-Day").length;

      const annualSalary = emp.annualSalary || 120000;
      const monthlyGross = annualSalary / 12;
      const basicSalary = monthlyGross / 1.5;

      const breakdown = calculatePayrollBreakdown({
        basicSalary,
        annualSalary,
        workingDays: OFFICE_SETUP.WORKING_DAYS_PER_MONTH,
        absentDays,
        unpaidDays,
        halfDays,
        payFrequency: "monthly",
      });

      totalGross += breakdown.totalGross;
      totalNet += breakdown.netPay;
      totalTaxes += breakdown.totalTaxes;
      totalDeductions += breakdown.totalDeductions;

      return {
        payslipId: `PS-${emp.id}-${Date.now().toString().slice(-4)}`,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        jobTitle: emp.jobTitle,
        bankDetails: emp.bankDetails,
        ...breakdown,
      };
    });

    const newRun = {
      id: `PR-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      period: period || "Oct 01, 2026 - Oct 31, 2026",
      payDate: payDate || new Date().toISOString().split("T")[0],
      status: "Finalized", // Rule 6: Finalized runs are permanently locked
      isLocked: true, // Permanent lock
      totalGross: Number(totalGross.toFixed(2)),
      totalNet: Number(totalNet.toFixed(2)),
      totalTaxes: Number(totalTaxes.toFixed(2)),
      totalDeductions: Number(totalDeductions.toFixed(2)),
      employeeCount: employees.length,
      processedBy,
      processedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      payslips,
    };

    const runs = getRuns();
    runs.unshift(newRun);
    saveRuns(runs);
    return newRun;
  },

  /**
   * Rule 6: Permanently locked runs cannot be modified or deleted.
   */
  async updatePayrollRun(id, updates) {
    const runs = getRuns();
    const run = runs.find((r) => r.id === id);
    if (!run) throw new Error("Payroll run not found");
    if (run.isLocked || run.status === "Finalized" || run.status === "Completed") {
      const err = new Error("Forbidden: Finalized payroll runs are permanently locked.");
      err.status = 403;
      throw err;
    }
    Object.assign(run, updates);
    saveRuns(runs);
    return run;
  },

  async deletePayrollRun(id) {
    const runs = getRuns();
    const run = runs.find((r) => r.id === id);
    if (!run) throw new Error("Payroll run not found");
    if (run.isLocked || run.status === "Finalized" || run.status === "Completed") {
      const err = new Error("Forbidden: Finalized payroll runs are permanently locked.");
      err.status = 403;
      throw err;
    }
    const filtered = runs.filter((r) => r.id !== id);
    saveRuns(filtered);
    return true;
  },

  async getPayslip(payrollRunId, employeeId) {
    const run = await this.getPayrollRunById(payrollRunId);
    if (!run) return null;
    if (run.payslips) {
      return run.payslips.find((p) => p.employeeId === employeeId) || null;
    }
    return null;
  },
};
