import { INITIAL_PERFORMANCE_REVIEWS } from "@/lib/seedData";

const STORAGE_REVIEWS = "hcm_lite_performance_reviews";

function getReviews() {
  if (typeof window === "undefined") return INITIAL_PERFORMANCE_REVIEWS;
  const stored = localStorage.getItem(STORAGE_REVIEWS);
  if (!stored) {
    localStorage.setItem(STORAGE_REVIEWS, JSON.stringify(INITIAL_PERFORMANCE_REVIEWS));
    return INITIAL_PERFORMANCE_REVIEWS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_PERFORMANCE_REVIEWS;
  }
}

function saveReviews(list) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_REVIEWS, JSON.stringify(list));
  }
}

export const performanceService = {
  async getAllReviews({ employeeId = "" } = {}) {
    let list = getReviews();
    if (employeeId) list = list.filter((r) => r.employeeId === employeeId);
    return list;
  },

  async createReview(data) {
    const list = getReviews();
    const newReview = {
      id: `REV-${Math.floor(300 + Math.random() * 700)}`,
      status: "Completed",
      completedDate: new Date().toISOString().split("T")[0],
      ...data,
    };
    list.unshift(newReview);
    saveReviews(list);
    return newReview;
  },

  async getPerformanceStats() {
    const list = getReviews();
    const avgScore = list.length
      ? (list.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / list.length).toFixed(1)
      : "5.0";
    return {
      totalReviews: list.length,
      averageScore: avgScore,
      completedCount: list.filter((r) => r.status === "Completed").length,
    };
  },
};
