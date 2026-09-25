import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "sepia.session";

const loadSession = () => {
  try {
    // Written by the previous version; it could include the password hash.
    localStorage.removeItem("profile");
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return session?.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
};

export const saveSession = (session) => {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage is unavailable, so the session lasts until reload.
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: loadSession,
  reducers: {
    signedIn: (_session, { payload }) => payload,
    signedOut: () => null,
  },
  selectors: {
    selectUser: (session) => session?.user ?? null,
  },
});

export const { signedIn, signedOut } = authSlice.actions;
export const { selectUser } = authSlice.selectors;
export default authSlice.reducer;
