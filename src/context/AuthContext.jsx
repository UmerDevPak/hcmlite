"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, isLiveFirebaseConfigured } from "@/lib/firebase/client";
import { DEMO_USERS, findDemoUser, authService } from "@/services/authService";
import { employeeService } from "@/services/employeeService";
import { ROLES, normalizeRole } from "@/lib/constants";
import { resolveAvatar } from "@/lib/avatarSystem";

const AuthContext = createContext({
  user: null,
  role: ROLES.ADMIN,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  switchDemoRole: async () => {},
  isAdmin: false,
  isHR: false,
  isManager: false,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("hcm_lite_cached_session");
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return null;
  });

  const [role, setRole] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("hcm_lite_cached_session");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.role) return normalizeRole(parsed.role);
        }
      } catch (e) {}
    }
    return ROLES.ADMIN;
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("hcm_lite_cached_session");
        if (cached) return false;
      } catch (e) {}
    }
    return true;
  });

  // Safety timeout: Ensure page loading never hangs on slow network / cold start
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLiveFirebaseConfigured && auth) {
      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Concurrently resolve profile and employee record for maximum speed
            const [profile, empRecordDirect] = await Promise.all([
              authService.getUserProfile(firebaseUser.uid).catch(() => null),
              employeeService.getEmployeeById(firebaseUser.uid).catch(() => null),
            ]);

            let empRecord = empRecordDirect;
            if (!empRecord && firebaseUser.email) {
              empRecord = await employeeService.getEmployeeByEmail(firebaseUser.email).catch(() => null);
            }

            const demoMatch = findDemoUser(firebaseUser.email);

            const rawRole =
              profile?.role ||
              empRecord?.role ||
              demoMatch?.role ||
              (firebaseUser.email?.toLowerCase().includes("admin") ? "ADMIN" : ROLES.EMPLOYEE);
            const activeRole = normalizeRole(rawRole);

            const activeDisplayName =
              empRecord?.name ||
              profile?.displayName ||
              firebaseUser.displayName ||
              demoMatch?.displayName ||
              (activeRole === "ADMIN" ? "Sarah Connor" : "User");

            const activeEmployeeId = profile?.employeeId || empRecord?.id || demoMatch?.employeeId || "EMP-001";

            const effectiveAvatar = resolveAvatar({
              src: empRecord?.avatar || profile?.avatar || firebaseUser.photoURL || demoMatch?.avatar,
              name: activeDisplayName,
              email: firebaseUser.email,
              id: activeEmployeeId,
            });

            const userObj = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: activeDisplayName,
              photoURL: effectiveAvatar,
              avatar: effectiveAvatar,
              role: activeRole,
              employeeId: activeEmployeeId,
              jobTitle:
                empRecord?.jobTitle ||
                profile?.jobTitle ||
                demoMatch?.jobTitle ||
                (activeRole === "ADMIN" ? "Super Administrator" : "Team Member"),
              department:
                empRecord?.department ||
                profile?.department ||
                demoMatch?.department ||
                (activeRole === "ADMIN" ? "Executive" : "General"),
              mustChangePassword: Boolean(profile?.mustChangePassword || empRecord?.mustChangePassword),
            };

            setUser(userObj);
            setRole(activeRole);
            if (typeof window !== "undefined") {
              localStorage.setItem("hcm_lite_cached_session", JSON.stringify(userObj));
              localStorage.setItem("hcm_lite_demo_user_uid", firebaseUser.uid);
              localStorage.removeItem("hcm_lite_logged_out");
            }
          } catch (err) {
            console.warn("[AuthContext] onAuthStateChanged profile resolution error:", err);
          }
        } else {
          setUser(null);
          setRole(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("hcm_lite_cached_session");
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // In Demo / Local Mode
      const savedUid = typeof window !== "undefined" ? localStorage.getItem("hcm_lite_demo_user_uid") : null;
      let matched = null;

      if (typeof window !== "undefined") {
        try {
          const registered = JSON.parse(localStorage.getItem("hcm_lite_registered_users") || "[]");
          matched = registered.find((u) => u.uid === savedUid);
        } catch {
          // ignore parsing error
        }
      }

      if (!matched && savedUid) {
        matched = DEMO_USERS.find((u) => u.uid === savedUid);
      }

      // Default initial persona on first visit
      const isExplicitLoggedOut = typeof window !== "undefined" && localStorage.getItem("hcm_lite_logged_out") === "true";
      if (!matched && !isExplicitLoggedOut) {
        matched = DEMO_USERS[0];
        if (typeof window !== "undefined") {
          localStorage.setItem("hcm_lite_demo_user_uid", matched.uid);
        }
      }

      if (matched) {
        const canonical = normalizeRole(matched.role);
        const resolved = resolveAvatar({
          src: matched.avatar,
          name: matched.displayName,
          email: matched.email,
          id: matched.employeeId,
        });
        setUser({ ...matched, avatar: resolved, photoURL: resolved, role: canonical });
        setRole(canonical);
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    }
  }, []);

  const switchDemoRole = async (newRole) => {
    const canonical = normalizeRole(newRole);

    // If live Firebase is configured and user is switching roles,
    // seamlessly authenticate with the verified persona credentials
    if (isLiveFirebaseConfigured && auth) {
      const emailMap = {
        ADMIN: "admin@hcmlite.internal",
        HR: "hr@hcmlite.internal",
        EMPLOYEE: "employee@hcmlite.internal",
      };
      const targetEmail = emailMap[canonical];
      if (targetEmail) {
        try {
          const { signInWithEmailAndPassword } = await import("firebase/auth");
          await signInWithEmailAndPassword(auth, targetEmail, "Password123!");
          return;
        } catch (e) {
          console.warn("[switchDemoRole] Live switch notice:", e.message);
        }
      }
    }

    const matched = DEMO_USERS.find((u) => normalizeRole(u.role) === canonical) || DEMO_USERS[0];
    const userRole = normalizeRole(matched.role);
    const resolved = resolveAvatar({
      src: matched.avatar,
      name: matched.displayName,
      email: matched.email,
      id: matched.employeeId,
    });
    setUser({ ...matched, avatar: resolved, photoURL: resolved, role: userRole });
    setRole(userRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("hcm_lite_demo_user_uid", matched.uid);
      localStorage.removeItem("hcm_lite_logged_out");
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const authResult = await authService.signInWithEmailPassword(email, password);
      const normalizedRole = normalizeRole(authResult.role);
      const updatedUser = { ...authResult, role: normalizedRole };
      setUser(updatedUser);
      setRole(normalizedRole);
      if (typeof window !== "undefined") {
        localStorage.setItem("hcm_lite_demo_user_uid", authResult.uid);
        localStorage.removeItem("hcm_lite_logged_out");
      }
      return updatedUser;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (formData) => {
    setLoading(true);
    try {
      const authResult = await authService.signUpWithEmailPassword(formData);
      const normalizedRole = normalizeRole(authResult.role);
      const updatedUser = { ...authResult, role: normalizedRole };
      setUser(updatedUser);
      setRole(normalizedRole);
      if (typeof window !== "undefined") {
        localStorage.setItem("hcm_lite_demo_user_uid", authResult.uid);
        localStorage.removeItem("hcm_lite_logged_out");
      }
      return updatedUser;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      if (typeof window !== "undefined") {
        localStorage.removeItem("hcm_lite_cached_session");
        localStorage.removeItem("hcm_lite_demo_user_uid");
        localStorage.setItem("hcm_lite_logged_out", "true");
      }
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const currentRoleCanonical = normalizeRole(user?.role || role);
  const isAdmin = currentRoleCanonical === "ADMIN";
  const isHR = currentRoleCanonical === "ADMIN" || currentRoleCanonical === "HR";
  const isManager = currentRoleCanonical === "ADMIN" || currentRoleCanonical === "HR";

  return (
    <AuthContext.Provider
      value={{
        user,
        role: currentRoleCanonical,
        loading,
        signIn,
        signUp,
        signOut,
        switchDemoRole,
        isAdmin,
        isHR,
        isManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
