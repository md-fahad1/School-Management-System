import { NextResponse } from "next/server";

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";

const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      id
      username
      role
    }
  }
`;

export async function POST(request: Request) {
  const { identifier, password } = await request.json();

  const gqlRes = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: LOGIN_MUTATION,
      variables: { input: { identifier, password } },
    }),
    cache: "no-store",
  });
  const json = await gqlRes.json();

  if (json.errors?.length) {
    return NextResponse.json(
      { error: json.errors[0].message },
      { status: 401 },
    );
  }

  const { accessToken, refreshToken, id, username, role } = json.data.login;

  // refreshToken is deliberately left OUT of this JSON body — it only
  // ever leaves the server as an httpOnly Set-Cookie below, so client
  // JS never has a chance to read or store it.
  const response = NextResponse.json({ accessToken, id, username, role });

  const isProd = process.env.NODE_ENV === "production";
  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}