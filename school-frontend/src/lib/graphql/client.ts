"use client";

import { GraphQLClient } from "graphql-request";
import Cookies from "js-cookie";

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";

/**
 * GraphQL client for use inside Client Components (forms, mutations
 * triggered by button clicks, etc). Pulls the JWT fresh from the
 * cookie on every call so it always reflects the current session.
 */
export function getClientGqlClient() {
  const token = Cookies.get("token");

  return new GraphQLClient(GRAPHQL_URL, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}
