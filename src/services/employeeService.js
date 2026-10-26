import { isLiveFirebaseConfigured, db } from "@/lib/firebase/client";
import { INITIAL_EMPLOYEES } from "@/lib/seedData";
import { generateId } from "@/lib/utils";
import { resolveAvatar } from "@/lib/avatarSystem";

const STORAGE_KEY = "hcm_lite_employees";

function getLocalEmployees() {
  if (typeof window === "undefined") return INITIAL_EMPLOYEES;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EMPLOYEES));
    return INITIAL_EMPLOYEES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_EMPLOYEES;
  }
}

function saveLocalEmployees(list) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

// In-memory cache for ultra-fast employee directory rendering
let memoryEmployeesCache = null;
let lastEmployeesFetchTime = 0;
const EMPLOYEES_CACHE_TTL_MS = 30000;

export const employeeService = {
  async getAllEmployees({ search = "", department = "", status = "" } = {}, forceRefresh = false) {
    const now = Date.now();
    let list;

    if (!forceRefresh && memoryEmployeesCache && now - lastEmployeesFetchTime < EMPLOYEES_CACHE_TTL_MS) {
      list = [...memoryEmployeesCache];
    } else {
      list = getLocalEmployees();

      if (isLiveFirebaseConfigured && db) {
        try {
          const { collection, getDocs } = await import("firebase/firestore");
          const snapshot = await Promise.race([
            getDocs(collection(db, "employees")),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1400)),
          ]);
          if (!snapshot.empty) {
            const remoteList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
          console.warn("[employeeService] Firestore query error, falling back to local state:", err);
        }
      }

      memoryEmployeesCache = list;
      lastEmployeesFetchTime = now;
    }

    if (department) list = list.filter((e) => e.department === department);
    if (status) list = list.filter((e) => e.status === status);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name?.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q) ||
          e.jobTitle?.toLowerCase().includes(q)
      );
    }
    return list;
  },

  async getEmployeeById(id) {
    if (!id) return null;
    const normalizedId = String(id).trim();

    if (isLiveFirebaseConfigured && db) {
      try {
        const { doc, getDoc, collection, getDocs } = await import("firebase/firestore");
        // Try direct doc id
        const snap = await getDoc(doc(db, "employees", normalizedId));
        if (snap.exists()) return { id: snap.id, ...snap.data() };

        // Try searching by email or id field
        const allSnap = await getDocs(collection(db, "employees"));
        const match = allSnap.docs.find((d) => {
          const item = d.data();
          return (
            d.id === normalizedId ||
            item.id === normalizedId ||
            item.uid === normalizedId ||
            item.email?.toLowerCase() === normalizedId.toLowerCase()
          );
        });
        if (match) return { id: match.id, ...match.data() };
      } catch (err) {
        console.warn("[employeeService] getEmployeeById fallback:", err);
      }
    }

    const list = getLocalEmployees();
    return (
      list.find(
        (e) =>
          e.id === normalizedId ||
          e.uid === normalizedId ||
          e.email?.toLowerCase() === normalizedId.toLowerCase()
      ) || null
    );
  },

  async getEmployeeByEmail(email) {
    if (!email) return null;
    return this.getEmployeeById(email);
  },

  /**
   * Activates employee when they log in and change their password
   */
  async activateEmployee(emailOrId) {
    if (!emailOrId) return null;
    const emp = await this.getEmployeeById(emailOrId);
    if (!emp) return null;

    return this.updateEmployee(emp.id, {
      status: "Active",
      mustChangePassword: false,
      activatedAt: new Date().toISOString(),
    });
  },

  async createEmployee(data) {
    const newId = `EMP-${String(Math.floor(Math.random() * 900) + 100)}`;
    const tempPassword = data.temporaryPassword || `HCM-${Math.random().toString(36).substring(2, 8).toUpperCase()}!`;
    const cleanEmail = (data.email || "").trim().toLowerCase();

    const empName = `${data.firstName || ""} ${data.lastName || ""}`.trim() || data.name || "Unnamed Employee";
    const assignedAvatar = resolveAvatar({
      src: data.avatar,
      name: empName,
      email: cleanEmail,
      id: newId,
      gender: data.gender,
    });

    const newEmp = {
      id: newId,
      name: empName,
      email: cleanEmail,
      status: "Pending Activation",
      hireDate: data.hireDate || new Date().toISOString().split("T")[0],
      avatar: assignedAvatar,
      currency: "USD",
      temporaryPassword: tempPassword,
      mustChangePassword: true,
      ...data,
      status: "Pending Activation",
    };

    if (isLiveFirebaseConfigured && db) {
      let authUid = newId;

      // 1. Provision Auth User in Firebase Auth using isolated secondary app instance
      try {
        const { initializeApp, deleteApp } = await import("firebase/app");
        const { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } = await import("firebase/auth");
        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };
        const appName = `sec_auth_${Date.now()}`;
        const secApp = initializeApp(firebaseConfig, appName);
        const secAuth = getAuth(secApp);

        const cred = await createUserWithEmailAndPassword(secAuth, cleanEmail, tempPassword);
        authUid = cred.user.uid;
        await updateProfile(cred.user, { displayName: newEmp.name });
        await signOut(secAuth);
        await deleteApp(secApp);
      } catch (authErr) {
        console.warn("[employeeService] Secondary auth user provision notice:", authErr.message);
      }

      // 2. Persist record to Cloud Firestore
      try {
        const { doc, setDoc } = await import("firebase/firestore");
        const recordToSave = { ...newEmp, uid: authUid, avatar: assignedAvatar };

        await setDoc(doc(db, "employees", newId), recordToSave);
        if (authUid !== newId) {
          await setDoc(doc(db, "employees", authUid), recordToSave);
        }

        await setDoc(doc(db, "users", authUid), {
          uid: authUid,
          email: cleanEmail,
          displayName: newEmp.name,
          role: newEmp.role || "Employee",
          employeeId: newId,
          jobTitle: newEmp.jobTitle || "Team Member",
          department: newEmp.department || "General",
          mustChangePassword: true,
          temporaryPassword: tempPassword,
          status: "Pending Activation",
          avatar: assignedAvatar,
          createdAt: new Date().toISOString(),
        });

        return { ...newEmp, uid: authUid, temporaryPassword: tempPassword };
      } catch (err) {
        console.warn("[employeeService] Firestore create notice:", err);
      }
    }

    const current = getLocalEmployees();
    const updated = [newEmp, ...current];
    saveLocalEmployees(updated);
    memoryEmployeesCache = null;
    return newEmp;
  },

  async updateEmployee(id, updates) {
    if (isLiveFirebaseConfigured && db) {
      try {
        const { doc, updateDoc } = await import("firebase/firestore");
        await updateDoc(doc(db, "employees", id), updates);
      } catch (err) {
        console.warn("[employeeService] Firestore update fallback:", err);
      }
    }

    const current = getLocalEmployees();
    const index = current.findIndex((e) => e.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updates };
      saveLocalEmployees(current);
      memoryEmployeesCache = null;
      return current[index];
    }
    return null;
  },

  async deleteEmployee(id) {
    if (isLiveFirebaseConfigured && db) {
      try {
        const { doc, deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(db, "employees", id));
      } catch (err) {
        console.warn("[employeeService] Firestore delete fallback:", err);
      }
    }

    const current = getLocalEmployees();
    const filtered = current.filter((e) => e.id !== id);
    saveLocalEmployees(filtered);
    memoryEmployeesCache = null;
    return true;
  },

  async getDepartmentsSummary() {
    const employees = await this.getAllEmployees();
    const counts = {};
    employees.forEach((emp) => {
      const dept = emp.department || "Other";
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return counts;
  },
};
