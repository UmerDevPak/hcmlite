# HCM Lite - Technical Specifications & Rules

## Core Rules:
1. Roles: Admin, HR, Employee. Server-side role/scope verification on every endpoint/action.
2. Auth: Temporary password created during HR registration; must be changed on first login.
3. Setup: Office starts at 09:00, grace 15m (Late after 09:15), half-day < 5h, weekend Sat-Sun.
4. Attendance: 1 record per employee/day (prevent duplicate check-in with 409).
5. Leaves: 14 Annual, 8 Sick, 10 Casual. Skip weekends and holidays. Overlaps/exceeded quota = 422.
6. Payroll:
   - Gross = Basic * 1.5 (40% HRA, 10% Medical).
   - Per-day deduction = Gross / Working Days.
   - Deductions: absent + unpaid + (0.5 * half_days).
   - Tax Slabs (Annualized): 0-600k: 0%, 600k-1.2M: 5%, 1.2M-2.4M: 30k+15%, 2.4M-3.6M: 210k+25%, >3.6M: 510k+35%.
   - Finalized runs are permanently locked.
