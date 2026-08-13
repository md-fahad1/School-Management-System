import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

/**
 * Decodes a JWT payload without verifying the signature — good enough
 * to catch an obviously expired token for UX redirects. The backend
 * still verifies the signature on every request via passport-jwt, so
 * this is not a security boundary by itself, just a faster redirect.
 */
function isExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(base64));
    if (!decoded.exp) return false;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    // Malformed token — treat as invalid/expired.
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAuthPage = AUTH_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`)
  );

  const hasValidSession = Boolean(token) && !isExpired(token!);

  // No valid session: block protected routes, clear stale cookies.
  if (!hasValidSession) {
    if (isProtected) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("from", pathname);
      const response = NextResponse.redirect(signInUrl);
      if (token) {
        // Token existed but was expired/malformed — clean up so the
        // client-side Redux rehydration doesn't pick up a dead session.
        response.cookies.delete("token");
        response.cookies.delete("role");
        response.cookies.delete("userId");
        response.cookies.delete("username");
      }
      return response;
    }
    return NextResponse.next();
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

  return NextResponse.next();
}

export const config = {
  // Run on everything except static assets and Next internals.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)"],
};
