"use client";

import React, { useState } from "react";
import { Lock, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/authService";
import { useNotification } from "@/context/NotificationContext";

export function ForcePasswordChangeModal({ isOpen, user, onPasswordChanged }) {
  const { notifySuccess, notifyError } = useNotification();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      notifyError("Password Too Short", "New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      notifyError("Password Mismatch", "New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(user?.uid || user?.id, newPassword);
      notifySuccess("Password Updated", "Your permanent password has been saved.");
      onPasswordChanged();
    } catch (err) {
      notifyError("Update Failed", err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Non-dismissible: mandatory password change
      title="Mandatory Password Update"
      description="You are currently signed in with a temporary password from HR registration."
      maxWidth="max-w-md"
    >
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Action Required:</strong> For enterprise security compliance, temporary credentials must be updated upon first authentication before accessing system records.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Secure Password"
            type="password"
            icon={Lock}
            placeholder="••••••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Minimum 6 characters"
            required
            autoFocus
          />

          <Input
            label="Confirm New Password"
            type="password"
            icon={Lock}
            placeholder="••••••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={loading}
              icon={CheckCircle2}
            >
              Update Password & Access Dashboard
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
