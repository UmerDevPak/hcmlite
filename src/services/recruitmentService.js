import { INITIAL_JOBS, INITIAL_CANDIDATES } from "@/lib/seedData";
import { RECRUITMENT_STAGES } from "@/lib/constants";

const STORAGE_JOBS = "hcm_lite_jobs";
const STORAGE_CANDIDATES = "hcm_lite_candidates";

function getJobs() {
  if (typeof window === "undefined") return INITIAL_JOBS;
  const stored = localStorage.getItem(STORAGE_JOBS);
  if (!stored) {
    localStorage.setItem(STORAGE_JOBS, JSON.stringify(INITIAL_JOBS));
    return INITIAL_JOBS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_JOBS;
  }
}

function getCandidates() {
  if (typeof window === "undefined") return INITIAL_CANDIDATES;
  const stored = localStorage.getItem(STORAGE_CANDIDATES);
  if (!stored) {
    localStorage.setItem(STORAGE_CANDIDATES, JSON.stringify(INITIAL_CANDIDATES));
    return INITIAL_CANDIDATES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_CANDIDATES;
  }
}

function saveJobs(list) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_JOBS, JSON.stringify(list));
}

function saveCandidates(list) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_CANDIDATES, JSON.stringify(list));
}

export const recruitmentService = {
  async getAllJobs() {
    return getJobs();
  },

  async createJob(jobData) {
    const jobs = getJobs();
    const newJob = {
      id: `JOB-${Math.floor(100 + Math.random() * 900)}`,
      applicantsCount: 0,
      status: "Active",
      postedDate: new Date().toISOString().split("T")[0],
      ...jobData,
    };
    jobs.unshift(newJob);
    saveJobs(jobs);
    return newJob;
  },

  async getAllCandidates({ jobId = "", stage = "" } = {}) {
    let list = getCandidates();
    if (jobId) list = list.filter((c) => c.jobId === jobId);
    if (stage) list = list.filter((c) => c.stage === stage);
    return list;
  },

  async updateCandidateStage(candidateId, newStage) {
    const list = getCandidates();
    const index = list.findIndex((c) => c.id === candidateId);
    if (index !== -1) {
      list[index].stage = newStage;
      saveCandidates(list);
      return list[index];
    }
    return null;
  },

  async addCandidate(candidateData) {
    const list = getCandidates();
    const newCandidate = {
      id: `CND-${Math.floor(500 + Math.random() * 500)}`,
      appliedDate: new Date().toISOString().split("T")[0],
      rating: 4.0,
      stage: "Applied",
      ...candidateData,
    };
    list.unshift(newCandidate);
    saveCandidates(list);

    // Update job applicant count
    const jobs = getJobs();
    const jobIndex = jobs.findIndex((j) => j.id === candidateData.jobId);
    if (jobIndex !== -1) {
      jobs[jobIndex].applicantsCount = (jobs[jobIndex].applicantsCount || 0) + 1;
      saveJobs(jobs);
    }

    return newCandidate;
  },
};
