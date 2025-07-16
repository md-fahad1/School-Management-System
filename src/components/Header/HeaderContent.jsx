"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  FaUserCircle,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
} from "react-icons/fa";

const HeaderContent = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Hardcoded mock login state
  const isLoggedIn = false; // Change to `true` to simulate logged-in state
  const user = {
    name: "Fahad",
    image: "/profile.png",
    role: "admin",
  };

  const handleLogout = () => {
    alert("Logging out...");
    router.push("/signin");
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-2xl text-gray-900"
        >
          <Image src="/logo.png" alt="Logo" width={30} height={30} />
          <span>Dream</span>
          <span className="text-sm text-pink-500">Edu</span>
        </Link>

        {/* Navigation Menu */}
        <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
          <Link href="/">Home</Link>
          <Link href="/courses">Courses</Link>
          <Link href="/events">Events</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
          <Link href="#">Features</Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex gap-2 items-center">
          {isLoggedIn ? (
            <>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-700">
                <FaUserCircle className="text-xl text-indigo-900" />
                <span>{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="flex items-center gap-1 bg-indigo-900 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm"
              >
                <FaSignInAlt />
                Sign In
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm"
              >
                <FaUserPlus />
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderContent;
