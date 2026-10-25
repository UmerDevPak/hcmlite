import { NextResponse } from "next/server";
import { INITIAL_EMPLOYEES, INITIAL_PAYROLL_RUNS } from "@/lib/seedData";

export async function GET() {
  const departmentDistribution = {};
  INITIAL_EMPLOYEES.forEach((emp) => {
    const dept = emp.department || "Other";
    departmentDistribution[dept] = (departmentDistribution[dept] || 0) + 1;
  });

  return NextResponse.json({
    success: true,
    data: {
      totalEmployees: INITIAL_EMPLOYEES.length,
      activeEmployees: INITIAL_EMPLOYEES.filter((e) => e.status === "Active").length,
      departmentDistribution,
      lastPayrollNet: INITIAL_PAYROLL_RUNS[0]?.totalNet || 35120.45,
    },
  });
}
