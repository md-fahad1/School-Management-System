"use client";

import React from "react";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SignIn = () => {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulate authentication logic here
    // If successful:
    router.push("/admin");
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
            School Management Login
          </h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1 text-gray-700">Email Address</label>
              <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
                <Mail className="text-gray-400 mr-2" size={18} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-transparent outline-none"
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
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              Sign In
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
