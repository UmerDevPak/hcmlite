"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  CreditCard,
  Shield,
  Edit2,
  Clock,
  Award,
  HeartHandshake,
  CheckCircle2,
} from "lucide-react";
import { employeeService } from "@/services/employeeService";
import { leaveService } from "@/services/leaveService";
import { performanceService } from "@/services/performanceService";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate, calculatePayrollBreakdown } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { EmployeeModal } from "@/components/employees/EmployeeModal";

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isHR } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      const emp = await employeeService.getEmployeeById(params.id);
      if (!emp) {
        router.push("/employees");
        return;
      }
      setEmployee(emp);

      const [balances, empReviews] = await Promise.all([
        leaveService.getEmployeeBalances(emp.id),
        performanceService.getAllReviews({ employeeId: emp.id }),
      ]);
      setLeaveBalances(balances);
      setReviews(empReviews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!employee) return null;

  const payrollEstimate = calculatePayrollBreakdown({
    annualSalary: employee.annualSalary || 120000,
    allowances: 150,
    preTaxDeductions: 250,
  });

  const tabs = [
    { id: "overview", label: "Overview & Personal", icon: Shield },
    { id: "compensation", label: "Compensation & Payroll", icon: CreditCard },
    { id: "leave", label: "Time Off & Leave Balances", icon: Clock },
    { id: "performance", label: "Performance & Reviews", icon: Award },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <Link
        href="/employees"
        className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Employee Directory
      </Link>

      {/* Hero 360 Header */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar
              src={employee.avatar}
              name={employee.name}
              size="2xl"
              shape="square"
              className="w-20 h-20 rounded-2xl border-2 border-indigo-500/20 shadow-md ring-2 ring-indigo-500/10"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {employee.name}
                </h1>
                <Badge
                  variant={
                    employee.status === "Active"
                      ? "success"
                      : employee.status === "On Leave"
                      ? "warning"
                      : "neutral"
                  }
                  dot
                >
                  {employee.status}
                </Badge>
              </div>

              <p className="text-sm font-medium text-indigo-500 dark:text-indigo-400 mt-0.5">
                {employee.jobTitle} • {employee.department}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {employee.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {employee.location || "San Francisco, CA (HQ)"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Hired {formatDate(employee.hireDate)}
                </span>
              </div>
            </div>
          </div>

          {isHR && (
            <Button
              variant="outline"
              size="sm"
              icon={Edit2}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </Card>

      {/* Tabs navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Professional Biography & Core Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {employee.bio ||
                  "No detailed bio provided yet. Employee is actively working within their department team."}
              </p>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Skills & Domain Expertise
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(employee.skills || ["Team Leadership", "Cross-Functional Collaboration"]).map(
                    (skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-400 block text-[11px]">Primary Contact</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {employee.emergencyContact?.name || "Not specified"}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Relationship</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {employee.emergencyContact?.relationship || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Emergency Phone</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {employee.emergencyContact?.phone || "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "compensation" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Bi-Weekly Estimated Payroll Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                  <div className="text-[11px] text-zinc-400">Annual Base</div>
                  <div className="text-lg font-bold font-mono mt-0.5">
                    {formatCurrency(employee.annualSalary)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                  <div className="text-[11px] text-zinc-400">Period Gross</div>
                  <div className="text-lg font-bold font-mono text-indigo-400 mt-0.5">
                    {formatCurrency(payrollEstimate.totalGross)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                  <div className="text-[11px] text-zinc-400">Total Deductions</div>
                  <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">
                    {formatCurrency(payrollEstimate.totalDeductions)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                  <div className="text-[11px] text-zinc-400">Net Take-Home</div>
                  <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                    {formatCurrency(payrollEstimate.netPay)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Federal Income Tax (15% est.)</span>
                  <span className="font-mono text-zinc-300">
                    -{formatCurrency(payrollEstimate.federalTax)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">FICA (Social Security & Medicare)</span>
                  <span className="font-mono text-zinc-300">
                    -{formatCurrency(payrollEstimate.ficaTax)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">State Income Tax (5% est.)</span>
                  <span className="font-mono text-zinc-300">
                    -{formatCurrency(payrollEstimate.stateTax)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Pre-Tax Benefits (401k & Health)</span>
                  <span className="font-mono text-zinc-300">
                    -{formatCurrency(payrollEstimate.preTaxDeductions)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Direct Deposit Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-400 block text-[11px]">Financial Institution</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {employee.bankDetails?.bankName || "Chase Bank NA"}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Account Number</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  •••• •••• •••• {employee.bankDetails?.accountNumberEnding || "4481"}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Routing Number (ABA)</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {employee.bankDetails?.routingNumber || "021000021"}
                </span>
              </div>
              <div className="pt-2">
                <Badge variant="success" dot>
                  Verified for Automated ACH
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "leave" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-xs text-zinc-400">Annual Leave</div>
            <div className="text-2xl font-bold font-mono mt-1 text-indigo-400">
              {leaveBalances?.annual ?? 14} <span className="text-xs font-normal text-zinc-400">/ 14 days</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Statutory annual entitlement</p>
          </Card>

          <Card className="p-4">
            <div className="text-xs text-zinc-400">Sick Leave</div>
            <div className="text-2xl font-bold font-mono mt-1 text-emerald-400">
              {leaveBalances?.sick ?? 8} <span className="text-xs font-normal text-zinc-400">/ 8 days</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Medical absence coverage</p>
          </Card>

          <Card className="p-4">
            <div className="text-xs text-zinc-400">Casual Leave</div>
            <div className="text-2xl font-bold font-mono mt-1 text-amber-400">
              {leaveBalances?.casual ?? 10} <span className="text-xs font-normal text-zinc-400">/ 10 days</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Short-notice emergency leave</p>
          </Card>
        </div>
      )}

      {activeTab === "performance" && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <Card className="p-8 text-center text-xs text-zinc-400">
              No formal performance review completed for this cycle yet.
            </Card>
          ) : (
            reviews.map((rev) => (
              <Card key={rev.id} className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      {rev.cycle}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Evaluated by {rev.reviewerName} on {formatDate(rev.completedDate)}
                    </p>
                  </div>
                  <Badge variant="purple" size="lg">
                    Rating: {rev.overallScore} / 5.0
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="font-semibold text-emerald-400 mb-1">Key Strengths</h4>
                    <p className="text-zinc-300">{rev.strengths}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-400 mb-1">Growth Areas</h4>
                    <p className="text-zinc-300">{rev.improvements}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit modal */}
      <EmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employee={employee}
        onSaved={fetchProfile}
      />
    </div>
  );
}
