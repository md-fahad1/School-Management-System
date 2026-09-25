"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { performLogout } from "@/lib/auth/logout";
import { useSidebar } from "./SidebarContext";
import { useTranslation } from "@/lib/i18n/useTranslation";
import MenuIcon from "./MenuIcon";

type MenuItem = {
  icon: string; // icon name, see MenuIcon.tsx
  labelKey: string; // translation key under the "menu" namespace
  href: string;
  action?: string;
  exact?: boolean; // true = highlight only on this exact URL (used by Dashboard)
};

export const isPathActive = (pathname: string, href: string, exact?: boolean) =>
  exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

const MenuLink = ({ item, nested = false }: { item: MenuItem; nested?: boolean }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { mobileOpen, closeMobile } = useSidebar();
  const { t } = useTranslation();
  const label = t(`menu.${item.labelKey}`);
  const labelClass = mobileOpen ? "block" : "hidden lg:block";
  const justifyClass = mobileOpen ? "justify-start" : "justify-center lg:justify-start";
  const isActive = isPathActive(pathname, item.href, item.exact);
  const iconSize = nested ? 16 : 20;

  if (item.action === "logout") {
    return (
      <button
        type="button"
        title={label}
        onClick={async () => {
          closeMobile();
          await performLogout();
          router.push("/signin");
        }}
        className={`flex items-center ${justifyClass} gap-4 py-2.5 px-3 rounded-lg transition-colors text-sidebarText hover:bg-sidebarBgHover hover:text-sidebarTextActive w-full`}
      >
        <MenuIcon name={item.icon} size={iconSize} />
        <span className={labelClass}>{label}</span>
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      title={label}
      aria-current={isActive ? "page" : undefined}
      onClick={closeMobile}
      className={`flex items-center ${justifyClass} gap-4 rounded-lg transition-colors ${
        nested ? "py-2 px-3 text-[13px]" : "py-2.5 px-3"
      } ${
        isActive
          ? "bg-accent text-white"
          : "text-sidebarText hover:bg-sidebarBgHover hover:text-sidebarTextActive"
      }`}
    >
      <MenuIcon name={item.icon} size={iconSize} />
      <span className={labelClass}>{label}</span>
    </Link>
  );
};

export default MenuLink;