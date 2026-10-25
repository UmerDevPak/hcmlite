"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { LEAVE_TYPES, LEAVE_QUOTAS } from "@/lib/constants";
import { leaveService } from "@/services/leaveService";
import { calculateWorkingDays } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

export function LeaveRequestModal({ isOpen, onClose, onSubmitted }) {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const [loading, setLoading] = useState(false);

  const [leaveType, setLeaveType] = useState("Annual");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");

  const calculateDays = () => {
    return calculateWorkingDays(startDate, endDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await leaveService.requestLeave({
        employeeId: user?.employeeId || "EMP-001",
        employeeName: user?.displayName || "Admin User",
        leaveType,
        startDate,
        endDate,
        daysCount: calculateDays(),
        reason,
      });

      notifySuccess("Leave request submitted", "Your request is awaiting managerial review.");
      onSubmitted();
      onClose();
    } catch (err) {
      notifyError("Failed to submit request", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Time Off"
      description="Submit a vacation, sick leave, or absence request for manager review."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Leave Category"
          options={["Annual", "Sick", "Casual", "Unpaid"]}
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 text-xs flex justify-between items-center">
          <span className="text-zinc-400">Total Working Days (excl. weekends)</span>
          <span className="font-bold text-indigo-400 font-mono">
            {calculateDays()} working days
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Reason / Notes
          </label>
          <textarea
            rows={3}
            placeholder="Provide context for your team lead..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
