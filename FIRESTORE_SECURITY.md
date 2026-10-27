# Firebase Firestore Security Rules & Demo Safety Guide

This guide ensures your Firebase database is configured securely, prevents permission lockouts during your interview, and gives you talking points to demonstrate enterprise security awareness.

---

## 1. The Fatal "Test Mode" Expiration Trap (Must Avoid!)

When you initially create a Cloud Firestore database in the Firebase Console, Google offers two starting modes:
- **Production Mode**: All reads and writes are blocked by default (`allow read, write: if false;`).
- **Test Mode**: Automatically sets a **30-day expiration date**:
  ```javascript
  // DANGEROUS FOR INTERVIEWS:
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if request.time < timestamp.date(2026, 11, 20); // EXPIRES!
      }
    }
  }
  ```

> [!CAUTION]
> If that 30-day date passes before or during your interview, Firestore immediately rejects all operations with `FirebaseError: Missing or insufficient permissions`, causing your app to fail live!

---

## 2. Production Security Rules (`firestore.rules`)

We have created an enterprise-grade `firestore.rules` file in your project root with **no expiration date** and strict **Role-Based Access Control (RBAC)**.

### How to Apply in 60 Seconds:
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project -> Click **Firestore Database** in the left sidebar.
3. Click the **Rules** tab at the top.
4. Delete whatever is currently in the editor.
5. Copy the complete contents of [`firestore.rules`](./firestore.rules) and paste them into the editor.
6. Click **Publish**.

*(Alternatively, if you use the Firebase CLI, run: `firebase deploy --only firestore:rules`)*

---

## 3. How the Rules Work (Interview Talking Points)

| Collection | Security Policy | Why This Policy? |
| :--- | :--- | :--- |
| `/users/{userId}` | Authenticated read; write restricted to self or Admin | Prevents users from escalating their own roles from Employee to Admin. |
| `/employees/{id}` | Read by all authenticated staff; write restricted to HR & Admin | Employees can view the org directory, but only People Operations can onboard or terminate employees. |
| `/payroll_runs/{id}` | Read by HR & Admin; write restricted strictly to Executive Admin | Financial disbursals and company-wide salaries are confidential executive data. |
| `/complaints/{id}` | Any authenticated user can create; investigation restricted to HR & Admin | Protects whistleblower confidentiality. Employees cannot view other employees' grievances. |
| `/leave_requests/{id}` | Any authenticated employee can submit; approval/update restricted to HR | Employees cannot approve their own leaves. |

---

## 4. Answering: "How do you secure your Firebase backend?" in an Interview

> *"We enforce multi-tiered defense in depth. On the client frontend, our Next.js `AuthContext` normalizes roles and protects routes. At the database layer, we enforce strict Cloud Firestore Security Rules using custom RBAC helper functions (`isAdmin()`, `isHR()`, `isSelf()`). Sensitive operations like payroll disbursements are locked to Executive Admins, while the grievance pipeline isolates confidential whistleblower complaints to the assigned HR investigators and Executive sign-offs."*
