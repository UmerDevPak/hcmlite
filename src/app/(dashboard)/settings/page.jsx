"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { normalizeRole } from "@/lib/constants";
import {
  Settings,
  Shield,
  Building2,
  Database,
  RefreshCw,
  CheckCircle2,
  Lock,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { isLiveFirebaseConfigured, isDemoMode } from "@/lib/firebase/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { notifySuccess } = useNotification();

  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      const userRole = normalizeRole(user.role);
      router.replace(userRole === "HR" ? "/hr" : "/employee");
    }
  }, [user, isAdmin, authLoading, router]);

  const [companyName, setCompanyName] = useState("HCM Lite Technologies, Inc.");
  const [ein, setEin] = useState("94-3829102");
  const [currency, setCurrency] = useState("USD ($)");
  const [address, setAddress] = useState("100 Market St, Suite 400, San Francisco, CA 94105");

  if (!authLoading && (!user || !isAdmin)) {
    return null;
  }

  const handleSaveCompany = (e) => {
    e.preventDefault();
    notifySuccess("Settings Updated", "Company profile saved successfully.");
  };

  const handleResetData = () => {
    if (confirm("Reset local demo data to initial factory state?")) {
      localStorage.clear();
      notifySuccess("Data Reset", "Refreshed to initial factory seed data.");
      setTimeout(() => window.location.reload(), 600);
    }
  };

  const rbacMatrix = [
    {
      module: "Workforce Directory",
      admin: "Full (Create, Edit, Delete)",
      hr: "Full (Create, Edit, Delete)",
      emp: "Self Profile Only",
    },
    {
      module: "Time & Attendance",
      admin: "Full Org Oversight",
      hr: "Full Org Oversight",
      emp: "Self Punch Clock",
    },
    {
      module: "Leave & Absence",
      admin: "Full Sign-off",
      hr: "Full Sign-off",
      emp: "Submit & View Balances",
    },
    {
      module: "Payroll Runs",
      admin: "Execute & Disburse (Locked)",
      hr: "Review Drafts",
      emp: "Personal Payslips",
    },
    {
      module: "Recruitment (ATS)",
      admin: "Full Pipeline",
      hr: "Manage Requisitions",
      emp: "No Access",
    },
    {
      module: "Performance & OKRs",
      admin: "Calibrate & Sign",
      hr: "Administer Cycles",
      emp: "Self Review & Goals",
    },
    {
      module: "Corporate Expenses",
      admin: "Full Approval & Pay",
      hr: "Audit Receipts",
      emp: "Submit Claims",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Enterprise Settings & Access Control
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Configure legal entity metadata, Firebase connectivity, and role-based permissions.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={handleResetData}
        >
          Reset Demo Data
        </Button>
      </div>

      {/* Grid: Company Profile & Firebase Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Company Settings */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Organization & Legal Entity</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveCompany} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Legal Entity Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
                <Input
                  label="Employer Identification Number (EIN)"
                  value={ein}
                  onChange={(e) => setEin(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Primary Headquarters Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
                <Input
                  label="Default Operational Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm">
                  Save Entity Details
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Firebase & Engine Status */}
        <Card>
          <CardHeader>
            <CardTitle>Database & Cloud Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Database Engine</span>
                <span className="font-semibold text-zinc-200">Google Cloud Firestore</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Authentication</span>
                <span className="font-semibold text-zinc-200">Firebase Auth</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Backend API</span>
                <span className="font-semibold text-zinc-200">Firebase Admin SDK</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-400">Operational Mode</span>
                <Badge
                  variant={isLiveFirebaseConfigured ? "success" : "info"}
                  dot
                >
                  {isLiveFirebaseConfigured ? "Live Firebase Connected" : "Local Mock/Demo Mode"}
                </Badge>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
              To connect to your live Firebase Cloud project, populate the environment variables in <code>.env.local</code>.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RBAC Table */}
      <Card>
        <CardHeader>
          <CardTitle>Role-Based Access Control (RBAC) Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Functional Module</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>HR</TableHead>
                <TableHead>Employee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rbacMatrix.map((item) => (
                <TableRow key={item.module}>
                  <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.module}
                  </TableCell>
                  <TableCell className="text-indigo-400 font-medium">
                    {item.admin}
                  </TableCell>
                  <TableCell className="text-emerald-400">
                    {item.hr}
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {item.emp}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
