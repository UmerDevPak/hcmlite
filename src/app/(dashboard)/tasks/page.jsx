"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { containerStagger, itemFadeUp } from "@/lib/animationVariants";
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ExternalLink,
  FileText,
  User,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  Send,
  Star,
  RotateCcw,
  Check,
  X,
  Target,
  Layers,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { taskService, TASK_STATUS, TASK_PRIORITY } from "@/services/taskService";
import { employeeService } from "@/services/employeeService";
import { normalizeRole } from "@/lib/constants";
import { formatDate, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";

export default function TasksPage() {
  const { user, role } = useAuth();
  const { notifySuccess, notifyError, notifyInfo } = useNotification();

  const activeRole = normalizeRole(user?.role || role || "EMPLOYEE");
  const isAdmin = activeRole === "ADMIN";
  const isHR = activeRole === "HR";
  const isEmployee = activeRole === "EMPLOYEE";

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState([]);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Form states
  const [submitFormData, setSubmitFormData] = useState({
    notes: "",
    link: "",
    fileName: "",
  });

  const [reviewFormData, setReviewFormData] = useState({
    decision: "APPROVED",
    feedback: "",
    score: 5,
  });

  const [createFormData, setCreateFormData] = useState({
    title: "",
    description: "",
    department: "Engineering",
    priority: "Medium",
    assignedToId: "EMP-003",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    isExecutiveOkr: false,
  });

  const loadData = async () => {
    try {
      const [allTasks, currentStats, empList] = await Promise.all([
        taskService.getTasks({
          role: activeRole,
          userEmail: user?.email,
          employeeId: user?.employeeId,
        }),
        taskService.getTaskStats(),
        employeeService.getAllEmployees(),
      ]);
      setTasks(allTasks);
      setStats(currentStats);
      setEmployees(empList);
    } catch (err) {
      console.warn("[TasksPage] Load error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, activeRole]);

  // Handlers
  const handleStartWork = async (task) => {
    try {
      await taskService.updateStatus(task.id, TASK_STATUS.IN_PROGRESS);
      notifySuccess("Work Started", `Task ${task.id} is now In Progress.`);
      loadData();
    } catch (err) {
      notifyError("Failed", err.message);
    }
  };

  const handleOpenSubmitModal = (task) => {
    setSelectedTask(task);
    setSubmitFormData({
      notes: task.deliverable?.notes || "",
      link: task.deliverable?.link || "",
      fileName: task.deliverable?.fileName || "deliverable-final.zip",
    });
    setIsSubmitModalOpen(true);
  };

  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    if (!submitFormData.notes.trim()) {
      notifyError("Validation Error", "Delivery notes are required.");
      return;
    }

    try {
      await taskService.submitDeliverable(selectedTask.id, {
        notes: submitFormData.notes,
        link: submitFormData.link,
        fileName: submitFormData.fileName || "work-package.zip",
        submittedBy: user?.displayName || "Employee",
      });

      notifySuccess("Deliverable Submitted", `Task ${selectedTask.id} submitted for HR evaluation.`);
      setIsSubmitModalOpen(false);
      loadData();
    } catch (err) {
      notifyError("Submission Failed", err.message);
    }
  };

  const handleOpenReviewModal = (task) => {
    setSelectedTask(task);
    setReviewFormData({
      decision: "APPROVED",
      feedback: "Deliverable satisfies corporate quality metrics.",
      score: 5,
    });
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await taskService.reviewTask(selectedTask.id, {
        decision: reviewFormData.decision,
        feedback: reviewFormData.feedback,
        score: reviewFormData.score,
        reviewerName: user?.displayName || "Aaliyah Patel (HR)",
      });

      if (reviewFormData.decision === "APPROVED") {
        notifySuccess("Deliverable Approved", `Task ${selectedTask.id} marked as completed & verified.`);
      } else {
        notifyInfo("Revisions Requested", `Feedback transmitted back to ${selectedTask.assignedTo?.name}.`);
      }
      setIsReviewModalOpen(false);
      loadData();
    } catch (err) {
      notifyError("Review Failed", err.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!createFormData.title.trim()) {
      notifyError("Validation Error", "Task title is required.");
      return;
    }

    const assignedEmp = employees.find((e) => e.id === createFormData.assignedToId);

    try {
      await taskService.createTask({
        title: createFormData.title,
        description: createFormData.description,
        department: createFormData.department,
        priority: createFormData.priority,
        assignedTo: assignedEmp
          ? {
              id: assignedEmp.id,
              name: assignedEmp.name,
              email: assignedEmp.email,
              jobTitle: assignedEmp.jobTitle,
              avatar: assignedEmp.avatar,
            }
          : undefined,
        dueDate: createFormData.dueDate,
        isExecutiveOkr: createFormData.isExecutiveOkr,
      });

      notifySuccess("Task Assigned", `New corporate task issued.`);
      setIsCreateModalOpen(false);
      setCreateFormData({
        title: "",
        description: "",
        department: "Engineering",
        priority: "Medium",
        assignedToId: "EMP-003",
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        isExecutiveOkr: false,
      });
      loadData();
    } catch (err) {
      notifyError("Creation Failed", err.message);
    }
  };

  // Filtered list
  const filteredTasks = tasks.filter((t) => {
    const matchesTab =
      activeTab === "ALL"
        ? true
        : activeTab === "SUBMITTED"
        ? t.status === TASK_STATUS.SUBMITTED
        : activeTab === "IN_PROGRESS"
        ? t.status === TASK_STATUS.IN_PROGRESS
        : activeTab === "APPROVED"
        ? t.status === TASK_STATUS.APPROVED
        : activeTab === "REVISION"
        ? t.status === TASK_STATUS.REVISION_REQUESTED
        : true;

    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedTo?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerStagger}
      className="space-y-6 pb-12"
    >
      {/* 1. Header Banner */}
      <motion.div
        variants={itemFadeUp}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-indigo-950/40 border border-zinc-800 shadow-elevated relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5 min-w-0 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Corporate Task & Deliverables Ledger</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-50">
            Task Orchestration & Deliverable Review
          </h1>

          <p className="text-xs text-zinc-400 leading-relaxed">
            {isAdmin && (
              <>
                <strong className="text-zinc-200">Executive Command:</strong> Monitor cross-departmental OKR milestones, unblock organizational bottlenecks, and audit throughput velocity.
              </>
            )}
            {isHR && (
              <>
                <strong className="text-zinc-200">Operational Quality Assurance:</strong> Review employee deliverable submissions, verify compliance, award performance scores, and approve or request revisions.
              </>
            )}
            {isEmployee && (
              <>
                <strong className="text-zinc-200">Self-Service Workspace:</strong> View your assigned milestones, track progress, upload proof deliverables (links & files), and inspect HR evaluation notes.
              </>
            )}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
          {(isAdmin || isHR) && (
            <Button
              size="sm"
              icon={Plus}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Assign New Task
            </Button>
          )}
        </div>
      </motion.div>

      {/* 2. Metric KPI Cards (Staggered Pop-In) */}
      <motion.div
        variants={containerStagger}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div
          variants={itemFadeUp}
          whileHover={{ y: -3, transition: { duration: 0.16 } }}
          className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-2 hover:border-zinc-700 transition-colors"
        >
          <span className="text-xs font-medium text-zinc-400">Total Tracked Tasks</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-zinc-100">{stats?.total || 5}</span>
            <span className="text-[10px] text-zinc-500 font-mono">Org Registry</span>
          </div>
          <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.5 }}
              className="h-full bg-indigo-500 rounded-full"
            />
          </div>
        </motion.div>

        <motion.div
          variants={itemFadeUp}
          whileHover={{ y: -3, transition: { duration: 0.16 } }}
          className="p-4 sm:p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 shadow-sm space-y-2 hover:border-amber-500/40 transition-colors"
        >
          <span className="text-xs font-medium text-amber-400">Awaiting HR Review</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-300">
              {stats?.submittedForReview || 1}
            </span>
            <span className="text-[10px] text-amber-500 font-mono">Pending Evaluation</span>
          </div>
          <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${stats?.total ? ((stats?.submittedForReview || 1) / stats.total) * 100 : 20}%`,
              }}
              transition={{ duration: 0.5 }}
              className="h-full bg-amber-500 rounded-full"
            />
          </div>
        </motion.div>

        <motion.div
          variants={itemFadeUp}
          whileHover={{ y: -3, transition: { duration: 0.16 } }}
          className="p-4 sm:p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 shadow-sm space-y-2 hover:border-emerald-500/40 transition-colors"
        >
          <span className="text-xs font-medium text-emerald-400">Verified & Approved</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-300">
              {stats?.approved || 1}
            </span>
            <span className="text-[10px] text-emerald-500 font-mono">
              {stats?.completionRate || 20}% Completed
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats?.completionRate || 20}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </motion.div>

        <motion.div
          variants={itemFadeUp}
          whileHover={{ y: -3, transition: { duration: 0.16 } }}
          className="p-4 sm:p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 shadow-sm space-y-2 hover:border-rose-500/40 transition-colors"
        >
          <span className="text-xs font-medium text-rose-400">Revision Required</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-rose-300">
              {stats?.revision || 1}
            </span>
            <span className="text-[10px] text-rose-500 font-mono">Feedback Active</span>
          </div>
          <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${stats?.total ? ((stats?.revision || 1) / stats.total) * 100 : 20}%`,
              }}
              transition={{ duration: 0.5 }}
              className="h-full bg-rose-500 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* 3. Department Velocity Telemetry Bars */}
      <motion.div
        variants={itemFadeUp}
        className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Departmental Delivery Velocity & Completion Matrix
              </h3>
              <p className="text-[11px] text-zinc-400">
                Real-time throughput metrics calculated from verified HR approvals.
              </p>
            </div>
          </div>
          <Badge variant="indigo" size="sm">
            Corporate SLA: 85% On-Time
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {(stats?.deptStats || []).map((dept) => (
            <div
              key={dept.name}
              className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-200 truncate">{dept.name}</span>
                <span className="font-mono text-[11px] font-bold text-indigo-400">
                  {dept.rate}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(dept.rate, 6)}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>{dept.done} approved</span>
                <span>{dept.total} total</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 4. Filter Tabs and Search Bar */}
      <motion.div
        variants={itemFadeUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm"
      >
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0 text-xs">
          {[
            { id: "ALL", label: `All Tasks (${tasks.length})` },
            { id: "SUBMITTED", label: `In Review by HR (${stats?.submittedForReview || 0})` },
            { id: "IN_PROGRESS", label: `In Progress (${stats?.inProgress || 0})` },
            { id: "APPROVED", label: `Approved & Verified (${stats?.approved || 0})` },
            { id: "REVISION", label: `Needs Revision (${stats?.revision || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all duration-150",
                activeTab === tab.id
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search task, assignee, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </motion.div>

      {/* 5. Task Cards Feed (Sequential Pop-In & Spring Hover) */}
      <motion.div variants={containerStagger} className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 space-y-3">
            <CheckSquare className="w-10 h-10 mx-auto text-zinc-600 stroke-[1.5]" />
            <h3 className="font-semibold text-sm text-zinc-200">No Tasks In This Category</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              All deliverables in this status queue have been triaged or cleared.
            </p>
          </div>
        ) : (
          filteredTasks.map((t) => {
            const isAssignedToCurrentUser =
              t.assignedTo?.email?.toLowerCase() === user?.email?.toLowerCase() ||
              t.assignedTo?.id === user?.employeeId;

            let statusBadge = (
              <Badge variant="secondary" dot size="sm">
                To Do
              </Badge>
            );
            if (t.status === TASK_STATUS.IN_PROGRESS) {
              statusBadge = (
                <Badge variant="indigo" dot size="sm">
                  In Progress
                </Badge>
              );
            } else if (t.status === TASK_STATUS.SUBMITTED) {
              statusBadge = (
                <Badge variant="warning" dot size="sm">
                  Submitted for Review
                </Badge>
              );
            } else if (t.status === TASK_STATUS.APPROVED) {
              statusBadge = (
                <Badge variant="success" dot size="sm">
                  Approved & Completed
                </Badge>
              );
            } else if (t.status === TASK_STATUS.REVISION_REQUESTED) {
              statusBadge = (
                <Badge variant="danger" dot size="sm">
                  Revision Requested
                </Badge>
              );
            }

            return (
              <motion.div
                key={t.id}
                variants={itemFadeUp}
                whileHover={{ y: -3, transition: { duration: 0.16 } }}
                className="p-5 sm:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-sm space-y-4 hover:border-zinc-700 transition-colors"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                        {t.id}
                      </span>
                      {statusBadge}
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          t.priority === "Urgent"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : t.priority === "High"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-zinc-500/10 text-zinc-400 border-zinc-500/30"
                        )}
                      >
                        {t.priority}
                      </span>
                      <Badge variant="secondary" size="sm">
                        {t.department}
                      </Badge>
                      {t.isExecutiveOkr && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          ★ Executive OKR
                        </span>
                      )}
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-zinc-100">
                      {t.title}
                    </h2>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  {/* Due Date & Assignee */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 text-xs shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Due: <strong className="text-zinc-200">{formatDate(t.dueDate)}</strong></span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <Avatar src={t.assignedTo?.avatar} name={t.assignedTo?.name} size="xs" />
                      <span className="font-medium text-zinc-300 text-xs">
                        {t.assignedTo?.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deliverable Snapshot (If submitted) */}
                {t.deliverable && (
                  <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        Submitted Deliverable Package
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Delivered {formatDate(t.submittedAt)}
                      </span>
                    </div>

                    <p className="text-zinc-300 bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800/80 font-mono text-[11px] leading-relaxed">
                      {t.deliverable.notes}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                      {t.deliverable.link && (
                        <a
                          href={t.deliverable.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4"
                        >
                          Inspection Link / PR <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {t.deliverable.fileName && (
                        <span className="inline-flex items-center gap-1 text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          <FileText className="w-3 h-3 text-zinc-500" />
                          {t.deliverable.fileName}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* HR Review Callout (If reviewed) */}
                {t.hrReview && (
                  <div
                    className={cn(
                      "p-3.5 rounded-xl border text-xs space-y-1.5",
                      t.hrReview.decision === "APPROVED"
                        ? "border-emerald-500/20 bg-emerald-950/20"
                        : "border-rose-500/20 bg-rose-950/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold">
                        {t.hrReview.decision === "APPROVED" ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-300">HR Operational Sign-Off Granted</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                            <span className="text-rose-300">Revisions Requested by HR</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 font-mono text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{t.hrReview.score} / 5.0</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-300">
                      <strong>Evaluator Notes ({t.hrReview.reviewedBy}):</strong> {t.hrReview.feedback}
                    </p>
                  </div>
                )}

                {/* Action Bar (Role-Adaptive) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
                  <div className="text-[11px] text-zinc-500 font-mono">
                    Owner: {t.assignedTo?.jobTitle}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Employee Actions */}
                    {(isEmployee || isAssignedToCurrentUser) && (
                      <>
                        {t.status === TASK_STATUS.TODO && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleStartWork(t)}
                          >
                            Mark In Progress
                          </Button>
                        )}
                        {(t.status === TASK_STATUS.IN_PROGRESS ||
                          t.status === TASK_STATUS.REVISION_REQUESTED) && (
                          <Button
                            size="sm"
                            icon={Send}
                            onClick={() => handleOpenSubmitModal(t)}
                          >
                            Submit Deliverable
                          </Button>
                        )}
                      </>
                    )}

                    {/* HR Review Actions */}
                    {isHR && t.status === TASK_STATUS.SUBMITTED && (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={ShieldCheck}
                        onClick={() => handleOpenReviewModal(t)}
                      >
                        Evaluate & Review Work
                      </Button>
                    )}

                    {/* Admin Executive Override */}
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={ShieldCheck}
                        onClick={() => handleOpenReviewModal(t)}
                      >
                        Audit / Sign Off
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Modal: Employee Submit Deliverable */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Task Deliverable"
        description={`Provide documentation and proof for task ${selectedTask?.id}: "${selectedTask?.title}".`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmitDeliverable} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Delivery Summary & Implementation Notes *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Detail what was completed, architecture considerations, and verification steps..."
              value={submitFormData.notes}
              onChange={(e) => setSubmitFormData({ ...submitFormData, notes: e.target.value })}
              className="w-full rounded-xl text-xs bg-zinc-900 border border-zinc-800 p-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <Input
            label="Proof / Inspection Link (GitHub PR, Figma, Doc URL)"
            icon={ExternalLink}
            placeholder="https://github.com/enterprise/repo/pull/123"
            value={submitFormData.link}
            onChange={(e) => setSubmitFormData({ ...submitFormData, link: e.target.value })}
          />

          <Input
            label="Attached Artifact / Archive Name"
            icon={FileText}
            placeholder="deliverable-v1.zip"
            value={submitFormData.fileName}
            onChange={(e) => setSubmitFormData({ ...submitFormData, fileName: e.target.value })}
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
            <Button variant="ghost" type="button" onClick={() => setIsSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" icon={Send}>
              Transmit to HR for Review
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: HR Review Deliverable */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Operational Quality Review & Scoring"
        description={`Assess deliverable for ${selectedTask?.id} submitted by ${selectedTask?.assignedTo?.name}.`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Review Decision *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReviewFormData({ ...reviewFormData, decision: "APPROVED" })}
                className={cn(
                  "flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all",
                  reviewFormData.decision === "APPROVED"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400"
                )}
              >
                <Check className="w-4 h-4 text-emerald-400" />
                Approve & Complete
              </button>
              <button
                type="button"
                onClick={() =>
                  setReviewFormData({ ...reviewFormData, decision: "REVISION_REQUESTED" })
                }
                className={cn(
                  "flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all",
                  reviewFormData.decision === "REVISION_REQUESTED"
                    ? "border-rose-500 bg-rose-500/10 text-rose-300 ring-1 ring-rose-500"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400"
                )}
              >
                <RotateCcw className="w-4 h-4 text-rose-400" />
                Request Revision
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Quality Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setReviewFormData({ ...reviewFormData, score: num })}
                  className={cn(
                    "p-2 rounded-lg border text-xs font-bold transition-all",
                    reviewFormData.score >= num
                      ? "border-amber-500 bg-amber-500/10 text-amber-300"
                      : "border-zinc-800 bg-zinc-900 text-zinc-500"
                  )}
                >
                  ★ {num}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Evaluator Feedback & Quality Remarks *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Provide constructive feedback, statutory alignment notes, or specific items to revise..."
              value={reviewFormData.feedback}
              onChange={(e) => setReviewFormData({ ...reviewFormData, feedback: e.target.value })}
              className="w-full rounded-xl text-xs bg-zinc-900 border border-zinc-800 p-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
            <Button variant="ghost" type="button" onClick={() => setIsReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Confirm Evaluation</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create / Assign Task */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Assign Enterprise Corporate Task"
        description="Delegate operational objectives or strategic milestones to team members."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title *"
            placeholder="e.g., Audit Q4 Payroll Deductions"
            value={createFormData.title}
            onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-300">
              Detailed Scope & Deliverable Requirements
            </label>
            <textarea
              rows={3}
              placeholder="Specify milestones, required artifacts, and acceptance criteria..."
              value={createFormData.description}
              onChange={(e) =>
                setCreateFormData({ ...createFormData, description: e.target.value })
              }
              className="w-full rounded-xl text-xs bg-zinc-900 border border-zinc-800 p-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Assigned Personnel *"
              options={employees.map((emp) => ({
                value: emp.id,
                label: `${emp.name} (${emp.department})`,
              }))}
              value={createFormData.assignedToId}
              onChange={(e) =>
                setCreateFormData({ ...createFormData, assignedToId: e.target.value })
              }
            />

            <Select
              label="Priority Level *"
              options={[
                { value: "Urgent", label: "Urgent (24-48h)" },
                { value: "High", label: "High" },
                { value: "Medium", label: "Medium" },
                { value: "Low", label: "Low" },
              ]}
              value={createFormData.priority}
              onChange={(e) =>
                setCreateFormData({ ...createFormData, priority: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Department *"
              options={[
                { value: "Engineering", label: "Engineering" },
                { value: "Human Resources", label: "Human Resources" },
                { value: "Finance", label: "Finance" },
                { value: "Product", label: "Product" },
                { value: "Executive", label: "Executive" },
              ]}
              value={createFormData.department}
              onChange={(e) =>
                setCreateFormData({ ...createFormData, department: e.target.value })
              }
            />

            <Input
              label="Target Due Date *"
              type="date"
              value={createFormData.dueDate}
              onChange={(e) =>
                setCreateFormData({ ...createFormData, dueDate: e.target.value })
              }
              required
            />
          </div>

          {isAdmin && (
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={createFormData.isExecutiveOkr}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, isExecutiveOkr: e.target.checked })
                }
                className="rounded border-zinc-800 bg-zinc-900 text-indigo-600 focus:ring-0"
              />
              Designate as Company-Wide Strategic OKR Milestone
            </label>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Issue Task Order</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
