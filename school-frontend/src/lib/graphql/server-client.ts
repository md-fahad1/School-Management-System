import "server-only";
import { GraphQLClient } from "graphql-request";
import { cookies } from "next/headers";

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";

/**
 * GraphQL client for use inside Server Components / Server Actions.
 * Pulls the JWT from the `token` cookie set at login (see
 * src/app/signin/page.jsx) so every request server components make
 * is authenticated as the signed-in user.
 */
export function getServerClient() {
  const token = cookies().get("token")?.value;

  return new GraphQLClient(GRAPHQL_URL, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    // Server Components re-render on navigation; avoid stale cached
    // GraphQL responses across requests.
    fetch: (url, options) =>
      fetch(url, { ...options, cache: "no-store" } as RequestInit),
  });
}

/** Convenience: current user's role, read straight from the cookie. */
export function getServerRole(): string | undefined {
  return cookies().get("role")?.value;
}

export function getServerUserId(): string | undefined {
  return cookies().get("userId")?.value;
}
