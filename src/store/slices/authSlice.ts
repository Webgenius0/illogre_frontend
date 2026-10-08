import { getCookie, removeCookie, setCookie } from "@/utils/cookie";
import {
  removeLocalStorage,
} from "@/utils/localStorage";
import {
  removeSessionStorage,
} from "@/utils/sessionStorage";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  id?: number | string;
  name?: string;
  email?: string;
  role?: string;
  is_verified?: boolean;
  is_ai_configured?: boolean;
  [key: string]: unknown;
}

export interface AuthState {
  user: UserState | null;
  token: string | null;
  remember: boolean;
}

const getInitialUser = (): UserState | null => {
  const userCookie = getCookie("tixolve_access_user");
  if (!userCookie) return null;
  try {
    return JSON.parse(userCookie);
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getInitialUser(),
  token: null,
  remember: Boolean(getInitialUser()),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{ user?: UserState | null; token?: string; remember?: boolean }>
    ) => {
      const { user, remember } = action.payload;
      state.user = user ?? null;
      state.token = null;
      state.remember = Boolean(remember);

      if (user) {
        setCookie("tixolve_access_user", JSON.stringify(user), 7);
      }

      // Cleanup legacy plain-text storage
      removeCookie("tixolve_access_token");
      removeLocalStorage("tixolve_access_token");
      removeLocalStorage("tixolve_access_user");
      removeSessionStorage("tixolve_access_token");
      removeSessionStorage("tixolve_access_user");
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.remember = false;

      removeCookie("tixolve_access_token");
      removeCookie("tixolve_access_user");
      removeLocalStorage("tixolve_access_token");
      removeLocalStorage("tixolve_access_user");
      removeSessionStorage("tixolve_access_token");
      removeSessionStorage("tixolve_access_user");
    },

    setUser: (state, action: PayloadAction<UserState>) => {
      state.user = action.payload;
      if (action.payload) {
        setCookie("tixolve_access_user", JSON.stringify(action.payload), 7);
      }
    },
  },
});

export const { setAuth, logout, setUser } = authSlice.actions;

export default authSlice.reducer;

