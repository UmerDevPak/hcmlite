import { generateId, formatDate } from "@/lib/utils";

const STORAGE_KEY = "hcm_lite_activity_notifications";

export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-001",
    title: "Payroll Finalized for October 2026",
    message: "Sarah Connor (Executive Admin) finalized the monthly payroll run of $48,250.00 across all 6 departments. Payslips are now available.",
    actor: {
      name: "Sarah Connor",
      role: "ADMIN",
      email: "admin@hcmlite.internal",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
    actorRole: "ADMIN",
    targetAudience: "ALL",
    type: "payroll",
    priority: "high",
    isRead: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 mins ago
    link: "/payroll",
  },
  {
    id: "notif-002",
    title: "Grievance Escalated to Executive Admin",
    message: "Aaliyah Patel (HR) investigated Complaint #GRV-2026-002 (Manager Misconduct & Overtime Dispute) and escalated it for Executive Admin Approval.",
    actor: {
      name: "Aaliyah Patel",
      role: "HR",
      email: "hr@hcmlite.internal",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    },
    actorRole: "HR",
    targetAudience: "ADMIN",
    type: "complaint",
    priority: "urgent",
    isRead: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    link: "/complaints",
  },
  {
    id: "notif-003",
    title: "Annual Leave Request Approved",
    message: "Aaliyah Patel (HR) approved 3 days of Annual Leave for Elena Rostova (Engineering). Calendar updated.",
    actor: {
      name: "Aaliyah Patel",
      role: "HR",
      email: "hr@hcmlite.internal",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    },
    actorRole: "HR",
    targetAudience: "ALL",
    type: "leave",
    priority: "normal",
    isRead: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    link: "/leave",
  },
  {
    id: "notif-004",
    title: "New Employee Onboarded to Engineering",
    message: "HR registered Liam Nguyen as Junior Software Engineer in the Engineering department.",
    actor: {
      name: "Aaliyah Patel",
      role: "HR",
      email: "hr@hcmlite.internal",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    },
    actorRole: "HR",
    targetAudience: "ALL",
    type: "onboarding",
    priority: "normal",
    isRead: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    link: "/employees",
  },
  {
    id: "notif-005",
    title: "Company Grace Period Updated",
    message: "Executive Administrator updated daily attendance grace window to 15 minutes past 09:00 AM.",
    actor: {
      name: "Sarah Connor",
      role: "ADMIN",
      email: "admin@hcmlite.internal",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
    actorRole: "ADMIN",
    targetAudience: "ALL",
    type: "settings",
    priority: "normal",
    isRead: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    link: "/settings",
  },
  {
    id: "notif-006",
    title: "Confidential Grievance Submitted",
    message: "An employee submitted a formal grievance regarding Workplace Safety & Ergonomics equipment.",
    actor: {
      name: "Employee Self-Service",
      role: "EMPLOYEE",
      email: "employee@hcmlite.internal",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    actorRole: "EMPLOYEE",
    targetAudience: "ADMIN_HR",
    type: "complaint",
    priority: "high",
    isRead: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    link: "/complaints",
  },
];

function getStoredNotifications() {
  if (typeof window === "undefined") return INITIAL_NOTIFICATIONS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

function saveNotifications(list) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // Dispatch custom event for instant cross-component re-renders
    window.dispatchEvent(new CustomEvent("hcm_activity_notification_updated"));
  }
}

