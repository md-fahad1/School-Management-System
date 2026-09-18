"use client";

import Cookies from "js-cookie";
import { store } from "@/redux/store";
import { logout as logoutAction } from "@/redux/slices/authSlice";

/**
 * Shared logout routine — used by both the top Navbar "Logout" button
 * and the sidebar Menu "Logout" item, so behavior stays consistent.
 * Best-effort server-side revoke; always clears the local session
 * even if the network call fails, so logout never gets "stuck".
 *
 * Goes through our own /api/auth/logout route rather than calling the
 * backend directly, because the refresh token is httpOnly now —
 * client JS has no way to read it to send along itself.
 */
export async function performLogout() {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (err) {
    console.error("Server-side logout failed, clearing local session anyway:", err);
  }

  Cookies.remove("token");
  Cookies.remove("role");
  Cookies.remove("userId");
  Cookies.remove("username");
  store.dispatch(logoutAction());
}