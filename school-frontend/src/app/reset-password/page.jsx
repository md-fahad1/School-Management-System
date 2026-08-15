"use client";

import React, { Suspense, useState } from "react";
import { Lock } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-pink-600 mb-2">Invalid Link</h2>
          <p className="text-gray-600 mb-6">
            This password reset link is missing its token. Please request a new one.
          </p>
          <Link href="/forgot-password" className="text-pink-600 hover:underline">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white">
      <div className="hidden md:flex items-center justify-center bg-pink-50">
        <div className="max-w-md p-6 text-center">
          <img src="/img/img3.svg" alt="Illustration" className="w-full h-auto" />
          <h2 className="text-2xl font-bold mt-6">
            Choose a <span className="text-blue-500">new password</span>
          </h2>
          <p className="mt-2 text-gray-600 text-sm">
            Make it something you haven't used before.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-pink-600 mb-6">
            Reset Password
          </h2>

          {success ? (
            <div className="text-center space-y-4">
              <p className="text-gray-700">
                Your password has been reset. All existing sessions have been signed out for
                security. Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-1 text-gray-700">New Password</label>
                <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
                  <Lock className="text-gray-400 mr-2" size={18} />
                  <input
                    type="password"
                    placeholder="At least 6 characters, letters + numbers"
                    className="w-full bg-transparent outline-none"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-gray-700">Confirm Password</label>
                <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
                  <Lock className="text-gray-400 mr-2" size={18} />
                  <input
                    type="password"
                    placeholder="Re-enter your new password"
                    className="w-full bg-transparent outline-none"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-blue-700 transition shadow-md disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-gray-500 text-sm">
            <Link href="/signin" className="text-pink-600 hover:underline">
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