"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { containerStagger, itemFadeUp } from "@/lib/animationVariants";
import confetti from "canvas-confetti";
import {
  CalendarDays,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Check,
  X,
  FileCheck,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { leaveService } from "@/services/leaveService";
import { LEAVE_STATUS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { LeaveRequestModal } from "@/components/leave/LeaveRequestModal";

export default function LeavePage() {
  const { user, isHR, isManager } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);

  const loadData = async () => {
    const [allReqs, empBalances] = await Promise.all([
      leaveService.getAllRequests(),
      leaveService.getEmployeeBalances(user?.employeeId || "EMP-001"),
    ]);
    setRequests(allReqs);
    setBalances(empBalances);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleReview = async (id, newStatus) => {
    setLoadingAction(id);
    try {
      await leaveService.updateRequestStatus(id, newStatus, user?.displayName || "Reviewer");
      if (newStatus === LEAVE_STATUS.APPROVED) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
        notifySuccess("Leave Approved", "Employee balance updated automatically.");
      } else {
        notifySuccess("Leave Request Rejected", "Status updated.");
      }
      loadData();
    } catch (err) {
      notifyError("Failed to update leave", err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeleteLeave = async (id, empName) => {
    if (confirm(`Are you sure you want to delete this leave record for ${empName}? This will restore deducted days back to the employee.`)) {
      setLoadingAction(id);
      try {
        await leaveService.deleteRequest(id);
        notifySuccess("Leave Record Deleted", `Leave request for ${empName} was removed.`);
        loadData();
      } catch (err) {
        notifyError("Failed to delete leave", err.message);
      } finally {
        setLoadingAction(null);
      }
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (activeTab === "ALL") return true;
    return r.status.toUpperCase() === activeTab;
  });

  const tabs = [
    { id: "ALL", label: "All Requests", count: requests.length },
    {
      id: "PENDING",
      label: "Pending Review",
      count: requests.filter((r) => r.status === LEAVE_STATUS.PENDING).length,
    },
    {
      id: "APPROVED",
      label: "Approved",
      count: requests.filter((r) => r.status === LEAVE_STATUS.APPROVED).length,
    },
    {
      id: "REJECTED",
      label: "Rejected",
      count: requests.filter((r) => r.status === LEAVE_STATUS.REJECTED).length,
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerStagger}
      className="space-y-6"
    >
      {/* Header with Smooth Entrance */}
      <motion.div
        variants={itemFadeUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Leave & Absence Management
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Track vacation accruals, sick days, and managerial approval queues.
          </p>
        </div>

        <Button size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Request Time Off
        </Button>
      </motion.div>

      {/* Balance Cards (Rule 5: 14 Annual, 8 Sick, 10 Casual) with Pop-In & Animated Bars */}
      <motion.div variants={containerStagger} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          variants={itemFadeUp}
          whileHover={{ y: -4, transition: { duration: 0.16 } }}
          whileTap={{ scale: 0.985 }}
          className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/70 shadow-sm hover:border-indigo-500/40 transition-colors space-y-2"
        >
          <div className="text-xs font-medium text-zinc-400">Annual Leave</div>
          <div className="text-2xl font-bold font-mono text-indigo-400">
            {balances?.annual ?? 14}{" "}
            <span className="text-xs font-normal text-zinc-400">/ 14 days left</span>
          </div>
          {/* Animated Progress Bar */}
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.round(((balances?.annual ?? 14) / 14) * 100))}%` }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
            />
          </div>
          <p className="text-[11px] text-zinc-500 pt-1">Statutory annual entitlement</p>
        </motion.div>

        <motion.div
          variants={itemFadeUp}
          whileHover={{ y: -4, transition: { duration: 0.16 } }}
          whileTap={{ scale: 0.985 }}
          className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/70 shadow-sm hover:border-emerald-500/40 transition-colors space-y-2"
        >
          <div className="text-xs font-medium text-zinc-400">Sick Leave</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {balances?.sick ?? 8}{" "}
            <span className="text-xs font-normal text-zinc-400">/ 8 days left</span>
          </div>
          {/* Animated Progress Bar */}
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.round(((balances?.sick ?? 8) / 8) * 100))}%` }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
            />
          </div>
          <p className="text-[11px] text-zinc-500 pt-1">Medical absence coverage</p>
        </motion.div>

        <motion.div
          variants={itemFadeUp}
          whileHover={{ y: -4, transition: { duration: 0.16 } }}
          whileTap={{ scale: 0.985 }}
          className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/70 shadow-sm hover:border-amber-500/40 transition-colors space-y-2"
        >
          <div className="text-xs font-medium text-zinc-400">Casual Leave</div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {balances?.casual ?? 10}{" "}
            <span className="text-xs font-normal text-zinc-400">/ 10 days left</span>
          </div>
          {/* Animated Progress Bar */}
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.round(((balances?.casual ?? 10) / 10) * 100))}%` }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
            />
          </div>
          <p className="text-[11px] text-zinc-500 pt-1">Short-notice emergency leave</p>
        </motion.div>
      </motion.div>

      {/* Requests Tabs & Table */}
      <motion.div variants={itemFadeUp} className="space-y-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <Card className="overflow-hidden">
          {filteredRequests.length === 0 ? (
            <div className="p-8 sm:p-12">
              <EmptyState
                title="Oops! There is nothing to see here"
                description={
                  activeTab === "PENDING"
                    ? "Great news! All employee leave requests have been reviewed and approved. Inbox zero reached!"
                    : activeTab === "REJECTED"
                    ? "No rejected leave requests on file. All historical applications are in good standing."
                    : activeTab === "APPROVED"
                    ? "No approved leaves recorded yet."
                    : "No leave records found under this view. Submit a time off request to get started."
                }
                actionLabel="Request Time Off"
                actionIcon={Plus}
                onAction={() => setIsModalOpen(true)}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right min-w-[140px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={req.employeeName} size="sm" />
                        <div>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {req.employeeName}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono">{req.id}</div>
                        </div>
                      </div>
                    </TableCell>
                      <TableCell className="font-medium text-zinc-800 dark:text-zinc-200">
                        {req.leaveType}
                      </TableCell>
                      <TableCell className="text-zinc-400 text-xs">
                        {formatDate(req.startDate)} → {formatDate(req.endDate)}
                      </TableCell>
                      <TableCell className="font-mono font-medium text-zinc-200">
                        {req.daysCount} d
                      </TableCell>
                      <TableCell className="text-zinc-400 max-w-xs truncate">
                        {req.reason}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            req.status === LEAVE_STATUS.APPROVED
                              ? "success"
                              : req.status === LEAVE_STATUS.PENDING
                              ? "warning"
                              : "danger"
                          }
                          dot
                        >
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {req.status === LEAVE_STATUS.PENDING ? (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                icon={Check}
                                isLoading={loadingAction === req.id}
                                onClick={() => handleReview(req.id, LEAVE_STATUS.APPROVED)}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                icon={X}
                                isLoading={loadingAction === req.id}
                                onClick={() => handleReview(req.id, LEAVE_STATUS.REJECTED)}
                              >
                                Reject
                              </Button>
                            </>
                          ) : (
                            <span className="text-[11px] text-zinc-400 font-medium">
                              {req.reviewedBy ? `Signed by ${req.reviewedBy}` : "Completed"}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteLeave(req.id, req.employeeName)}
                            title="Delete leave record"
                            disabled={loadingAction === req.id}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Modal */}
      <LeaveRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitted={loadData}
      />
    </motion.div>
  );
}
