"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  FaUserCircle,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const HeaderContent = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = false; // Change to true to test
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
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-auto">
          {/* Left - Hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-2xl text-gray-700 focus:outline-none"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          {/* Center - Logo */}
          <div className="flex-1 flex justify-center md:justify-start">
            <Link
              href="/"
              className="flex items-center gap-1 font-bold text-2xl text-gray-900"
            >
              <Image src="/logo.png" alt="Logo" width={30} height={30} />
              <span>Dream</span>
              <span className="text-sm text-pink-500">Edu</span>
            </Link>
          </div>

          {/* Right - Mobile Signup only */}
          <div className="flex md:hidden">
            <Link
              href="/signup"
              className="flex items-center gap-1 bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 rounded-full text-sm"
            >
              <FaUserPlus />
              Sign Up
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex w-full items-center justify-between">
            {/* Navigation Menu */}
            <nav className="flex gap-6 text-gray-700 font-medium ml-8">
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
                  <div className="flex items-center gap-2 text-sm text-gray-700">
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
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white px-6 pb-4 shadow-md">
          <nav className="flex flex-col gap-3 text-gray-700 font-medium pt-4">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/courses" onClick={() => setMobileMenuOpen(false)}>
              Courses
            </Link>
            <Link href="/events" onClick={() => setMobileMenuOpen(false)}>
              Events
            </Link>
            <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>
              Blog
            </Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
            <Link href="#" onClick={() => setMobileMenuOpen(false)}>
              Features
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default HeaderContent;
