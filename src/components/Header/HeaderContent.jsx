"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Logo from "../../../public/logo.png";
import { FaSignOutAlt } from "react-icons/fa";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/events", label: "Events" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

const HeaderContent = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Hardcoded mock login state
  const isLoggedIn = true;
  const user = {
    name: "Fahad",
    image: "/profile.png", // Put your test image in /public folder
    role: "admin",
  };

  const handleLogout = () => {
    alert("Logging out...");
    router.push("/signin");
  };

  return (
    <header className="absolute top-0 left-0 w-full z-50 font-rubik">
      <nav className="container mx-auto flex items-center justify-between h-[60px] md:h-20 px-4">
        {/* Logo */}
        <Link href="/" className="relative w-[50px] md:w-[110px] h-full z-20">
          <Image
            src={Logo}
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </Link>

        {/* Navigation */}
        <div className="bg-white/40 backdrop-blur-md rounded-xl px-4 py-2 flex items-center gap-4 z-20">
          <ul className="flex items-center gap-4 md:gap-6 text-sm md:text-base font-bold uppercase text-[#0c2461]">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`relative px-2 py-1 rounded transition ${
                      isActive
                        ? "font-semibold underline text-blue-700"
                        : "hover:text-blue-600"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}

            {!isLoggedIn && (
              <>
                <li>
                  <Link href="/signin" className="hover:text-blue-600">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-blue-600">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Profile + Role + Logout */}
          {isLoggedIn && user && (
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="flex items-center gap-2 hover:opacity-80"
              >
                <Image
                  src={user.image}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full border-2 border-blue-500"
                />
                <span className="text-sm font-medium text-blue-800 capitalize">
                  {user.name}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 text-xl"
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default HeaderContent;