export const activityNotificationService = {
  /**
   * Retrieve all activity notifications filtered by active user role
   */
  getNotifications(userRole = "ADMIN") {
    const list = getStoredNotifications();
    const norm = String(userRole || "EMPLOYEE").toUpperCase();

    return list.filter((n) => {
      if (n.targetAudience === "ALL") return true;
      if (norm === "ADMIN") return true; // Admin has full visibility into all enterprise events
      if (norm === "HR") return n.targetAudience !== "ADMIN_ONLY";
      // Employee
      return n.targetAudience === "ALL" || n.targetAudience === "EMPLOYEE";
    });
  },

  /**
   * Record a new activity event across the system
   */
  addNotification({
    title,
    message,
    actor = {},
    actorRole = "EMPLOYEE",
    targetAudience = "ALL",
    type = "system",
    priority = "normal",
    link = "/dashboard",
  }) {
    const list = getStoredNotifications();
    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      actor: {
        name: actor.name || (actorRole === "ADMIN" ? "Sarah Connor" : actorRole === "HR" ? "Aaliyah Patel" : "Employee"),
        role: actorRole,
        email: actor.email || `${actorRole.toLowerCase()}@hcmlite.internal`,
        avatar: actor.avatar || null,
      },
      actorRole,
      targetAudience,
      type,
      priority,
      isRead: false,
      timestamp: new Date().toISOString(),
      link,
    };

    const updated = [newNotif, ...list];
    saveNotifications(updated);
    return newNotif;
  },

  /**
   * Mark a single notification as read
   */
  markAsRead(id) {
    const list = getStoredNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    saveNotifications(updated);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    const list = getStoredNotifications();
    const updated = list.map((n) => ({ ...n, isRead: true }));
    saveNotifications(updated);
  },

  /**
   * Clear or delete notification
   */
  deleteNotification(id) {
    const list = getStoredNotifications();
    const updated = list.filter((n) => n.id !== id);
    saveNotifications(updated);
  },

  /**
   * Interactive Simulator: Generates realistic live events for Admin, HR, or Employee
   */
  simulateAction(actionKey) {
    switch (actionKey) {
      case "ADMIN_PAYROLL":
        return this.addNotification({
          title: "Executive Admin Approved Batch Payroll",
          message: "Sarah Connor authorized direct deposit release for 18 staff members totaling $51,400.00.",
          actorRole: "ADMIN",
          actor: { name: "Sarah Connor", role: "ADMIN" },
          targetAudience: "ALL",
          type: "payroll",
          priority: "high",
          link: "/payroll",
        });

      case "ADMIN_POLICY":
        return this.addNotification({
          title: "Executive Office Policy Updated",
          message: "Admin announced updated Paid Time Off (PTO) carryover rules for fiscal year 2027.",
          actorRole: "ADMIN",
          actor: { name: "Sarah Connor", role: "ADMIN" },
          targetAudience: "ALL",
          type: "settings",
          priority: "normal",
          link: "/settings",
        });

      case "ADMIN_APPROVE_COMPLAINT":
        return this.addNotification({
          title: "Executive Admin Approved Complaint Settlement",
          message: "Sarah Connor officially approved HR's resolution plan for Grievance #GRV-2026-002.",
          actorRole: "ADMIN",
          actor: { name: "Sarah Connor", role: "ADMIN" },
          targetAudience: "ALL",
          type: "complaint",
          priority: "urgent",
          link: "/complaints",
        });

      case "HR_LEAVE_APPROVAL":
        return this.addNotification({
          title: "HR Approved Sick Leave",
          message: "Aaliyah Patel (HR) approved 2-day emergency sick leave for Marcus Vance.",
          actorRole: "HR",
          actor: { name: "Aaliyah Patel", role: "HR" },
          targetAudience: "ALL",
          type: "leave",
          priority: "normal",
          link: "/leave",
        });

      case "HR_ESCALATE_COMPLAINT":
        return this.addNotification({
          title: "HR Escalated Grievance to Executive Admin",
          message: "Aaliyah Patel escalated Grievance #GRV-2026-004 (Compensation Review) requesting Executive Sign-off.",
          actorRole: "HR",
          actor: { name: "Aaliyah Patel", role: "HR" },
          targetAudience: "ADMIN",
          type: "complaint",
          priority: "urgent",
          link: "/complaints",
        });

      case "EMPLOYEE_NEW_COMPLAINT":
        return this.addNotification({
          title: "New Formal Grievance Filed",
          message: "An employee filed a formal grievance regarding Workplace Environment & Ventilation in Floor 3.",
          actorRole: "EMPLOYEE",
          actor: { name: "Elena Rostova", role: "EMPLOYEE" },
          targetAudience: "ADMIN_HR",
          type: "complaint",
          priority: "high",
          link: "/complaints",
        });

      case "EMPLOYEE_APPLY_LEAVE":
        return this.addNotification({
          title: "New Leave Application Submitted",
          message: "Elena Rostova submitted a request for 4 days of Annual Vacation (Nov 12 - Nov 16).",
          actorRole: "EMPLOYEE",
          actor: { name: "Elena Rostova", role: "EMPLOYEE" },
          targetAudience: "ADMIN_HR",
          type: "leave",
          priority: "normal",
          link: "/leave",
        });

      case "EMPLOYEE_PUNCH_CLOCK":
        return this.addNotification({
          title: "Attendance Check-In Logged",
          message: "David Chen clocked in at 08:58 AM (On-Time) via Enterprise Web Punch Clock.",
          actorRole: "EMPLOYEE",
          actor: { name: "David Chen", role: "EMPLOYEE" },
          targetAudience: "ADMIN_HR",
          type: "attendance",
          priority: "normal",
          link: "/attendance",
        });

      default:
        return this.addNotification({
          title: "System Synchronization Active",
          message: "Database audit logs synchronized successfully across workforce modules.",
          actorRole: "ADMIN",
          actor: { name: "System Automated Agent", role: "ADMIN" },
          targetAudience: "ALL",
          type: "system",
          priority: "normal",
          link: "/reports",
        });
    }
  },
};
