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

const getInitialToken = (): string | null => {
  return getCookie("tixolve_access_token") || null;
};

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
  token: getInitialToken(),
  remember: Boolean(getCookie("tixolve_access_token")),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{ user: UserState; token: string; remember?: boolean }>
    ) => {
      const { user, token, remember } = action.payload;
      state.user = user;
      state.token = token;
      state.remember = Boolean(remember);

      if (token) {
        setCookie("tixolve_access_token", token, 7);
      }
      if (user) {
        setCookie("tixolve_access_user", JSON.stringify(user), 7);
      }

      // Cleanup legacy plain-text storage
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

