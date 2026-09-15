"use client";

import Cookies from "js-cookie";
import { isExpired } from "@/lib/jwt";
import { REFRESH_TOKEN } from "./queries";
import { store } from "@/redux/store";
import { setCredentials, logout as logoutAction } from "@/redux/slices/authSlice";

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";

const COOKIE_OPTS = { expires: 30 } as const; // days; refresh token cookie lifetime

/**
 * Minimal GraphQL client backed by the browser's native `fetch` — same
 * shape (`.request(query, variables)`) as graphql-request's GraphQLClient
 * so every call site stays unchanged. We avoid importing graphql-request
 * here on purpose: it pulls in cross-fetch -> node-fetch -> whatwg-url ->
 * tr46 (a ~250KB Unicode mapping table meant for Node.js), which has no
 * reason to ship to the browser when `fetch` is already a global.
 */
class SimpleGraphQLClient {
  constructor(
    private url: string,
    private headers: Record<string, string> = {},
  ) {}

  async request<T = any>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const res = await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...this.headers },
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();

    if (json.errors?.length) {
      const message = json.errors.map((e: { message: string }) => e.message).join("; ");
      throw new Error(message);
    }

    return json.data as T;
  }
}

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
    const anonClient = new SimpleGraphQLClient(GRAPHQL_URL);
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
export async function getClientGqlClient(): Promise<SimpleGraphQLClient> {
  let token = Cookies.get("token");

  if (!token || isExpired(token)) {
    token = (await refreshSession()) ?? undefined;
  }

  return new SimpleGraphQLClient(GRAPHQL_URL, token ? { Authorization: `Bearer ${token}` } : {});
}