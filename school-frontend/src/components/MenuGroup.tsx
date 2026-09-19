"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import MenuLink from "./MenuLink";
import { useSidebar } from "./SidebarContext";

// See MenuLink.tsx: subject.png / result.png have an opaque white
// background, so they need a different filter to avoid a white box.
const iconFilter = (src: string) =>
  src === "/subject.png" || src === "/result.png"
    ? "invert mix-blend-screen"
    : "brightness-0 invert";

type MenuItem = { icon: string; label: string; href: string };

const MenuGroup = ({
  icon,
  label,
  childrenItems,
}: {
  icon: string;
  label: string;
  childrenItems: MenuItem[];
}) => {
  const pathname = usePathname();
  const { mobileOpen } = useSidebar();
  const labelClass = mobileOpen ? "block" : "hidden lg:block";
  const justifyClass = mobileOpen ? "justify-between" : "justify-center lg:justify-between";
  const hasActiveChild = childrenItems.some((c) => pathname.startsWith(c.href));

  // Opens by default if the user is already on a page inside this
  // group (e.g. refreshing /list/teachers keeps "People" expanded).
  const [open, setOpen] = useState(hasActiveChild);

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center ${justifyClass} gap-4 py-2.5 px-3 rounded-lg transition-colors w-full ${
          hasActiveChild
            ? "text-sidebarTextActive bg-sidebarActiveBg"
            : "text-sidebarText"
        } hover:bg-sidebarBgHover hover:text-sidebarTextActive`}
      >
        <span className="flex items-center gap-4">
          <Image
            src={icon}
            alt=""
            width={20}
            height={20}
            className={`${iconFilter(icon)} ${
              hasActiveChild ? "opacity-100" : "opacity-70"
            }`}
          />
          <span className={labelClass}>{label}</span>
        </span>
        <ChevronDown
          size={14}
          className={`${labelClass} shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className={`flex flex-col gap-1 mt-1 border-sidebarBorder ${
            mobileOpen ? "pl-8 border-l ml-4" : "lg:pl-8 lg:border-l lg:ml-4"
          }`}
        >
          {childrenItems.map((child) => (
            <MenuLink key={child.label} item={child} nested />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuGroup;