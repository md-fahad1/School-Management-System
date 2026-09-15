"use client";

import Cookies from "js-cookie";
import { getClientGqlClient } from "@/lib/graphql/client";
import { LOGOUT } from "@/lib/graphql/queries";
import { store } from "@/redux/store";
import { logout as logoutAction } from "@/redux/slices/authSlice";

/**
 * Shared logout routine — used by both the top Navbar "Logout" button
 * and the sidebar Menu "Logout" item, so behavior stays consistent.
 * Best-effort server-side revoke; always clears the local session
 * even if the network call fails, so logout never gets "stuck".
 */
export async function performLogout() {
  const refreshToken = Cookies.get("refreshToken");

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
  store.dispatch(logoutAction());
}