import { LEAVE_STATUS, LEAVE_QUOTAS, LEAVE_TYPES } from "@/lib/constants";
import { calculateWorkingDays } from "@/lib/utils";
import { isLiveFirebaseConfigured, db } from "@/lib/firebase/client";

const STORAGE_BALANCES = "hcm_lite_leave_balances";
const STORAGE_REQUESTS = "hcm_lite_leave_requests";

// Initial balances according to Rule 5: 14 Annual, 8 Sick, 10 Casual
const INITIAL_SPEC_BALANCES = {
  "EMP-001": { annual: 14, sick: 8, casual: 10, vacation: 14 },
  "EMP-002": { annual: 12, sick: 8, casual: 9, vacation: 12 },
  "EMP-003": { annual: 10, sick: 7, casual: 8, vacation: 10 },
  "EMP-004": { annual: 14, sick: 8, casual: 10, vacation: 14 },
  "EMP-005": { annual: 13, sick: 8, casual: 9, vacation: 13 },
  "EMP-006": { annual: 9, sick: 6, casual: 7, vacation: 9 },
  "EMP-007": { annual: 2, sick: 2, casual: 4, vacation: 2 },
  "EMP-008": { annual: 11, sick: 8, casual: 10, vacation: 11 },
};

const INITIAL_SPEC_REQUESTS = [
  {
    id: "LV-1001",
    employeeId: "EMP-007",
    employeeName: "Chloe Dupont",
    leaveType: "Annual",
    startDate: "2026-10-15",
    endDate: "2026-10-25",
    daysCount: 7, // skipping weekends
    reason: "Extended annual family leave.",
    status: LEAVE_STATUS.APPROVED,
    appliedAt: "2026-09-20",
    reviewedBy: "Sarah Connor",
    reviewedAt: "2026-09-21",
  },
  {
    id: "LV-1002",
    employeeId: "EMP-003",
    employeeName: "Elena Rostova",
    leaveType: "Annual",
    startDate: "2026-11-02",
    endDate: "2026-11-06",
    daysCount: 5,
    reason: "Family vacation trip.",
    status: LEAVE_STATUS.PENDING,
    appliedAt: "2026-10-22",
    reviewedBy: null,
    reviewedAt: null,
  },
  {
    id: "LV-1003",
    employeeId: "EMP-006",
    employeeName: "Lucas Silva",
    leaveType: "Sick",
    startDate: "2026-10-20",
    endDate: "2026-10-21",
    daysCount: 2,
    reason: "Flu recovery.",
    status: LEAVE_STATUS.APPROVED,
    appliedAt: "2026-10-20",
    reviewedBy: "Sarah Connor",
    reviewedAt: "2026-10-20",
  },
];

function getBalances() {
  if (typeof window === "undefined") return INITIAL_SPEC_BALANCES;
  const stored = localStorage.getItem(STORAGE_BALANCES);
  if (!stored) {
    localStorage.setItem(STORAGE_BALANCES, JSON.stringify(INITIAL_SPEC_BALANCES));
    return INITIAL_SPEC_BALANCES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_SPEC_BALANCES;
  }
}

function getRequests() {
  if (typeof window === "undefined") return INITIAL_SPEC_REQUESTS;
  const stored = localStorage.getItem(STORAGE_REQUESTS);
  if (!stored) {
    localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(INITIAL_SPEC_REQUESTS));
    return INITIAL_SPEC_REQUESTS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_SPEC_REQUESTS;
  }
}

function saveBalances(data) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_BALANCES, JSON.stringify(data));
}

function saveRequests(data) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(data));
}

// In-memory instant cache to eliminate lag when switching tabs
let memoryLeaveRequestsCache = null;
let lastLeaveFetchTime = 0;
const LEAVE_CACHE_TTL_MS = 30000;

