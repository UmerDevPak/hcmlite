"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { containerStagger, itemFadeUp, scrollViewport } from "@/lib/animationVariants";
import {
  ShieldAlert,
  AlertCircle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  ArrowRight,
  X,
  Send,
  Eye,
  EyeOff,
  Sparkles,
  FileText,
  MessageSquare,
  Lock,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import {
  complaintService,
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUS,
} from "@/services/complaintService";
import { normalizeRole } from "@/lib/constants";
import { formatDate, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export default function ComplaintsPage() {
  const { user, role } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [isAdminApproveModalOpen, setIsAdminApproveModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  // Form states
  const [createFormData, setCreateFormData] = useState({
    title: "",
    category: "MANAGER_MISCONDUCT",
    urgency: "Medium",
    isAnonymous: false,
    description: "",
    desiredRemedy: "",
  });

  const [escalateData, setEscalateData] = useState({
    reason: "",
    requestedRemedy: "",
  });

  const [adminReviewData, setAdminReviewData] = useState({
    decision: "APPROVED",
    adminNotes: "",
  });

  const [resolveData, setResolveData] = useState({
    summary: "",
  });

  const activeRole = normalizeRole(user?.role || role || "EMPLOYEE");

  const loadComplaints = () => {
    const list = complaintService.getComplaints({
      role: activeRole,
      userEmail: user?.email,
      employeeId: user?.employeeId,
    });
    setComplaints(list);

    // Keep active selected complaint updated in real-time
    if (selectedComplaint) {
      const refreshed = list.find((c) => c.id === selectedComplaint.id);
      if (refreshed) setSelectedComplaint(refreshed);
    }
  };

  useEffect(() => {
    loadComplaints();

    const handleUpdate = () => loadComplaints();
    window.addEventListener("hcm_complaints_updated", handleUpdate);
    return () => window.removeEventListener("hcm_complaints_updated", handleUpdate);
  }, [activeRole, user]);

  // Filtering
  const filteredComplaints = complaints.filter((c) => {
    // Tab filter
    if (activeTab === "PENDING_HR" && c.status !== "PENDING_HR") return false;
    if (activeTab === "INVESTIGATING" && c.status !== "INVESTIGATING") return false;
    if (activeTab === "ESCALATED_TO_ADMIN" && c.status !== "ESCALATED_TO_ADMIN") return false;
    if (activeTab === "RESOLVED" && c.status !== "RESOLVED") return false;

    // Urgency filter
    if (urgencyFilter !== "ALL" && c.urgency !== urgencyFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(query);
      const matchDesc = c.description.toLowerCase().includes(query);
      const matchCase = c.caseNumber.toLowerCase().includes(query);
      const matchFiler = c.filedBy?.name?.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchCase && !matchFiler) return false;
    }

    return true;
  });

  // Metrics
  const totalCount = complaints.length;
  const pendingTriageCount = complaints.filter((c) => c.status === "PENDING_HR").length;
  const investigatingCount = complaints.filter((c) => c.status === "INVESTIGATING").length;
  const escalatedToAdminCount = complaints.filter((c) => c.status === "ESCALATED_TO_ADMIN").length;
  const resolvedCount = complaints.filter((c) => c.status === "RESOLVED").length;

  // Category & Urgency breakdown telemetry
  const categoryStats = COMPLAINT_CATEGORIES.map((cat) => {
    const count = complaints.filter((c) => c.category === cat.id).length;
    const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { ...cat, count, percent };
  });

  const urgencyLevels = [
    { level: "Urgent", color: "bg-rose-500", text: "text-rose-400", bar: "from-rose-500 to-rose-600" },
    { level: "High", color: "bg-amber-500", text: "text-amber-400", bar: "from-amber-500 to-amber-600" },
    { level: "Medium", color: "bg-indigo-500", text: "text-indigo-400", bar: "from-indigo-500 to-indigo-600" },
    { level: "Low", color: "bg-zinc-500", text: "text-zinc-400", bar: "from-zinc-500 to-zinc-600" },
  ];
  const urgencyStats = urgencyLevels.map((u) => {
    const count = complaints.filter((c) => c.urgency === u.level).length;
    const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { ...u, count, percent };
  });

  // Actions
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!createFormData.title.trim() || !createFormData.description.trim()) {
      notifyError("Validation Error", "Title and description are required.");
      return;
    }

    try {
      const newCase = complaintService.createComplaint({
        ...createFormData,
        filedBy: {
          name: user?.displayName || "Employee",
          email: user?.email || "employee@hcmlite.internal",
          department: user?.department || "General",
          role: activeRole,
        },
      });

      notifySuccess("Grievance Logged", `Case ${newCase.caseNumber} registered in secure intake.`);
      setIsCreateModalOpen(false);
      setCreateFormData({
        title: "",
        category: "MANAGER_MISCONDUCT",
        urgency: "Medium",
        isAnonymous: false,
        description: "",
        desiredRemedy: "",
      });
      loadComplaints();
    } catch (err) {
      notifyError("Submission Error", err.message);
    }
  };

  const handleStartInvestigation = (complaint) => {
    try {
      complaintService.startInvestigation(complaint.id, {
        investigatorName: user?.displayName || "Aaliyah Patel (HR)",
        hrNotes: "HR formally acknowledged case and began preliminary fact-finding.",
      });
      notifySuccess("Investigation Commenced", `You are assigned as lead investigator for ${complaint.caseNumber}.`);
      loadComplaints();
    } catch (err) {
      notifyError("Action Failed", err.message);
    }
  };

  const handleEscalateSubmit = (e) => {
    e.preventDefault();
    if (!escalateData.reason.trim()) {
      notifyError("Validation Error", "Reason for escalation is required.");
      return;
    }

    try {
      complaintService.escalateToAdmin(selectedComplaint.id, {
        reason: escalateData.reason,
        requestedRemedy: escalateData.requestedRemedy || "Executive review and authorization.",
        escalatedBy: user?.displayName || "Aaliyah Patel (HR)",
      });

      notifySuccess("Case Escalated", `Case ${selectedComplaint.caseNumber} escalated to Executive Admin.`);
      setIsEscalateModalOpen(false);
      setEscalateData({ reason: "", requestedRemedy: "" });
      loadComplaints();
    } catch (err) {
      notifyError("Action Failed", err.message);
    }
  };

  const handleAdminApproveSubmit = (e) => {
    e.preventDefault();
    try {
      complaintService.adminApprove(selectedComplaint.id, {
        decision: adminReviewData.decision,
        adminNotes: adminReviewData.adminNotes || "Executive approval granted. HR authorized to execute resolution.",
        approvedBy: user?.displayName || "Sarah Connor (Admin)",
      });

      notifySuccess("Executive Sign-Off Granted", `Executive sign-off recorded for ${selectedComplaint.caseNumber}.`);
      setIsAdminApproveModalOpen(false);
      setAdminReviewData({ decision: "APPROVED", adminNotes: "" });
      loadComplaints();
    } catch (err) {
      notifyError("Action Failed", err.message);
    }
  };

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (!resolveData.summary.trim()) {
      notifyError("Validation Error", "Resolution summary is required.");
      return;
    }

    try {
      complaintService.resolveComplaint(selectedComplaint.id, {
        summary: resolveData.summary,
        resolvedBy: user?.displayName || "Aaliyah Patel (HR)",
      });

      notifySuccess("Grievance Resolved", `Case ${selectedComplaint.caseNumber} closed with final resolution.`);
      setIsResolveModalOpen(false);
      setResolveData({ summary: "" });
      loadComplaints();
    } catch (err) {
      notifyError("Action Failed", err.message);
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case "Urgent":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">Urgent</span>;
      case "High":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">High</span>;
      case "Medium":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-500/10 text-zinc-400 border border-zinc-500/30">Low</span>;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerStagger}
      className="space-y-8 pb-16"
    >
      {/* Header Banner */}
      <motion.div
        variants={itemFadeUp}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-zinc-900/90 via-zinc-900/50 to-zinc-950 shadow-elevated relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Corporate Grievance Redressal System</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
            Workforce Complaints & Grievances
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            {activeRole === "ADMIN" && (
              <>
                <strong className="text-zinc-200">Executive Authority Portal:</strong> Review HR investigation findings, authorize disciplinary remedies, and grant final executive approval for escalated workplace grievances.
              </>
            )}
            {activeRole === "HR" && (
              <>
                <strong className="text-zinc-200">Primary Grievance Custodian:</strong> Intake workplace complaints, conduct confidential inquiries, mediate disputes, and escalate complex issues to Executive Admin for authorization.
              </>
            )}
            {activeRole === "EMPLOYEE" && (
              <>
                <strong className="text-zinc-200">Confidential Employee Helpdesk:</strong> File grievances with optional anonymous whistleblowing protection. Track case progress in real-time through HR triage and executive resolution.
              </>
            )}
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            icon={Plus}
            className="font-bold text-xs py-2.5 px-4 shadow-glow w-full sm:w-auto"
          >
            File New Grievance
          </Button>
        </div>
      </motion.div>

      {/* Metric KPI Overview (Staggered Pop-In Cards) */}
      <motion.div
        variants={containerStagger}
        className="grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        <motion.div
          variants={itemFadeUp}
          whileHover={{ y: -4, transition: { duration: 0.16 } }}
          whileTap={{ scale: 0.985 }}
          className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-2 hover:border-zinc-700 transition-colors"
        >
          <span className="text-xs font-medium text-zinc-400">Total Cases Logged</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-zinc-100">{totalCount}</span>
            <span className="text-[10px] font-mono text-zinc-500">Corporate Registry</span>
          </div>
          <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full bg-indigo-500"
            />
          </div>
        </motion.div>

        <motion.div
          variants={itemFadeUp}
          whileHover={{ y: -4, transition: { duration: 0.16 } }}
          whileTap={{ scale: 0.985 }}
          className="p-4 sm:p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 shadow-sm space-y-2 hover:border-amber-500/40 transition-colors"
        >
          <span className="text-xs font-medium text-amber-400">Pending HR Intake</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-amber-300">{pendingTriageCount}</span>
            <span className="text-[10px] font-mono text-amber-500">Awaiting Assignment</span>
          </div>
          <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${totalCount > 0 ? (pendingTriageCount / totalCount) * 100 : 0}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full bg-amber-500"
            />
          </div>
        </motion.div>

        <motion.div
          variants={itemFadeUp}
          whileHover={{ y: -4, transition: { duration: 0.16 } }}
          whileTap={{ scale: 0.985 }}
          className="p-4 sm:p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 shadow-sm space-y-2 relative overflow-hidden hover:border-purple-500/40 transition-colors"
        >
          {escalatedToAdminCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          )}
          <span className="text-xs font-medium text-purple-400">Escalated to Admin</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-purple-300">{escalatedToAdminCount}</span>
            <span className="text-[10px] font-mono text-purple-400 uppercase">Requires Sign-off</span>
          </div>
          <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${totalCount > 0 ? (escalatedToAdminCount / totalCount) * 100 : 0}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full bg-purple-500"
            />
          </div>
        </motion.div>

        <motion.div
          variants={itemFadeUp}
          whileHover={{ y: -4, transition: { duration: 0.16 } }}
          whileTap={{ scale: 0.985 }}
          className="p-4 sm:p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 shadow-sm space-y-2 hover:border-emerald-500/40 transition-colors"
        >
          <span className="text-xs font-medium text-emerald-400">Resolved & Closed</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-emerald-300">{resolvedCount}</span>
            <span className="text-[10px] font-mono text-emerald-500">Remediated</span>
          </div>
          <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${totalCount > 0 ? (resolvedCount / totalCount) * 100 : 0}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full bg-emerald-500"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Visual Telemetry: Category & Urgency Distribution (Trigger on Scroll) */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={scrollViewport}
        variants={itemFadeUp}
      >
        <div className="p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                Grievance Telemetry & Intake Analytics
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real-time breakdown of logged incidents across corporate categories and priority levels.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 self-start sm:self-auto border border-zinc-700">
              {totalCount} Total Case Distribution
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Category Breakdown with animated gradient bars */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                Category Distribution
              </span>
              <div className="space-y-2.5">
                {categoryStats.map((cat) => (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-medium truncate">{cat.label}</span>
                      <div className="flex items-center gap-2 shrink-0 font-mono">
                        <span className="text-zinc-400 text-[11px]">{cat.count} {cat.count === 1 ? "case" : "cases"}</span>
                        <span className="font-semibold text-zinc-200">{cat.percent}%</span>
                      </div>
                    </div>
                    {/* Animated Progress Bar */}
                    <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(cat.percent, cat.count > 0 ? 8 : 0)}%` }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Urgency Severity Matrix */}
            <div className="space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-3">
                  Priority Severity Matrix
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {urgencyStats.map((u) => (
                    <motion.div
                      key={u.level}
                      whileHover={{ y: -2, transition: { duration: 0.15 } }}
                      className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className={cn("font-bold text-xs uppercase tracking-wider", u.text)}>
                          {u.level}
                        </span>
                        <span className="font-mono text-zinc-400 text-[11px] font-semibold">
                          {u.percent}%
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-extrabold font-mono text-zinc-100">{u.count}</span>
                        <span className="text-[10px] text-zinc-500">tickets</span>
                      </div>
                      {/* Animated Bar */}
                      <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${u.percent}%` }}
                          transition={{ duration: 0.55, ease: "easeOut" }}
                          className={cn("h-full rounded-full bg-gradient-to-r", u.bar)}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Policy Note Callout */}
              <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-950/20 text-xs text-rose-300 space-y-1 mt-3">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                  Anti-Retaliation Policy Protection
                </div>
                <p className="text-[11px] text-zinc-400">
                  Whistleblower submissions are cryptographically encrypted. Anonymous filings strip filer metadata and employee IP identifiers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter and Search Bar */}
      <motion.div
        variants={itemFadeUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm"
      >
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0 text-xs">
          {[
            { id: "ALL", label: `All Cases (${totalCount})` },
            { id: "PENDING_HR", label: `Pending HR (${pendingTriageCount})` },
            { id: "INVESTIGATING", label: `In Review (${investigatingCount})` },
            { id: "ESCALATED_TO_ADMIN", label: `⚡ Escalated to Admin (${escalatedToAdminCount})` },
            { id: "RESOLVED", label: `Resolved (${resolvedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all duration-200 active:scale-[0.98]",
                activeTab === tab.id
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Urgency dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search case, subject, filer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent Only</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </motion.div>

      {/* Complaints List Cards (Trigger on Scroll into View) */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={scrollViewport}
        variants={containerStagger}
        className="space-y-4"
      >
        {filteredComplaints.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 space-y-3">
            <ShieldCheck className="w-10 h-10 mx-auto text-zinc-600 stroke-[1.5]" />
            <h3 className="font-semibold text-sm text-zinc-200">No Complaints Match Filters</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              There are currently no active grievances under this category. Corporate compliance checks are operating within standard parameters.
            </p>
          </div>
        ) : (
          filteredComplaints.map((item) => {
            const categoryObj = COMPLAINT_CATEGORIES.find((c) => c.id === item.category) || COMPLAINT_CATEGORIES[6];
            const statusObj = COMPLAINT_STATUS[item.status] || COMPLAINT_STATUS.PENDING_HR;

            return (
              <motion.div
                key={item.id}
                variants={itemFadeUp}
                whileHover={{ y: -3, transition: { duration: 0.16 } }}
                className={cn(
                  "p-5 sm:p-6 rounded-2xl border transition-colors duration-150 bg-white dark:bg-zinc-900/60 shadow-sm space-y-4 hover:border-zinc-700",
                  item.status === "ESCALATED_TO_ADMIN"
                    ? "border-purple-500/40 bg-purple-950/10"
                    : "border-zinc-200 dark:border-zinc-800"
                )}
              >
                {/* Top Row: Case Number, Badges, Urgency, Status */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700">
                      {item.caseNumber}
                    </span>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", categoryObj.color)}>
                      {categoryObj.label}
                    </span>
                    {getUrgencyBadge(item.urgency)}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-semibold px-3 py-1 rounded-full border", statusObj.color)}>
                      {statusObj.label}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* Desired Remedy Callout */}
                {item.desiredRemedy && (
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-300 space-y-1">
                    <span className="font-semibold text-zinc-400 block text-[10px] uppercase tracking-wider">
                      Desired Filer Remedy:
                    </span>
                    <p className="text-zinc-200">{item.desiredRemedy}</p>
                  </div>
                )}

                {/* Escalation details if active */}
                {item.status === "ESCALATED_TO_ADMIN" && item.escalationDetails && (
                  <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-950/20 text-xs text-purple-200 space-y-1.5 animate-pulse">
                    <div className="flex items-center gap-2 font-bold text-purple-300 text-xs">
                      <ShieldAlert className="w-4 h-4 text-purple-400" />
                      <span>Executive Escalation Briefing:</span>
                    </div>
                    <p className="text-zinc-300 font-medium">{item.escalationDetails.reason}</p>
                    <p className="text-[11px] text-purple-300/80">
                      <strong>Requested Admin Action:</strong> {item.escalationDetails.requestedAdminAction}
                    </p>
                  </div>
                )}

                {/* Progress Step Bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 font-medium">
                    <span className={item.timeline.length >= 1 ? "text-indigo-400 font-semibold" : ""}>1. Intake Logged</span>
                    <span className={item.assignedInvestigator ? "text-indigo-400 font-semibold" : ""}>2. HR Investigation</span>
                    <span className={item.escalationDetails ? "text-purple-400 font-semibold" : ""}>3. Executive Admin Escalation</span>
                    <span className={item.status === "RESOLVED" ? "text-emerald-400 font-semibold" : ""}>4. Remediation Closed</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 rounded-full",
                        item.status === "RESOLVED"
                          ? "bg-emerald-500 w-full"
                          : item.status === "ESCALATED_TO_ADMIN" || item.status === "APPROVED_BY_ADMIN"
                          ? "bg-purple-500 w-3/4"
                          : item.status === "INVESTIGATING"
                          ? "bg-indigo-500 w-1/2"
                          : "bg-amber-500 w-1/4"
                      )}
                    />
                  </div>
                </div>

                {/* Footer Controls & Role Based Actions */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Filer info */}
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-[10px]">
                      {item.isAnonymous ? <Lock className="w-3 h-3 text-amber-400" /> : <User className="w-3 h-3 text-cyan-400" />}
                    </div>
                    <span>
                      Filed by:{" "}
                      <strong className="text-zinc-200">
                        {item.isAnonymous ? "Anonymous Whistleblower" : item.filedBy?.name}
                      </strong>{" "}
                      ({item.filedBy?.department || "Staff"})
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Details Drawer */}
                    <button
                      onClick={() => setSelectedComplaint(item)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 transition-colors flex items-center gap-1.5"
                    >
                      <span>View Dossier & Timeline</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* HR: Start Investigation */}
                    {activeRole === "HR" && item.status === "PENDING_HR" && (
                      <Button
                        onClick={() => handleStartInvestigation(item)}
                        className="text-xs py-1.5 px-3 font-semibold"
                      >
                        Start Investigation
                      </Button>
                    )}

                    {/* HR: Escalate to Admin */}
                    {activeRole === "HR" && item.status === "INVESTIGATING" && (
                      <button
                        onClick={() => {
                          setSelectedComplaint(item);
                          setIsEscalateModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <span>Escalate to Admin</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* HR: Direct Resolve */}
                    {activeRole === "HR" && (item.status === "INVESTIGATING" || item.status === "APPROVED_BY_ADMIN") && (
                      <button
                        onClick={() => {
                          setSelectedComplaint(item);
                          setIsResolveModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold transition-colors"
                      >
                        Resolve & Close
                      </button>
                    )}

                    {/* ADMIN: Approve Escalated Complaint */}
                    {activeRole === "ADMIN" && item.status === "ESCALATED_TO_ADMIN" && (
                      <button
                        onClick={() => {
                          setSelectedComplaint(item);
                          setIsAdminApproveModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-lg border border-purple-500 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-glow flex items-center gap-1.5 animate-pulse"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Executive Sign-Off</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* ========================================================= */}
      {/* MODAL 1: FILE NEW GRIEVANCE MODAL                         */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-semibold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Confidential Grievance Submission</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-zinc-100">
                File a Formal Complaint
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                All submissions are encrypted and handled under enterprise whistleblowing policy. HR will review and investigate according to severity.
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <Input
                label="Complaint Subject / Title"
                placeholder="e.g. Inappropriate conduct during retrospective"
                value={createFormData.title}
                onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Grievance Category
                  </label>
                  <select
                    value={createFormData.category}
                    onChange={(e) => setCreateFormData({ ...createFormData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {COMPLAINT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Urgency Level
                  </label>
                  <select
                    value={createFormData.urgency}
                    onChange={(e) => setCreateFormData({ ...createFormData, urgency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Low">Low - General Inquiry</option>
                    <option value="Medium">Medium - Operational Impact</option>
                    <option value="High">High - Severe Policy Matter</option>
                    <option value="Urgent">Urgent - Immediate Risk</option>
                  </select>
                </div>
              </div>

              {/* Anonymous Whistleblower Option */}
              <div className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-between cursor-pointer">
                <div className="space-y-0.5">
                  <span className="font-semibold text-xs text-zinc-200 block">
                    Anonymous Whistleblower Mode
                  </span>
                  <span className="text-[11px] text-zinc-400 block">
                    Hides your name and email. HR and Admin see "Anonymous Whistleblower".
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={createFormData.isAnonymous}
                  onChange={(e) => setCreateFormData({ ...createFormData, isAnonymous: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Detailed Statement of Facts
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide objective dates, occurrences, parties involved, and impact..."
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Desired Remedy or Proposed Outcome (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="What resolution or corrective action are you requesting from HR / Executive Leadership?"
                  value={createFormData.desiredRemedy}
                  onChange={(e) => setCreateFormData({ ...createFormData, desiredRemedy: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <Button type="submit" className="font-bold text-xs py-2 px-5">
                  Submit Grievance
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CASE DOSSIER & COMPLETE TIMELINE MODAL           */}
      {/* ========================================================= */}
      {selectedComplaint && !isEscalateModalOpen && !isAdminApproveModalOpen && !isResolveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border border-zinc-700 bg-zinc-950 p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedComplaint(null)}
              className="absolute top-6 right-6 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700">
                  {selectedComplaint.caseNumber}
                </span>
                {getUrgencyBadge(selectedComplaint.urgency)}
                <span className="text-xs text-zinc-400 font-mono">
                  Filed on {formatDate(selectedComplaint.createdAt)}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
                {selectedComplaint.title}
              </h2>
            </div>

            {/* Description dossier */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 space-y-2">
              <span className="font-bold text-zinc-400 block uppercase tracking-wider text-[10px]">
                Official Statement of Grievance:
              </span>
              <p className="leading-relaxed text-zinc-200">{selectedComplaint.description}</p>
            </div>

            {/* Remedy Callout */}
            {selectedComplaint.desiredRemedy && (
              <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
                <strong className="block text-[10px] uppercase font-bold text-indigo-400">
                  Requested Remedy:
                </strong>
                <p className="text-zinc-200">{selectedComplaint.desiredRemedy}</p>
              </div>
            )}

            {/* HR Investigation notes if present */}
            {selectedComplaint.hrNotes && (
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-zinc-300 text-xs">
                  <span>HR Lead Investigator Notes ({selectedComplaint.assignedInvestigator || "HR"}):</span>
                </div>
                <p className="text-zinc-300 leading-relaxed">{selectedComplaint.hrNotes}</p>
              </div>
            )}

            {/* Admin Escalation & Review section */}
            {selectedComplaint.escalationDetails && (
              <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-950/20 text-xs text-purple-200 space-y-2">
                <span className="font-bold text-purple-300 block text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                  <span>Executive Admin Escalation Dossier:</span>
                </span>
                <p className="text-zinc-200">{selectedComplaint.escalationDetails.reason}</p>
                <div className="text-[11px] text-purple-300/80 pt-1">
                  <strong>Requested Executive Action:</strong> {selectedComplaint.escalationDetails.requestedAdminAction}
                </div>
              </div>
            )}

            {selectedComplaint.adminReview && (
              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 text-xs text-emerald-200 space-y-1.5">
                <span className="font-bold text-emerald-300 block text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Executive Administrator Official Sign-Off:</span>
                </span>
                <p className="text-zinc-200">{selectedComplaint.adminReview.notes}</p>
                <span className="text-[10px] text-emerald-400/80 block font-mono">
                  Authorized by {selectedComplaint.adminReview.reviewedBy} on {formatDate(selectedComplaint.adminReview.reviewedAt)}
                </span>
              </div>
            )}

            {/* Complete Chronological Case Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Chronological Case Audit Trail</span>
              </h4>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                {selectedComplaint.timeline.map((item, idx) => (
                  <div key={item.id || idx} className="relative space-y-1">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-zinc-950" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-200">{item.stage}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{formatDate(item.timestamp)}</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{item.note}</p>
                    <span className="text-[10px] text-zinc-500 font-medium">Logged by: {item.author} ({item.role})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar inside dossier */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                Close Dossier
              </button>

              {activeRole === "HR" && selectedComplaint.status === "INVESTIGATING" && (
                <button
                  onClick={() => setIsEscalateModalOpen(true)}
                  className="px-4 py-2 rounded-xl border border-purple-500/40 bg-purple-600/30 text-purple-200 text-xs font-bold hover:bg-purple-600/40 transition-colors"
                >
                  Escalate to Executive Admin
                </button>
              )}

              {activeRole === "ADMIN" && selectedComplaint.status === "ESCALATED_TO_ADMIN" && (
                <button
                  onClick={() => setIsAdminApproveModalOpen(true)}
                  className="px-4 py-2 rounded-xl border border-purple-500 bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-colors shadow-glow"
                >
                  Executive Sign-Off
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: HR ESCALATE TO ADMIN MODAL                       */}
      {/* ========================================================= */}
      {isEscalateModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-purple-500/50 bg-zinc-950 p-6 shadow-2xl space-y-5 animate-scale-in">
            <button
              onClick={() => setIsEscalateModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs text-purple-400 font-semibold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Executive Escalation Gateway</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-100">
                Escalate Case to Executive Admin
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Escalate {selectedComplaint.caseNumber} to Sarah Connor (Executive Admin) for budget authorization, policy change, or disciplinary sign-off.
              </p>
            </div>

            <form onSubmit={handleEscalateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">
                  HR Findings & Reason for Escalation
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain why this requires Executive Admin approval (e.g., budget impact, legal risk, management disciplinary action)..."
                  value={escalateData.reason}
                  onChange={(e) => setEscalateData({ ...escalateData, reason: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Requested Executive Action / Remedy
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Sign off on $4,800 overtime retroactive budget, approve formal written reprimand..."
                  value={escalateData.requestedRemedy}
                  onChange={(e) => setEscalateData({ ...escalateData, requestedRemedy: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEscalateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl border border-purple-500 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow transition-all"
                >
                  Submit Escalation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: ADMIN EXECUTIVE APPROVAL MODAL                   */}
      {/* ========================================================= */}
      {isAdminApproveModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-emerald-500/50 bg-zinc-950 p-6 shadow-2xl space-y-5 animate-scale-in">
            <button
              onClick={() => setIsAdminApproveModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Executive Sign-Off Authority</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-100">
                Authorize Grievance Remedy
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                As Executive Administrator, grant official company approval for Case {selectedComplaint.caseNumber}.
              </p>
            </div>

            <form onSubmit={handleAdminApproveSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-1">
                <span className="font-bold text-purple-300 block">HR Escalation Request:</span>
                <p className="text-zinc-300">{selectedComplaint.escalationDetails?.reason || selectedComplaint.description}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Executive Directives / Direct Authorization Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Record executive decision terms, policy instructions, or authorized budget..."
                  value={adminReviewData.adminNotes}
                  onChange={(e) => setAdminReviewData({ ...adminReviewData, adminNotes: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAdminApproveModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl border border-emerald-500 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow transition-all"
                >
                  Grant Executive Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: HR RESOLVE & CLOSE GRIEVANCE MODAL              */}
      {/* ========================================================= */}
      {isResolveModalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-emerald-500/40 bg-zinc-950 p-6 shadow-2xl space-y-5 animate-scale-in">
            <button
              onClick={() => setIsResolveModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Final Resolution & Case Closure</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-100">
                Close Grievance #{selectedComplaint.caseNumber}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Document final remediation terms executed. The employee and executive admin will be notified.
              </p>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Final Official Remediation Summary
                </label>
                <textarea
                  rows={4}
                  placeholder="Document actions executed (e.g., payroll adjustment processed, mediation session completed, policy memo issued)..."
                  value={resolveData.summary}
                  onChange={(e) => setResolveData({ ...resolveData, summary: e.target.value })}
                  className="w-full p-3 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsResolveModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl border border-emerald-500 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow transition-all"
                >
                  Confirm & Close Grievance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
