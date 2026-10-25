import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { OFFICE_SETUP } from "./constants";

/**
 * Combines Tailwind class names cleanly using clsx and twMerge.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number to USD currency ($1,234.56).
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

/**
 * Formats date to a human readable format (e.g. Oct 24, 2026).
 */
export function formatDate(dateString) {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Formats date and time (e.g. Oct 24, 2026, 09:30 AM).
 */
export function formatDateTime(dateString) {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Formats a time string (e.g. 09:30 AM).
 */
export function formatTime(dateString) {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Calculates initials from full name.
 */
export function getInitials(name = "") {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generates random unique ID with an optional prefix.
 */
export function generateId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

/**
 * PROJECT_SPEC.md Rule 3:
 * Office starts at 09:00, grace 15m (Late after 09:15).
 */
export function isLateCheckIn(timeStr) {
  if (!timeStr) return false;
  // Parse formats like "09:20 AM", "09:20", "9:20"
  try {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return false;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3] ? match[3].toUpperCase() : null;

    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    const totalMinutes = hours * 60 + minutes;
    const thresholdMinutes = 9 * 60 + 15; // 09:15 AM
    return totalMinutes > thresholdMinutes;
  } catch {
    return false;
  }
}

/**
 * PROJECT_SPEC.md Rule 3:
 * Half-day < 5 hours.
 */
export function isHalfDay(hoursWorked) {
  if (hoursWorked === null || hoursWorked === undefined) return false;
  const h = typeof hoursWorked === "string" ? parseFloat(hoursWorked) : hoursWorked;
  return !isNaN(h) && h > 0 && h < OFFICE_SETUP.HALF_DAY_MIN_HOURS;
}

/**
 * PROJECT_SPEC.md Rule 5:
 * Calculate working days between two dates, skipping weekends (Sat-Sun) and holidays.
 */
export function calculateWorkingDays(startDateStr, endDateStr, holidays = []) {
  try {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;

    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
      const dateIso = current.toISOString().split("T")[0];

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidays.includes(dateIso);

      if (!isWeekend && !isHoliday) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  } catch {
    return 1;
  }
}

/**
 * PROJECT_SPEC.md Rule 6: Tax Slabs (Annualized)
 * 0-600k: 0%
 * 600k-1.2M: 5%
 * 1.2M-2.4M: 30k + 15%
 * 2.4M-3.6M: 210k + 25%
 * >3.6M: 510k + 35%
 */
export function calculateAnnualTaxSlab(annualGross) {
  if (!annualGross || annualGross <= 600000) {
    return 0;
  }
  if (annualGross <= 1200000) {
    return (annualGross - 600000) * 0.05;
  }
  if (annualGross <= 2400000) {
    return 30000 + (annualGross - 1200000) * 0.15;
  }
  if (annualGross <= 3600000) {
    return 210000 + (annualGross - 2400000) * 0.25;
  }
  return 510000 + (annualGross - 3600000) * 0.35;
}

/**
 * PROJECT_SPEC.md Rule 6:
 * - Gross = Basic * 1.5 (40% HRA, 10% Medical)
 * - Per-day deduction = Gross / Working Days
 * - Deductions: absent + unpaid + (0.5 * half_days)
 * - Tax Slabs (Annualized)
 */
export function calculatePayrollBreakdown({
  basicSalary = 0,
  annualSalary = 0,
  workingDays = 22,
  absentDays = 0,
  unpaidDays = 0,
  halfDays = 0,
  payFrequency = "monthly", // monthly (12 runs)
}) {
  // If basicSalary is provided, compute gross = basic * 1.5
  // If annualSalary is provided, basic = (annualSalary / 12) / 1.5
  let monthlyBasic = 0;
  let monthlyGross = 0;

  if (basicSalary > 0) {
    monthlyBasic = basicSalary;
    monthlyGross = monthlyBasic * 1.5;
  } else if (annualSalary > 0) {
    monthlyGross = annualSalary / 12;
    monthlyBasic = monthlyGross / 1.5;
  } else {
    monthlyBasic = 50000;
    monthlyGross = monthlyBasic * 1.5;
  }

  const hra = monthlyBasic * 0.4; // 40% HRA
  const medical = monthlyBasic * 0.1; // 10% Medical

  // Per-day deduction = Gross / Working Days
  const daysInPeriod = workingDays > 0 ? workingDays : 22;
  const perDayDeduction = monthlyGross / daysInPeriod;

  // Deductions: absent + unpaid + (0.5 * half_days)
  const penaltyUnits = Number(absentDays || 0) + Number(unpaidDays || 0) + 0.5 * Number(halfDays || 0);
  const attendanceDeduction = penaltyUnits * perDayDeduction;

  // Annualized gross for tax slab calculation
  const annualizedGross = monthlyGross * 12;
  const annualTax = calculateAnnualTaxSlab(annualizedGross);
  const monthlyTax = annualTax / 12;

  const totalDeductions = attendanceDeduction + monthlyTax;
  const netPay = Math.max(0, monthlyGross - totalDeductions);

  return {
    basicSalary: Number(monthlyBasic.toFixed(2)),
    hra: Number(hra.toFixed(2)),
    medical: Number(medical.toFixed(2)),
    grossSalary: Number(monthlyGross.toFixed(2)),
    totalGross: Number(monthlyGross.toFixed(2)),
    periodGross: Number(monthlyGross.toFixed(2)),
    annualizedGross: Number(annualizedGross.toFixed(2)),
    workingDays: daysInPeriod,
    perDayDeduction: Number(perDayDeduction.toFixed(2)),
    absentDays: Number(absentDays || 0),
    unpaidDays: Number(unpaidDays || 0),
    halfDays: Number(halfDays || 0),
    penaltyUnits: Number(penaltyUnits.toFixed(1)),
    attendanceDeduction: Number(attendanceDeduction.toFixed(2)),
    tax: Number(monthlyTax.toFixed(2)),
    annualTax: Number(annualTax.toFixed(2)),
    totalTaxes: Number(monthlyTax.toFixed(2)),
    totalDeductions: Number(totalDeductions.toFixed(2)),
    netPay: Number(netPay.toFixed(2)),
  };
}

/**
 * Exports data to CSV and triggers download in browser.
 */
export function exportToCSV(filename, rows, headers) {
  if (!rows || !rows.length) return;
  const headerKeys = Object.keys(headers);
  const headerLabels = Object.values(headers);

  const csvContent = [
    headerLabels.join(","),
    ...rows.map((row) =>
      headerKeys
        .map((key) => {
          let val = row[key] ?? "";
          if (typeof val === "string" && (val.includes(",") || val.includes('"') || val.includes("\n"))) {
            val = `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
