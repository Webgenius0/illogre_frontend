"use client";

import { Provider } from "react-redux";
import { ReactNode, useEffect } from "react";
import { store } from "@/store/store";
import { injectStore } from "@/hooks/axios/useAxiosPrivate";
import { GoogleOAuthProvider } from "@react-oauth/google";

interface ReduxProviderProps {
  children: ReactNode;
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
  // Inject once on mount
  useEffect(() => {
    injectStore(store);
  }, []);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={googleClientId}>
        {children}
      </GoogleOAuthProvider>
    </Provider>
  );
}
