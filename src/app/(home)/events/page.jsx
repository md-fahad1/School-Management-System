"use client";
import React from "react";
import { Users, BookOpen, Calendar, CheckCircle } from "lucide-react";

const features = [
  {
    icon: <Users size={36} className="text-[var(--primary)]" />,
    title: "Student Management",
    desc: "Easily add, edit, and track student profiles.",
  },
  {
    icon: <BookOpen size={36} className="text-[var(--primary)]" />,
    title: "Class Scheduling",
    desc: "Organize classes and timetable seamlessly.",
  },
  {
    icon: <Calendar size={36} className="text-[var(--primary)]" />,
    title: "Attendance Tracking",
    desc: "Monitor attendance and generate reports.",
  },
  {
    icon: <CheckCircle size={36} className="text-[var(--primary)]" />,
    title: "Exam & Results",
    desc: "Manage exams and publish results efficiently.",
  },
];

const EventPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--secondary)] to-[var(--accent)] px-4 py-12 flex flex-col items-center">
      {/* Main Card */}
      <div className="bg-white shadow-2xl rounded-3xl p-10 sm:p-14 max-w-4xl w-full text-center">
        {/* Header */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--primary)] mb-4">
          Welcome to School Management System
        </h1>
        <p className="text-gray-700 mb-8 max-w-2xl mx-auto text-base sm:text-lg">
          Manage students, classes, attendance, and more — all in one place.
          Simplify your school administration with our intuitive dashboard.
        </p>

        {/* CTA */}
        <button className="bg-[var(--primary)] hover:bg-[var(--secondary)] text-white px-8 py-3 rounded-full font-semibold transition shadow-lg mb-10">
          Get Started
        </button>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
          {features.map((f, idx) => (
            <div key={idx} className="flex items-start space-x-4">
              {f.icon}
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)] mb-1">
                  {f.title}
                </h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-gray-600 text-sm text-center">
        © 2024 School Management System. All rights reserved.
      </footer>
    </div>
  );
};

export default EventPage;
