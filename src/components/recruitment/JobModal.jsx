"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { DEPARTMENTS } from "@/lib/constants";
import { recruitmentService } from "@/services/recruitmentService";
import { useNotification } from "@/context/NotificationContext";

export function JobModal({ isOpen, onClose, onJobCreated }) {
  const { notifySuccess, notifyError } = useNotification();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    department: DEPARTMENTS[0],
    location: "San Francisco, CA (Hybrid)",
    type: "Full-Time",
    experienceLevel: "Senior (5+ yrs)",
    salaryRange: "$150,000 - $180,000",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await recruitmentService.createJob(formData);
      notifySuccess("Job Opening Created", `${formData.title} published to careers portal.`);
      onJobCreated();
      onClose();
    } catch (err) {
      notifyError("Failed to create job", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Job Opening"
      description="Post a requisition to your applicant tracking pipeline."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Job Title"
          placeholder="e.g. Staff Distributed Systems Engineer"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Department"
            options={DEPARTMENTS}
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
          <Input
            label="Work Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Experience Level"
            value={formData.experienceLevel}
            onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
          />
          <Input
            label="Target Salary Range"
            value={formData.salaryRange}
            onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Role Summary & Responsibilities
          </label>
          <textarea
            rows={3}
            placeholder="Brief overview of role mission and tech stack..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-lg text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Publish Opening
          </Button>
        </div>
      </form>
    </Modal>
  );
}
