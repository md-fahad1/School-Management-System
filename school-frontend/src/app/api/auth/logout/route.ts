import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";

const LOGOUT_MUTATION = `
  mutation Logout($input: LogoutInput!) {
    logout(input: $input)
  }
`;

export async function POST() {
  const refreshToken = cookies().get("refreshToken")?.value;

  if (refreshToken) {
    try {
      await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: LOGOUT_MUTATION,
          variables: { input: { refreshToken } },
        }),
        cache: "no-store",
      });
    } catch {
      // best-effort — cookie still gets cleared below regardless
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete("refreshToken");
  return response;
}