export const leaveService = {
  async getEmployeeBalances(employeeId) {
    if (isLiveFirebaseConfigured && db && employeeId) {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const snap = await getDoc(doc(db, "leave_balances", employeeId));
        if (snap.exists()) {
          return snap.data();
        }
      } catch (err) {
        console.warn("[leaveService] Firestore balances read notice:", err.message);
      }
    }

    const balances = getBalances();
    return (
      balances[employeeId] || {
        annual: LEAVE_QUOTAS.ANNUAL,
        sick: LEAVE_QUOTAS.SICK,
        casual: LEAVE_QUOTAS.CASUAL,
        vacation: LEAVE_QUOTAS.ANNUAL,
      }
    );
  },

  async getAllRequests({ status = "", employeeId = "" } = {}, forceRefresh = false) {
    const now = Date.now();
    let list;
    if (!forceRefresh && memoryLeaveRequestsCache && now - lastLeaveFetchTime < LEAVE_CACHE_TTL_MS) {
      list = [...memoryLeaveRequestsCache];
    } else {
      list = getRequests();

      if (isLiveFirebaseConfigured && db) {
        try {
          const { collection, getDocs } = await import("firebase/firestore");
          const snap = await getDocs(collection(db, "leave_requests"));
          if (!snap.empty) {
            const remoteList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            // Merge with local list by id
            remoteList.forEach((rem) => {
              const idx = list.findIndex((l) => l.id === rem.id);
              if (idx !== -1) {
                list[idx] = rem;
              } else {
                list.unshift(rem);
              }
            });
          }
        } catch (err) {
          console.warn("[leaveService] Firestore requests read notice:", err.message);
        }
      }

      memoryLeaveRequestsCache = list;
      lastLeaveFetchTime = now;
    }

    let result = [...list];
    if (status) result = result.filter((r) => r.status === status);
    if (employeeId) result = result.filter((r) => r.employeeId === employeeId);
    return result;
  },

  /**
   * PROJECT_SPEC.md Rule 5:
   * Leaves: 14 Annual, 8 Sick, 10 Casual.
   * Skip weekends and holidays.
   * Overlaps/exceeded quota = 422.
   */
  async requestLeave({ employeeId, employeeName, leaveType, startDate, endDate, reason }) {
    // Normalize type key
    const typeKey = leaveType.toLowerCase().includes("sick")
      ? "sick"
      : leaveType.toLowerCase().includes("casual")
      ? "casual"
      : "annual";

    // Skip weekends and holidays
    const workingDays = calculateWorkingDays(startDate, endDate);
    if (workingDays <= 0) {
      const err = new Error("Selected date range contains no working days (weekends/holidays).");
      err.status = 422;
      throw err;
    }

    const currentRequests = getRequests();

    // Check for overlapping leave requests for this employee (Rule 5: Overlaps = 422)
    const hasOverlap = currentRequests.some((r) => {
      if (r.employeeId !== employeeId || r.status === LEAVE_STATUS.REJECTED || r.status === LEAVE_STATUS.CANCELLED) {
        return false;
      }
      const existingStart = new Date(r.startDate);
      const existingEnd = new Date(r.endDate);
      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);
      return newStart <= existingEnd && newEnd >= existingStart;
    });

    if (hasOverlap) {
      const err = new Error("Overlapping leave request: You already have a pending or approved leave during this period.");
      err.status = 422;
      throw err;
    }

    // Check quota (Rule 5: Exceeded quota = 422)
    const balances = getBalances();
    const empBalance = balances[employeeId] || {
      annual: LEAVE_QUOTAS.ANNUAL,
      sick: LEAVE_QUOTAS.SICK,
      casual: LEAVE_QUOTAS.CASUAL,
    };
    const currentQuota = empBalance[typeKey] ?? 0;

    if (workingDays > currentQuota && leaveType !== "Unpaid") {
      const err = new Error(`Exceeded quota: Requested ${workingDays} days, but remaining ${typeKey} leave balance is ${currentQuota}.`);
      err.status = 422;
      throw err;
    }

    const newReq = {
      id: `LV-${Math.floor(1000 + Math.random() * 9000)}`,
      employeeId,
      employeeName,
      leaveType: leaveType === "Annual" || leaveType === "Sick" || leaveType === "Casual" ? leaveType : "Annual",
      startDate,
      endDate,
      daysCount: workingDays,
      reason,
      status: LEAVE_STATUS.PENDING,
      appliedAt: new Date().toISOString().split("T")[0],
      reviewedBy: null,
      reviewedAt: null,
    };

    currentRequests.unshift(newReq);
    saveRequests(currentRequests);
    memoryLeaveRequestsCache = null;

    if (isLiveFirebaseConfigured && db) {
      try {
        const { doc, setDoc } = await import("firebase/firestore");
        await setDoc(doc(db, "leave_requests", newReq.id), newReq);
      } catch (err) {
        console.warn("[leaveService] Firestore leave request save notice:", err.message);
      }
    }

    return newReq;
  },

  async updateRequestStatus(requestId, status, reviewerName = "HR Manager") {
    const requests = getRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index === -1) return null;

    const request = requests[index];
    request.status = status;
    request.reviewedBy = reviewerName;
    request.reviewedAt = new Date().toISOString().split("T")[0];

    // If approved, deduct from employee's balance
    let updatedBalance = null;
    if (status === LEAVE_STATUS.APPROVED && request.leaveType !== "Unpaid") {
      const balances = getBalances();
      const empBalance = balances[request.employeeId] || {
        annual: LEAVE_QUOTAS.ANNUAL,
        sick: LEAVE_QUOTAS.SICK,
        casual: LEAVE_QUOTAS.CASUAL,
      };

      const typeKey = request.leaveType.toLowerCase().includes("sick")
        ? "sick"
        : request.leaveType.toLowerCase().includes("casual")
        ? "casual"
        : "annual";

      empBalance[typeKey] = Math.max(0, (empBalance[typeKey] || 0) - request.daysCount);
      empBalance.vacation = empBalance.annual; // keep sync
      balances[request.employeeId] = empBalance;
      saveBalances(balances);
      updatedBalance = empBalance;
    }

    saveRequests(requests);
    memoryLeaveRequestsCache = null;

    if (isLiveFirebaseConfigured && db) {
      try {
        const { doc, setDoc } = await import("firebase/firestore");
        await setDoc(doc(db, "leave_requests", requestId), request, { merge: true });
        if (updatedBalance && request.employeeId) {
          await setDoc(doc(db, "leave_balances", request.employeeId), updatedBalance, { merge: true });
        }
      } catch (err) {
        console.warn("[leaveService] Firestore update status notice:", err.message);
      }
    }

    return request;
  },

  async getLeaveStats() {
    const requests = getRequests();
    const pending = requests.filter((r) => r.status === LEAVE_STATUS.PENDING).length;
    const approved = requests.filter((r) => r.status === LEAVE_STATUS.APPROVED).length;
    const rejected = requests.filter((r) => r.status === LEAVE_STATUS.REJECTED).length;
    return { pending, approved, rejected, total: requests.length };
  },

  async deleteRequest(requestId) {
    const requests = getRequests();
    const target = requests.find((r) => r.id === requestId);
    if (!target) return false;

    // If the deleted request was approved, restore the quota back to the employee
    if (target.status === LEAVE_STATUS.APPROVED && target.leaveType !== "Unpaid") {
      const balances = getBalances();
      const empBalance = balances[target.employeeId] || {
        annual: LEAVE_QUOTAS.ANNUAL,
        sick: LEAVE_QUOTAS.SICK,
        casual: LEAVE_QUOTAS.CASUAL,
      };

      const typeKey = target.leaveType.toLowerCase().includes("sick")
        ? "sick"
        : target.leaveType.toLowerCase().includes("casual")
        ? "casual"
        : "annual";

      empBalance[typeKey] = (empBalance[typeKey] || 0) + (target.daysCount || 0);
      empBalance.vacation = empBalance.annual;
      balances[target.employeeId] = empBalance;
      saveBalances(balances);

      if (isLiveFirebaseConfigured && db && target.employeeId) {
        try {
          const { doc, setDoc } = await import("firebase/firestore");
          await setDoc(doc(db, "leave_balances", target.employeeId), empBalance, { merge: true });
        } catch (err) {
          console.warn("[leaveService] Firestore restore balance notice:", err.message);
        }
      }
    }

    const filtered = requests.filter((r) => r.id !== requestId);
    saveRequests(filtered);
    memoryLeaveRequestsCache = null;

    if (isLiveFirebaseConfigured && db) {
      try {
        const { doc, deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(db, "leave_requests", requestId));
      } catch (err) {
        console.warn("[leaveService] Firestore delete request notice:", err.message);
      }
    }

    return true;
  },
};
