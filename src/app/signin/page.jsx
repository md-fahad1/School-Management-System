"use client";
import React from "react";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";

const SignIn = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          School Management Login
        </h2>

        <form className="space-y-5">
          <div>
            <label className="block mb-1 text-gray-700">Email Address</label>
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
              <Mail className="text-gray-400 mr-2" size={18} />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-transparent outline-none"
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
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
