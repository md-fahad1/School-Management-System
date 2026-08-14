"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import Cookies from "js-cookie";
import { store } from "./store";
import { restoreSession } from "./slices/authSlice";
import { isExpired } from "@/lib/jwt";
import { refreshSession } from "@/lib/graphql/client";

// How often to check whether the access token needs refreshing while
// a tab is open. The access token itself lives 15 minutes; checking
// every minute means we refresh well before it actually expires.
const REFRESH_CHECK_INTERVAL_MS = 60 * 1000;

function SessionRehydrator({ children }: { children: React.ReactNode }) {
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const token = Cookies.get("token");
    const id = Cookies.get("userId");
    const username = Cookies.get("username");
    const role = Cookies.get("role");

    if (token && id && username && role) {
      store.dispatch(restoreSession({ token, id, username, role }));
    }
  }, []);

  useEffect(() => {
    // Keeps a long-open tab's session alive without the person having
    // to navigate anywhere — middleware only gets a chance to refresh
    // on page navigation, so a tab left open on one page for 20+
    // minutes needs this instead.
    const interval = setInterval(() => {
      const token = Cookies.get("token");
      const refreshToken = Cookies.get("refreshToken");
      if (!refreshToken) return; // not logged in — nothing to keep alive
      if (token && !isExpired(token, 120)) return; // still fine for 2+ more minutes

      refreshSession();
    }, REFRESH_CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionRehydrator>{children}</SessionRehydrator>
    </Provider>
  );
}