"use client";
import React from "react";
import { Users, BookOpen, Calendar, CheckCircle } from "lucide-react";

const Page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 px-6 py-12 flex flex-col items-center">
      {/* Main Card */}
      <div className="bg-white shadow-xl rounded-2xl mt-8 p-10 max-w-3xl w-full text-center">
        <h1 className="text-5xl font-extrabold text-purple-700 mb-4">
          Welcome to School Management System
        </h1>
        <p className="text-gray-700 mb-10 max-w-xl mx-auto">
          Manage students, classes, attendance, and more — all in one place.
          Simplify your school administration with our intuitive dashboard.
        </p>

        <button className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition shadow mb-12">
          Get Started
        </button>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 text-left">
          <div className="flex items-center space-x-4">
            <Users className="text-purple-600" size={36} />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Student Management
              </h3>
              <p className="text-gray-600">
                Easily add, edit, and track student profiles.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <BookOpen className="text-purple-600" size={36} />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Class Scheduling
              </h3>
              <p className="text-gray-600">
                Organize classes and timetable seamlessly.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Calendar className="text-purple-600" size={36} />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Attendance Tracking
              </h3>
              <p className="text-gray-600">
                Monitor attendance and generate reports.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <CheckCircle className="text-purple-600" size={36} />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Exam & Results
              </h3>
              <p className="text-gray-600">
                Manage exams and publish results efficiently.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-gray-600 text-sm">
        © 2024 School Management System. All rights reserved.
      </footer>
    </div>
  );
};

export default Page;
