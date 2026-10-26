// PROJECT_SPEC.md Rule 1: Roles (Admin, HR, Employee)
export const ROLES = {
  ADMIN: "ADMIN",
  HR: "HR",
  EMPLOYEE: "EMPLOYEE",
  // Backward compatibility aliases
  SUPER_ADMIN: "ADMIN",
  HR_MANAGER: "HR",
  DEPARTMENT_MANAGER: "ADMIN",
  Admin: "ADMIN",
  Employee: "EMPLOYEE",
};

export function normalizeRole(role) {
  if (!role) return "EMPLOYEE";
  const upper = String(role).trim().toUpperCase();
  if (upper === "ADMIN" || upper === "SUPER_ADMIN" || upper === "DEPARTMENT_MANAGER") return "ADMIN";
  if (upper === "HR" || upper === "HR_MANAGER") return "HR";
  return "EMPLOYEE";
}

export const ROLE_LABELS = {
  ADMIN: "Admin",
  Admin: "Admin",
  HR: "HR",
  Hr: "HR",
  EMPLOYEE: "Employee",
  Employee: "Employee",
  SUPER_ADMIN: "Admin",
  HR_MANAGER: "HR",
  DEPARTMENT_MANAGER: "Admin",
};

// PROJECT_SPEC.md Rule 3: Setup constants
export const OFFICE_SETUP = {
  START_TIME: "09:00",
  GRACE_MINUTES: 15, // Late after 09:15
  HALF_DAY_MIN_HOURS: 5, // half-day < 5h
  WEEKEND_DAYS: [0, 6], // Saturday (6) and Sunday (0)
  WORKING_DAYS_PER_MONTH: 22,
};

// PROJECT_SPEC.md Rule 5: Leaves quotas
export const LEAVE_QUOTAS = {
  ANNUAL: 14,
  SICK: 8,
  CASUAL: 10,
};

export const LEAVE_TYPES = {
  ANNUAL: "Annual",
  SICK: "Sick",
  CASUAL: "Casual",
  UNPAID: "Unpaid",
  // Aliases for UI display
  VACATION: "Annual",
  PARENTAL: "Annual",
  BEREAVEMENT: "Casual",
};

export const LEAVE_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

// PROJECT_SPEC.md Rule 6: Tax Slabs (Annualized)
// 0-600k: 0%, 600k-1.2M: 5%, 1.2M-2.4M: 30k+15%, 2.4M-3.6M: 210k+25%, >3.6M: 510k+35%
export const TAX_SLABS = [
  { min: 0, max: 600000, rate: 0, baseTax: 0 },
  { min: 600000, max: 1200000, rate: 0.05, baseTax: 0 },
  { min: 1200000, max: 2400000, rate: 0.15, baseTax: 30000 },
  { min: 2400000, max: 3600000, rate: 0.25, baseTax: 210000 },
  { min: 3600000, max: Infinity, rate: 0.35, baseTax: 510000 },
];

export const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Human Resources",
  "Sales",
  "Marketing",
  "Finance & Operations",
  "Customer Success",
  "Legal",
];

export const EMPLOYEE_STATUS = {
  ACTIVE: "Active",
  PENDING: "Pending Activation",
  ON_LEAVE: "On Leave",
  PROBATION: "Probation",
  TERMINATED: "Terminated",
};

export const EMPLOYMENT_TYPE = {
  FULL_TIME: "Full-Time",
  PART_TIME: "Part-Time",
  CONTRACTOR: "Contractor",
  INTERN: "Intern",
};

export const RECRUITMENT_STAGES = [
  "Applied",
  "Screening",
  "Technical Interview",
  "Culture Fit",
  "Offer Extended",
  "Hired",
  "Rejected",
];

export const EXPENSE_CATEGORIES = [
  "Travel & Mileage",
  "Meals & Entertainment",
  "Equipment & Hardware",
  "Software & Subscriptions",
  "Learning & Development",
  "Office Supplies",
  "Other",
];

export const EXPENSE_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REIMBURSED: "Reimbursed",
  REJECTED: "Rejected",
};

export const DOCUMENT_CATEGORIES = [
  "Company Handbook",
  "Employment Contract",
  "Benefits & Health",
  "Performance & Reviews",
  "Tax & Compliance",
  "Certifications",
];
