import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { forwardedHeaders } from "@/lib/forwardHeaders";

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

export async function POST(request: Request) {
  const refreshToken = cookies().get("refreshToken")?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const gqlRes = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: forwardedHeaders(request.headers),
    body: JSON.stringify({
      query: REFRESH_TOKEN_MUTATION,
      variables: { input: { refreshToken } },
    }),
    cache: "no-store",
  });
  const json = await gqlRes.json();

  if (json.errors?.length || !json.data?.refreshToken) {
    const response = NextResponse.json(
      { error: "Session expired" },
      { status: 401 },
    );
    response.cookies.delete("refreshToken");
    return response;
  }

  const next = json.data.refreshToken;
  const response = NextResponse.json({
    accessToken: next.accessToken,
    id: next.id,
    username: next.username,
    role: next.role,
  });

  const isProd = process.env.NODE_ENV === "production";
  response.cookies.set("refreshToken", next.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}