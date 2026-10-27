"use client";

import React, { useState, useEffect } from "react";
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
  const { user, loading: authLoading, signUp } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    role: ROLES.EMPLOYEE,
    department: "Engineering",
    jobTitle: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // If already authenticated, cannot return to /signup
  useEffect(() => {
    if (!authLoading && user) {
      const norm = normalizeRole(user.role);
      const dest = norm === "ADMIN" ? "/admin" : norm === "HR" ? "/hr" : "/employee";
      router.replace(dest);
    }
  }, [user, authLoading, router]);

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

      // Synchronize into registered users registry
      if (typeof window !== "undefined") {
        try {
          const regUsers = JSON.parse(localStorage.getItem("hcm_lite_registered_users") || "[]");
          const cleanEmail = formData.email.trim().toLowerCase();
          const cleanRole = normalizeRole(formData.role);
          const idx = regUsers.findIndex((u) => u.email?.toLowerCase() === cleanEmail);
          const record = {
            email: cleanEmail,
            role: cleanRole,
            displayName: formData.displayName.trim(),
            department: formData.department,
            jobTitle: formData.jobTitle.trim() || `${cleanRole} Member`,
          };
          if (idx !== -1) {
            regUsers[idx] = { ...regUsers[idx], ...record };
          } else {
            regUsers.push(record);
          }
          localStorage.setItem("hcm_lite_registered_users", JSON.stringify(regUsers));
        } catch (e) {}
      }

      const roleLabel = ROLE_LABELS[normalizeRole(formData.role)] || "Employee";
      const loginMsg = `Logged in successfully as ${roleLabel}`;
      try {
        sessionStorage.setItem(
          "hcm_role_login_popup",
          JSON.stringify({
            role: roleLabel,
            name: formData.displayName.trim(),
            email: formData.email.trim(),
            message: loginMsg,
          })
        );
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

  if (!authLoading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-zinc-500">Already authenticated. Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex bg-zinc-950 text-zinc-100 overflow-x-hidden">
      {/* Fluid Background Graphic (Reference Image 4 / Mockup Image 2) */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{ backgroundImage: `url('/images/auth-fluid-dark.jpg')` }}
      />
      {/* Ambient dark gradient veil ensuring crisp text contrast */}
      <div className="fixed inset-0 z-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/45 to-zinc-950/75 pointer-events-none" />

      {/* Left visual side */}
      <div className="relative z-10 hidden lg:flex lg:w-1/2 flex-col justify-between p-10 xl:p-14 border-r border-zinc-800/50">
        {/* Top Branding matching mockup */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-glow">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">HCM Lite</h1>
              <p className="text-xs text-zinc-400">Enterprise Human Capital Platform</p>
            </div>
          </div>
          <div className="hidden xl:flex items-center gap-4 text-[11px] font-mono tracking-wider text-zinc-400">
            <span>PLATFORM</span>
            <span>•</span>
            <span>WORKFORCE</span>
            <span>•</span>
            <span>PAYROLL</span>
          </div>
        </div>

        {/* Center Hero Block (A GLOBAL VISION typography matching mockup) */}
        <div className="relative my-auto space-y-5 max-w-xl py-6">
          {/* Faint Large Watermark Text */}
          <div className="absolute -top-10 -left-2 text-6xl xl:text-7xl font-extrabold uppercase tracking-tight text-white/[0.04] select-none pointer-events-none whitespace-nowrap">
            GLOBAL WORKFORCE
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" />
              <span className="w-2 h-[2px] bg-indigo-400 rounded-full" />
              <span className="text-[11px] font-mono text-indigo-400 tracking-widest uppercase">
                Workforce Onboarding
              </span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-white leading-tight">
              A GLOBAL WORKFORCE
            </h1>

            <p className="text-sm xl:text-base text-zinc-300 font-light leading-relaxed max-w-md">
              Enterprise human capital operations unified—from ATS candidate hiring and self-service portals to automated payroll compliance.
            </p>
          </div>

          <div className="space-y-3 text-sm text-zinc-300 pt-2">
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

          {/* Dotted indicator like mockup */}
          <div className="flex items-center gap-2 pt-2 text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
          </div>
        </div>

        {/* Bottom Left Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/40 pt-4">
          <span>Pure JavaScript • Next.js App Router</span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            {isLiveFirebaseConfigured ? "Live Firebase Connected" : "Local Demo Mode Active"}
          </span>
        </div>
      </div>

      {/* Right sign up form - Floating Glassmorphic Card (matching Image 2) */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg space-y-6 rounded-2xl sm:rounded-3xl border border-zinc-800/80 bg-zinc-950/85 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl my-6">
          {/* Mobile branding header (visible on phone / tablet < lg) */}
          <div className="flex items-center gap-3 lg:hidden pb-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-glow shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-lg tracking-tight text-zinc-100">
                HCM Lite
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 font-mono font-semibold border border-indigo-500/20">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-zinc-400">Enterprise Human Capital Platform</p>
            </div>
          </div>

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