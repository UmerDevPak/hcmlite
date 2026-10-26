"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { LoginSuccessModal } from "@/components/auth/LoginSuccessModal";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { normalizeRole } from "@/lib/constants";

export function getRouteAccess(pathname, rawRole) {
  const role = normalizeRole(rawRole);
  const path = pathname || "";

  // 1. Admin-only routes: strictly locked to ADMIN
  if (
    path.startsWith("/admin") ||
    path.startsWith("/settings") ||
    path.startsWith("/setup")
  ) {
    if (role === "ADMIN") return { authorized: true };
    return {
      authorized: false,
      redirectPath: role === "HR" ? "/hr" : "/employee",
      reason: "Administrator verification required. HR and Employees cannot access Admin portals.",
    };
  }

  // 2. HR portal route: strictly locked to HR
  if (path.startsWith("/hr")) {
    if (role === "HR") return { authorized: true };
    return {
      authorized: false,
      redirectPath: role === "ADMIN" ? "/admin" : "/employee",
      reason: "Human Resources verification required. Dedicated to HR accounts.",
    };
  }

  // 3. Recruitment & Payroll routes: Admin & HR authorized
  if (path.startsWith("/recruitment") || path.startsWith("/payroll")) {
    if (role === "ADMIN" || role === "HR") return { authorized: true };
    return {
      authorized: false,
      redirectPath: "/employee",
      reason: "Access restricted to HR and Administrators.",
    };
  }

  // 4. Employee self-service and shared directory/document routes
  return { authorized: true };
}

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { notifyError } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 1. Protect dashboard routes: redirect unauthenticated sessions to /login
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // 2. Role-based Route Protection
  const userRole = normalizeRole(user?.role);
  const routeAccess = getRouteAccess(pathname, userRole);

  useEffect(() => {
    if (!loading && user && !routeAccess.authorized) {
      notifyError("Access Denied", routeAccess.reason);
      router.replace(routeAccess.redirectPath);
    }
  }, [user, loading, routeAccess.authorized, routeAccess.redirectPath, routeAccess.reason, router, notifyError]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-zinc-500">Loading HCM Lite...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!routeAccess.authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-rose-400 font-semibold">
            {routeAccess.reason} Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main app container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-7xl space-y-8">{children}</div>
        </main>
      </div>

      {/* Login Role Confirmation Modal Popup */}
      <LoginSuccessModal />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
