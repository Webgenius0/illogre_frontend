# Tixolve Frontend — Troubleshooting & Incident Resolution Guide

**Target Application**: `tixolve-app` (`app.tixolve.com`)  
**Framework**: Next.js 16.2.2 App Router  
**HTTP Client**: Axios with Credentials  

---

## 1. Authentication & Session Failures

### Symptom: Login Succeeds, but Dashboard Immediately Redirects Back to Login
- **Root Cause**:
  1. The backend did not set the `tixolve_access_token` cookie, or set it with the wrong `Domain` attribute. If the backend is at `api.tixolve.com` and the frontend is at `app.tixolve.com`, a cookie without `Domain=.tixolve.com` is host-only and will not be sent to the frontend.
  2. The browser rejected the cookie because `Secure` is enabled but the site was accessed over unencrypted `http://`.
  3. `DashboardLayout` called `GET /api/user`, received 401 Unauthorized, and triggered the session expiration redirect.
- **Diagnostic Steps**:
  1. Open Chrome DevTools > **Application** > **Cookies**. Check whether `tixolve_access_token` exists and inspect its `Domain`, `Path`, `HttpOnly`, `Secure`, and `SameSite` flags.
  2. Open DevTools > **Network**. Filter by `user`. Inspect the response headers of `GET /api/user`.
- **Resolution**:
  - In Laravel backend `.env`, ensure:
    ```ini
    SESSION_DOMAIN=.tixolve.com
    AUTH_COOKIE_DOMAIN=.tixolve.com
    SESSION_SECURE_COOKIE=true
    ```
  - Access both frontend and backend strictly over HTTPS.

---

### Symptom: Infinite Redirect Loop on Login Page
- **Root Cause**: An unauthenticated request on a public route (`/auth/login`) threw a 401 error, and the Axios response interceptor redirected to `/auth/login?callbackUrl=/auth/login`.
- **Resolution**:
  - Verify that `useAxiosPrivate.tsx` includes all public routes in `publicRoutes`:
    ```typescript
    const publicRoutes = [
      "/auth/login",
      "/auth/register",
      "/auth/register/email_verification",
      "/auth/register/plans",
      "/auth/forgot_password",
      "/auth/callback",
      "/auth/accept-invitation",
      "/auth/accept-agent-invitation",
    ];
    ```
  - The interceptor prevents redirects if the current path starts with any of the routes above.

---

## 2. CORS & Network Connection Errors

### Symptom: Console Error `Access to XMLHttpRequest has been blocked by CORS policy`
- **Root Cause**:
  1. Laravel `config/cors.php` does not whitelist the frontend origin.
  2. `supports_credentials` is set to `false` in backend CORS configuration. Browsers reject responses containing credentials if `Access-Control-Allow-Credentials: true` is missing.
  3. Preflight `OPTIONS` request failed or returned 404/500.
- **Resolution**:
  - In Laravel backend `config/cors.php`, confirm:
    ```php
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_origins' => ['https://app.tixolve.com', 'http://localhost:3000'],
    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
    ```

---

### Symptom: `ERR_NETWORK` / "Please check your network connection"
- **Root Cause**:
  - The API host specified in `NEXT_PUBLIC_BASE_URL` is unreachable, offline, or blocked by local firewall/DNS.
- **Resolution**:
  - Verify the backend API URL directly by visiting `https://api.tixolve.com/api/user` (or `http://localhost:8000/api/user`) in a browser. It should return JSON `{"message": "Unauthenticated."}` with HTTP status 401.

---

## 3. Google OAuth Issues

### Symptom: "Google OAuth is not configured. Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID"
- **Root Cause**:
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is empty, unset, or set to placeholder string `"your_client_id_here"`.
- **Resolution**:
  - Set a valid Google OAuth Web Client ID in `.env.local` or container environment variables:
    ```ini
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
    ```
  - Rebuild the application if deploying (`npm run build`), as Next.js inlines `NEXT_PUBLIC_*` variables at compile time.

---

### Symptom: Google OAuth Popup Closes Immediately or Shows `redirect_uri_mismatch`
- **Root Cause**:
  1. The origin or callback URL is not registered in Google Cloud Console.
  2. `Cross-Origin-Opener-Policy` blocked popup communication.
- **Resolution**:
  - In Google Cloud Console > APIs & Services > Credentials:
    * Add `https://app.tixolve.com` to **Authorized JavaScript origins**.
    * Add `https://app.tixolve.com/auth/callback` to **Authorized redirect URIs**.
  - In `next.config.ts`, ensure `Cross-Origin-Opener-Policy` is set to `same-origin-allow-popups` (retained in current codebase).

---

## 4. Next.js Image Optimization Errors

### Symptom: `Error: Invalid src prop on next/image, hostname is not configured`
- **Root Cause**: An avatar, attachment, or company logo URL comes from an external host not registered in `next.config.ts` `remotePatterns`.
- **Resolution**:
  - Add the target domain to `next.config.ts`:
    ```typescript
    images: {
      unoptimized: true,
      remotePatterns: [
        { protocol: "https", hostname: "app.tixolve.com", pathname: "/**" },
        { protocol: "https", hostname: "admin.tixolve.com", pathname: "/**" },
        { protocol: "https", hostname: "api.tixolve.com", pathname: "/**" },
        { protocol: "https", hostname: "your-cdn-host.com", pathname: "/**" },
      ],
    }
    ```

---

## 5. Build, Lint & TypeScript Errors

### Symptom: `npm run lint` Fails with Numerous `@typescript-eslint/no-explicit-any` Errors
- **Root Cause**:
  - Legacy API hooks (`src/hooks/*.api.ts`) use `any` types for parameters and return types.
  - ESLint 9 + TypeScript-ESLint enforce strict typing rules by default.
- **Resolution**:
  - Note: In compliance with engineering guidelines, rules are **not** suppressed or disabled.
  - Fix incrementally by creating TypeScript response interfaces in `src/types/` (e.g. `TicketResponse`, `CustomerResponse`) and typing the hooks.

---

### Symptom: Standalone Server Fails to Start (`Cannot find module 'next'`)
- **Root Cause**:
  - Attempting to run `node .next/standalone/server.js` without copying `public` and `.next/static` assets into the standalone directory.
- **Resolution**:
  ```bash
  cp -r public .next/standalone/
  cp -r .next/static .next/standalone/.next/
  cd .next/standalone
  node server.js
  ```

---

## 6. Polling & Stale Data Issues

### Symptom: Ticket Table Does Not Show New Tickets Automatically
- **Root Cause**:
  1. The browser tab is in the background or minimized. TanStack Query is configured with `refetchIntervalInBackground: false` to conserve battery and server bandwidth.
  2. Polling interval is set to 10 seconds (`refreshInterval: 10000`).
- **Resolution**:
  - Bringing the browser tab back into focus immediately triggers a background revalidation (`refetchOnWindowFocus: true`).
  - For real-time push updates, implement Laravel Echo/Reverb WebSockets as documented in the engineering roadmap.
