"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuItem = {
  icon: string;
  label: string;
  href: string;
};

const MenuLink = ({ item }: { item: MenuItem }) => {
  const pathname = usePathname();
  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={`flex items-center justify-center lg:justify-start gap-4 py-2 md:px-2 rounded-md transition-colors ${
        isActive ? "bg-brandPurple text-white" : "text-gray-500 hover:bg-lamaPurpleLight"
      }`}
    >
      <Image
        src={item.icon}
        alt=""
        width={20}
        height={20}
        className={isActive ? "brightness-0 invert" : ""}
      />
      <span className="hidden lg:block">{item.label}</span>
    </Link>
  );
};

export default MenuLink;