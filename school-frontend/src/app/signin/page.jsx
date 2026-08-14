"use client";

import React, { Suspense, useState } from "react";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { getClientGqlClient } from "@/lib/graphql/client";
import { LOGIN } from "@/lib/graphql/queries";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/slices/authSlice";

const SignInForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  // Backend logs in by username, not email — the form still labels
  // the field "Email Address" to match the original design, and
  // accepts the account's username there.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const client = await getClientGqlClient();
      const data = await client.request(LOGIN, { input: { username, password } });

      const { accessToken, refreshToken, id, username: uname, role } = data.login;

      // Cookies (not localStorage) so Server Components can read the
      // session too via next/headers — see src/lib/graphql/server-client.ts.
      // Access token cookie is short-lived to match its actual JWT
      // lifetime; refreshToken/role/etc last as long as the refresh
      // token itself, since those are what auto-refresh depends on.
      Cookies.set("token", accessToken, { expires: 1 });
      Cookies.set("refreshToken", refreshToken, { expires: 30 });
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
        err?.response?.errors?.[0]?.message ?? "Invalid username or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white">
      {/* Left Illustration Section */}
      <div className="hidden md:flex items-center justify-center bg-pink-50">
        <div className="max-w-md p-6 text-center">
          <img
            src="/img/img3.svg"
            alt="Illustration"
            className="w-full h-auto"
          />
          <h2 className="text-2xl font-bold mt-6">
            Welcome to <span className="text-blue-500">DreamsEdu</span> Login
          </h2>
          <p className="mt-2 text-gray-600 text-sm">
            Sign in to access your dashboard, manage your profile, and track
            your learning progress.
          </p>
        </div>
      </div>

      {/* Right Login Form Section */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-pink-600 mb-6">
            DreamEdu Login
          </h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1 text-gray-700">Email Address</label>
              <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
                <Mail className="text-gray-400 mr-2" size={18} />
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full bg-transparent outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Password</label>
              <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
                <Lock className="text-gray-400 mr-2" size={18} />
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full bg-transparent outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-500 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-pink-600 hover:underline">
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

