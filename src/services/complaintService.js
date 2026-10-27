import { activityNotificationService } from "./activityNotificationService";
import { formatDate } from "@/lib/utils";

const STORAGE_KEY = "hcm_lite_complaints";

export const COMPLAINT_CATEGORIES = [
  { id: "HARASSMENT", label: "Workplace Harassment", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  { id: "PAYROLL_COMPENSATION", label: "Compensation & Payroll Dispute", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { id: "MANAGER_MISCONDUCT", label: "Manager Misconduct / Leadership", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { id: "WORKPLACE_SAFETY", label: "Workplace Safety & Ergonomics", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  { id: "DISCRIMINATION", label: "Ethics, DEI & Discrimination", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  { id: "POLICY_VIOLATION", label: "Corporate Policy Violation", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  { id: "OTHER", label: "General Workplace Grievance", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
];

export const COMPLAINT_STATUS = {
  PENDING_HR: { label: "Pending HR Triage", color: "text-amber-400 bg-amber-500/10 border-amber-500/30", step: 1 },
  INVESTIGATING: { label: "Under HR Investigation", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30", step: 2 },
  ESCALATED_TO_ADMIN: { label: "Escalated for Admin Approval", color: "text-purple-400 bg-purple-500/10 border-purple-500/30", step: 3 },
  APPROVED_BY_ADMIN: { label: "Admin Approved - Resolving", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", step: 4 },
  RESOLVED: { label: "Resolved & Closed", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", step: 4 },
};

export const INITIAL_COMPLAINTS = [
  {
    id: "GRV-2026-002",
    caseNumber: "GRV-2026-002",
    title: "Leadership Misconduct & Unpaid Weekend Overtime Coercion",
    category: "MANAGER_MISCONDUCT",
    urgency: "Urgent",
    isAnonymous: true,
    filedBy: {
      name: "Anonymous Whistleblower",
      email: "confidential@hcmlite.internal",
      department: "Engineering",
      role: "EMPLOYEE",
    },
    status: "ESCALATED_TO_ADMIN",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    description: "Engineering team members have been repeatedly pressured into mandatory 12-hour weekend shifts without overtime logging or compensating time off under threat of unfavorable appraisal scoring.",
    desiredRemedy: "Independent review of Engineering sprint workload, audit of overtime compensation, and formal executive policy reminder.",
    assignedInvestigator: "Aaliyah Patel (Senior HR Partner)",
    hrNotes: "Conducted preliminary interviews with 3 engineers under confidentiality. Shift logs confirm uncompensated weekend check-ins. Disciplinary and compensation adjustment requires Executive Admin authorization.",
    escalationDetails: {
      escalatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      escalatedBy: "Aaliyah Patel (HR)",
      reason: "Requires executive intervention: policy amendment and discretionary retroactive overtime disbursement of $4,800 across 4 affected engineers.",
      requestedAdminAction: "Executive Sign-Off for retroactive budget disbursement and formal counseling memo.",
    },
    adminReview: null,
    resolution: null,
    timeline: [
      {
        id: "t-1",
        stage: "Submitted",
        author: "Anonymous Employee",
        role: "EMPLOYEE",
        note: "Grievance filed through secure anonymous whistleblowing channel.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
      {
        id: "t-2",
        stage: "Under HR Investigation",
        author: "Aaliyah Patel",
        role: "HR",
        note: "HR initiated formal confidential inquiry. Shift timestamp logs reviewed.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        id: "t-3",
        stage: "Escalated for Admin Approval",
        author: "Aaliyah Patel",
        role: "HR",
        note: "Escalated to Sarah Connor (Executive Admin) for budget authorization and leadership remediation.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      },
    ],
  },
  {
    id: "GRV-2026-001",
    caseNumber: "GRV-2026-001",
    title: "Payroll Calculation Discrepancy on September Tax Withholding",
    category: "PAYROLL_COMPENSATION",
    urgency: "Medium",
    isAnonymous: false,
    filedBy: {
      name: "Elena Rostova",
      email: "elena.rostova@hcmlite.internal",
      department: "Engineering",
      role: "EMPLOYEE",
    },
    status: "INVESTIGATING",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    description: "My September payslip displays an unexpected $410 state tax deduction discrepancy compared to previous pay periods despite no status change.",
    desiredRemedy: "Audit September payslip calculation and credit difference in the upcoming October payroll run.",
    assignedInvestigator: "Aaliyah Patel (HR)",
    hrNotes: "Reviewing with payroll provider tax brackets update. Recalculation adjustment drafted for October batch run.",
    escalationDetails: null,
    adminReview: null,
    resolution: null,
    timeline: [
      {
        id: "t-1",
        stage: "Submitted",
        author: "Elena Rostova",
        role: "EMPLOYEE",
        note: "Grievance filed with attached September PDF payslip.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      },
      {
        id: "t-2",
        stage: "Under HR Investigation",
        author: "Aaliyah Patel",
        role: "HR",
        note: "Payroll draft audit in progress. Discrepancy identified as mid-year tax table update.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      },
    ],
  },
  {
    id: "GRV-2026-003",
    caseNumber: "GRV-2026-003",
    title: "Ergonomic Hardware Equipment Request for Distributed Product Team",
    category: "WORKPLACE_SAFETY",
    urgency: "Low",
    isAnonymous: false,
    filedBy: {
      name: "David Chen",
      email: "david.chen@hcmlite.internal",
      department: "Product",
      role: "EMPLOYEE",
    },
    status: "RESOLVED",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    description: "Remote team members have requested standardized ergonomic keyboard and adjustable standing desk converter stipends.",
    desiredRemedy: "Approve $500 home office ergonomics stipend under company health & wellness program.",
    assignedInvestigator: "Aaliyah Patel (HR)",
    hrNotes: "Benchmarked against industry standards. Fits within annual workplace wellness allocation.",
    escalationDetails: null,
    adminReview: {
      reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
      reviewedBy: "Sarah Connor (Admin)",
      decision: "APPROVED",
      notes: "Executive sign-off granted under company equipment budget.",
    },
    resolution: {
      resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      resolvedBy: "Aaliyah Patel (HR)",
      summary: "Ergonomic equipment allowance approved. Expense reimbursement code ERGO-2026 issued for product team.",
    },
    timeline: [
      {
        id: "t-1",
        stage: "Submitted",
        author: "David Chen",
        role: "EMPLOYEE",
        note: "Request submitted under Workplace Safety & Health category.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
      },
      {
        id: "t-2",
        stage: "Under HR Investigation",
        author: "Aaliyah Patel",
        role: "HR",
        note: "Policy review completed. Recommended approval.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
      },
      {
        id: "t-3",
        stage: "Resolved & Closed",
        author: "Aaliyah Patel",
        role: "HR",
        note: "Official resolution finalized and published to employee.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      },
    ],
  },
  {
    id: "GRV-2026-004",
    caseNumber: "GRV-2026-004",
    title: "Allegation of Inappropriate Remarks During Team Retrospective",
    category: "DISCRIMINATION",
    urgency: "High",
    isAnonymous: true,
    filedBy: {
      name: "Anonymous Employee",
      email: "confidential@hcmlite.internal",
      department: "Human Resources",
      role: "EMPLOYEE",
    },
    status: "PENDING_HR",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    description: "Repeated dismissive comments made during sprint retrospective concerning parental leave accommodations.",
    desiredRemedy: "Formal HR mediation and team conduct workshop reminder.",
    assignedInvestigator: null,
    hrNotes: null,
    escalationDetails: null,
    adminReview: null,
    resolution: null,
    timeline: [
      {
        id: "t-1",
        stage: "Submitted",
        author: "Anonymous Employee",
        role: "EMPLOYEE",
        note: "Confidential submission received. Awaiting HR intake triage.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
    ],
  },
];

function getStoredComplaints() {
  if (typeof window === "undefined") return INITIAL_COMPLAINTS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMPLAINTS));
    return INITIAL_COMPLAINTS;
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : INITIAL_COMPLAINTS;
  } catch {
    return INITIAL_COMPLAINTS;
  }
}

function saveComplaints(list) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("hcm_complaints_updated"));
  }
}

export const complaintService = {
  /**
   * Get all complaints filtered by user role and identity
   * - Admin: full executive visibility into all corporate grievances
   * - HR: operational visibility into all cases except strict admin-direct
   * - Employee: visibility ONLY into complaints they filed themselves
   */
  getComplaints({ role = "ADMIN", userEmail = "", employeeId = "" } = {}) {
    const list = getStoredComplaints();
    const norm = String(role || "EMPLOYEE").toUpperCase();
    const cleanEmail = String(userEmail || "").trim().toLowerCase();

    if (norm === "ADMIN" || norm === "HR") {
      return list;
    }

    // Standard employee: view only their own filed complaints or anonymous ones filed by their session
    return list.filter((c) => {
      if (c.filedBy?.email && c.filedBy.email.toLowerCase() === cleanEmail) return true;
      if (c.filedBy?.id && c.filedBy.id === employeeId) return true;
      return false;
    });
  },

  getComplaintById(id) {
    const list = getStoredComplaints();
    return list.find((c) => c.id === id || c.caseNumber === id) || null;
  },

  /**
   * Submit a new grievance / complaint
   */
  createComplaint({
    title,
    category = "OTHER",
    urgency = "Medium",
    description,
    desiredRemedy = "",
    isAnonymous = false,
    filedBy = {},
  }) {
    const list = getStoredComplaints();
    const caseIndex = list.length + 1;
    const caseNumber = `GRV-2026-${String(caseIndex).padStart(3, "0")}`;
    const now = new Date().toISOString();

    const cleanFiler = isAnonymous
      ? {
          name: "Anonymous Whistleblower",
          email: "confidential@hcmlite.internal",
          department: filedBy.department || "General",
          role: "EMPLOYEE",
        }
      : {
          name: filedBy.name || filedBy.displayName || "Employee",
          email: filedBy.email || "employee@hcmlite.internal",
          department: filedBy.department || "General",
          role: filedBy.role || "EMPLOYEE",
        };

    const newCase = {
      id: caseNumber,
      caseNumber,
      title: title.trim(),
      category,
      urgency,
      isAnonymous,
      filedBy: cleanFiler,
      status: "PENDING_HR",
      createdAt: now,
      description: description.trim(),
      desiredRemedy: desiredRemedy.trim(),
      assignedInvestigator: null,
      hrNotes: null,
      escalationDetails: null,
      adminReview: null,
      resolution: null,
      timeline: [
        {
          id: `t_${Date.now()}`,
          stage: "Submitted",
          author: cleanFiler.name,
          role: cleanFiler.role,
          note: isAnonymous
            ? "Confidential whistleblowing grievance submitted into encrypted intake."
            : "Formal grievance submitted for HR review.",
          timestamp: now,
        },
      ],
    };

    const updated = [newCase, ...list];
    saveComplaints(updated);

    // Broadcast enterprise notification
    activityNotificationService.addNotification({
      title: `New Grievance Filed: ${caseNumber}`,
      message: `${cleanFiler.name} filed a ${urgency.toLowerCase()} priority grievance: "${title.trim()}". Awaiting HR intake triage.`,
      actorRole: "EMPLOYEE",
      actor: { name: cleanFiler.name, role: cleanFiler.role },
      targetAudience: "ADMIN_HR",
      type: "complaint",
      priority: urgency === "Urgent" ? "urgent" : "high",
      link: "/complaints",
    });

    return newCase;
  },

  /**
   * HR action: Acknowledge & begin investigation
   */
  startInvestigation(id, { investigatorName = "Aaliyah Patel (HR)", hrNotes = "" } = {}) {
    const list = getStoredComplaints();
    const now = new Date().toISOString();

    const updated = list.map((c) => {
      if (c.id !== id && c.caseNumber !== id) return c;

      const newTimeline = [
        ...c.timeline,
        {
          id: `t_${Date.now()}`,
          stage: "Under HR Investigation",
          author: investigatorName,
          role: "HR",
          note: hrNotes ? `Investigation initiated: ${hrNotes}` : "HR initiated formal inquiry and evidence gathering.",
          timestamp: now,
        },
      ];

      return {
        ...c,
        status: "INVESTIGATING",
        assignedInvestigator: investigatorName,
        hrNotes: hrNotes || c.hrNotes,
        timeline: newTimeline,
      };
    });

    saveComplaints(updated);

    activityNotificationService.addNotification({
      title: `HR Initiated Investigation: ${id}`,
      message: `${investigatorName} opened active investigation on case ${id}.`,
      actorRole: "HR",
      actor: { name: investigatorName, role: "HR" },
      targetAudience: "ALL",
      type: "complaint",
      priority: "normal",
      link: "/complaints",
    });

    return updated.find((c) => c.id === id || c.caseNumber === id);
  },

  /**
   * HR action: Escalate to Executive Admin for Approval
   * (Exactly matching the corporate hierarchy requested by user:
   * HR handles investigation and escalates to Admin for executive sign-off)
   */
  escalateToAdmin(id, { reason, requestedRemedy, escalatedBy = "Aaliyah Patel (HR)" }) {
    const list = getStoredComplaints();
    const now = new Date().toISOString();

    const updated = list.map((c) => {
      if (c.id !== id && c.caseNumber !== id) return c;

      const escalationDetails = {
        escalatedAt: now,
        escalatedBy,
        reason: reason.trim(),
        requestedAdminAction: requestedRemedy.trim(),
      };

      const newTimeline = [
        ...c.timeline,
        {
          id: `t_${Date.now()}`,
          stage: "Escalated for Admin Approval",
          author: escalatedBy,
          role: "HR",
          note: `Escalated to Executive Admin: "${reason.trim()}". Requested remedy: "${requestedRemedy.trim()}".`,
          timestamp: now,
        },
      ];

      return {
        ...c,
        status: "ESCALATED_TO_ADMIN",
        escalationDetails,
        timeline: newTimeline,
      };
    });

    saveComplaints(updated);

    activityNotificationService.addNotification({
      title: `URGENT: Grievance Escalated to Admin (${id})`,
      message: `${escalatedBy} escalated Case ${id} for Executive Admin Approval: "${reason.trim()}".`,
      actorRole: "HR",
      actor: { name: escalatedBy, role: "HR" },
      targetAudience: "ADMIN",
      type: "complaint",
      priority: "urgent",
      link: "/complaints",
    });

    return updated.find((c) => c.id === id || c.caseNumber === id);
  },

  /**
   * Admin action: Executive Approval & Sign-Off
   */
  adminApprove(id, { decision = "APPROVED", adminNotes = "", approvedBy = "Sarah Connor (Admin)" }) {
    const list = getStoredComplaints();
    const now = new Date().toISOString();

    const updated = list.map((c) => {
      if (c.id !== id && c.caseNumber !== id) return c;

      const adminReview = {
        reviewedAt: now,
        reviewedBy,
        decision,
        notes: adminNotes.trim() || "Executive authorization granted. Proceed with proposed resolution.",
      };

      const newTimeline = [
        ...c.timeline,
        {
          id: `t_${Date.now()}`,
          stage: "Admin Approved - Resolving",
          author: approvedBy,
          role: "ADMIN",
          note: `Executive Sign-Off granted by ${approvedBy}: "${adminNotes.trim() || 'Approved'}".`,
          timestamp: now,
        },
      ];

      return {
        ...c,
        status: "APPROVED_BY_ADMIN",
        adminReview,
        timeline: newTimeline,
      };
    });

    saveComplaints(updated);

    activityNotificationService.addNotification({
      title: `Executive Admin Approved Grievance Remedy: ${id}`,
      message: `${approvedBy} signed off on Case ${id}. HR authorized to execute resolution.`,
      actorRole: "ADMIN",
      actor: { name: approvedBy, role: "ADMIN" },
      targetAudience: "ALL",
      type: "complaint",
      priority: "high",
      link: "/complaints",
    });

    return updated.find((c) => c.id === id || c.caseNumber === id);
  },

  /**
   * HR action: Finalize resolution and close grievance
   */
  resolveComplaint(id, { summary, resolvedBy = "Aaliyah Patel (HR)" }) {
    const list = getStoredComplaints();
    const now = new Date().toISOString();

    const updated = list.map((c) => {
      if (c.id !== id && c.caseNumber !== id) return c;

      const resolution = {
        resolvedAt: now,
        resolvedBy,
        summary: summary.trim(),
      };

      const newTimeline = [
        ...c.timeline,
        {
          id: `t_${Date.now()}`,
          stage: "Resolved & Closed",
          author: resolvedBy,
          role: "HR",
          note: `Case closed with official resolution: "${summary.trim()}".`,
          timestamp: now,
        },
      ];

      return {
        ...c,
        status: "RESOLVED",
        resolution,
        timeline: newTimeline,
      };
    });

    saveComplaints(updated);

    activityNotificationService.addNotification({
      title: `Grievance Case Resolved: ${id}`,
      message: `${resolvedBy} finalized and officially closed Case ${id}.`,
      actorRole: "HR",
      actor: { name: resolvedBy, role: "HR" },
      targetAudience: "ALL",
      type: "complaint",
      priority: "normal",
      link: "/complaints",
    });

    return updated.find((c) => c.id === id || c.caseNumber === id);
  },
};
