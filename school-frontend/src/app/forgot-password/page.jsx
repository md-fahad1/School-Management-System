"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";
import Link from "next/link";
import { getClientGqlClient } from "@/lib/graphql/client";
import { REQUEST_PASSWORD_RESET } from "@/lib/graphql/queries";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // The backend always returns true for this mutation regardless of
  // whether the email matches an account (anti-enumeration — see
  // PasswordResetService.requestReset on the backend). The UI mirrors
  // that: it never confirms or denies an account exists, it just
  // shows the same "check your inbox" message either way.
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const client = await getClientGqlClient();
      await client.request(REQUEST_PASSWORD_RESET, { input: { email } });
      setSubmitted(true);
    } catch (err) {
      setError(err?.response?.errors?.[0]?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white">
      <div className="hidden md:flex items-center justify-center bg-pink-50">
        <div className="max-w-md p-6 text-center">
          <img src="/img/img3.svg" alt="Illustration" className="w-full h-auto" />
          <h2 className="text-2xl font-bold mt-6">
            Forgot your <span className="text-blue-500">password?</span>
          </h2>
          <p className="mt-2 text-gray-600 text-sm">
            No worries — enter your email and we'll send you a link to reset it.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-pink-600 mb-6">
            Reset Password
          </h2>

          {submitted ? (
            <div className="text-center space-y-4">
              <p className="text-gray-700">
                If an account exists for <span className="font-medium">{email}</span>, we've
                sent a password reset link to it. Check your inbox (and spam folder).
              </p>
              <Link href="/signin" className="text-pink-600 hover:underline text-sm">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block mb-1 text-gray-700">Email Address</label>
                  <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
                    <Mail className="text-gray-400 mr-2" size={18} />
                    <input
                      type="email"
                      placeholder="Enter your account email"
                      className="w-full bg-transparent outline-none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="mt-6 text-center text-gray-500 text-sm">
                Remembered your password?{" "}
                <Link href="/signin" className="text-pink-600 hover:underline">
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;