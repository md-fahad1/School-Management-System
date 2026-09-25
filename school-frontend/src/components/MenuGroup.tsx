"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import MenuLink, { isPathActive } from "./MenuLink";
import MenuIcon from "./MenuIcon";
import { useSidebar } from "./SidebarContext";
import { useTranslation } from "@/lib/i18n/useTranslation";

type MenuItem = { icon: string; labelKey: string; href: string };

const MenuGroup = ({
  icon,
  labelKey,
  childrenItems,
}: {
  icon: string;
  labelKey: string;
  childrenItems: MenuItem[];
}) => {
  const pathname = usePathname();
  const { mobileOpen } = useSidebar();
  const { t } = useTranslation();
  const label = t(`menu.${labelKey}`);
  const labelClass = mobileOpen ? "block" : "hidden lg:block";
  const justifyClass = mobileOpen ? "justify-between" : "justify-center lg:justify-between";
  const hasActiveChild = childrenItems.some((c) => isPathActive(pathname, c.href));

  // Opens by default if the user is already on a page inside this
  // group (e.g. refreshing /list/teachers keeps "People" expanded).
  const [open, setOpen] = useState(hasActiveChild);

  return (
    <div className="flex flex-col">
      <button
        type="button"
        title={label}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center ${justifyClass} gap-4 py-2.5 px-3 rounded-lg transition-colors w-full ${
          hasActiveChild
            ? "text-sidebarTextActive bg-sidebarActiveBg"
            : "text-sidebarText"
        } hover:bg-sidebarBgHover hover:text-sidebarTextActive`}
      >
        <span className="flex items-center gap-4">
          <MenuIcon name={icon} size={20} />
          <span className={labelClass}>{label}</span>
        </span>
        <ChevronDown
          size={14}
          className={`${labelClass} shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`flex flex-col gap-1 mt-1 border-sidebarBorder ${
            mobileOpen ? "pl-8 border-l ml-4" : "lg:pl-8 lg:border-l lg:ml-4"
          }`}
        >
          {childrenItems.map((child) => (
            <MenuLink key={child.labelKey} item={child} nested />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuGroup;