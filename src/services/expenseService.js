import { INITIAL_EXPENSES } from "@/lib/seedData";
import { EXPENSE_STATUS } from "@/lib/constants";

const STORAGE_EXPENSES = "hcm_lite_expenses";

function getExpenses() {
  if (typeof window === "undefined") return INITIAL_EXPENSES;
  const stored = localStorage.getItem(STORAGE_EXPENSES);
  if (!stored) {
    localStorage.setItem(STORAGE_EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    return INITIAL_EXPENSES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_EXPENSES;
  }
}

function saveExpenses(list) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_EXPENSES, JSON.stringify(list));
  }
}

export const expenseService = {
  async getAllExpenses({ status = "", employeeId = "" } = {}) {
    let list = getExpenses();
    if (status) list = list.filter((e) => e.status === status);
    if (employeeId) list = list.filter((e) => e.employeeId === employeeId);
    return list;
  },

  async createExpense({ employeeId, employeeName, category, amount, description, date, receiptUrl }) {
    const list = getExpenses();
    const newExpense = {
      id: `EXP-${Math.floor(800 + Math.random() * 200)}`,
      employeeId,
      employeeName,
      category,
      amount: Number(amount) || 0,
      description,
      date: date || new Date().toISOString().split("T")[0],
      receiptUrl: receiptUrl || "/receipts/sample-receipt.pdf",
      status: EXPENSE_STATUS.PENDING,
      reviewedBy: null,
    };
    list.unshift(newExpense);
    saveExpenses(list);
    return newExpense;
  },

  async updateExpenseStatus(id, status, reviewerName = "Sarah Connor") {
    const list = getExpenses();
    const index = list.findIndex((e) => e.id === id);
    if (index !== -1) {
      list[index].status = status;
      list[index].reviewedBy = reviewerName;
      saveExpenses(list);
      return list[index];
    }
    return null;
  },

  async getExpenseStats() {
    const list = getExpenses();
    const totalAmount = list.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const pendingAmount = list
      .filter((e) => e.status === EXPENSE_STATUS.PENDING)
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const approvedAmount = list
      .filter((e) => e.status === EXPENSE_STATUS.APPROVED || e.status === EXPENSE_STATUS.REIMBURSED)
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return {
      totalClaims: list.length,
      totalAmount: Number(totalAmount.toFixed(2)),
      pendingAmount: Number(pendingAmount.toFixed(2)),
      approvedAmount: Number(approvedAmount.toFixed(2)),
    };
  },
};
