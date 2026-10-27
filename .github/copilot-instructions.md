# GitHub Copilot Instructions for HCM Lite

You are GitHub Copilot assisting the developer in maintaining, debugging, extending, and explaining **HCM Lite**, an enterprise-grade Human Capital Management and HR platform.

## 1. High-Level Architecture & Tech Stack

- **Framework**: Next.js 14 (App Router) using React 18 client and server components.
- **Language**: Pure JavaScript (ES6+ / JSX). **Do NOT use TypeScript syntax** (no `: string`, `interface`, or `<T>`).
- **Styling**: Tailwind CSS v3 (`dark` class strategy, zinc palette: `zinc-950` dark background, `zinc-900` cards, `zinc-800` borders, `indigo-600` primary brand).
- **Icons**: `lucide-react` (e.g., `Building2`, `Users`, `Clock`, `CreditCard`, `CalendarDays`, `ShieldAlert`, `Bell`).
- **Database & Auth**:
  - Live mode: Firebase v10 Modular SDK (`firebase/auth`, `firebase/firestore`).
  - Offline/Demo fallback: Robust fallback to seeded browser `localStorage` (`src/lib/seedData.js`).
- **Delight & Utilities**: `canvas-confetti` (for approvals), `date-fns` (time formatting), `clsx` + `tailwind-merge` (`cn()` in `src/lib/utils.js`).

---

## 2. Directory & Route Map

### Application Routes (`src/app/`)
| Route | File Path | Description | Access Role |
| :--- | :--- | :--- | :--- |
| `/login` | `src/app/(auth)/login/page.jsx` | Multi-role login screen with quick 1-click persona switchers and hero art | Public |
| `/signup` | `src/app/(auth)/signup/page.jsx` | Registration with role selection, dept, and Firestore user profile creation | Public |
| `/forgot-password` | `src/app/(auth)/forgot-password/page.jsx` | Password reset flow | Public |
| `/setup` | `src/app/(auth)/setup/page.jsx` | First-run wizard to initialize company metadata | Public / First run |
| `/dashboard` | `src/app/(dashboard)/dashboard/page.jsx` | Smart router that redirects users to `/admin`, `/hr`, or `/employee` | Authenticated |
| `/admin` | `src/app/(dashboard)/admin/page.jsx` | Executive command center with org metrics, quick actions & system status | Admin only |
| `/hr` | `src/app/(dashboard)/hr/page.jsx` | People operations dashboard with onboarding, leave queues & payroll drafts | HR & Admin |
| `/employee` | `src/app/(dashboard)/employee/page.jsx` | Employee self-service portal (quick clock-in, leave balances, recent payslips) | All employees |
| `/employees` | `src/app/(dashboard)/employees/page.jsx` | Workforce directory with search, department filtering, and modal creation | HR & Admin |
| `/employees/[id]` | `src/app/(dashboard)/employees/[id]/page.jsx` | Detailed single employee profile, salary breakdown, and timeline | Authenticated |
| `/attendance` | `src/app/(dashboard)/attendance/page.jsx` | Real-time live clock-in / clock-out terminal, office/remote toggles, shift logs | All employees |
| `/leave` | `src/app/(dashboard)/leave/page.jsx` | Leave management: statutory balances (14 annual, 8 sick, 10 casual), approval queue | All employees |
| `/payroll` | `src/app/(dashboard)/payroll/page.jsx` | Automated batch gross-to-net tax calculation, direct deposit export, payslip viewer | Admin (execute) / HR |
| `/complaints` | `src/app/(dashboard)/complaints/page.jsx` | Grievance & complaint resolution pipeline (HR investigates, Admin sign-off) | All employees |
| `/recruitment` | `src/app/(dashboard)/recruitment/page.jsx` | ATS candidate pipeline (Applied -> Screened -> Interview -> Offer -> Hired) | HR & Admin |
| `/performance` | `src/app/(dashboard)/performance/page.jsx` | OKR tracking, self-reviews, and quarterly manager performance calibrations | All employees |
| `/expenses` | `src/app/(dashboard)/expenses/page.jsx` | Corporate expense claim filing, receipt uploads, approval workflows | All employees |
| `/documents` | `src/app/(dashboard)/documents/page.jsx` | Enterprise document repository, compliance handbook, download tracking | All employees |
| `/reports` | `src/app/(dashboard)/reports/page.jsx` | Audit logs, workforce distribution charts, and compliance exports | Admin & HR |
| `/settings` | `src/app/(dashboard)/settings/page.jsx` | Organization settings, EIN metadata, Firebase cloud connection status | Admin only |
| `/profile` | `src/app/(dashboard)/profile/page.jsx` | Personal user profile, compensation & tax info, leave balances, review history | All employees |

