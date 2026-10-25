import { INITIAL_ATTENDANCE } from "@/lib/seedData";
import { formatTime, isLateCheckIn, isHalfDay } from "@/lib/utils";
import { OFFICE_SETUP } from "@/lib/constants";
import { isLiveFirebaseConfigured, db } from "@/lib/firebase/client";

const STORAGE_KEY = "hcm_lite_attendance";

function getLocalAttendance() {
  if (typeof window === "undefined") return INITIAL_ATTENDANCE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ATTENDANCE));
    return INITIAL_ATTENDANCE;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_ATTENDANCE;
  }
}

function saveLocalAttendance(list) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

// In-memory instant cache to eliminate lag when switching tabs
let memoryRecordsCache = null;
let lastRecordsFetchTime = 0;
const CACHE_TTL_MS = 30000;

export const attendanceService = {
  async getTodayRecords(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && memoryRecordsCache && now - lastRecordsFetchTime < CACHE_TTL_MS) {
      return memoryRecordsCache;
    }

    const today = new Date().toISOString().split("T")[0];
    let records = getLocalAttendance();

    if (isLiveFirebaseConfigured && db) {
      try {
        const { collection, getDocs, query, where } = await import("firebase/firestore");
        const q = query(collection(db, "attendance"), where("date", "in", [today, "2026-10-24"]));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const remoteRecords = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          // Merge remote records with local records
          remoteRecords.forEach((rem) => {
            const idx = records.findIndex((loc) => loc.employeeId === rem.employeeId && loc.date === rem.date);
            if (idx !== -1) {
              records[idx] = rem;
            } else {
              records.unshift(rem);
            }
          });
        }
      } catch (err) {
        console.warn("[attendanceService] Firestore read fallback:", err.message);
      }
    }

    const filtered = records.filter((r) => r.date === today || r.date === "2026-10-24");
    memoryRecordsCache = filtered;
    lastRecordsFetchTime = now;
    return filtered;
  },

  async getEmployeeTodayRecord(employeeId) {
    const todayRecords = await this.getTodayRecords();
    return todayRecords.find((r) => r.employeeId === employeeId) || null;
  },

  /**
   * PROJECT_SPEC.md Rule 3 & 4:
   * - 1 record per employee/day (prevent duplicate check-in with 409)
   * - Office starts at 09:00, grace 15m (Late after 09:15)
   */
  async clockIn({ employeeId, employeeName, location = "Office (HQ)" }) {
    const records = getLocalAttendance();
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const nowStr = formatTime(now);

    const existing = records.find(
      (r) => r.employeeId === employeeId && (r.date === today || r.date === "2026-10-24")
    );

    // Rule 4: Prevent duplicate check-in with 409
    if (existing && existing.clockIn) {
      const err = new Error("Duplicate check-in: Attendance record already exists for today");
      err.status = 409;
      throw err;
    }

    const late = isLateCheckIn(nowStr);
    const status = late ? "Late" : "Present";

    if (existing) {
      existing.clockIn = nowStr;
      existing.status = status;
      existing.isLate = late;
      existing.location = location;
      saveLocalAttendance(records);
      memoryRecordsCache = null;
      memoryRecordsCache = null;

      if (isLiveFirebaseConfigured && db) {
        try {
          const { doc, setDoc } = await import("firebase/firestore");
          await setDoc(doc(db, "attendance", `${today}_${employeeId}`), existing, { merge: true });
        } catch (e) {
          console.warn("[attendanceService] Firestore clock-in update notice:", e.message);
        }
      }

      return existing;
    }

    const newRecord = {
      id: `ATT-${Date.now().toString().slice(-4)}`,
      employeeId,
      employeeName,
      date: today,
      clockIn: nowStr,
      clockOut: null,
      status,
      isLate: late,
      isHalfDay: false,
      totalHours: null,
      location,
    };

    records.unshift(newRecord);
    saveLocalAttendance(records);
    memoryRecordsCache = null;

    if (isLiveFirebaseConfigured && db) {
      try {
        const { doc, setDoc } = await import("firebase/firestore");
        await setDoc(doc(db, "attendance", `${today}_${employeeId}`), newRecord);
      } catch (e) {
        console.warn("[attendanceService] Firestore clock-in save notice:", e.message);
      }
    }

    return newRecord;
  },

  /**
   * PROJECT_SPEC.md Rule 3:
   * Half-day < 5h
   */
  async clockOut({ employeeId }) {
    const records = getLocalAttendance();
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();
    const nowStr = formatTime(now);

    const index = records.findIndex(
      (r) => r.employeeId === employeeId && (r.date === today || r.date === "2026-10-24")
    );

    if (index !== -1) {
      const record = records[index];
      record.clockOut = nowStr;
      
      // Calculate duration
      let durationHours = 8.0;
      if (record.clockIn) {
        try {
          const inParts = record.clockIn.match(/(\d+):(\d+)\s*(AM|PM)?/i);
          if (inParts) {
            let h = parseInt(inParts[1], 10);
            const m = parseInt(inParts[2], 10);
            if (inParts[3]?.toUpperCase() === "PM" && h < 12) h += 12;
            if (inParts[3]?.toUpperCase() === "AM" && h === 12) h = 0;
            const checkInDate = new Date();
            checkInDate.setHours(h, m, 0, 0);
            const diffMs = now.getTime() - checkInDate.getTime();
            durationHours = Math.max(0.5, Number((diffMs / (1000 * 60 * 60)).toFixed(1)));
          }
        } catch {
          durationHours = 8.0;
        }
      }

      record.totalHours = `${durationHours} hrs`;
      record.hoursWorked = durationHours;
      record.isHalfDay = isHalfDay(durationHours);
      if (record.isHalfDay) {
        record.status = "Half-Day";
      }

      saveLocalAttendance(records);
      memoryRecordsCache = null;

      if (isLiveFirebaseConfigured && db) {
        try {
          const { doc, setDoc } = await import("firebase/firestore");
          await setDoc(doc(db, "attendance", `${record.date || today}_${employeeId}`), record, { merge: true });
        } catch (e) {
          console.warn("[attendanceService] Firestore clock-out save notice:", e.message);
        }
      }

      return record;
    }

    return null;
  },

  async getAttendanceStats() {
    const records = await this.getTodayRecords();
    const present = records.filter((r) => r.status === "Present" || r.status === "Late").length;
    const onLeave = records.filter((r) => r.status === "On Leave").length;
    const absent = Math.max(0, 8 - (present + onLeave));
    return {
      totalEmployees: 8,
      present,
      onLeave,
      absent,
      presentRate: Math.round((present / 8) * 100),
    };
  },
};
