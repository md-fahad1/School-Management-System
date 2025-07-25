"use client";
import { BookOpen, Briefcase, FlaskConical } from "lucide-react";

const categories = [
  {
    title: "Science",
    description: "134 Courses",
    icon: <FlaskConical size={40} className="text-indigo-900" />,
  },
  {
    title: "Commerce",
    description: "112 Courses",
    icon: <Briefcase size={40} className="text-indigo-900" />,
  },
  {
    title: "Arts",
    description: "98 Courses",
    icon: <BookOpen size={40} className="text-indigo-900" />,
  },
];

const TopCategories = () => {
  return (
    <section className="py-4 bg-white text-center">
      {/* Section Title */}
      <div className="mb-12">
        <span className="inline-block bg-pink-100 text-pink-600 text-sm px-4 py-1 rounded-full font-semibold mb-2">
          Favourite Course
        </span>
        <h2 className="text-4xl font-bold text-gray-800">Top Category</h2>
        <p className="text-gray-500 mt-2">
          The right course, guided by an expert mentor, can provide invaluable
          insights, practical skills
        </p>
      </div>

      {/* Category Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-6 mb-10">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="bg-white border rounded-xl px-6 py-8 shadow-md hover:shadow-xl transition"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-50 p-4 rounded-xl">{cat.icon}</div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">{cat.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopCategories;

// "use client";
// import React from "react";
// import { Users, BookOpen, CalendarCheck, CheckCircle2 } from "lucide-react";

// const FeatureCard = ({ icon, title, description }) => (
//   <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition text-center space-y-4 border">
//     <div className="flex justify-center">{icon}</div>
//     <h3 className="text-lg font-semibold text-[var(--text)]">{title}</h3>
//     <p className="text-sm text-gray-600">{description}</p>
//   </div>
// );

// const CoursePage = () => {
//   return (
//     <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
//       {/* Hero Section */}
//       <header className="flex-grow flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center bg-gradient-to-tr from-[var(--secondary)] to-[var(--accent)] text-white">
//         <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
//           Welcome to the School Management System
//         </h1>
//         <p className="text-lg md:text-xl max-w-2xl mb-8">
//           Simplify school administration with a smart dashboard to manage
//           students, classes, attendance, exams, and more.
//         </p>
//         <button className="bg-[var(--primary)] hover:bg-[var(--secondary)] transition text-white font-semibold px-8 py-3 rounded-full shadow-md">
//           Get Started
//         </button>
//       </header>

//       {/* Features Section */}
//       <section className="bg-[var(--bg)] py-16 px-6 md:px-12 lg:px-20">
//         <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
//           <FeatureCard
//             icon={<Users size={48} className="text-[var(--primary)]" />}
//             title="Student Management"
//             description="Easily manage student profiles, registrations, and academic records."
//           />
//           <FeatureCard
//             icon={<BookOpen size={48} className="text-[var(--primary)]" />}
//             title="Class Scheduling"
//             description="Organize class routines, teacher assignments, and room allocations."
//           />
//           <FeatureCard
//             icon={<CalendarCheck size={48} className="text-[var(--primary)]" />}
//             title="Attendance Tracking"
//             description="Track attendance daily and generate detailed attendance reports."
//           />
//           <FeatureCard
//             icon={<CheckCircle2 size={48} className="text-[var(--primary)]" />}
//             title="Exams & Results"
//             description="Conduct exams, evaluate scores, and publish results efficiently."
//           />
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-gray-50 py-6 text-center text-gray-500 text-sm border-t">
//         © 2025 School Management System. All rights reserved.
//       </footer>
//     </div>
//   );
// };

// export default CoursePage;
