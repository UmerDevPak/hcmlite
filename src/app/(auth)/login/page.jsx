"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, ArrowRight, ShieldCheck, UserCheck, Users, User, Lock, Mail } from "lucide-react";
import EnterpriseVectorHero from "@/components/auth/EnterpriseVectorHero";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DEMO_USERS, authService } from "@/services/authService";
import { normalizeRole, ROLE_LABELS } from "@/lib/constants";
import { setupService } from "@/services/setupService";
import { employeeService } from "@/services/employeeService";
import { ForcePasswordChangeModal } from "@/components/auth/ForcePasswordChangeModal";
import { auth, isLiveFirebaseConfigured } from "@/lib/firebase/client";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, signIn, switchDemoRole } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [selectedRole, setSelectedRole] = useState("ADMIN");
  const [email, setEmail] = useState("admin@hcmlite.internal");
  const [password, setPassword] = useState("Password123!");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [pendingUser, setPendingUser] = useState(null);
  const [showForcePasswordModal, setShowForcePasswordModal] = useState(false);

  const handleSelectRole = (roleId, defaultEmail) => {
    setSelectedRole(roleId);
    setEmail(defaultEmail);
    setPassword("Password123!");
    setLoginError("");
  };

  // If already authenticated, cannot return to /login
  useEffect(() => {
    if (!authLoading && !loading && user) {
      const dest = getRoleDashboard(user.role);
      router.replace(dest);
    }
  }, [user, authLoading, loading, router]);

  // First-Run Detection: If company_settings is empty, redirect to /setup
  useEffect(() => {
    setupService.checkIsCompanyInitialized().then((isInitialized) => {
      if (!isInitialized) {
        router.push("/setup");
      }
    });
  }, [router]);

  const getRoleDashboard = (userRole) => {
    const norm = (userRole || "").toUpperCase();
    if (norm === "ADMIN" || norm === "SUPER_ADMIN") return "/admin";
    if (norm === "HR" || norm === "HR_MANAGER") return "/hr";
    return "/employee";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    try {
      // Pass selectedRole so AuthContext strictly verifies the account's role
      const authUser = await signIn(email, password, selectedRole);

      // First-Login Password Change check
      if (authUser?.mustChangePassword) {
        setPendingUser(authUser);
        setShowForcePasswordModal(true);
        return;
      }

      const authenticatedRole = normalizeRole(authUser?.role);
      const roleLabel = ROLE_LABELS[authenticatedRole] || "Employee";
      const loginMsg = `Logged in successfully as ${roleLabel}`;
      try {
        sessionStorage.setItem(
          "hcm_role_login_popup",
          JSON.stringify({
            role: roleLabel,
            name: authUser?.displayName || roleLabel,
            email: authUser?.email || email,
            message: loginMsg,
          })
        );
        sessionStorage.setItem(
          "hcm_role_login_flash",
          JSON.stringify({ role: roleLabel, message: loginMsg })
        );
      } catch (e) {}
      notifySuccess("Authentication Success", loginMsg);

      const dest = getRoleDashboard(authenticatedRole);
      router.push(dest);
    } catch (err) {
      let rawMsg = (err.message || "").toLowerCase();
      let errorMsg = "Invalid credentials";

      if (err.message?.startsWith("ROLE_MISMATCH:")) {
        const parts = err.message.split(":");
        const expected = parts[1] || "Selected Role";
        const actual = parts[2] || "Account Role";
        errorMsg = `Login Failed: This account was created as "${actual}". You selected "${expected}" on login. You can only log in by selecting "${actual}".`;
      } else if (rawMsg.includes("deactivated") || rawMsg.includes("user-disabled")) {
        errorMsg = "Account deactivated";
      } else if (rawMsg.includes("invalid-credential") || rawMsg.includes("wrong-password") || rawMsg.includes("user-not-found")) {
        errorMsg = "Invalid credentials. Please verify your email and password.";
      } else if (rawMsg.includes("too-many-requests")) {
        errorMsg = "Too many failed attempts. Try again later.";
      } else if (rawMsg.includes("no employee record found")) {
        errorMsg = "No employee record found for this work email.";
      } else if (err.message) {
        errorMsg = err.message;
      }

      setLoginError(errorMsg);
      notifyError("Sign In Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoPersona = (demoUser) => {
    const canonical = normalizeRole(demoUser.role);
    setSelectedRole(canonical);
    setEmail(demoUser.email);
    setPassword("Password123!");
    setLoginError("");
  };

  const handlePasswordChanged = async () => {
    setShowForcePasswordModal(false);
    if (pendingUser) {
      try {
        await employeeService.activateEmployee(
          pendingUser.employeeId || pendingUser.uid || pendingUser.email
        );
      } catch (e) {
        console.warn("Activation update notice:", e);
      }
      switchDemoRole(pendingUser.role);
    }
    const roleLabel = ROLE_LABELS[normalizeRole(pendingUser?.role)] || "Employee";
    const loginMsg = `Logged in successfully as ${roleLabel}`;
    try {
      sessionStorage.setItem(
        "hcm_role_login_popup",
        JSON.stringify({
          role: roleLabel,
          name: pendingUser?.displayName || roleLabel,
          email: pendingUser?.email,
          message: loginMsg,
        })
      );
      sessionStorage.setItem(
        "hcm_role_login_flash",
        JSON.stringify({ role: roleLabel, message: loginMsg })
      );
    } catch (e) {}
    const dest = getRoleDashboard(pendingUser?.role);
    notifySuccess("Authentication Success", loginMsg);
    router.push(dest);
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
        <div className="relative my-auto space-y-4 max-w-xl py-6">
          {/* Faint Large Watermark Text */}
          <div className="absolute -top-10 -left-2 text-6xl xl:text-7xl font-extrabold uppercase tracking-tight text-white/[0.04] select-none pointer-events-none whitespace-nowrap">
            A GLOBAL VISION
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" />
              <span className="w-2 h-[2px] bg-indigo-400 rounded-full" />
              <span className="text-[11px] font-mono text-indigo-400 tracking-widest uppercase">
                Enterprise Cloud
              </span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-white leading-tight">
              A GLOBAL VISION
            </h1>

            <p className="text-sm xl:text-base text-zinc-300 font-light leading-relaxed max-w-md">
              Access the enterprise employee directory, automated payroll runs, and intelligent workforce operations.
            </p>
          </div>

          {/* Seamless Vector Art Ecosystem */}
          <div className="pt-2">
            <EnterpriseVectorHero />
          </div>

          {/* Dotted carousel indicator like mockup */}
          <div className="flex items-center gap-2 pt-2 text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
          </div>
        </div>

        {/* Bottom Left Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/40 pt-4">
          <span>&copy; 2026 HCM Lite Global • Enterprise Workforce System</span>
          <span className="font-mono text-indigo-400">v1.0.0</span>
        </div>
      </div>

      {/* Right sign in form - Floating Glassmorphic Card (matching Image 2) */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-lg space-y-6 rounded-2xl sm:rounded-3xl border border-zinc-800/80 bg-zinc-950/85 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl">
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
              Sign in to your account
            </h2>
            <p className="text-xs text-zinc-400 mt-1.5">
              Access the enterprise employee directory, payroll runs, and requests.
            </p>
          </div>

          {/* Who is logging in? Role Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                Who is logging in?
              </label>
              <span className="text-[10px] text-zinc-500">
                Select your designated role
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: "ADMIN",
                  label: "Admin",
                  desc: "Full Control",
                  icon: ShieldCheck,
                  email: "admin@hcmlite.internal",
                  activeBorder: "border-indigo-500 bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/40",
                  activeIcon: "text-indigo-400",
                },
                {
                  id: "HR",
                  label: "HR",
                  desc: "People Ops",
                  icon: UserCheck,
                  email: "hr@hcmlite.internal",
                  activeBorder: "border-emerald-500 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/40",
                  activeIcon: "text-emerald-400",
                },
                {
                  id: "EMPLOYEE",
                  label: "Employee",
                  desc: "Self-Service",
                  icon: User,
                  email: "employee@hcmlite.internal",
                  activeBorder: "border-cyan-500 bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/40",
                  activeIcon: "text-cyan-400",
                },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = selectedRole === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectRole(item.id, item.email)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 active:scale-[0.98] ${
                      isSelected
                        ? item.activeBorder
                        : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? item.activeIcon : "text-zinc-400"}`} />
                    <span className="font-bold text-xs">{item.label}</span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Demo Personas (1-Click evaluation) */}
          <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                Instant Demo Personas
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                1-Click Switch
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((u) => {
                const canonical = normalizeRole(u.role);
                const Icon =
                  canonical === "ADMIN"
                    ? ShieldCheck
                    : canonical === "HR"
                    ? UserCheck
                    : User;
                return (
                  <button
                    key={u.uid}
                    type="button"
                    onClick={() => handleSelectDemoPersona(u)}
                    className="flex items-center gap-2.5 p-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-indigo-500/50 hover:bg-zinc-800/80 transition-all text-left text-xs"
                  >
                    <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-zinc-200 truncate">{u.displayName}</div>
                      <div className="text-[10px] text-zinc-400 truncate">{u.jobTitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Standard Form */}
          {loginError && (
            <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/25 text-xs text-rose-300 flex items-center gap-2.5 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <p className="font-medium">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="admin@hcmlite.internal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-400">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-zinc-800 bg-zinc-900 text-indigo-600 focus:ring-0"
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={loading}
              icon={ArrowRight}
            >
              Sign In
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-zinc-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors"
                >
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Mandatory Password Change Modal for Temporary Credentials */}
      <ForcePasswordChangeModal
        isOpen={showForcePasswordModal}
        user={pendingUser}
        onPasswordChanged={handlePasswordChanged}
      />
    </div>
  );
}
