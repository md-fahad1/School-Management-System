"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, Calendar, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import axios from "axios";

const SignUpSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  dateOfBirth: z.string().min(1, "Date of Birth is required"),
  bloodGroup: z.string().min(1, "Blood Group is required"),
  userType: z.string().min(1, "User Type is required"),
  profilePicture: z.any(),
});

const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SignUpSchema),
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("FirstName", data.name);
      formData.append("Email", data.email);
      formData.append("Password", data.password);
      formData.append("DateOfBirth", data.dateOfBirth);
      formData.append("BloodGroup", data.bloodGroup);
      formData.append("UserType", data.userType);
      if (data.profilePicture?.[0]) {
        formData.append("ProfilePicture", data.profilePicture[0]);
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/signUp`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("SignUp Success:", response.data);
      alert("Account created successfully!");
    } catch (error) {
      console.error("SignUp Error:", error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white">
      <div className="hidden md:flex items-center justify-center bg-pink-50">
        <div className="max-w-md p-6 text-center">
          <img
            src="/img/img3.svg"
            alt="Illustration"
            className="w-full h-auto"
          />
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
            <div>
              <label className="block mb-1 text-gray-700">Full Name</label>
              <div className="flex items-center border rounded px-3 py-2 bg-gray-50">
                <User className="text-gray-400 mr-2" size={18} />
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full bg-transparent outline-none"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Email</label>
              <div className="flex items-center border rounded px-3 py-2 bg-gray-50">
                <Mail className="text-gray-400 mr-2" size={18} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-transparent outline-none"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Password</label>
              <div className="flex items-center border rounded px-3 py-2 bg-gray-50">
                <Lock className="text-gray-400 mr-2" size={18} />
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full bg-transparent outline-none"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Date of Birth</label>
              <div className="flex items-center border rounded px-3 py-2 bg-gray-50">
                <Calendar className="text-gray-400 mr-2" size={18} />
                <input
                  type="date"
                  className="w-full bg-transparent outline-none"
                  {...register("dateOfBirth")}
                />
              </div>
              {errors.dateOfBirth && (
                <p className="text-red-500 text-sm">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-gray-700">Blood Group</label>
              <select
                className="w-full px-3 py-2 bg-gray-50 border rounded outline-none"
                {...register("bloodGroup")}
              >
                <option value="">Select</option>
                <option value="1">A+</option>
                <option value="2">A-</option>
                <option value="3">B+</option>
                <option value="4">B-</option>
                <option value="5">AB+</option>
                <option value="6">AB-</option>
                <option value="7">O+</option>
                <option value="8">O-</option>
              </select>
              {errors.bloodGroup && (
                <p className="text-red-500 text-sm">
                  {errors.bloodGroup.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-gray-700">User Type</label>
              <select
                className="w-full px-3 py-2 bg-gray-50 border rounded outline-none"
                {...register("userType")}
              >
                <option value="">Select</option>
                <option value="1">Admin</option>
                <option value="2">User</option>
                <option value="3">Manager</option>
              </select>
              {errors.userType && (
                <p className="text-red-500 text-sm">
                  {errors.userType.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-gray-700">
                Profile Picture
              </label>
              <div className="flex items-center border rounded px-3 py-2 bg-gray-50">
                <ImageIcon className="text-gray-400 mr-2" size={18} />
                <input
                  type="file"
                  accept="image/*"
                  className="w-full bg-transparent outline-none"
                  {...register("profilePicture")}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition"
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
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
