"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import Cookies from "js-cookie";
import { store } from "./store";
import { restoreSession } from "./slices/authSlice";

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

  return <>{children}</>;
}

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionRehydrator>{children}</SessionRehydrator>
    </Provider>
  );
}