---

## 3. UI Components Library (`src/components/ui/`)

Always reuse these existing atomic UI components rather than writing raw HTML:
- `<Button variant="primary|secondary|outline|ghost|danger" size="sm|md|lg" icon={Icon} isLoading={bool}>`: standard button with loading spinner.
- `<Card>` & `<CardHeader>`, `<CardTitle>`, `<CardContent>`: glassmorphic card containers (`rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60`).
- `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableHead>`, `<TableCell>`: responsive table with built-in horizontal scroll wrapper.
- `<Modal isOpen={bool} onClose={fn} title={string} description={string}>`: responsive dialog with backdrop blur and escape key handling.
- `<Tabs tabs={[{id, label, count}]} activeTab={id} onChange={fn}>`: touch-scrollable, responsive tab bar with active indicator.
- `<Badge variant="primary|success|warning|danger|neutral" dot={bool}>`: status badges.
- `<StatCard title={string} value={any} subtext={string} icon={Icon}>`: KPI statistic card with icon badge.
- `<Avatar name={string} src={string} size="sm|md|lg">`: employee avatar with fallback color initials.
- `<Input label={string} icon={Icon} error={string}>`: styled form input.
- `<Select label={string} options={[{value, label}]}>`: styled dropdown select.
- `<EmptyState icon={Icon} title={string} description={string} actionLabel={string} onAction={fn}>`: empty list placeholder.

---

## 4. Services & Domain Logic (`src/services/`)

Each domain module is completely decoupled into its own service:
1. `authService.js`: Sign in, sign up, password reset, demo role switching, Firebase Auth + Firestore user doc synchronization.
2. `employeeService.js`: Full CRUD on employees, status activation, department counts, compensation stats.
3. `attendanceService.js`: Punch in/out time recording, calculating shift hours, live office/remote counts.
4. `leaveService.js`: Leave balances (Annual: 14, Sick: 8, Casual: 10), request submission, manager/HR approval, balance auto-deduction.
5. `payrollService.js`: Bi-weekly/monthly payroll execution, gross wages, federal/state/FICA withholding calculations, payslip generation, CSV export.
6. `complaintService.js`: Anonymous/named grievance filing, priority levels (Low/Medium/High/Urgent), multi-tier lifecycle:
   - `OPEN` -> `UNDER_REVIEW` (HR investigates) -> `ESCALATED_TO_ADMIN` -> `RESOLVED` (Admin/HR formal outcome).
7. `activityNotificationService.js`: Global real-time audit log & notification broadcast engine for topbar bell. Tracks Admin, HR, and Employee actions across the entire system.
8. `recruitmentService.js`: ATS pipeline stages, applicant status advancement, job requisition tracking.
9. `performanceService.js`: Performance reviews, OKR progress scoring (1.0 to 5.0 rating scale).
10. `expenseService.js`: Expense receipts, budget categories, approval flow.
11. `documentService.js`: Document repository, policy handbooks, download tracking.
12. `reportService.js`: System audit trails, compliance exports.
13. `setupService.js`: First-time setup detector, enterprise seed database.

---

## 5. Role-Based Access Control (RBAC) System

The application strictly verifies roles via `useAuth()` (`src/context/AuthContext.jsx`):
- `canonicalRole = normalizeRole(user?.role)`
- Three roles:
  1. `ADMIN`: Full system access, runs payroll disbursals, audits logs, escalates complaints, updates legal settings.
  2. `HR`: People operations, reviews leaves, drafts payroll, manages employee directory & ATS candidates, investigates grievances.
  3. `EMPLOYEE`: Self-service portal, records punch clock, files leave requests, views personal payslips, submits confidential complaints.

---

## 6. Coding Rules for Copilot

When responding or generating code in this repository:
1. **Never use TypeScript**: Always output plain JavaScript (`.jsx` / `.js`).
2. **Always include responsive Tailwind classes**: Small phone viewports (350px - 390px) must never overflow horizontally. Use `p-4 sm:p-6`, `flex-wrap`, `min-w-0`, and `overflow-x-auto` on wide content.
3. **Keep the enterprise dark theme consistent**: Use `zinc-950` as background, `zinc-900` for cards, `zinc-800` for borders, `zinc-100` for primary text, and `zinc-400` for muted captions.
4. **Broadcast notifications on state changes**: When adding a new workflow, call `activityNotificationService.logActivity({ actorName, actorRole, action, module, details })` so the topbar bell updates in real-time.
