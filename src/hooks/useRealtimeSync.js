"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isLiveFirebaseConfigured, db } from "@/lib/firebase/client";
import { reportService } from "@/services/reportService";
import { employeeService } from "@/services/employeeService";
import { complaintService } from "@/services/complaintService";
import { leaveService } from "@/services/leaveService";
import { payrollService } from "@/services/payrollService";

/**
 * Universal broadcast event helper to notify TanStack Query cache
 * when any local demo state updates (e.g. employee added, leave approved, complaint resolved).
 */
export function broadcastDataChange(entityKey) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("hcm_data_updated", { detail: { entityKey } }));
  }
}

/**
 * Hook: Real-time Admin Dashboard Metrics
 */
export function useAdminMetricsQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin_metrics"],
    queryFn: () => reportService.getAdminDashboardMetrics(true),
    staleTime: 1000 * 60 * 3,
  });

  useEffect(() => {
    // 1. Live Firebase Firestore real-time listener (if configured)
    let unsubscribe = null;
    if (isLiveFirebaseConfigured && db) {
      import("firebase/firestore").then(({ collection, onSnapshot }) => {
        try {
          unsubscribe = onSnapshot(collection(db, "employees"), async () => {
            const fresh = await reportService.getAdminDashboardMetrics(true);
            queryClient.setQueryData(["admin_metrics"], fresh);
          });
        } catch (e) {
          console.warn("[useAdminMetricsQuery] Snapshot listener notice:", e);
        }
      });
    }

    // 2. Local demo state sync listener
    const handleLocalSync = (e) => {
      const key = e.detail?.entityKey;
      if (!key || key === "employees" || key === "payroll" || key === "complaints") {
        reportService.getAdminDashboardMetrics(true).then((fresh) => {
          queryClient.setQueryData(["admin_metrics"], fresh);
        });
      }
    };

    window.addEventListener("hcm_data_updated", handleLocalSync);
    window.addEventListener("storage", handleLocalSync);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener("hcm_data_updated", handleLocalSync);
      window.removeEventListener("storage", handleLocalSync);
    };
  }, [queryClient]);

  return query;
}

/**
 * Hook: Real-time HR Dashboard Metrics
 */
export function useHrMetricsQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["hr_metrics"],
    queryFn: () => reportService.getHrDashboardMetrics(),
    staleTime: 1000 * 60 * 3,
  });

  useEffect(() => {
    const handleLocalSync = (e) => {
      const key = e.detail?.entityKey;
      if (!key || key === "leaves" || key === "attendance" || key === "employees") {
        reportService.getHrDashboardMetrics().then((fresh) => {
          queryClient.setQueryData(["hr_metrics"], fresh);
        });
      }
    };

    window.addEventListener("hcm_data_updated", handleLocalSync);
    window.addEventListener("storage", handleLocalSync);

    return () => {
      window.removeEventListener("hcm_data_updated", handleLocalSync);
      window.removeEventListener("storage", handleLocalSync);
    };
  }, [queryClient]);

  return query;
}

/**
 * Hook: Real-time Employees Directory
 */
export function useEmployeesQuery(filters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["employees", filters],
    queryFn: () => employeeService.getAllEmployees(filters),
    staleTime: 1000 * 60 * 3,
  });

  useEffect(() => {
    const handleLocalSync = (e) => {
      const key = e.detail?.entityKey;
      if (!key || key === "employees") {
        employeeService.getAllEmployees(filters, true).then((fresh) => {
          queryClient.setQueryData(["employees", filters], fresh);
        });
      }
    };

    window.addEventListener("hcm_data_updated", handleLocalSync);
    window.addEventListener("storage", handleLocalSync);

    return () => {
      window.removeEventListener("hcm_data_updated", handleLocalSync);
      window.removeEventListener("storage", handleLocalSync);
    };
  }, [queryClient, JSON.stringify(filters)]);

  return query;
}

/**
 * Hook: Real-time Grievances & Complaints Pipeline
 */
export function useComplaintsQuery(user) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["complaints", user?.employeeId, user?.role],
    queryFn: () => complaintService.getComplaintsForUser(user),
    staleTime: 1000 * 60 * 3,
  });

  useEffect(() => {
    const handleLocalSync = (e) => {
      const key = e.detail?.entityKey;
      if (!key || key === "complaints") {
        complaintService.getComplaintsForUser(user).then((fresh) => {
          queryClient.setQueryData(["complaints", user?.employeeId, user?.role], fresh);
        });
      }
    };

    window.addEventListener("hcm_data_updated", handleLocalSync);
    window.addEventListener("storage", handleLocalSync);

    return () => {
      window.removeEventListener("hcm_data_updated", handleLocalSync);
      window.removeEventListener("storage", handleLocalSync);
    };
  }, [queryClient, user?.employeeId, user?.role]);

  return query;
}
