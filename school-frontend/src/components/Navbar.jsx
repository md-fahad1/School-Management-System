"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import GlobalSearch from "./GlobalSearch";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Menu as MenuIcon, Mail, Bell, Calendar } from "lucide-react";
import { getClientGqlClient } from "@/lib/graphql/client";
import { GET_ME } from "@/lib/graphql/queries";
import { performLogout } from "@/lib/auth/logout";
import { useAppSelector } from "@/redux/hooks";
import { useSidebar } from "./SidebarContext";
import { useTranslation } from "@/lib/i18n/useTranslation";
import LanguageSwitcher from "./LanguageSwitcher";

// Academic year .env theke ashe (NEXT_PUBLIC_ACADEMIC_YEAR="2026").
// Na thakle current year dekhabe. Code change korte hobe na.
const ACADEMIC_YEAR =
  process.env.NEXT_PUBLIC_ACADEMIC_YEAR ?? String(new Date().getFullYear());

// Ei role gulor jonno Messages ar Announcements page ache (Menu.jsx er moto).
const COMMS_ROLES = ["admin", "teacher", "student", "parent"];

const Navbar = () => {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const { toggleMobile } = useSidebar();
  const { t } = useTranslation();

  // Both server and the very first client render must produce identical
  // markup — so this starts empty (never reads cookies/redux during
  // render) and only fills in after mount, once we're safely client-side.
  const [displayName, setDisplayName] = useState("");
  const [displayRole, setDisplayRole] = useState("");

  // Avatar + full name for the dropdown trigger — fetched separately
  // from `me` since the cookie/redux session only carries id/username/role.
  const [avatarImg, setAvatarImg] = useState(null);
  const [fullName, setFullName] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setDisplayName(user?.username ?? Cookies.get("username") ?? "Guest");
    setDisplayRole(user?.role ?? Cookies.get("role") ?? "");
  }, [user]);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const client = await getClientGqlClient();
        const data = await client.request(GET_ME);
        setAvatarImg(data.me.img ?? null);
        setFullName(`${data.me.name} ${data.me.surname}`.trim());
      } catch (err) {
        // Non-fatal — the navbar still works with the cookie-based
        // username/role fallback above if this fails.
        console.error("Failed to load profile for navbar:", err);
      }
    };
    loadMe();
  }, []);

  // Close the dropdown on outside click or Escape.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  // Sidebar er Logout er moto same routine (server session revoke +
  // httpOnly refresh cookie clear + local session clear).
  const handleLogout = async () => {
    await performLogout();
    router.push("/signin");
  };

  const canSeeComms = COMMS_ROLES.includes(displayRole);
  // "transport_staff" -> "transport staff"
  const roleLabel = displayRole.replace(/_/g, " ");

  return (
    <div className="flex items-center gap-3 p-3 md:p-4 bg-cardBg border-b border-border">
      {/* MOBILE MENU TOGGLE */}
      <button
        type="button"
        onClick={toggleMobile}
        className="md:hidden shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-textSecondary hover:bg-accentLight"
        aria-label="Toggle menu"
      >
        <MenuIcon size={20} />
      </button>

      {/* SEARCH BAR */}
      <GlobalSearch />

      {/* ACADEMIC YEAR (desktop only) */}
      <div className="hidden lg:flex items-center gap-2 text-sm text-textSecondary shrink-0 ml-auto mr-2">
        <Calendar size={16} className="text-textMuted" />
        <span>
          {t("common.academicYear")}: <span className="font-medium text-textPrimary">{ACADEMIC_YEAR}</span>
        </span>
      </div>

      <LanguageSwitcher />

      {/* ICONS AND USER */}
      <div className="flex items-center gap-2 md:gap-4 justify-end shrink-0 lg:ml-0 ml-auto">
        {canSeeComms && (
          <>
            <Link
              href="/list/messages"
              title="Messages"
              aria-label="Messages"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-infoLight text-info hover:opacity-80 transition-opacity"
            >
              <Mail size={17} />
            </Link>

            <Link
              href="/list/announcements"
              title="Announcements"
              aria-label="Announcements"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-accentLight text-accent hover:opacity-80 transition-opacity"
            >
              <Bell size={17} />
            </Link>
          </>
        )}

        {/* PROFILE DROPDOWN */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Account menu"
            className="flex items-center gap-2"
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs leading-3 font-medium text-textPrimary">
                {fullName || displayName}
              </span>
              <span className="text-[10px] text-textMuted text-right capitalize">
                {roleLabel}
              </span>
            </div>
            <Image
              src={avatarImg || "/avatar.png"}
              alt=""
              width={36}
              height={36}
              className="rounded-full ring-2 ring-primaryLight w-9 h-9 object-cover"
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-48 bg-cardBg rounded-xl shadow-lg ring-1 ring-border z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-textPrimary truncate">{fullName || displayName}</p>
                <p className="text-xs text-textMuted capitalize">{roleLabel}</p>
              </div>
              <Link
                href="/profile"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-textSecondary hover:bg-accentLight hover:text-textPrimary"
              >
                {t("common.myProfile")}
              </Link>
              <Link
                href="/settings"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-textSecondary hover:bg-accentLight hover:text-textPrimary"
              >
                {t("common.settings")}
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-dangerLight"
              >
                {t("common.logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;