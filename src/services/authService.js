import { auth, db, isLiveFirebaseConfigured } from "@/lib/firebase/client";
import { ROLES, normalizeRole } from "@/lib/constants";
import { employeeService } from "./employeeService";
import { CORE_PERSONA_AVATARS, resolveAvatar, getIllustratedAvatar } from "@/lib/avatarSystem";

export const DEMO_USERS = [
  {
    uid: "demo-admin",
    email: "admin@hcmlite.internal",
    aliases: ["sarah.connor@hcmlite.internal", "admin@acme.internal"],
    displayName: "Sarah Connor",
    role: "ADMIN",
    employeeId: "EMP-001",
    jobTitle: "Super Administrator",
    department: "Executive",
    mustChangePassword: false,
    avatar: CORE_PERSONA_AVATARS["admin@hcmlite.internal"],
  },
  {
    uid: "demo-hr",
    email: "hr@hcmlite.internal",
    aliases: ["aaliyah.patel@hcmlite.internal"],
    displayName: "Aaliyah Patel",
    role: "HR",
    employeeId: "EMP-005",
    jobTitle: "Senior HR Business Partner",
    department: "Human Resources",
    mustChangePassword: false,
    avatar: CORE_PERSONA_AVATARS["hr@hcmlite.internal"],
  },
  {
    uid: "demo-employee",
    email: "employee@hcmlite.internal",
    aliases: ["elena.rostova@hcmlite.internal"],
    displayName: "Elena Rostova",
    role: "EMPLOYEE",
    employeeId: "EMP-003",
    jobTitle: "Staff Software Engineer",
    department: "Engineering",
    mustChangePassword: false,
    avatar: CORE_PERSONA_AVATARS["employee@hcmlite.internal"],
  },
  {
    uid: "demo-temp-user",
    email: "new.hire@hcmlite.internal",
    aliases: [],
    displayName: "Liam Nguyen",
    role: "EMPLOYEE",
    employeeId: "EMP-009",
    jobTitle: "New Hire (Temp Password)",
    department: "Engineering",
    mustChangePassword: true,
    avatar: CORE_PERSONA_AVATARS["new.hire@hcmlite.internal"],
  },
];

export function findDemoUser(email = "") {
  const clean = String(email).trim().toLowerCase();
  return DEMO_USERS.find(
    (u) =>
      u.email.toLowerCase() === clean ||
      (Array.isArray(u.aliases) && u.aliases.some((a) => a.toLowerCase() === clean))
  );
}

