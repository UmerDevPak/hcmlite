import { NextResponse } from "next/server";
import { INITIAL_PAYROLL_RUNS } from "@/lib/seedData";
import { verifyServerRole } from "@/lib/serverAuth";
import { ROLES } from "@/lib/constants";

export async function GET(request) {
  const authCheck = await verifyServerRole(request, [ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE]);
  if (!authCheck.authorized) return authCheck.response;

  return NextResponse.json({
    success: true,
    data: INITIAL_PAYROLL_RUNS,
  });
}

export async function POST(request) {
  // Rule 1: Only Admin can execute and disburse payroll
  const authCheck = await verifyServerRole(request, [ROLES.ADMIN]);
  if (!authCheck.authorized) return authCheck.response;

  try {
    const { period, payDate, employees } = await request.json();

    // Rule 6: Finalized runs are permanently locked
    const sampleRun = {
      id: `PR-${Date.now().toString().slice(-6)}`,
      period: period || "Nov 01 - Nov 15, 2026",
      payDate: payDate || new Date().toISOString().split("T")[0],
      status: "Finalized",
      isLocked: true,
      totalGross: 48250.0,
      totalNet: 35120.45,
      totalTaxes: 10425.3,
      totalDeductions: 2704.25,
      employeeCount: employees ? employees.length : 8,
      processedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: sampleRun });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
