"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, ArrowRight, ShieldCheck, UserCheck, Users, User, Lock, Mail } from "lucide-react";
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
    if (!authLoading && user) {
      const dest = getRoleDashboard(user.role);
      router.replace(dest);
    }
  }, [user, authLoading, router]);

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
      const authUser = await signIn(email, password);

      // First-Login Password Change check
      if (authUser?.mustChangePassword) {
        setPendingUser(authUser);
        setShowForcePasswordModal(true);
        return;
      }

      // CRITICAL STRICT ROLE ENFORCEMENT:
      // The authenticated account's actual role MUST match the selected role.
      // HR cannot log in as Admin, Admin cannot log in as HR, Employee cannot log in as Admin/HR.
      const authenticatedRole = normalizeRole(authUser?.role);
      const targetRole = normalizeRole(selectedRole);

      if (authenticatedRole !== targetRole) {
        // Revoke session immediately to prevent unauthorized access
        try {
          if (auth) {
            const { signOut: fbSignOut } = await import("firebase/auth");
            await fbSignOut(auth);
          }
        } catch (e) {}
        if (typeof window !== "undefined") {
          localStorage.removeItem("hcm_lite_cached_session");
          localStorage.removeItem("hcm_lite_demo_user_uid");
          localStorage.setItem("hcm_lite_logged_out", "true");
          sessionStorage.removeItem("hcm_role_login_popup");
          sessionStorage.removeItem("hcm_role_login_flash");
        }

        const roleNames = {
          ADMIN: "Administrator",
          HR: "Human Resources (HR)",
          EMPLOYEE: "Employee",
        };
        const targetName = roleNames[targetRole] || targetRole;
        const actualName = roleNames[authenticatedRole] || authenticatedRole;

        const mismatchMsg = `Access Denied: You selected "${targetName}", but this account is registered as "${actualName}". An ${actualName} account cannot log in as ${targetName}.`;
        setLoginError(mismatchMsg);
        notifyError("Role Mismatch", mismatchMsg);
        setLoading(false);
        return;
      }

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

      if (rawMsg.includes("deactivated") || rawMsg.includes("user-disabled")) {
        errorMsg = "Account deactivated";
      } else if (rawMsg.includes("invalid-credential") || rawMsg.includes("wrong-password") || rawMsg.includes("user-not-found")) {
        errorMsg = "Invalid credentials";
      } else if (rawMsg.includes("too-many-requests")) {
        errorMsg = "Too many failed attempts. Try again later.";
      } else if (rawMsg.includes("no employee record found")) {
        errorMsg = "No employee record found for this work email.";
      }

      setLoginError(errorMsg);
      notifyError("Sign In Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoUser) => {
    if (demoUser?.mustChangePassword) {
      setPendingUser(demoUser);
      setShowForcePasswordModal(true);
      return;
    }

    setLoading(true);
    setLoginError("");

    try {
      const canonical = normalizeRole(demoUser.role);
      setSelectedRole(canonical);
      const roleLabel = ROLE_LABELS[canonical] || "Employee";
      const loginMsg = `Logged in successfully as ${roleLabel}`;

      // If live Firebase is configured, authentic sign in via verified demo persona credentials
      if (isLiveFirebaseConfigured) {
        const emailMap = {
          ADMIN: "admin@hcmlite.internal",
          HR: "hr@hcmlite.internal",
          EMPLOYEE: "employee@hcmlite.internal",
        };
        const targetEmail = emailMap[canonical] || demoUser.email;
        const authUser = await signIn(targetEmail, "Password123!");
        const dest = getRoleDashboard(authUser?.role || canonical);
        try {
          sessionStorage.setItem(
            "hcm_role_login_popup",
            JSON.stringify({
              role: roleLabel,
              name: authUser?.displayName || demoUser.displayName || roleLabel,
              email: authUser?.email || targetEmail,
              message: loginMsg,
            })
          );
          sessionStorage.setItem(
            "hcm_role_login_flash",
            JSON.stringify({ role: roleLabel, message: loginMsg })
          );
        } catch (e) {}
        notifySuccess("Authentication Success", loginMsg);
        router.push(dest);
        return;
      }

      await switchDemoRole(demoUser.role);
      const dest = getRoleDashboard(demoUser.role);
      try {
        sessionStorage.setItem(
          "hcm_role_login_popup",
          JSON.stringify({
            role: roleLabel,
            name: demoUser.displayName || roleLabel,
            email: demoUser.email,
            message: loginMsg,
          })
        );
        sessionStorage.setItem(
          "hcm_role_login_flash",
          JSON.stringify({ role: roleLabel, message: loginMsg })
        );
      } catch (e) {}
      notifySuccess("Authentication Success", loginMsg);
      router.push(dest);
    } catch (err) {
      console.warn("Live persona switch note:", err);
      const canonical = normalizeRole(demoUser.role);
      const roleLabel = ROLE_LABELS[canonical] || "Employee";
      const loginMsg = `Logged in successfully as ${roleLabel}`;
      await switchDemoRole(demoUser.role);
      const dest = getRoleDashboard(demoUser.role);
      try {
        sessionStorage.setItem(
          "hcm_role_login_popup",
          JSON.stringify({
            role: roleLabel,
            name: demoUser.displayName || roleLabel,
            email: demoUser.email,
            message: loginMsg,
          })
        );
        sessionStorage.setItem(
          "hcm_role_login_flash",
          JSON.stringify({ role: roleLabel, message: loginMsg })
        );
      } catch (e) {}
      notifySuccess("Authentication Success", loginMsg);
      router.push(dest);
    } finally {
      setLoading(false);
    }
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
          <blockquote className="text-2xl font-medium tracking-tight text-zinc-200">
            &ldquo;HCM Lite unified our entire employee lifecycle—from ATS recruitment pipeline and automated payroll runs to 360 appraisals—in one unified system.&rdquo;
          </blockquote>
          <div>
            <div className="font-semibold text-sm text-zinc-100">David Martinez</div>
            <div className="text-xs text-zinc-400">Chief People Officer, Stellar Dynamics</div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-zinc-500">
          Pure JavaScript • Next.js App Router • Firebase Powered
        </div>
      </div>

      {/* Right sign in form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
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
                    onClick={() => handleDemoLogin(u)}
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
