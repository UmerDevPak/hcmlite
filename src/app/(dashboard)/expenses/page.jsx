"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Receipt,
  Plus,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Check,
  X,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { expenseService } from "@/services/expenseService";
import { EXPENSE_CATEGORIES, EXPENSE_STATUS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export default function ExpensesPage() {
  const { user, isHR, isManager } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);

  const [formData, setFormData] = useState({
    category: EXPENSE_CATEGORIES[0],
    amount: 150.0,
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const loadData = async () => {
    const [allExp, st] = await Promise.all([
      expenseService.getAllExpenses(),
      expenseService.getExpenseStats(),
    ]);
    setExpenses(allExp);
    setStats(st);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await expenseService.createExpense({
        ...formData,
        employeeId: user?.employeeId || "EMP-001",
        employeeName: user?.displayName || "Admin User",
      });
      notifySuccess("Expense Claim Submitted", "Queued for finance reimbursement.");
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      notifyError("Failed to submit claim", err.message);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setLoadingAction(id);
    try {
      await expenseService.updateExpenseStatus(id, status, user?.displayName || "Sarah Connor");
      if (status === EXPENSE_STATUS.REIMBURSED) {
        confetti({ particleCount: 70, spread: 50, origin: { y: 0.8 } });
        notifySuccess("Claim Reimbursed", "ACH payment initiated.");
      } else {
        notifySuccess("Expense Approved", "Status updated.");
      }
      loadData();
    } catch (err) {
      notifyError("Status update failed", err.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    if (activeTab === "ALL") return true;
    return e.status.toUpperCase() === activeTab;
  });

  const tabs = [
    { id: "ALL", label: "All Claims", count: expenses.length },
    {
      id: "PENDING",
      label: "Pending Approval",
      count: expenses.filter((e) => e.status === EXPENSE_STATUS.PENDING).length,
    },
    {
      id: "APPROVED",
      label: "Approved",
      count: expenses.filter((e) => e.status === EXPENSE_STATUS.APPROVED).length,
    },
    {
      id: "REIMBURSED",
      label: "Reimbursed",
      count: expenses.filter((e) => e.status === EXPENSE_STATUS.REIMBURSED).length,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Expenses & Reimbursements
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Submit corporate expense receipts, verify category allowances, and track payouts.
          </p>
        </div>

        <Button size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
          New Expense Claim
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs text-zinc-400">Total Claims Outlay</div>
          <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
            {formatCurrency(stats?.totalAmount || 1989.99)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">{stats?.totalClaims || 3} total receipts</p>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-zinc-400">Pending Manager Review</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {formatCurrency(stats?.pendingAmount || 450.0)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Awaiting sign-off</p>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-zinc-400">Approved & Disbursed</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {formatCurrency(stats?.approvedAmount || 1539.99)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Settled to payroll</p>
        </Card>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claimant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {exp.employeeName}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">{exp.id}</div>
                  </TableCell>
                  <TableCell className="font-medium text-zinc-800 dark:text-zinc-200">
                    {exp.category}
                  </TableCell>
                  <TableCell className="text-zinc-400 text-xs">
                    {formatDate(exp.date)}
                  </TableCell>
                  <TableCell className="text-zinc-300 max-w-xs truncate">
                    {exp.description}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-zinc-100">
                    {formatCurrency(exp.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        exp.status === EXPENSE_STATUS.REIMBURSED
                          ? "purple"
                          : exp.status === EXPENSE_STATUS.APPROVED
                          ? "success"
                          : exp.status === EXPENSE_STATUS.PENDING
                          ? "warning"
                          : "danger"
                      }
                      dot
                    >
                      {exp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {exp.status === EXPENSE_STATUS.PENDING && (isHR || isManager) ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="success"
                          size="sm"
                          icon={Check}
                          isLoading={loadingAction === exp.id}
                          onClick={() => handleUpdateStatus(exp.id, EXPENSE_STATUS.APPROVED)}
                        >
                          Approve
                        </Button>
                      </div>
                    ) : exp.status === EXPENSE_STATUS.APPROVED && isHR ? (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={CreditCard}
                        isLoading={loadingAction === exp.id}
                        onClick={() => handleUpdateStatus(exp.id, EXPENSE_STATUS.REIMBURSED)}
                      >
                        Reimburse
                      </Button>
                    ) : (
                      <span className="text-[11px] text-zinc-500">
                        {exp.reviewedBy ? `Signed by ${exp.reviewedBy}` : "Complete"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Reimbursement Claim"
        description="Attach expense invoice details and corporate justification."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Expense Category"
            options={EXPENSE_CATEGORIES}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount ($ USD)"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <Input
              label="Transaction Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Business Purpose
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Flight ticket for enterprise client kick-off..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg text-sm bg-zinc-900 border border-zinc-800 p-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Claim</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
