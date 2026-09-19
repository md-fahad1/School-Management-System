"use client";

import React, { Suspense, useState } from "react";
import { Lock, Mail, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { getClientGqlClient } from "@/lib/graphql/client";
import { LOGIN } from "@/lib/graphql/queries";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/slices/authSlice";
import { getErrorMessage } from "@/lib/errors";

const SignInForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  // Backend logs in by username, not email — the form still labels
  // the field "Email Address" to match the original design, and
  // accepts the account's username there.
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid username or password");
      }

      const { accessToken, id, username: uname, role } = data;

      // Access token stays JS-readable (short-lived, low risk). The
      // refresh token never reaches this code at all anymore — it's
      // set server-side as an httpOnly cookie by /api/auth/login.
      Cookies.set("token", accessToken, { expires: 1 });
      Cookies.set("userId", id, { expires: 30 });
      Cookies.set("username", uname, { expires: 30 });
      Cookies.set("role", role.toLowerCase(), { expires: 30 });

      dispatch(setCredentials({ token: accessToken, id, username: uname, role }));

      // Send them back to whatever page middleware bounced them from
      // (e.g. a deep link to /list/exams), falling back to their
      // role's dashboard home.
      const from = searchParams.get("from");
      router.push(from || `/${role.toLowerCase()}`);
    } catch (err) {
      setError(
        getErrorMessage(err, "Invalid username or password")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-bg">
      {/* Left Brand Panel */}
      <div className="hidden md:flex flex-col items-center justify-center bg-primary relative overflow-hidden p-10">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-white/5" />

        <div className="relative max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="text-white" size={32} />
          </div>
          <img
            src="/img/img3.svg"
            alt="Illustration"
            className="w-full h-auto max-w-xs mx-auto"
          />
          <h2 className="text-2xl font-bold mt-6 text-white">
            Welcome to Dream Edu
          </h2>
          <p className="mt-2 text-primaryLight text-sm">
            Sign in to access your dashboard, manage your profile, and track
            your learning progress.
          </p>
        </div>
      </div>

      {/* Right Login Form Section */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-cardBg rounded-2xl shadow-sm border border-border p-6 sm:p-8">
          <div className="md:hidden w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-center text-textPrimary mb-1">
            Sign In
          </h2>
          <p className="text-center text-sm text-textMuted mb-6">
            Enter your details to access your account
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1.5 text-sm text-textSecondary">
                Email / Phone / Username
              </label>
              <div className="flex items-center border border-border rounded-lg px-3 py-2.5 bg-bg focus-within:border-accent focus-within:ring-2 focus-within:ring-accentLight transition-colors">
                <Mail className="text-textMuted mr-2" size={18} />
                <input
                  type="text"
                  placeholder="Enter email, phone or username"
                  className="w-full bg-transparent outline-none text-sm placeholder:text-textMuted"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-sm text-textSecondary">
                Password
              </label>
              <div className="flex items-center border border-border rounded-lg px-3 py-2.5 bg-bg focus-within:border-accent focus-within:ring-2 focus-within:ring-accentLight transition-colors">
                <Lock className="text-textMuted mr-2" size={18} />
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full bg-transparent outline-none text-sm placeholder:text-textMuted"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="text-right mt-1.5">
                <Link href="/forgot-password" className="text-xs text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primaryDark transition-colors shadow-sm disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-textMuted text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-accent hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

function SignIn() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}