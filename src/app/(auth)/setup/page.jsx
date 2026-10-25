"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ShieldCheck, ArrowRight, Lock, Mail, User, MapPin, Hash, Sparkles } from "lucide-react";
import { setupService } from "@/services/setupService";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function SetupWizardPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const [loading, setLoading] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState("Acme Enterprise");
  const [legalEntity, setLegalEntity] = useState("Acme Corporation, Inc.");
  const [address, setAddress] = useState("100 Market St, Suite 400, San Francisco, CA");
  const [ein, setEin] = useState("94-1234567");
  const [currency, setCurrency] = useState("USD");

  const [adminName, setAdminName] = useState("Sarah Connor");
  const [adminEmail, setAdminEmail] = useState("admin@acme.internal");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSetup = async (e) => {
    e.preventDefault();
    if (adminPassword.length < 6) {
      notifyError("Password too short", "Password must be at least 6 characters.");
      return;
    }
    if (adminPassword !== confirmPassword) {
      notifyError("Password mismatch", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await setupService.initializeCompany({
        companyName,
        legalEntity,
        address,
        ein,
        currency,
        adminName,
        adminEmail,
        adminPassword,
      });

      notifySuccess("Setup Complete", "Company profile and Super Admin account initialized.");

      // Attempt automatic sign in
      try {
        await signIn(adminEmail, adminPassword);
      } catch {
        // Fallback
      }

      router.push("/dashboard");
    } catch (err) {
      notifyError("Setup failed", err.message || "Failed to initialize company.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950 text-zinc-100 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl space-y-6 relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            First-Run Setup Wizard
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">
            Initialize HCM Lite
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Configure your enterprise company profile and provision your primary Super Admin account.
          </p>
        </div>

        <form onSubmit={handleSetup} className="space-y-6">
          {/* Section 1: Company Profile */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-zinc-100">
                1. Company & Legal Entity Profile
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company Brand Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Enterprise"
                required
              />
              <Input
                label="Legal Entity Name"
                value={legalEntity}
                onChange={(e) => setLegalEntity(e.target.value)}
                placeholder="Acme Corporation, Inc."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="HQ Address"
                  icon={MapPin}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="100 Market St, San Francisco, CA"
                  required
                />
              </div>
              <Input
                label="Tax EIN / VAT"
                icon={Hash}
                value={ein}
                onChange={(e) => setEin(e.target.value)}
                placeholder="94-1234567"
                required
              />
            </div>
          </Card>

          {/* Section 2: Super Admin Provisioning */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-zinc-100">
                2. Primary Super Admin Credentials
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                icon={User}
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Sarah Connor"
                required
              />
              <Input
                label="Admin Email"
                type="email"
                icon={Mail}
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@acme.internal"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Master Password"
                type="password"
                icon={Lock}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                helperText="Minimum 6 characters"
                required
              />
              <Input
                label="Confirm Master Password"
                type="password"
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            isLoading={loading}
            icon={ArrowRight}
          >
            Complete Setup & Launch Dashboard
          </Button>
        </form>
      </div>
    </div>
  );
}
