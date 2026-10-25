"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { DEPARTMENTS, ROLES, EMPLOYMENT_TYPE, ROLE_LABELS } from "@/lib/constants";
import { employeeService } from "@/services/employeeService";
import { useNotification } from "@/context/NotificationContext";

export function EmployeeModal({ isOpen, onClose, employee = null, onSaved }) {
  const { notifySuccess, notifyError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
    department: DEPARTMENTS[0],
    role: ROLES.EMPLOYEE,
    employmentType: EMPLOYMENT_TYPE.FULL_TIME,
    annualSalary: 120000,
    phone: "",
    hireDate: new Date().toISOString().split("T")[0],
    location: "San Francisco, CA (HQ)",
    temporaryPassword: "HCM-Pass2026!",
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
  });

  useEffect(() => {
    setCreatedCredentials(null);
    if (employee) {
      const names = (employee.name || "").split(" ");
      setFormData({
        firstName: employee.firstName || names[0] || "",
        lastName: employee.lastName || names.slice(1).join(" ") || "",
        email: employee.email || "",
        jobTitle: employee.jobTitle || "",
        department: employee.department || DEPARTMENTS[0],
        role: employee.role || ROLES.EMPLOYEE,
        employmentType: employee.employmentType || EMPLOYMENT_TYPE.FULL_TIME,
        annualSalary: employee.annualSalary || 120000,
        phone: employee.phone || "",
        hireDate: employee.hireDate || new Date().toISOString().split("T")[0],
        location: employee.location || "San Francisco, CA (HQ)",
        temporaryPassword: employee.temporaryPassword || "HCM-Pass2026!",
        emergencyName: employee.emergencyContact?.name || "",
        emergencyRelationship: employee.emergencyContact?.relationship || "",
        emergencyPhone: employee.emergencyContact?.phone || "",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        jobTitle: "",
        department: DEPARTMENTS[0],
        role: ROLES.EMPLOYEE,
        employmentType: EMPLOYMENT_TYPE.FULL_TIME,
        annualSalary: 120000,
        phone: "",
        hireDate: new Date().toISOString().split("T")[0],
        location: "San Francisco, CA (HQ)",
        temporaryPassword: `HCM-Pass${Math.floor(1000 + Math.random() * 9000)}!`,
        emergencyName: "",
        emergencyRelationship: "",
        emergencyPhone: "",
      });
    }
  }, [employee, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      annualSalary: Number(formData.annualSalary),
      emergencyContact: {
        name: formData.emergencyName,
        relationship: formData.emergencyRelationship,
        phone: formData.emergencyPhone,
      },
    };

    try {
      if (employee) {
        await employeeService.updateEmployee(employee.id, payload);
        notifySuccess("Employee updated", `${formData.firstName} ${formData.lastName} profile updated`);
        onSaved();
        onClose();
      } else {
        const created = await employeeService.createEmployee(payload);
        setCreatedCredentials(created);
        notifySuccess("Employee Onboarded", `${formData.firstName} ${formData.lastName} account created`);
        onSaved();
      }
    } catch (err) {
      notifyError("Operation failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={createdCredentials ? "Employee Account Credentials" : employee ? "Edit Employee Profile" : "Onboard New Employee"}
      description={
        createdCredentials
          ? "Employee account has been provisioned. Share these temporary credentials with the team member."
          : "Enter workforce details, role permissions, and compensation breakdown."
      }
      maxWidth="max-w-2xl"
    >
      {createdCredentials ? (
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                ✓ Account Provisioned Successfully
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                Pending Activation
              </span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-zinc-800/60 pt-1">
              <div className="pt-1.5 flex items-center justify-between">
                <span className="text-zinc-400">Employee Name:</span>
                <span className="font-semibold text-zinc-100">{createdCredentials.name}</span>
              </div>
              <div className="pt-1.5 flex items-center justify-between">
                <span className="text-zinc-400">Work Email (Login):</span>
                <span className="font-mono text-zinc-100 font-semibold">{createdCredentials.email}</span>
              </div>
              <div className="pt-1.5 flex items-center justify-between">
                <span className="text-zinc-400">Temporary Password:</span>
                <span className="font-mono text-amber-300 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 select-all">
                  {createdCredentials.temporaryPassword}
                </span>
              </div>
              <div className="pt-1.5 flex items-center justify-between">
                <span className="text-zinc-400">Assigned Role:</span>
                <span className="text-zinc-200">{ROLE_LABELS[createdCredentials.role] || createdCredentials.role}</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 italic pt-1">
              * The employee must use this email and temporary password to log in at /login. Upon first login, they will be required to change this password, which automatically activates their status to Active.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const credText = `HCM Lite Login Credentials:\nEmail: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.temporaryPassword}\nLogin Portal: ${window.location.origin}/login`;
                navigator.clipboard.writeText(credText);
                notifySuccess("Copied", "Credentials copied to clipboard.");
              }}
            >
              Copy Credentials
            </Button>
            <Button
              type="button"
              onClick={() => {
                setCreatedCredentials(null);
                onClose();
              }}
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Work Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            {!employee ? (
              <Input
                label="Initial Temporary Password"
                type="text"
                value={formData.temporaryPassword}
                onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
                helperText="Must be changed on first login."
                required
              />
            ) : (
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Job Title"
              placeholder="e.g. Senior Software Engineer"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              required
            />
            <Select
              label="Department"
              options={DEPARTMENTS}
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="System Role"
              options={Object.entries(ROLE_LABELS).map(([k, v]) => ({ value: k, label: v }))}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
            <Select
              label="Employment Type"
              options={Object.values(EMPLOYMENT_TYPE)}
              value={formData.employmentType}
              onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
            />
            <Input
              label="Annual Salary ($ USD)"
              type="number"
              value={formData.annualSalary}
              onChange={(e) => setFormData({ ...formData, annualSalary: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hire Date"
              type="date"
              value={formData.hireDate}
              onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
            />
            <Input
              label="Work Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Emergency Contact Information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Contact Name"
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
              />
              <Input
                label="Relationship"
                value={formData.emergencyRelationship}
                onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
              />
              <Input
                label="Contact Phone"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              {employee ? "Save Changes" : "Complete Onboarding"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
