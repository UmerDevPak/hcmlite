"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Briefcase,
  Plus,
  Users,
  Star,
  MapPin,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Sparkles,
  LayoutGrid,
  List,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { recruitmentService } from "@/services/recruitmentService";
import { RECRUITMENT_STAGES } from "@/lib/constants";
import { formatDate, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { JobModal } from "@/components/recruitment/JobModal";

const STAGE_CONFIG = {
  "Screening": { color: "bg-blue-500", text: "text-blue-500 dark:text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10" },
  "Technical Interview": { color: "bg-purple-500", text: "text-purple-500 dark:text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/10" },
  "Culture Fit": { color: "bg-amber-500", text: "text-amber-500 dark:text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" },
  "Offer Extended": { color: "bg-emerald-500", text: "text-emerald-500 dark:text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
  "Hired": { color: "bg-indigo-500", text: "text-indigo-500 dark:text-indigo-400", border: "border-indigo-500/20", bg: "bg-indigo-500/10" },
};

export default function RecruitmentPage() {
  const { isHR } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [activeTab, setActiveTab] = useState("pipeline"); // "pipeline" | "jobs"
  const [selectedStage, setSelectedStage] = useState("all");
  const [viewMode, setViewMode] = useState("board"); // "board" | "list"
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [allJobs, allCandidates] = await Promise.all([
        recruitmentService.getAllJobs(),
        recruitmentService.getAllCandidates(),
      ]);
      setJobs(allJobs);
      setCandidates(allCandidates);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStageChange = async (candidateId, newStage, candidateName) => {
    try {
      await recruitmentService.updateCandidateStage(candidateId, newStage);
      if (newStage === "Offer Extended" || newStage === "Hired") {
        confetti({ particleCount: 90, spread: 65, origin: { y: 0.7 } });
        notifySuccess(`${candidateName} advanced!`, `Stage updated to ${newStage}`);
      } else {
        notifySuccess("Stage Updated", `${candidateName} moved to ${newStage}`);
      }
      loadData();
    } catch (err) {
      notifyError("Stage update failed", err.message);
    }
  };

  const handleDeleteCandidate = async (candidateId, candidateName) => {
    if (confirm(`Are you sure you want to remove candidate ${candidateName} from the pipeline?`)) {
      try {
        await recruitmentService.deleteCandidate(candidateId);
        notifySuccess("Candidate Removed", `${candidateName} was removed from the ATS pipeline.`);
        loadData();
      } catch (err) {
        notifyError("Failed to delete candidate", err.message);
      }
    }
  };

  const tabs = [
    { id: "pipeline", label: "Candidate Kanban Pipeline", icon: Users, count: candidates.length },
    { id: "jobs", label: "Active Requisitions", icon: Briefcase, count: jobs.length },
  ];

  const kanbanColumns = [
    "Screening",
    "Technical Interview",
    "Culture Fit",
    "Offer Extended",
    "Hired",
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Talent Acquisition & ATS Pipeline
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Requisitions, candidate stage progression, evaluation scores, and hiring offers.
          </p>
        </div>

        {isHR && (
          <Button size="sm" icon={Plus} onClick={() => setIsJobModalOpen(true)}>
            New Opening
          </Button>
        )}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "pipeline" ? (
        <div className="space-y-4">
          {/* Pipeline Controls: Stage Filter Pills + View Switcher (Zero Bottom Slider) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            {/* Stage Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                type="button"
                onClick={() => setSelectedStage("all")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5",
                  selectedStage === "all"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/60"
                )}
              >
                <span>All Stages</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                    selectedStage === "all"
                      ? "bg-white/20 text-white"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                  )}
                >
                  {candidates.length}
                </span>
              </button>

              {kanbanColumns.map((st) => {
                const count = candidates.filter((c) => c.stage === st).length;
                const cfg = STAGE_CONFIG[st];
                const isSelected = selectedStage === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStage(st)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5",
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/60"
                    )}
                  >
                    <span className={cn("w-2 h-2 rounded-full", cfg?.color || "bg-indigo-500")} />
                    <span>{st}</span>
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                        isSelected
                          ? "bg-zinc-700 dark:bg-zinc-300 text-white dark:text-zinc-900"
                          : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-800 shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setViewMode("board")}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all",
                  viewMode === "board"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
                title="Board View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Board</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all",
                  viewMode === "list"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>

          {/* View Content: Responsive Board (Zero Slider) OR List View */}
          {viewMode === "board" ? (
            <div
              className={cn(
                "items-start gap-4",
                selectedStage === "all"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
                  : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-4xl"
              )}
            >
              {(selectedStage === "all" ? kanbanColumns : [selectedStage]).map((stage) => {
                const stageCandidates = candidates.filter((c) => c.stage === stage);
                const cfg = STAGE_CONFIG[stage];
                return (
                  <div
                    key={stage}
                    className="min-w-0 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 p-3.5 flex flex-col shadow-sm"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800/80 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn("w-2 h-2 rounded-full shrink-0", cfg?.color || "bg-indigo-500")} />
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                          {stage}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold shrink-0">
                        {stageCandidates.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 min-h-[140px]">
                      {stageCandidates.map((c) => (
                        <Card
                          key={c.id}
                          className="p-3.5 space-y-2.5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 hover:border-indigo-500/50 transition-all duration-150 shadow-subtle group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <Avatar name={c.name} size="sm" className="shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-400 transition-colors">
                                  {c.name}
                                </div>
                                <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
                                  {c.jobTitle}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold font-mono shrink-0">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {c.rating}
                            </div>
                          </div>

                          {c.notes && (
                            <p className="text-[11px] text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900/90 p-2.5 rounded-lg leading-relaxed border border-zinc-200/50 dark:border-zinc-800/60 line-clamp-3">
                              &ldquo;{c.notes}&rdquo;
                            </p>
                          )}

                          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {formatDate(c.appliedDate)}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <select
                                value={c.stage}
                                onChange={(e) =>
                                  handleStageChange(c.id, e.target.value, c.name)
                                }
                                className="text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg border border-zinc-300 dark:border-zinc-700 px-2 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                              >
                                {kanbanColumns.map((st) => (
                                  <option key={st} value={st}>
                                    Move: {st}
                                  </option>
                                ))}
                              </select>

                              <button
                                type="button"
                                onClick={() => handleDeleteCandidate(c.id, c.name)}
                                title="Remove candidate"
                                className="p-1 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </Card>
                      ))}

                      {stageCandidates.length === 0 && (
                        <div className="h-28 flex flex-col items-center justify-center text-center p-3 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-100/40 dark:bg-zinc-900/20 text-zinc-400 dark:text-zinc-500 space-y-1">
                          <Sparkles className="w-4 h-4 opacity-40 mb-0.5" />
                          <span className="text-xs font-medium">No candidates in {stage}</span>
                          <span className="text-[10px] text-zinc-500">Advance using Move dropdown</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Modern Candidate List View */
            <Card className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {candidates
                .filter((c) => selectedStage === "all" || c.stage === selectedStage)
                .map((c) => {
                  const cfg = STAGE_CONFIG[c.stage];
                  return (
                    <div
                      key={c.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar name={c.name} size="md" className="shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                              {c.name}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {c.jobTitle}
                            </span>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium border",
                                cfg?.bg || "bg-indigo-500/10",
                                cfg?.text || "text-indigo-400",
                                cfg?.border || "border-indigo-500/20"
                              )}
                            >
                              <span className={cn("w-1.5 h-1.5 rounded-full", cfg?.color || "bg-indigo-500")} />
                              {c.stage}
                            </span>
                          </div>
                          {c.notes && (
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 italic">
                              &ldquo;{c.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold font-mono">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {c.rating}
                        </div>
                        <span className="text-xs text-zinc-400 font-mono">
                          {formatDate(c.appliedDate)}
                        </span>
                        <select
                          value={c.stage}
                          onChange={(e) =>
                            handleStageChange(c.id, e.target.value, c.name)
                          }
                          className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg border border-zinc-300 dark:border-zinc-700 px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        >
                          {kanbanColumns.map((st) => (
                            <option key={st} value={st}>
                              Move: {st}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleDeleteCandidate(c.id, c.name)}
                          title="Remove candidate"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </Card>
          )}
        </div>
      ) : (
        /* Jobs List */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <Badge variant="success" dot>
                    {job.status}
                  </Badge>
                  <span className="text-xs font-semibold font-mono text-zinc-400">
                    {job.applicantsCount} Applicants
                  </span>
                </div>

                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-2">
                  {job.title}
                </h3>
                <p className="text-xs text-indigo-400 font-medium">{job.department}</p>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Location</span>
                  <span className="text-zinc-200">{job.location}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Range</span>
                  <span className="font-mono text-zinc-200">{job.salaryRange}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <JobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onJobCreated={loadData}
      />
    </div>
  );
}
