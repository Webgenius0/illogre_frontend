import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "@/utils/localStorage";
import {
  getSessionStorage,
  removeSessionStorage,
  setSessionStorage,
} from "@/utils/sessionStorage";
import { createSlice } from "@reduxjs/toolkit";

const getInitialToken = () => {
  return (
    getSessionStorage("tixolve_access_token") ||
    getLocalStorage("tixolve_access_token") ||
    null
  );
};

const getInitialUser = () => {
  return (
    getSessionStorage("tixolve_access_user") ||
    getLocalStorage("tixolve_access_user") ||
    null
  );
};

const initialState = {
  user: getInitialUser(),
  token: getInitialToken(),
  remember: Boolean(getLocalStorage("tixolve_access_token")),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      const { user, token, remember } = action.payload;
      state.user = user;
      state.token = token;
      state.remember = remember;
      setLocalStorage("tixolve_access_token", token);
      setLocalStorage("tixolve_access_user", user);
      setSessionStorage("tixolve_access_token", token);
      setSessionStorage("tixolve_access_user", user);
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.remember = false;
      removeSessionStorage("tixolve_access_token");
      removeLocalStorage("tixolve_access_token");
      removeLocalStorage("tixolve_access_user");
      removeSessionStorage("tixolve_access_user");
    },

    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { setAuth, logout, setUser } = authSlice.actions;

export default authSlice.reducer;
