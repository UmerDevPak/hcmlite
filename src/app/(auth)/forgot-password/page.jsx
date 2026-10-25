"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Building2, CheckCircle2 } from "lucide-react";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>

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