export const authService = {
  /**
   * Authentic Firebase Sign Up with email, password, and custom profile
   * Writes user profile to Cloud Firestore and syncs into employees collection
   */
  async signUpWithEmailPassword({
    email,
    password,
    displayName,
    role = ROLES.EMPLOYEE,
    department = "Engineering",
    jobTitle = "Team Member",
  }) {
    if (isLiveFirebaseConfigured && auth) {
      try {
        const { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } = await import("firebase/auth");
        let cred;
        try {
          cred = await createUserWithEmailAndPassword(auth, email, password);
        } catch (createErr) {
          if (createErr.code === "auth/email-already-in-use") {
            // If already created in Auth, authenticate directly
            cred = await signInWithEmailAndPassword(auth, email, password);
          } else {
            throw createErr;
          }
        }

        if (displayName && cred.user) {
          await updateProfile(cred.user, { displayName });
        }

        // Check if employee record already exists in directory to link
        const existingEmp = await employeeService.getEmployeeByEmail(email);
        const employeeId = existingEmp?.id || `EMP-${String(Math.floor(Math.random() * 900) + 100)}`;
        const assignedRole = existingEmp?.role || role || ROLES.ADMIN;
        const assignedDept = existingEmp?.department || department || "General";
        const assignedTitle = existingEmp?.jobTitle || jobTitle || "Team Member";

        const cleanDisplayName = displayName || existingEmp?.name || email.split("@")[0];
        const assignedAvatar = resolveAvatar({
          src: existingEmp?.avatar,
          name: cleanDisplayName,
          email: cred.user.email,
          id: employeeId,
        });

        const userProfile = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cleanDisplayName,
          role: assignedRole,
          employeeId,
          jobTitle: assignedTitle,
          department: assignedDept,
          mustChangePassword: false,
          status: "Active",
          createdAt: new Date().toISOString(),
          avatar: assignedAvatar,
        };

        // Persist profile to Cloud Firestore
        if (db) {
          try {
            const { doc, setDoc } = await import("firebase/firestore");
            await setDoc(doc(db, "users", cred.user.uid), userProfile);
            await setDoc(doc(db, "employees", cred.user.uid), {
              id: cred.user.uid,
              name: userProfile.displayName,
              email: cred.user.email,
              role: assignedRole,
              jobTitle: assignedTitle,
              department: assignedDept,
              status: "Active",
              hireDate: existingEmp?.hireDate || new Date().toISOString().split("T")[0],
              salary: existingEmp?.annualSalary || 85000,
              avatar: userProfile.avatar,
            });
            if (existingEmp && existingEmp.id !== cred.user.uid) {
              await setDoc(doc(db, "employees", existingEmp.id), {
                ...existingEmp,
                status: "Active",
                mustChangePassword: false,
                uid: cred.user.uid,
              });
            }
          } catch (dbErr) {
            console.warn("[authService] Cloud Firestore user document write:", dbErr.message);
          }
        }

        return userProfile;
      } catch (err) {
        if (err.code === "auth/wrong-password") {
          throw new Error("This email is already registered with a different password. Please sign in with your existing password.");
        }
        throw new Error(err.message || "Failed to create account with Firebase");
      }
    }

    // Demo / Offline Fallback Mode
    const newId = `usr_${Date.now()}`;
    const newEmployeeId = `EMP-${String(Math.floor(Math.random() * 900) + 100)}`;
    const resolvedName = displayName || email.split("@")[0];
    const localUser = {
      uid: newId,
      email,
      displayName: resolvedName,
      role: role || ROLES.ADMIN,
      employeeId: newEmployeeId,
      jobTitle: jobTitle || "Team Member",
      department: department || "General",
      mustChangePassword: false,
      avatar: resolveAvatar({ name: resolvedName, email, id: newEmployeeId }),
    };

    if (typeof window !== "undefined") {
      try {
        const existing = JSON.parse(localStorage.getItem("hcm_lite_registered_users") || "[]");
        existing.push(localUser);
        localStorage.setItem("hcm_lite_registered_users", JSON.stringify(existing));
        localStorage.setItem("hcm_lite_demo_user_uid", localUser.uid);
      } catch (e) {
        // ignore storage errors
      }
    }
    return localUser;
  },

  /**
   * Authentic Firebase Sign In
   * Validates with Firebase Auth and retrieves role and metadata from Firestore
   */
  async signInWithEmailPassword(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    if (isLiveFirebaseConfigured && auth) {
      try {
        const { signInWithEmailAndPassword } = await import("firebase/auth");
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);

        // Fetch user profile from Cloud Firestore
        let profileData = null;
        if (db) {
          try {
            const { doc, getDoc } = await import("firebase/firestore");
            const userSnap = await getDoc(doc(db, "users", cred.user.uid));
            if (userSnap.exists()) {
              profileData = userSnap.data();
            }
          } catch (dbErr) {
            console.warn("[authService] Cloud Firestore profile lookup:", dbErr.message);
          }
        }

        // Also check employee record for activation status
        const empRecord = await employeeService.getEmployeeById(cred.user.uid) || await employeeService.getEmployeeByEmail(cleanEmail);
        const mustChange = profileData?.mustChangePassword || empRecord?.mustChangePassword || false;

        const assignedRole = normalizeRole(
          profileData?.role ||
          empRecord?.role ||
          (cleanEmail.includes("admin") ? "ADMIN" : cleanEmail.includes("hr") ? "HR" : ROLES.EMPLOYEE)
        );

        const resolvedName = cred.user.displayName || empRecord?.name || profileData?.displayName || cleanEmail.split("@")[0];
        const resolvedEmpId = profileData?.employeeId || empRecord?.id || "EMP-001";
        const resolvedAvatar = resolveAvatar({
          src: empRecord?.avatar || profileData?.avatar || cred.user.photoURL,
          name: resolvedName,
          email: cleanEmail,
          id: resolvedEmpId,
        });

        return {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: resolvedName,
          role: assignedRole,
          employeeId: resolvedEmpId,
          jobTitle: profileData?.jobTitle || empRecord?.jobTitle || (assignedRole === "ADMIN" ? "Super Administrator" : "Team Member"),
          department: profileData?.department || empRecord?.department || (assignedRole === "ADMIN" ? "Executive" : "General"),
          mustChangePassword: Boolean(mustChange),
          avatar: resolvedAvatar,
        };
      } catch (err) {
        // Check if employee exists in directory with temporary password
        const empRecord = await employeeService.getEmployeeByEmail(cleanEmail);
        if (empRecord && (empRecord.temporaryPassword === password || empRecord.mustChangePassword)) {
          try {
            // Provision their auth user so they can sign in and change password
            const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
            const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
            if (empRecord.name) {
              await updateProfile(newCred.user, { displayName: empRecord.name });
            }
            return {
              uid: newCred.user.uid,
              email: cleanEmail,
              displayName: empRecord.name,
              role: empRecord.role || ROLES.EMPLOYEE,
              employeeId: empRecord.id,
              jobTitle: empRecord.jobTitle || "Team Member",
              department: empRecord.department || "General",
              mustChangePassword: true,
              avatar: empRecord.avatar,
            };
          } catch (createErr) {
            console.warn("[authService] Temporary auth provision notice:", createErr.message);
          }
        }

        throw new Error(err.message || "Invalid credentials. Please verify your email and password.");
      }
    }

    // 1. Check registered local users
    if (typeof window !== "undefined") {
      try {
        const registered = JSON.parse(localStorage.getItem("hcm_lite_registered_users") || "[]");
        const matchedRegistered = registered.find(
          (u) => u.email.toLowerCase() === cleanEmail
        );
        if (matchedRegistered) {
          localStorage.setItem("hcm_lite_demo_user_uid", matchedRegistered.uid);
          return matchedRegistered;
        }
      } catch (e) {
        // ignore storage errors
      }
    }

    // 2. Check predefined demo personas
    const foundDemo = findDemoUser(cleanEmail);
    if (foundDemo) {
      if (typeof window !== "undefined") {
        localStorage.setItem("hcm_lite_demo_user_uid", foundDemo.uid);
      }
      return foundDemo;
    }

    // 3. Check onboarded workforce directory
    const allEmployees = await employeeService.getAllEmployees();
    const matchedEmployee = allEmployees.find(
      (e) => e.email?.toLowerCase() === cleanEmail
    );

    if (matchedEmployee) {
      if (matchedEmployee.status === "Terminated") {
        throw new Error("This employee account has been deactivated. Please contact your HR administrator.");
      }

      const employeeUser = {
        uid: matchedEmployee.id,
        email: matchedEmployee.email,
        displayName: matchedEmployee.name,
        role: matchedEmployee.role || ROLES.EMPLOYEE,
        employeeId: matchedEmployee.id,
        jobTitle: matchedEmployee.jobTitle || "Team Member",
        department: matchedEmployee.department || "General",
        mustChangePassword: matchedEmployee.mustChangePassword !== false,
        avatar: resolveAvatar({
          src: matchedEmployee.avatar,
          name: matchedEmployee.name,
          email: matchedEmployee.email,
          id: matchedEmployee.id,
        }),
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("hcm_lite_demo_user_uid", employeeUser.uid);
      }
      return employeeUser;
    }

    // Strict Enforcement: Only added employees can log in
    throw new Error(
      `No employee record found for "${email}". Only onboarded employees can log in. Please contact your HR administrator to be added to the workforce directory.`
    );
  },

  /**
   * Retrieves profile document from Cloud Firestore for authenticated UID
   */
  async getUserProfile(uid) {
    if (isLiveFirebaseConfigured && db && uid) {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          return snap.data();
        }
      } catch (err) {
        console.warn("[authService] getUserProfile error:", err.message);
      }
    }
    return null;
  },

  /**
   * PROJECT_SPEC.md Rule 2:
   * Change password on first login.
   * Activates employee account and updates status to "Active".
   */
  async changePassword(userId, newPassword) {
    if (isLiveFirebaseConfigured && auth?.currentUser) {
      const { updatePassword } = await import("firebase/auth");
      await updatePassword(auth.currentUser, newPassword);

      if (db) {
        try {
          const { doc, updateDoc } = await import("firebase/firestore");
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            mustChangePassword: false,
            status: "Active",
          });
          // Also activate in employees collection
          await employeeService.activateEmployee(auth.currentUser.uid);
          await employeeService.activateEmployee(auth.currentUser.email);
        } catch (e) {
          console.warn("[authService] updateDoc password flag notice:", e.message);
        }
      }
      await employeeService.activateEmployee(userId);
      return true;
    }

    // Local / Demo Mode: activate employee in workforce directory
    await employeeService.activateEmployee(userId);

    const matched = DEMO_USERS.find((u) => u.uid === userId);
    if (matched) {
      matched.mustChangePassword = false;
      matched.status = "Active";
    }

    if (typeof window !== "undefined") {
      try {
        const registered = JSON.parse(localStorage.getItem("hcm_lite_registered_users") || "[]");
        const regUser = registered.find((u) => u.uid === userId);
        if (regUser) {
          regUser.mustChangePassword = false;
          regUser.status = "Active";
          localStorage.setItem("hcm_lite_registered_users", JSON.stringify(registered));
        }
      } catch (e) {
        // ignore
      }
    }

    return true;
  },

  async signOut() {
    if (isLiveFirebaseConfigured && auth) {
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("hcm_lite_demo_user_uid");
    }
    return true;
  },

  async resetPassword(email) {
    if (isLiveFirebaseConfigured && auth) {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      await sendPasswordResetEmail(auth, email);
      return true;
    }
    return true;
  },
};
