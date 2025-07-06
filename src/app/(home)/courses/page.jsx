"use client";
import React from "react";
import { Users, BookOpen, CalendarCheck, CheckCircle2 } from "lucide-react";

const Page = () => {
  return (
    <div className="min-h-screen  bg-gradient-to-tr from-indigo-100 to-purple-200 flex flex-col">
      {/* Hero Section */}
      <header className="flex-grow flex flex-col items-center justify-center mt-16 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-6xl font-extrabold text-indigo-700 mb-6">
          Welcome to the School Management System
        </h1>
        <p className="text-lg text-indigo-900 mb-8 max-w-3xl">
          Simplify school administration with a powerful dashboard to manage
          students, classes, attendance, exams, and more.
        </p>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-10 rounded-xl shadow-lg transition">
          Get Started
        </button>
      </header>

      {/* Features Section */}
      <section className="bg-white rounded-t-3xl shadow-xl py-16 px-10 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="flex flex-col items-center text-center space-y-4">
          <Users className="text-indigo-600" size={48} />
          <h3 className="text-xl font-semibold text-indigo-900">
            Student Management
          </h3>
          <p className="text-gray-600 max-w-xs">
            Easily manage student profiles, registrations, and records.
          </p>
        </div>
        <div className="flex flex-col items-center text-center space-y-4">
          <BookOpen className="text-indigo-600" size={48} />
          <h3 className="text-xl font-semibold text-indigo-900">
            Class Scheduling
          </h3>
          <p className="text-gray-600 max-w-xs">
            Organize classes, timetables, and resources efficiently.
          </p>
        </div>
        <div className="flex flex-col items-center text-center space-y-4">
          <CalendarCheck className="text-indigo-600" size={48} />
          <h3 className="text-xl font-semibold text-indigo-900">
            Attendance Tracking
          </h3>
          <p className="text-gray-600 max-w-xs">
            Track attendance and generate detailed reports seamlessly.
          </p>
        </div>
        <div className="flex flex-col items-center text-center space-y-4">
          <CheckCircle2 className="text-indigo-600" size={48} />
          <h3 className="text-xl font-semibold text-indigo-900">
            Exams & Results
          </h3>
          <p className="text-gray-600 max-w-xs">
            Manage exams and publish results with ease and transparency.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-600 text-sm">
        © 2024 School Management System. All rights reserved.
      </footer>
    </div>
  );
};

export default Page;
