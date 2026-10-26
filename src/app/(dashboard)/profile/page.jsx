"use client";

import React, { useState, useEffect } from "react";
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
  Clock,
  Award,
  HeartHandshake,
  CheckCircle2,
  User,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { employeeService } from "@/services/employeeService";
import { leaveService } from "@/services/leaveService";
import { performanceService } from "@/services/performanceService";
import { formatCurrency, formatDate, calculatePayrollBreakdown } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { resolveAvatar } from "@/lib/avatarSystem";

export default function MyProfilePage() {
  const { user } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function loadCurrentProfile() {
      if (!user) return;
      try {
        const identifier = user.employeeId || user.uid || user.email;
        let emp = await employeeService.getEmployeeById(identifier);
        if (!emp && user.email) {
          emp = await employeeService.getEmployeeByEmail(user.email);
        }

        if (emp && !emp.avatar) {
          emp.avatar = user?.avatar || user?.photoURL || resolveAvatar({ name: emp.name, email: emp.email, id: emp.id });
        }

        if (!emp) {
          // Construct self profile view from auth session if not in list
          emp = {
            id: user.employeeId || "EMP-001",
            name: user.displayName || user.email?.split("@")[0] || "Employee",
            email: user.email,
            role: user.role || "Employee",
            jobTitle: user.jobTitle || "Team Member",
            department: user.department || "General",
            status: "Active",
            hireDate: new Date().toISOString().split("T")[0],
            annualSalary: 95000,
            location: "San Francisco, CA (HQ)",
            avatar: user.avatar || user.photoURL || resolveAvatar({ name: user.displayName, email: user.email, id: user.employeeId }),
          };
        }

        setEmployee(emp);

        const [balances, empReviews] = await Promise.all([
          leaveService.getEmployeeBalances(emp.id),
          performanceService.getAllReviews({ employeeId: emp.id }),
        ]);

        setLeaveBalances(balances);
        setReviews(empReviews);
      } catch (err) {
        console.warn("[MyProfile] Error loading profile details:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCurrentProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <p>No profile record found.</p>
      </div>
    );
  }

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
        href="/dashboard"
        className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Hero 360 Header */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar
              src={employee.avatar || user?.photoURL || user?.avatar}
              name={employee.name || user?.displayName || "User"}
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
                      : employee.status === "Pending Activation"
                      ? "warning"
                      : "neutral"
                  }
                  dot
                >
                  {employee.status || "Active"}
                </Badge>
                <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-medium">
                  {ROLE_LABELS[employee.role] || employee.role}
                </span>
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
                <span className="font-mono text-zinc-400">
                  ID: {employee.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Professional Biography & Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {employee.bio ||
                  "Employee is an active member of the department team, contributing to workforce objectives and company deliverables."}
              </p>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Skills & Domain Focus
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(employee.skills || ["Team Collaboration", "Operations", "Project Execution"]).map(
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-xs text-zinc-400">Annual Base Package</div>
              <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
                {formatCurrency(employee.annualSalary || 120000)}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Paid monthly</div>
            </Card>

            <Card className="p-4">
              <div className="text-xs text-zinc-400">Monthly Gross (Base * 1.5)</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {formatCurrency(payrollEstimate.grossPay)}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Includes 40% HRA & 10% Medical</div>
            </Card>

            <Card className="p-4">
              <div className="text-xs text-zinc-400">Estimated Monthly Net Take-Home</div>
              <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
                {formatCurrency(payrollEstimate.netPay)}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Post annualized tax slab deduction</div>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Salary Breakdown Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-zinc-400">Basic Monthly Component</span>
                  <span className="font-mono font-medium">{formatCurrency(payrollEstimate.basicPay)}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-zinc-400">House Rent Allowance (HRA 40%)</span>
                  <span className="font-mono font-medium text-emerald-500">+{formatCurrency(payrollEstimate.hra)}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-zinc-400">Medical Allowance (10%)</span>
                  <span className="font-mono font-medium text-emerald-500">+{formatCurrency(payrollEstimate.medical)}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-zinc-400">Income Tax (Annualized Progressive Slabs)</span>
                  <span className="font-mono font-medium text-rose-500">-{formatCurrency(payrollEstimate.tax)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "leave" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-xs text-zinc-400">Annual Paid Leave</div>
              <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
                {leaveBalances?.annual?.remaining ?? 14} <span className="text-xs font-normal text-zinc-400">/ 14 days</span>
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Used: {leaveBalances?.annual?.used ?? 0} days</div>
            </Card>

            <Card className="p-4">
              <div className="text-xs text-zinc-400">Sick Leave</div>
              <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
                {leaveBalances?.sick?.remaining ?? 8} <span className="text-xs font-normal text-zinc-400">/ 8 days</span>
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Used: {leaveBalances?.sick?.used ?? 0} days</div>
            </Card>

            <Card className="p-4">
              <div className="text-xs text-zinc-400">Casual Leave</div>
              <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
                {leaveBalances?.casual?.remaining ?? 10} <span className="text-xs font-normal text-zinc-400">/ 10 days</span>
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Used: {leaveBalances?.casual?.used ?? 0} days</div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "performance" && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Reviews & Goals</CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-400">
                No formal performance reviews logged yet for this cycle.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-zinc-100">{rev.cycle}</span>
                      <Badge variant="success">Rating: {rev.rating} / 5</Badge>
                    </div>
                    <p className="text-xs text-zinc-400">{rev.feedback}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}