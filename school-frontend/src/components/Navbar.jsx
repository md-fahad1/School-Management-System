"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { getClientGqlClient } from "@/lib/graphql/client";
import { LOGOUT } from "@/lib/graphql/queries";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/slices/authSlice";

const Navbar = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  // Both server and the very first client render must produce identical
  // markup — so this starts empty (never reads cookies/redux during
  // render) and only fills in after mount, once we're safely client-side.
  const [displayName, setDisplayName] = useState("");
  const [displayRole, setDisplayRole] = useState("");

  useEffect(() => {
    setDisplayName(user?.username ?? Cookies.get("username") ?? "Guest");
    setDisplayRole(user?.role ?? Cookies.get("role") ?? "");
  }, [user]);

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
    <div className="flex items-center justify-between p-4 bg-white">
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-lamaPurple focus-within:ring-brandPurple px-2">
        <Image src="/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-2 bg-transparent outline-none"
        />
      </div>
      {/* ICONS AND USER */}
      <div className="flex items-center gap-6 justify-end w-full">
        <div className="bg-lamaSkyLight rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
          <Image src="/message.png" alt="" width={20} height={20} />
        </div>
        <div className="bg-lamaPurpleLight rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
          <Image src="/announcement.png" alt="" width={20} height={20} />
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-brandPurple text-white rounded-full text-xs">
            1
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">{displayName}</span>
          <span className="text-[10px] text-gray-500 text-right capitalize">
            {displayRole}
          </span>
        </div>
        <Image
          src="/avatar.png"
          alt=""
          width={36}
          height={36}
          className="rounded-full ring-2 ring-lamaPurple"
        />
        <button
          onClick={handleLogout}
          className="text-xs text-gray-500 hover:text-brandPurple transition"
          title="Log out"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;