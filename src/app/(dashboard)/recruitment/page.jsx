"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Briefcase,
  Plus,
  Users,
  Star,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { recruitmentService } from "@/services/recruitmentService";
import { RECRUITMENT_STAGES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { JobModal } from "@/components/recruitment/JobModal";

export default function RecruitmentPage() {
  const { isHR } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [activeTab, setActiveTab] = useState("pipeline"); // "pipeline" | "jobs"
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const pipelineScrollRef = useRef(null);

  const scrollPipeline = (direction) => {
    if (pipelineScrollRef.current) {
      const offset = direction === "left" ? -340 : 340;
      pipelineScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (activeTab === "pipeline" && pipelineScrollRef.current) {
      pipelineScrollRef.current.scrollLeft = 0;
    }
  }, [activeTab]);

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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "pipeline" && (
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <span className="text-[11px] text-zinc-400 font-medium mr-1 hidden sm:inline">
              Scroll board:
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => scrollPipeline("left")}
              title="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => scrollPipeline("right")}
              title="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {activeTab === "pipeline" ? (
        /* Kanban Board - Fluid Horizontal Scroll */
        <div
          ref={pipelineScrollRef}
          className="flex gap-4 overflow-x-auto pb-6 pt-1 scroll-smooth items-start -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {kanbanColumns.map((stage) => {
            const stageCandidates = candidates.filter((c) => c.stage === stage);
            return (
              <div
                key={stage}
                className="w-72 sm:w-80 shrink-0 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 p-3.5 flex flex-col shadow-sm"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800/80 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                      {stage}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold">
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
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900/90 p-2.5 rounded-lg leading-relaxed border border-zinc-200/50 dark:border-zinc-800/60">
                          &ldquo;{c.notes}&rdquo;
                        </p>
                      )}

                      <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-1">
                            <span className="text-zinc-400">Applied:</span>
                            <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                              {formatDate(c.appliedDate)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteCandidate(c.id, c.name)}
                            title="Remove candidate"
                            className="p-1 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <select
                            value={c.stage}
                            onChange={(e) =>
                              handleStageChange(c.id, e.target.value, c.name)
                            }
                            className="w-full text-[11px] bg-zinc-100 dark:bg-zinc-800/90 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg border border-zinc-200 dark:border-zinc-700/80 px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-colors"
                          >
                            {kanbanColumns.map((st) => (
                              <option key={st} value={st}>
                                Move to: {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {stageCandidates.length === 0 && (
                    <div className="h-28 flex flex-col items-center justify-center text-center p-3 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-100/40 dark:bg-zinc-900/20 text-zinc-400 dark:text-zinc-500 space-y-1">
                      <Sparkles className="w-4 h-4 opacity-40 mb-0.5" />
                      <span className="text-xs font-medium">No candidates in {stage}</span>
                      <span className="text-[10px] text-zinc-500">Move candidates using dropdown</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
