"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  ArrowRight,
  UserCheck,
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ROLES, DEPARTMENTS, normalizeRole, ROLE_LABELS } from "@/lib/constants";
import { isLiveFirebaseConfigured } from "@/lib/firebase/client";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    role: ROLES.ADMIN,
    department: "Engineering",
    jobTitle: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const roleOptions = [
    { value: ROLES.ADMIN, label: "Admin (Full System Access)" },
    { value: ROLES.HR, label: "HR (People & Payroll Ops)" },
    { value: ROLES.EMPLOYEE, label: "Employee (Self-Service)" },
  ];

  const departmentOptions = DEPARTMENTS.map((dept) => ({
    value: dept,
    label: dept,
  }));

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.displayName.trim()) {
      const msg = "Full Name is required.";
      setFormError(msg);
      notifyError("Validation Error", msg);
      return;
    }

    if (!formData.email.trim()) {
      const msg = "Work Email is required.";
      setFormError(msg);
      notifyError("Validation Error", msg);
      return;
    }

    if (formData.password.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      setFormError(msg);
      notifyError("Validation Error", msg);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const msg = "Passwords do not match.";
      setFormError(msg);
      notifyError("Validation Error", msg);
      return;
    }

    setLoading(true);
    try {
      await signUp({
        email: formData.email.trim(),
        password: formData.password,
        displayName: formData.displayName.trim(),
        role: formData.role,
        department: formData.department,
        jobTitle: formData.jobTitle.trim() || `${formData.role} Member`,
      });

      const roleLabel = ROLE_LABELS[normalizeRole(formData.role)] || "Employee";
      const loginMsg = `Logged in successfully as ${roleLabel}`;
      try {
        sessionStorage.setItem(
          "hcm_role_login_flash",
          JSON.stringify({ role: roleLabel, message: loginMsg })
        );
      } catch (e) {}
      notifySuccess("Account Created", loginMsg);

      const targetPath =
        formData.role === ROLES.ADMIN
          ? "/admin"
          : formData.role === ROLES.HR
          ? "/hr"
          : "/employee";
      router.push(targetPath);
    } catch (err) {
      console.error("[SignUp] Error:", err);
      let errorMsg = err.message || "Failed to create account.";
      if (errorMsg.includes("email-already-in-use")) {
        errorMsg = "An account with this email already exists. Please sign in instead.";
      } else if (errorMsg.includes("weak-password")) {
        errorMsg = "Password is too weak. Please choose a stronger password.";
      } else if (errorMsg.includes("invalid-email")) {
        errorMsg = "Please enter a valid email address.";
      }
      setFormError(errorMsg);
      notifyError("Registration Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100">
      {/* Left visual side */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-indigo-950/40 via-zinc-950 to-zinc-950 border-r border-zinc-800/80 relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-glow">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">HCM Lite</h1>
            <p className="text-xs text-zinc-400">Enterprise Human Capital Platform</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Enterprise Scaffolding</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 leading-snug">
            Enterprise Workforce Operations, Simplified.
          </h2>

          <div className="space-y-3 text-sm text-zinc-400">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Cloud Firestore User Registry & Role Verification</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Automated Attendance, Payroll Runs & Tax Slabs</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Annual, Sick & Casual Leave Policy Enforcement</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/60 pt-6">
          <span>Pure JavaScript • Next.js App Router</span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            {isLiveFirebaseConfigured ? "Live Firebase Connected" : "Local Demo Mode Active"}
          </span>
        </div>
      </div>

      {/* Right sign up form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 py-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
              Create your account
            </h2>
            <p className="text-xs text-zinc-400 mt-1.5">
              Register a new corporate account with role assignment and team profile.
            </p>
          </div>

          {formError && (
            <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20 text-xs text-rose-300 space-y-1">
              <p className="font-semibold text-rose-200">Registration Notice</p>
              <p>{formError}</p>
              {formError.includes("already exists") && (
                <div className="pt-1">
                  <Link
                    href="/login"
                    className="font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                  >
                    Click here to sign in &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              icon={UserCheck}
              placeholder="e.g. Sarah Connor"
              value={formData.displayName}
              onChange={(e) => handleChange("displayName", e.target.value)}
              required
            />

            <Input
              label="Work Email Address"
              type="email"
              icon={Mail}
              placeholder="e.g. sarah.connor@company.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Assigned Role"
                options={roleOptions}
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                required
              />

              <Select
                label="Department"
                options={departmentOptions}
                value={formData.department}
                onChange={(e) => handleChange("department", e.target.value)}
                required
              />
            </div>

            <Input
              label="Job Title (Optional)"
              type="text"
              placeholder="e.g. Senior Software Engineer"
              value={formData.jobTitle}
              onChange={(e) => handleChange("jobTitle", e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              icon={Lock}
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={loading}
                icon={ArrowRight}
              >
                Create Account
              </Button>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-zinc-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}