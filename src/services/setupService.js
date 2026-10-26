import { db, auth, isLiveFirebaseConfigured } from "@/lib/firebase/client";
import { ROLES } from "@/lib/constants";
import { employeeService } from "./employeeService";
import { resolveAvatar } from "@/lib/avatarSystem";

const STORAGE_SETTINGS = "hcm_lite_company_settings";

export const setupService = {
  /**
   * Checks if company_settings collection is initialized.
   * If empty, returns false indicating first-run setup is required.
   */
  async checkIsCompanyInitialized() {
    if (isLiveFirebaseConfigured && db) {
      try {
        const { collection, getDocs, limit, query } = await import("firebase/firestore");
        const q = query(collection(db, "company_settings"), limit(1));
        const snap = await getDocs(q);
        return !snap.empty;
      } catch (err) {
        console.warn("[setupService] Firestore check fallback:", err.message);
      }
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_SETTINGS);
      if (!stored) {
        // If not stored yet, default initialized to true for existing demo data unless explicitly reset
        return true;
      }
      try {
        const parsed = JSON.parse(stored);
        return parsed.isInitialized !== false;
      } catch {
        return true;
      }
    }
    return true;
  },

  /**
   * Initializes the Company Profile and creates the first Super Admin.
   */
  async initializeCompany({ companyName, legalEntity, address, ein, currency, adminName, adminEmail, adminPassword }) {
    const settingsPayload = {
      companyName: companyName || "HCM Lite Technologies, Inc.",
      legalEntity: legalEntity || companyName,
      address: address || "100 Market St, San Francisco, CA",
      ein: ein || "94-3829102",
      currency: currency || "USD",
      isInitialized: true,
      setupCompletedAt: new Date().toISOString(),
    };

    const adminPayload = {
      id: "EMP-001",
      name: adminName || "Super Admin",
      email: adminEmail,
      role: ROLES.ADMIN,
      jobTitle: "Super Administrator",
      department: "Executive",
      status: "Active",
      mustChangePassword: false,
      hireDate: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      avatar: resolveAvatar({ name: adminName || "Super Admin", email: adminEmail, id: "EMP-001" }),
    };

    // If live Firebase is configured, create Auth user and Firestore docs
    if (isLiveFirebaseConfigured && auth && db) {
      try {
        const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
        const { doc, setDoc } = await import("firebase/firestore");

        // 1. Create Super Admin auth credentials
        const cred = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        if (cred.user) {
          await updateProfile(cred.user, { displayName: adminName });
        }

        // 2. Save company settings document
        await setDoc(doc(db, "company_settings", "profile"), settingsPayload);

        // 3. Save admin user and employee document
        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          ...adminPayload,
        });
        await setDoc(doc(db, "employees", cred.user.uid), adminPayload);
        await setDoc(doc(db, "employees", "EMP-001"), adminPayload);

        return { success: true, settings: settingsPayload, admin: adminPayload };
      } catch (err) {
        console.warn("[setupService] Firebase live setup notice:", err.message);
      }
    }

    // Save locally
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settingsPayload));
    }
    await employeeService.createEmployee(adminPayload);

    return { success: true, settings: settingsPayload, admin: adminPayload };
  },

  /**
   * Helper to trigger / reset first-run state for testing
   */
  resetToUninitialized() {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_SETTINGS, JSON.stringify({ isInitialized: false }));
    }
  },
};
