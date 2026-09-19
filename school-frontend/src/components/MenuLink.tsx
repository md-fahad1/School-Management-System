"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { performLogout } from "@/lib/auth/logout";
import { useSidebar } from "./SidebarContext";

// subject.png / result.png have an opaque white background, so
// brightness-0 would turn the whole square white. Invert + screen
// blend makes the white background vanish on the dark sidebar.
const iconFilter = (src: string) =>
  src === "/subject.png" || src === "/result.png"
    ? "invert mix-blend-screen"
    : "brightness-0 invert";

type MenuItem = {
  icon: string;
  label: string;
  href: string;
  action?: string;
};

const MenuLink = ({ item, nested = false }: { item: MenuItem; nested?: boolean }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { mobileOpen } = useSidebar();
  const labelClass = mobileOpen ? "block" : "hidden lg:block";
  const justifyClass = mobileOpen ? "justify-start" : "justify-center lg:justify-start";
  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

  if (item.action === "logout") {
    return (
      <button
        onClick={async () => {
          await performLogout();
          router.push("/signin");
        }}
        className={`flex items-center ${justifyClass} gap-4 py-2.5 px-3 rounded-lg transition-colors text-sidebarText hover:bg-sidebarBgHover hover:text-sidebarTextActive w-full`}
      >
        <Image
          src={item.icon}
          alt=""
          width={20}
          height={20}
          className="brightness-0 invert opacity-70"
        />
        <span className={labelClass}>{item.label}</span>
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      className={`flex items-center ${justifyClass} gap-4 rounded-lg transition-colors ${
        nested ? "py-2 px-3 text-[13px]" : "py-2.5 px-3"
      } ${
        isActive
          ? "bg-accent text-white"
          : "text-sidebarText hover:bg-sidebarBgHover hover:text-sidebarTextActive"
      }`}
    >
      <Image
        src={item.icon}
        alt=""
        width={nested ? 16 : 20}
        height={nested ? 16 : 20}
        className={`${iconFilter(item.icon)} ${isActive ? "opacity-100" : "opacity-70"}`}
      />
      <span className={labelClass}>{item.label}</span>
    </Link>
  );
};

export default MenuLink;