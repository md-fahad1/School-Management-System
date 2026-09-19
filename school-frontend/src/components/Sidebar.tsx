"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { useSidebar } from "./SidebarContext";

// `menu` is passed in as a prop (not imported directly) because Menu.jsx
// is a Server Component (reads cookies()) — passing it as a node lets it
// still render on the server even though Sidebar itself is a Client
// Component (needed for the mobile open/close state).
type SidebarProps = {
  menu: ReactNode;
  institutionName?: string | null;
  institutionLogo?: string | null;
  institutionType?: string | null;
};

const Sidebar = ({ menu, institutionName, institutionLogo, institutionType }: SidebarProps) => {
  const { mobileOpen, closeMobile } = useSidebar();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobile}
        />
      )}

      <div
        className={`fixed md:static top-0 left-0 h-screen z-50 overflow-y-auto
          w-[80%] max-w-[280px] md:w-[8%] lg:w-[16%] xl:w-[14%]
          bg-sidebarBg p-4 transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <Link
          href="/"
          onClick={closeMobile}
          className={`flex items-center ${
            mobileOpen ? "justify-start" : "justify-center lg:justify-start"
          } gap-2 mb-3`}
        >
          <Image
            src={institutionLogo || "/logo.png"}
            alt="logo"
            width={32}
            height={32}
            className="rounded object-cover"
          />
          <span className={`${mobileOpen ? "block" : "hidden lg:block"} font-bold text-sidebarTextActive truncate`}>
            {institutionName || "Dream Edu"}
          </span>
        </Link>

        <div
          className={`${
            mobileOpen ? "flex" : "hidden lg:flex"
          } items-center gap-2 bg-sidebarBgHover rounded-lg px-3 py-2 mb-2`}
        >
          <span className="w-2 h-2 rounded-full bg-success shrink-0" />
          <span className="text-sm text-sidebarTextActive truncate capitalize">
            {institutionType ? institutionType.replace(/_/g, " ").toLowerCase() : "platform"}
          </span>
        </div>

        {menu}
      </div>
    </>
  );
};

export default Sidebar;