import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Role = "admin" | "teacher" | "student" | "parent";

export interface AuthUser {
  id: string;
  username: string;
  role: Role;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; id: string; username: string; role: string }>
    ) => {
      const { token, id, username, role } = action.payload;
      state.token = token;
      state.user = { id, username, role: role.toLowerCase() as Role };
    },
    // Called on app load to rehydrate Redux from the cookie set at
    // login, since Redux state itself doesn't persist across reloads.
    restoreSession: (
      state,
      action: PayloadAction<{ token: string; id: string; username: string; role: string } | null>
    ) => {
      if (!action.payload) {
        state.token = null;
        state.user = null;
        return;
      }
      const { token, id, username, role } = action.payload;
      state.token = token;
      state.user = { id, username, role: role.toLowerCase() as Role };
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setCredentials, restoreSession, logout } = authSlice.actions;
export default authSlice.reducer;
