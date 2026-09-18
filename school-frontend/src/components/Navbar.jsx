"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import GlobalSearch from "./GlobalSearch";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Menu as MenuIcon, Mail, Bell, ChevronDown, Calendar } from "lucide-react";
import { getClientGqlClient } from "@/lib/graphql/client";
import { LOGOUT, GET_ME } from "@/lib/graphql/queries";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/slices/authSlice";
import { useSidebar } from "./SidebarContext";

const Navbar = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { toggleMobile } = useSidebar();

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

  // Close the dropdown on outside click.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const refreshToken = Cookies.get("refreshToken");

    // Best-effort: revoke the session server-side (kills the refresh
    // token + blacklists the current access token). If this fails
    // (network down, already expired, etc.) we still clear the local
    // session below — a logout should never get "stuck".
    if (refreshToken) {
      try {
        const client = await getClientGqlClient();
        await client.request(LOGOUT, { input: { refreshToken } });
      } catch (err) {
        console.error("Server-side logout failed, clearing local session anyway:", err);
      }
    }

    Cookies.remove("token");
    Cookies.remove("refreshToken");
    Cookies.remove("role");
    Cookies.remove("userId");
    Cookies.remove("username");
    dispatch(logout());
    router.push("/signin");
  };

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
          Academic Year: <span className="font-medium text-textPrimary">2024/2025</span>
        </span>
      </div>

      {/* ICONS AND USER */}
      <div className="flex items-center gap-2 md:gap-4 justify-end shrink-0 lg:ml-0 ml-auto">
        <button
          type="button"
          aria-label="Messages"
          className="relative w-9 h-9 flex items-center justify-center rounded-full bg-infoLight text-info hover:opacity-80 transition-opacity"
        >
          <Mail size={17} />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative w-9 h-9 flex items-center justify-center rounded-full bg-accentLight text-accent hover:opacity-80 transition-opacity"
        >
          <Bell size={17} />
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-danger text-white rounded-full text-[10px] font-medium ring-2 ring-cardBg">
            1
          </span>
        </button>

        <button
          type="button"
          className="hidden sm:flex items-center gap-1 text-sm text-textSecondary hover:text-textPrimary"
        >
          EN
          <ChevronDown size={14} />
        </button>

        {/* PROFILE DROPDOWN */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2"
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs leading-3 font-medium text-textPrimary">
                {fullName || displayName}
              </span>
              <span className="text-[10px] text-textMuted text-right capitalize">
                {displayRole}
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
            <div className="absolute right-0 top-full mt-2 w-48 bg-cardBg rounded-xl shadow-lg ring-1 ring-border z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-textPrimary truncate">{fullName || displayName}</p>
                <p className="text-xs text-textMuted capitalize">{displayRole}</p>
              </div>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-textSecondary hover:bg-accentLight hover:text-textPrimary"
              >
                My Profile
              </Link>
              <Link
                 href="/settings"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-textSecondary hover:bg-accentLight hover:text-textPrimary"
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-dangerLight"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;