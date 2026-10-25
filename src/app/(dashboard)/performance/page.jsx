"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Award,
  Target,
  CheckCircle2,
  Clock,
  Star,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { performanceService } from "@/services/performanceService";
import { employeeService } from "@/services/employeeService";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export default function PerformancePage() {
  const { user, isHR, isManager } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    employeeId: "EMP-003",
    cycle: "Q4 2026 Appraisal",
    overallScore: 4.8,
    strengths: "",
    improvements: "",
  });

  const loadData = async () => {
    const [revs, st, emps] = await Promise.all([
      performanceService.getAllReviews(),
      performanceService.getPerformanceStats(),
      employeeService.getAllEmployees(),
    ]);
    setReviews(revs);
    setStats(st);
    setEmployees(emps);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === formData.employeeId);
    try {
      await performanceService.createReview({
        ...formData,
        employeeName: emp?.name || "Elena Rostova",
        reviewerId: user?.employeeId || "EMP-001",
        reviewerName: user?.displayName || "Sarah Connor",
        overallScore: Number(formData.overallScore),
      });
      notifySuccess("Review Submitted", "Performance evaluation recorded.");
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      notifyError("Failed to submit review", err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Performance & OKR Objectives
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Quarterly appraisal cycles, goal tracking, and 360-degree competency reviews.
          </p>
        </div>

        {(isHR || isManager) && (
          <Button size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Record Appraisal
          </Button>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400">Average Org Rating</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1 flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-amber-400" />
              {stats?.averageScore || "4.7"} / 5.0
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Top decile engineering & product</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400">Completed Appraisals</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {stats?.completedCount || 2}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">100% submission rate this cycle</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400">Active Review Cadence</div>
            <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
              Quarterly OKRs
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Next calibration: Dec 15, 2026</p>
          </div>
        </Card>
      </div>

      {/* Review list */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Completed 360 Appraisals
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <Card key={rev.id} className="p-5 space-y-4">
              <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div>
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    {rev.employeeName}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {rev.cycle} • Evaluator: {rev.reviewerName}
                  </p>
                </div>
                <Badge variant="purple" size="md">
                  ★ {rev.overallScore} / 5.0
                </Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-emerald-400 block mb-0.5">
                    Demonstrated Strengths
                  </span>
                  <p className="text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    {rev.strengths}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-amber-400 block mb-0.5">
                    Coaching & Growth Goals
                  </span>
                  <p className="text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    {rev.improvements}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Appraisal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Conduct Performance Review"
        description="Submit appraisal score and actionable feedback for the team member."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Employee"
            options={employees.map((e) => ({ value: e.id, label: `${e.name} (${e.jobTitle})` }))}
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Review Cycle"
              value={formData.cycle}
              onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
              required
            />
            <Input
              label="Overall Rating (1.0 - 5.0)"
              type="number"
              step="0.1"
              min="1.0"
              max="5.0"
              value={formData.overallScore}
              onChange={(e) => setFormData({ ...formData, overallScore: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Key Strengths & Impact
            </label>
            <textarea
              rows={3}
              value={formData.strengths}
              onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              placeholder="Highlight architecture, mentoring, project delivery..."
              className="w-full rounded-lg text-sm bg-zinc-900 border border-zinc-800 p-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Growth Areas & Next Quarter Goals
            </label>
            <textarea
              rows={3}
              value={formData.improvements}
              onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
              placeholder="Areas to coach or expand leadership..."
              className="w-full rounded-lg text-sm bg-zinc-900 border border-zinc-800 p-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Appraisal</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
