"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Building2, CheckCircle2 } from "lucide-react";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      const norm = normalizeRole(user.role);
      const dest = norm === "ADMIN" ? "/admin" : norm === "HR" ? "/hr" : "/employee";
      router.replace(dest);
    }
  }, [user, authLoading, router]);

  if (!authLoading && user) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.resetPassword(email);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Fluid Background Graphic (Reference Image 4 / Mockup Image 2) */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{ backgroundImage: `url('/images/auth-fluid-dark.jpg')` }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/60 to-zinc-950/70 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6 rounded-2xl sm:rounded-3xl border border-zinc-800/80 bg-zinc-950/85 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-glow">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm text-zinc-100">HCM Lite</span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reset password</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Enter your email and we'll send a link to reset your account password.
          </p>
        </div>

        {submitted ? (
          <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              Reset email sent
            </div>
            <p className="text-xs text-zinc-300">
              If an account matches <strong>{email}</strong>, a recovery link has been dispatched.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setSubmitted(false)}
            >
              Send again
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              icon={Mail}
              placeholder="sarah.connor@hcmlite.internal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" size="lg" className="w-full" isLoading={loading}>
              Send Reset Link
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
