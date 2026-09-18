"use client";

import React, { Suspense, useState } from "react";
import { Lock, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getClientGqlClient } from "@/lib/graphql/client";
import { RESET_PASSWORD } from "@/lib/graphql/queries";

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const client = await getClientGqlClient();
      await client.request(RESET_PASSWORD, { input: { token, newPassword } });
      setSuccess(true);
      // A successful reset revokes every existing session on the
      // backend (see PasswordResetService.resetPassword), so send
      // them to sign in fresh rather than trying to keep them logged in.
      setTimeout(() => router.push("/signin"), 2500);
    } catch (err) {
      setError(
        err?.response?.errors?.[0]?.message ??
          "This reset link is invalid or has expired. Please request a new one."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-6">
        <div className="text-center max-w-md bg-cardBg rounded-2xl shadow-sm border border-border p-8">
          <h2 className="text-2xl font-bold text-textPrimary mb-2">Invalid Link</h2>
          <p className="text-textMuted mb-6">
            This password reset link is missing its token. Please request a new one.
          </p>
          <Link href="/forgot-password" className="text-accent hover:underline font-medium">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-bg">
      <div className="hidden md:flex flex-col items-center justify-center bg-primary relative overflow-hidden p-10">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-white/5" />

        <div className="relative max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="text-white" size={32} />
          </div>
          <img src="/img/img3.svg" alt="Illustration" className="w-full h-auto max-w-xs mx-auto" />
          <h2 className="text-2xl font-bold mt-6 text-white">
            Choose a new password
          </h2>
          <p className="mt-2 text-primaryLight text-sm">
            Make it something you haven&apos;t used before.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-cardBg rounded-2xl shadow-sm border border-border p-6 sm:p-8">
          <div className="md:hidden w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-center text-textPrimary mb-6">
            Reset Password
          </h2>

          {success ? (
            <div className="text-center space-y-4">
              <p className="text-textSecondary">
                Your password has been reset. All existing sessions have been signed out for
                security. Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-1.5 text-textSecondary text-sm">New Password</label>
                <div className="flex items-center border border-border rounded-lg px-3 py-2.5 bg-bg focus-within:border-accent focus-within:ring-2 focus-within:ring-accentLight transition-colors">
                  <Lock className="text-textMuted mr-2" size={18} />
                  <input
                    type="password"
                    placeholder="At least 6 characters, letters + numbers"
                    className="w-full bg-transparent outline-none text-sm placeholder:text-textMuted"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-textSecondary text-sm">Confirm Password</label>
                <div className="flex items-center border border-border rounded-lg px-3 py-2.5 bg-bg focus-within:border-accent focus-within:ring-2 focus-within:ring-accentLight transition-colors">
                  <Lock className="text-textMuted mr-2" size={18} />
                  <input
                    type="password"
                    placeholder="Re-enter your new password"
                    className="w-full bg-transparent outline-none text-sm placeholder:text-textMuted"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primaryDark transition-colors shadow-sm disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-textMuted text-sm">
            <Link href="/signin" className="text-accent hover:underline font-medium">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

function ResetPassword() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}