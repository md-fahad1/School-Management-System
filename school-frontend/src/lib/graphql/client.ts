"use client";

import { GraphQLClient } from "graphql-request";
import Cookies from "js-cookie";
import { isExpired } from "@/lib/jwt";
import { REFRESH_TOKEN } from "./queries";
import { store } from "@/redux/store";
import { setCredentials, logout as logoutAction } from "@/redux/slices/authSlice";

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";

const COOKIE_OPTS = { expires: 30 } as const; // days; refresh token cookie lifetime

/**
 * Exchanges the current refresh token for a new access+refresh pair,
 * persisting the result to cookies and Redux. Used both here (lazily,
 * right before a client-side GraphQL call) and by the periodic
 * background refresh in redux/Provider.tsx.
 *
 * Returns the new access token on success, or null if refresh failed
 * (expired/revoked refresh token — the caller should treat this as a
 * logged-out state).
 */
export async function refreshSession(): Promise<string | null> {
  const refreshToken = Cookies.get("refreshToken");
  if (!refreshToken) return null;

  try {
    const anonClient = new GraphQLClient(GRAPHQL_URL);
    const data = await anonClient.request<{
      refreshToken: { accessToken: string; refreshToken: string; id: string; username: string; role: string };
    }>(REFRESH_TOKEN, { input: { refreshToken } });

    const next = data.refreshToken;

    Cookies.set("token", next.accessToken, { expires: 1 }); // access token: short-lived, cookie expiry is just a ceiling
    Cookies.set("refreshToken", next.refreshToken, COOKIE_OPTS);
    Cookies.set("userId", next.id, COOKIE_OPTS);
    Cookies.set("username", next.username, COOKIE_OPTS);
    Cookies.set("role", next.role.toLowerCase(), COOKIE_OPTS);

    store.dispatch(
      setCredentials({ token: next.accessToken, id: next.id, username: next.username, role: next.role })
    );

    return next.accessToken;
  } catch (err) {
    // Refresh token is invalid/expired/revoked (e.g. reuse-detection
    // fired server-side) — clear the dead session rather than looping.
    console.error("Session refresh failed:", err);
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    Cookies.remove("userId");
    Cookies.remove("username");
    Cookies.remove("role");
    store.dispatch(logoutAction());
    return null;
  }
}

/**
 * GraphQL client for use inside Client Components (forms, mutations
 * triggered by button clicks, etc). Checks the access token's expiry
 * before every call and transparently refreshes it first if needed,
 * so callers never have to think about the 15-minute access token
 * lifetime themselves.
 */
export async function getClientGqlClient(): Promise<GraphQLClient> {
  let token = Cookies.get("token");

  if (!token || isExpired(token)) {
    token = (await refreshSession()) ?? undefined;
  }

  return new GraphQLClient(GRAPHQL_URL, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}