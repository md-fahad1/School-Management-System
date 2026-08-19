"use client";

import React, { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { getClientGqlClient } from "@/lib/graphql/client";
import { REGISTER } from "@/lib/graphql/queries";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/slices/authSlice";

const SignUp = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    surname: "",
    role: "TEACHER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const client = await getClientGqlClient();
      const data = await client.request(REGISTER, { input: form });

      const { accessToken, refreshToken, id, username, role } = data.register;

      Cookies.set("token", accessToken, { expires: 1 });
      Cookies.set("refreshToken", refreshToken, { expires: 30 });
      Cookies.set("userId", id, { expires: 30 });
      Cookies.set("username", username, { expires: 30 });
      Cookies.set("role", role.toLowerCase(), { expires: 30 });

      dispatch(setCredentials({ token: accessToken, id, username, role }));

      router.push(`/${role.toLowerCase()}`);
    } catch (err) {
      setError(
        err?.response?.errors?.[0]?.message ?? "Something went wrong. Please try again."
      );
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
            Welcome to <span className="text-pink-500">DreamsEdu</span> Courses.
          </h2>
          <p className="mt-2 text-gray-600 text-sm">
            Platform designed to help organizations, educators, and learners
            manage, deliver, and track learning and training activities.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-pink-600 mb-6">
            Create an Account
          </h2>

          {/* Student accounts are created by an admin, not self-signup,
              since they require a class/grade/parent assignment. */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-gray-700 text-sm">First Name</label>
                <div className="flex items-center border rounded px-3 py-2 bg-gray-50">
                  <User className="text-gray-400 mr-2" size={16} />
                  <input
                    type="text"
                    name="name"
                    placeholder="First name"
                    className="w-full bg-transparent outline-none text-sm"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-gray-700 text-sm">Last Name</label>
                <div className="flex items-center border rounded px-3 py-2 bg-gray-50">
                  <input
                    type="text"
                    name="surname"
                    placeholder="Last name"
                    className="w-full bg-transparent outline-none text-sm"
                    value={form.surname}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-gray-700 text-sm">Username</label>
              <div className="flex items-center border rounded px-3 py-2 bg-gray-50">
                <User className="text-gray-400 mr-2" size={16} />
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  className="w-full bg-transparent outline-none text-sm"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-gray-700 text-sm">Email</label>
              <div className="flex items-center border rounded px-3 py-2 bg-gray-50">
                <Mail className="text-gray-400 mr-2" size={16} />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full bg-transparent outline-none text-sm"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-gray-700 text-sm">Password</label>
              <div className="flex items-center border rounded px-3 py-2 bg-gray-50">
                <Lock className="text-gray-400 mr-2" size={16} />
                <input
                  type="password"
                  name="password"
                  placeholder="At least 6 characters, letters + numbers"
                  className="w-full bg-transparent outline-none text-sm"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-gray-700 text-sm">I am a...</label>
              <select
                name="role"
                className="w-full px-3 py-2 bg-gray-50 border rounded outline-none text-sm"
                value={form.role}
                onChange={handleChange}
              >
                <option value="TEACHER">Teacher</option>
                <option value="PARENT">Parent</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/signin" className="text-pink-500 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;