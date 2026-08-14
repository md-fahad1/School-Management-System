import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isExpired } from "@/lib/jwt";

// Dashboard sections that require a signed-in session at all.
const PROTECTED_PREFIXES = [
  "/admin",
  "/teacher",
  "/student",
  "/parent",
  "/librarian",
  "/accountant",
  "/principal",
  "/transport-staf",
  "/list",
];

// Only these four correspond to real backend roles (see Role enum in
// the NestJS schema) — role-mismatch redirects only apply to these.
// The extra demo dashboards (librarian/accountant/...) just require
// *some* valid session, not a specific role.
const ROLE_HOME: Record<string, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
  parent: "/parent",
};

const AUTH_PAGES = ["/signin", "/signup"];

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";

const REFRESH_TOKEN_MUTATION = `
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      accessToken
      refreshToken
      id
      username
      role
    }
  }
`;

interface RefreshResult {
  accessToken: string;
  refreshToken: string;
  id: string;
  username: string;
  role: string;
}

/**
 * Calls the backend's refreshToken mutation directly (plain fetch —
 * graphql-request isn't used here since middleware runs on the Edge
 * runtime and we want zero extra dependencies on this hot path).
 * Returns null on any failure (expired/revoked/network error) so the
 * caller can fall through to "treat as logged out".
 */
async function tryRefresh(refreshToken: string): Promise<RefreshResult | null> {
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: REFRESH_TOKEN_MUTATION,
        variables: { input: { refreshToken } },
      }),
      cache: "no-store",
    });
    const json = await res.json();
    if (json.errors || !json.data?.refreshToken) return null;
    return json.data.refreshToken as RefreshResult;
  } catch {
    return null;
  }
}

const COOKIE_BASE = { path: "/", sameSite: "lax" as const };
const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes, mirrors backend ACCESS_TOKEN_EXPIRES_IN
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, mirrors backend REFRESH_TOKEN_EXPIRES_IN_DAYS

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let token = request.cookies.get("token")?.value;
  let role = request.cookies.get("role")?.value;
  const refreshTokenCookie = request.cookies.get("refreshToken")?.value;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAuthPage = AUTH_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`)
  );

  let response = NextResponse.next({ request: { headers: request.headers } });
  let refreshedThisRequest = false;

  // Access token missing or expired, but we still have a refresh
  // token: refresh proactively, right here, before any page code
  // runs — so Server Components in this same request already see a
  // valid session instead of bouncing to /signin for a 15-minute-old
  // (but otherwise still-logged-in) visitor.
  if ((!token || isExpired(token)) && refreshTokenCookie && (isProtected || isAuthPage)) {
    const refreshed = await tryRefresh(refreshTokenCookie);

    if (refreshed) {
      token = refreshed.accessToken;
      role = refreshed.role.toLowerCase();
      refreshedThisRequest = true;

      // Make the new token visible to this request's Server Components
      // (next/headers cookies() reads from request.cookies).
      request.cookies.set("token", refreshed.accessToken);
      request.cookies.set("refreshToken", refreshed.refreshToken);
      request.cookies.set("role", role);
      request.cookies.set("userId", refreshed.id);
      request.cookies.set("username", refreshed.username);
      response = NextResponse.next({ request: { headers: request.headers } });

      // And persist the new pair back to the browser.
      response.cookies.set("token", refreshed.accessToken, {
        ...COOKIE_BASE,
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });
      response.cookies.set("refreshToken", refreshed.refreshToken, {
        ...COOKIE_BASE,
        maxAge: REFRESH_TOKEN_MAX_AGE,
      });
      response.cookies.set("role", role, { ...COOKIE_BASE, maxAge: REFRESH_TOKEN_MAX_AGE });
      response.cookies.set("userId", refreshed.id, { ...COOKIE_BASE, maxAge: REFRESH_TOKEN_MAX_AGE });
      response.cookies.set("username", refreshed.username, {
        ...COOKIE_BASE,
        maxAge: REFRESH_TOKEN_MAX_AGE,
      });
    } else {
      // Refresh token itself is dead (expired, revoked, or reuse was
      // detected server-side) — nothing left to try, fall through to
      // the unauthenticated path below.
      token = undefined;
    }
  }

  const hasValidSession = Boolean(token) && !isExpired(token!);

  // No valid session: block protected routes, clear stale cookies.
  if (!hasValidSession) {
    if (isProtected) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("from", pathname);
      const redirectResponse = NextResponse.redirect(signInUrl);
      redirectResponse.cookies.delete("token");
      redirectResponse.cookies.delete("refreshToken");
      redirectResponse.cookies.delete("role");
      redirectResponse.cookies.delete("userId");
      redirectResponse.cookies.delete("username");
      return redirectResponse;
    }
    return response;
  }

  // Valid session, but visiting /signin or /signup: bounce to their dashboard.
  if (isAuthPage) {
    const home = role && ROLE_HOME[role] ? ROLE_HOME[role] : "/admin";
    return NextResponse.redirect(new URL(home, request.url));
  }

  // Valid session on a role-specific dashboard: enforce role match.
  const matchedRoleHome = Object.entries(ROLE_HOME).find(
    ([, path]) => pathname === path || pathname.startsWith(`${path}/`)
  );
  if (matchedRoleHome) {
    const [ownerRole] = matchedRoleHome;
    if (role !== ownerRole) {
      const home = role && ROLE_HOME[role] ? ROLE_HOME[role] : "/signin";
      return NextResponse.redirect(new URL(home, request.url));
    }
  }

  return response;
}

export const config = {
  // Run on everything except static assets and Next internals.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)"],
};