"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import Logo from "../../../public/logo.png";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/events", label: "Events" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/signin", label: "Login" },
  { href: "/signup", label: "Register" },
];

const HeaderContent = () => {
  const pathname = usePathname();

  return (
    <header className="absolute top-0 left-0 w-full z-50 text-white">
      <nav className="container mx-auto flex items-center justify-between h-[60px] md:h-20 px-4">
        {/* Left: Logo */}
        <Link href="/" className="relative w-[50px] md:w-[110px] h-full">
          <Image
            src={Logo}
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </Link>

        {/* Right: Navigation Links */}
        <ul className="flex text-green-500 items-center gap-4 md:gap-6 text-sm md:text-base font-medium">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`hover:text-gray-300 ${
                    isActive ? "text-white font-semibold underline" : ""
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
};

export default HeaderContent;
