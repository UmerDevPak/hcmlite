"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  CreditCard,
  CalendarDays,
  ShieldAlert,
  Users,
  Settings,
  Clock,
  Sparkles,
  X,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { activityNotificationService } from "@/services/activityNotificationService";
import { cn } from "@/lib/utils";

export function NotificationCenter() {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [showSimulator, setShowSimulator] = useState(false);
  const panelRef = useRef(null);

  const loadNotifications = () => {
    const list = activityNotificationService.getNotifications(user?.role || role || "ADMIN");
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => loadNotifications();
    window.addEventListener("hcm_activity_notification_updated", handleUpdate);
    return () => window.removeEventListener("hcm_activity_notification_updated", handleUpdate);
  }, [user, role]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowSimulator(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    activityNotificationService.markAllAsRead();
    loadNotifications();
  };

  const handleMarkOneRead = (id) => {
    activityNotificationService.markAsRead(id);
    loadNotifications();
  };

  const handleSimulate = (actionKey) => {
    activityNotificationService.simulateAction(actionKey);
    loadNotifications();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "ADMIN") return n.actorRole === "ADMIN";
    if (activeTab === "HR") return n.actorRole === "HR";
    if (activeTab === "EMPLOYEE") return n.actorRole === "EMPLOYEE";
    if (activeTab === "COMPLAINTS") return n.type === "complaint";
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case "payroll":
        return <CreditCard className="w-3.5 h-3.5 text-indigo-400" />;
      case "leave":
        return <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />;
      case "complaint":
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case "onboarding":
        return <Users className="w-3.5 h-3.5 text-cyan-400" />;
      case "settings":
        return <Settings className="w-3.5 h-3.5 text-amber-400" />;
      case "attendance":
        return <Clock className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Enterprise Activity Notifications"
        title="Real-Time Enterprise Notifications"
        className={cn(
          "relative p-2 rounded-lg border transition-all duration-200 active:scale-[0.98]",
          isOpen
            ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400 ring-2 ring-indigo-500/20"
            : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
        )}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-950 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 shadow-2xl backdrop-blur-xl z-50 animate-scale-in flex flex-col max-h-[85vh] overflow-hidden">
          {/* Header */}
          <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/40">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <h4 className="text-xs font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                Enterprise Activity Feed
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-mono border border-indigo-500/20">
                    {unreadCount} new
                  </span>
                )}
              </h4>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSimulator(!showSimulator)}
                title="Test Activity Simulator"
                className={cn(
                  "p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1",
                  showSimulator
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "text-zinc-500 hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">Simulate</span>
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[10px] transition-colors flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Activity Simulator Quick Test Bar */}
          {showSimulator && (
            <div className="p-3 border-b border-indigo-500/20 bg-indigo-950/20 space-y-2 animate-fade-in text-xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-300">
                <span>Interactive Enterprise Activity Simulator:</span>
                <span className="text-[10px] text-zinc-400 font-mono">1-Click Live Test</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  onClick={() => handleSimulate("ADMIN_PAYROLL")}
                  className="p-1.5 rounded-lg border border-indigo-500/30 bg-zinc-900/90 hover:bg-indigo-900/40 text-left truncate text-indigo-300 transition-colors"
                >
                  👑 Admin: Finalize Payroll
                </button>
                <button
                  onClick={() => handleSimulate("ADMIN_POLICY")}
                  className="p-1.5 rounded-lg border border-indigo-500/30 bg-zinc-900/90 hover:bg-indigo-900/40 text-left truncate text-indigo-300 transition-colors"
                >
                  👑 Admin: Update Policy
                </button>
                <button
                  onClick={() => handleSimulate("HR_ESCALATE_COMPLAINT")}
                  className="p-1.5 rounded-lg border border-emerald-500/30 bg-zinc-900/90 hover:bg-emerald-900/40 text-left truncate text-emerald-300 transition-colors"
                >
                  💼 HR: Escalate Complaint
                </button>
                <button
                  onClick={() => handleSimulate("HR_LEAVE_APPROVAL")}
                  className="p-1.5 rounded-lg border border-emerald-500/30 bg-zinc-900/90 hover:bg-emerald-900/40 text-left truncate text-emerald-300 transition-colors"
                >
                  💼 HR: Approve Leave
                </button>
                <button
                  onClick={() => handleSimulate("EMPLOYEE_NEW_COMPLAINT")}
                  className="p-1.5 rounded-lg border border-rose-500/30 bg-zinc-900/90 hover:bg-rose-900/40 text-left truncate text-rose-300 transition-colors"
                >
                  👤 Employ: File Complaint
                </button>
                <button
                  onClick={() => handleSimulate("EMPLOYEE_APPLY_LEAVE")}
                  className="p-1.5 rounded-lg border border-cyan-500/30 bg-zinc-900/90 hover:bg-cyan-900/40 text-left truncate text-cyan-300 transition-colors"
                >
                  👤 Employ: Request Leave
                </button>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-2 border-b border-zinc-100 dark:border-zinc-800 overflow-x-auto scrollbar-none bg-zinc-50/30 dark:bg-zinc-900/20 text-[11px]">
            {[
              { id: "ALL", label: "All" },
              { id: "ADMIN", label: "Admin" },
              { id: "HR", label: "HR" },
              { id: "EMPLOYEE", label: "Employees" },
              { id: "COMPLAINTS", label: "Complaints" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all duration-150",
                  activeTab === tab.id
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notifications Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60 max-h-[380px]">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-zinc-600 stroke-[1.5]" />
                <p className="text-xs font-medium">No activity notifications yet</p>
                <p className="text-[11px] text-zinc-500">Actions taken on the website appear here live</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const roleBadgeClass =
                  notif.actorRole === "ADMIN"
                    ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
                    : notif.actorRole === "HR"
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkOneRead(notif.id)}
                    className={cn(
                      "p-3.5 transition-colors relative flex items-start gap-3 text-left group",
                      notif.isRead
                        ? "hover:bg-zinc-50 dark:hover:bg-zinc-900/40 text-zinc-400 opacity-80 hover:opacity-100"
                        : "bg-indigo-50/20 dark:bg-indigo-950/20 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 text-zinc-200"
                    )}
                  >
                    {/* Unread dot */}
                    {!notif.isRead && (
                      <span className="absolute top-4 left-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-glow" />
                    )}

                    {/* Type Icon Badge */}
                    <div className="mt-0.5 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shrink-0">
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("text-[9px] px-1.5 py-0.2 rounded border font-semibold uppercase tracking-wider font-mono", roleBadgeClass)}>
                            {notif.actorRole}
                          </span>
                          <span className="text-[11px] font-medium text-zinc-400 truncate">
                            {notif.actor?.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 whitespace-nowrap font-mono">
                          {formatRelativeTime(notif.timestamp)}
                        </span>
                      </div>

                      <h5 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 leading-snug">
                        {notif.title}
                      </h5>

                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>

                      {notif.link && (
                        <div className="pt-1">
                          <Link
                            href={notif.link}
                            onClick={() => {
                              handleMarkOneRead(notif.id);
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-500 hover:text-indigo-400 transition-colors"
                          >
                            <span>Open Module</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 text-center">
            <Link
              href="/complaints"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors inline-flex items-center gap-1"
            >
              <span>View Corporate Grievance Dashboard</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
