import { NextResponse } from "next/server";
import { forwardedHeaders } from "@/lib/forwardHeaders";
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";

const REGISTER_MUTATION = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      id
      username
      role
    }
  }
`;

export async function POST(request: Request) {
  const body = await request.json();

  // Public sign-up is parent-only; the backend enforces this as well.
  const input = {
    username: body.username,
    email: body.email,
    password: body.password,
    name: body.name,
    surname: body.surname,
    role: "PARENT",
    institutionSlug: body.institutionSlug,
  };

  const gqlRes = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: forwardedHeaders(request.headers),
    body: JSON.stringify({ query: REGISTER_MUTATION, variables: { input } }),
    cache: "no-store",
  });
  const json = await gqlRes.json();

  if (json.errors?.length) {
    return NextResponse.json({ error: json.errors[0].message }, { status: 400 });
  }

  const { accessToken, refreshToken, id, username, role } = json.data.register;

  const response = NextResponse.json({ accessToken, id, username, role });
  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}