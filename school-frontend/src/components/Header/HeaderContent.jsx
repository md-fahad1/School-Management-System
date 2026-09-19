"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
  UserCircle,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/events", label: "Events" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

const HeaderContent = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = false; // Change to true to test
  const user = {
    name: "Fahad",
    role: "admin",
  };

  const handleLogout = () => {
    alert("Logging out...");
    router.push("/signin");
  };

  return (
    <header className="fixed top-0 left-0 w-full h-[72px] bg-white border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left - Hamburger (mobile) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-textSecondary hover:text-textPrimary"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="text-white" size={20} />
          </span>
          <span className="font-bold text-lg text-textPrimary">
            Dream<span className="text-accent">Edu</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 ml-8">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-accent bg-accentLight"
                    : "text-textSecondary hover:text-textPrimary hover:bg-bg"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth Buttons (desktop) */}
        <div className="hidden md:flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-2 text-sm text-textSecondary">
                <UserCircle size={20} className="text-primary" />
                <span>{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 border border-border text-textSecondary hover:text-danger hover:border-danger px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="flex items-center gap-1.5 border border-border text-textPrimary hover:border-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <LogIn size={16} />
                Sign In
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1.5 bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <UserPlus size={16} />
                Register
              </Link>
            </>
          )}
        </div>

        {/* Right - Mobile Signup only */}
        <Link
          href="/signup"
          className="md:hidden flex items-center gap-1 bg-primary hover:bg-primaryDark text-white px-3 py-1.5 rounded-lg text-sm font-medium"
        >
          <UserPlus size={14} />
          Sign Up
        </Link>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-border px-4 pb-4 shadow-sm">
          <nav className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? "text-accent bg-accentLight"
                      : "text-textSecondary hover:bg-bg"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 flex items-center justify-center gap-1.5 border border-border text-textPrimary px-4 py-2.5 rounded-lg text-sm font-medium"
            >
              <LogIn size={16} />
              Sign In
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default HeaderContent;
