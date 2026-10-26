"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  LayoutGrid,
  List,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { employeeService } from "@/services/employeeService";
import { formatCurrency, formatDate, exportToCSV } from "@/lib/utils";
import { DEPARTMENTS, EMPLOYEE_STATUS, ROLE_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { EmployeeModal } from "@/components/employees/EmployeeModal";

export default function EmployeesPage() {
  const { user, isHR, isAdmin } = useAuth();
  const canManage = isHR || isAdmin;
  const { notifySuccess, notifyError } = useNotification();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAllEmployees({
        search,
        department: selectedDept,
        status: selectedStatus,
      });
      setEmployees(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, selectedDept, selectedStatus]);

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to offboard/delete ${name}?`)) {
      try {
        await employeeService.deleteEmployee(id);
        notifySuccess("Employee removed", `${name} record deleted.`);
        fetchEmployees();
      } catch (err) {
        notifyError("Error deleting employee", err.message);
      }
    }
  };

  const handleExport = () => {
    exportToCSV(
      `hcm-lite-workforce-${new Date().toISOString().split("T")[0]}`,
      employees,
      {
        id: "Employee ID",
        name: "Full Name",
        email: "Email Address",
        jobTitle: "Job Title",
        department: "Department",
        status: "Status",
        annualSalary: "Annual Compensation ($)",
        hireDate: "Hire Date",
      }
    );
    notifySuccess("Export ready", "Workforce directory CSV downloaded.");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Workforce Directory
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Manage personnel records, departments, compensation tiers, and access credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExport}
          >
            Export CSV
          </Button>
          {canManage && (
            <Button
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingEmployee(null);
                setIsModalOpen(true);
              }}
            >
              Add Employee
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search by name, email, or role..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              placeholder="All Departments"
              options={DEPARTMENTS}
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-40">
            <Select
              placeholder="All Statuses"
              options={Object.values(EMPLOYEE_STATUS)}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            />
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 bg-zinc-100 dark:bg-zinc-900 self-end md:self-auto">
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-md ${
              viewMode === "table"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md ${
              viewMode === "grid"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : employees.length === 0 ? (
        <EmptyState
          title="No employees found"
          description="Try adjusting your search criteria or add a new team member."
          actionLabel={canManage ? "Add Employee" : null}
          onAction={() => {
            setEditingEmployee(null);
            setIsModalOpen(true);
          }}
        />
      ) : viewMode === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm">
          <Table>
          <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department & Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Hire Date</TableHead>
                <TableHead>Annual Salary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <Link
                      href={`/employees/${emp.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <Avatar src={emp.avatar} name={emp.name} size="sm" />
                      <div>
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-400 transition-colors">
                          {emp.name}
                        </div>
                        <div className="text-[11px] text-zinc-400">{emp.email}</div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-zinc-800 dark:text-zinc-200">
                      {emp.jobTitle}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {emp.department} • {ROLE_LABELS[emp.role] || emp.role}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        emp.status === "Active"
                          ? "success"
                          : emp.status === "On Leave"
                          ? "warning"
                          : "neutral"
                      }
                      dot
                    >
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-500 dark:text-zinc-400">
                    {emp.location || "San Francisco, CA"}
                  </TableCell>
                  <TableCell className="text-zinc-500 dark:text-zinc-400">
                    {formatDate(emp.hireDate)}
                  </TableCell>
                  <TableCell className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(emp.annualSalary)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/employees/${emp.id}`}>
                        <button className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      {canManage && (
                        <>
                          <button
                            onClick={() => {
                              setEditingEmployee(emp);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp.id, emp.name)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <Card key={emp.id} className="p-5 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={emp.avatar} name={emp.name} size="md" />
                  <div>
                    <Link
                      href={`/employees/${emp.id}`}
                      className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 hover:text-indigo-400 transition-colors"
                    >
                      {emp.name}
                    </Link>
                    <p className="text-xs text-zinc-400">{emp.jobTitle}</p>
                  </div>
                </div>
                <Badge
                  variant={emp.status === "Active" ? "success" : "warning"}
                  dot
                >
                  {emp.status}
                </Badge>
              </div>

              <div className="my-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Department</span>
                  <span className="font-medium text-zinc-200">{emp.department}</span>
                </div>
                <div className="flex justify-between">
                  <span>Compensation</span>
                  <span className="font-mono font-medium text-zinc-200">
                    {formatCurrency(emp.annualSalary)}/yr
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Email</span>
                  <span className="text-zinc-300 truncate max-w-[180px]">{emp.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-zinc-500 font-mono">{emp.id}</span>
                <Link href={`/employees/${emp.id}`}>
                  <Button variant="ghost" size="sm" icon={ExternalLink}>
                    View 360 Profile
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={editingEmployee}
        onSaved={fetchEmployees}
      />
    </div>
  );
}
