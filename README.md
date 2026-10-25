# HCM Lite — Enterprise Human Capital Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![JavaScript](https://img.shields.io/badge/Language-Pure%20JavaScript-yellow?style=flat&logo=javascript)](https://developer.mozilla.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-orange?style=flat&logo=firebase)](https://firebase.google.com/)

HCM Lite is an enterprise-grade Human Capital Management (HCM) web application built from scratch with **Next.js (App Router)** and **Pure JavaScript (No TypeScript)**. It integrates directly with **Firebase Auth**, **Cloud Firestore**, and **Firebase Admin SDK**, adhering to a strict **Service-Layer Architecture** that isolates UI presentation from domain calculations.

---

## 🏗️ Architecture & Clean Service Layer Pattern

The application strictly separates user interfaces, state management, and business logic:

```
src/
├── app/                        # Next.js App Router (Routes & Server API endpoints)
│   ├── (auth)/                 # Authentication routes (Login, Forgot Password)
│   ├── (dashboard)/            # Authenticated Application Shell & Functional Modules
│   │   ├── dashboard/          # Executive KPI Dashboard & Realtime Activity
│   │   ├── employees/          # Employee Directory & [id] 360 Profile Dossier
│   │   ├── attendance/         # Attendance Terminal & Timesheets Ledger
│   │   ├── leave/              # Leave Management & Approval Queue
│   │   ├── payroll/            # Automated Gross-to-Net Payroll & Payslips
│   │   ├── recruitment/        # ATS Job Openings & Kanban Pipeline
│   │   ├── performance/        # Review Cycles, Appraisals & OKR Tracking
│   │   ├── expenses/           # Reimbursement Claims & Accounting Audit
│   │   ├── documents/          # Policy & Compliance Document Library
│   │   ├── reports/            # Executive Analytics & CSV Extracts
│   │   └── settings/           # Enterprise Profile & RBAC Matrix
│   └── api/                    # Server-side Route Handlers (Firebase Admin SDK)
├── components/                 # Reusable Presentation Layer
│   ├── ui/                     # Vercel/Linear style atomic primitives (Button, Modal, StatCard, Table)
│   ├── layout/                 # Sidebar, Topbar, RoleSwitcher, CommandPalette (Cmd+K)
│   ├── employees/              # Employee CRUD & Filters
│   ├── leave/                  # Time-off Request Modals
│   ├── payroll/                # Batch Execution & Paystub Statements
│   └── recruitment/            # Requisition Modals
├── context/                    # React Contexts (AuthContext, ThemeContext, NotificationContext)
├── lib/
│   ├── firebase/               # Client & Admin SDK initializers with safe fallbacks
│   ├── constants.js            # Roles, Departments, Leave types, Job stages
│   ├── utils.js                # Gross-to-Net calculation, currency, date formatting, CSV exporter
│   └── seedData.js             # 25+ realistic workforce seed records
└── services/                   # Clean Business Logic & Service Layer
    ├── authService.js          # Authentication, password reset, demo switching
    ├── employeeService.js      # Workforce CRUD & Department metrics
    ├── attendanceService.js    # Punch clock, timesheets, shift statistics
    ├── leaveService.js         # Balance deduction, PTO workflows, approvals
    ├── payrollService.js       # Batch calculation, payslip voucher generator
    ├── performanceService.js   # 360 reviews & quarterly ratings
    ├── recruitmentService.js   # ATS pipeline stages & candidate evaluations
    ├── expenseService.js       # Reimbursement submission & approval workflows
    ├── documentService.js      # Organization policies & handbook distribution
    └── reportService.js        # Headcount analytics & audit metrics
```

---

## 🛡️ Role-Based Access Control (RBAC)

The system supports four distinct roles, complete with an interactive **Role Switcher** in the top navigation bar:

| Feature / Module | Super Admin | HR Manager | Department Lead | Employee |
| :--- | :--- | :--- | :--- | :--- |
| **Workforce Directory** | Full (Create, Edit, Delete) | Full (Create, Edit, Delete) | View Department | Self Profile Only |
| **Attendance Punch** | Full Org Oversight | Full Org Oversight | Team Oversight | Self Clock In/Out |
| **Leave Approvals** | Direct Sign-off | Direct Sign-off | Department Review | Submit & View Balance |
| **Payroll Batches** | Execute & Disburse | Review Drafts | No Access | Personal Payslips |
| **ATS Recruitment** | Full Pipeline | Manage Requisitions | Interview & Score | No Access |
| **Performance OKRs** | Calibrate & Sign | Administer Cycles | Appraise Directs | Self Reviews |
| **Expenses** | Approve & Disburse | Audit Receipts | Team Approval | Submit Claims |

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (Tested on Node v24)
- **Package Manager**: npm

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

> **Instant Demo Mode**: By default, `NEXT_PUBLIC_USE_DEMO_DATA=true` is enabled. The application runs immediately out of the box with zero setup! You can switch roles (Super Admin, HR Manager, Department Lead, Employee) in the topbar with 1 click to test any workflow.
>
> **Live Firebase Mode**: Add your Firebase Web API keys and Firebase Admin private key to `.env.local` to sync live with your Firestore database.

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```
