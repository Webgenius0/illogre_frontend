# Tixolve Frontend — Authentication & Session Architecture

**Target Application**: `tixolve-app` (`app.tixolve.com`)  
**Backend API**: Laravel 11 / Sanctum (`api.tixolve.com` / `admin.tixolve.com`)  
**Specification Version**: Next.js 16 App Router  

---

## 1. Overview & Security Philosophy

The Tixolve frontend implements an **HttpOnly, Secure cookie-based authentication architecture** designed to protect credentials against Cross-Site Scripting (XSS) and client-side token exposure.

### Core Security Principles
1. **Zero Client-Side Token Storage**: Authentication tokens are **never** stored in `localStorage`, `sessionStorage`, client-accessible cookies, or Redux state.
2. **Browser-Managed Credential Propagation**: All private API requests include credentials automatically via `withCredentials: true` (`useAxiosPrivate.tsx`). The browser attaches the backend-issued `tixolve_access_token` cookie.
3. **Optimistic Display vs. Authoritative Proof**: The client cookie `tixolve_access_user` contains only non-sensitive profile information (`id`, `name`, `email`, `role`) for immediate header hydration. It is **never** accepted as authoritative proof of authentication.
4. **Backend Authorization Supremacy**: Client-side layout gates and route redirects improve user experience; they do **not** replace server-side role and tenant authorization. The Laravel backend verifies session validity on every API request.

---

## 2. Authentication Flow Diagrams

### A. Login & Session Establishment Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Support Agent / Owner
    participant UI as Login Page (/auth/login)
    participant Axios as axiosPublic (withCredentials)
    participant Backend as Laravel API (/api/auth/login)
    participant Redux as Redux authSlice
    participant Browser as Browser Cookie Jar

    User->>UI: Enters email and password
    UI->>Axios: POST /api/auth/login { email, password }
    Axios->>Backend: Request forwarded with credentials
    Backend->>Backend: Validate credentials & check email_verified_at
    Backend-->>Browser: Set-Cookie: tixolve_access_token=***; Domain=.tixolve.com; HttpOnly; Secure; SameSite=Lax
    Backend-->>Axios: 200 OK { status: "success", data: { id, name, role, is_subscribed } }
    Axios-->>UI: Resolves onSuccess(data)
    UI->>Redux: dispatch(setAuth({ user: data.data, remember: true }))
    Redux->>Browser: Set-Cookie: tixolve_access_user={...}; Path=/; SameSite=Lax
    UI->>UI: Evaluate role & redirect (Owner -> "/", Agent -> "/tickets")
```

---

### B. Session Verification & Route Guarding Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Browser Client
    participant Layout as DashboardLayout (useCurrentUser)
    participant Axios as axiosPrivate (withCredentials: true)
    participant Backend as Laravel API (/api/user)
    participant Router as Next.js Router

    User->>Layout: Navigates to /tickets or /settings
    Layout->>Layout: Renders Spinner (isLoading: true)
    Layout->>Axios: GET /api/user
    Axios->>Backend: Includes tixolve_access_token (HttpOnly)
    
    alt Session Valid
        Backend-->>Axios: 200 OK { data: UserProfile }
        Axios-->>Layout: currentUser populated
        Layout->>Layout: Unblocks rendering; mounts dashboard child view
    else Session Expired / Invalid (401)
        Backend-->>Axios: 401 Unauthorized
        Axios->>Axios: Interceptor catches 401
        Axios->>Layout: Dispatches logout() & toasts "Session expired"
        Axios->>Router: window.location.href = /auth/login?callbackUrl=/tickets
    end
```

---

## 3. Implemented Authentication Flows

### 1. User Login
- **Endpoint**: `POST /api/auth/login`
- **Hook**: `useLogin` (`src/hooks/auth.api.ts`)
- **Component**: `LoginForm.tsx` (`src/components/auth/LoginForm.tsx`)
- **Behavior**:
  - Validates email and password using `validator.ts`.
  - On 200 success: verifies `is_subscribed`. If false, redirects owner to `/auth/register/plans`.
  - If `callbackUrl` search param exists and is a relative path (`startsWith("/")`), redirects to that path.
  - Role-based default destination:
    * `owner`: `/` (Overview Dashboard)
    * `Support Manager` or `Support Agent`: `/tickets`
  - If `is_ai_configured === false`, appends query parameter `?ai_not_configured=true`.

### 2. User Logout
- **Endpoint**: `POST /api/auth/logout`
- **Hook**: `useLogout` (`src/hooks/auth.api.ts`)
- **Trigger**: `LogoutModal.tsx` (`src/shared/LogoutModal.tsx`)
- **Behavior**:
  - Sends authenticated POST to invalidation endpoint.
  - Clears TanStack Query cache (`queryClient.clear()`).
  - Dispatches `logout()` in Redux: clears `state.user`, deletes `tixolve_access_user` cookie, and clears legacy storage keys.
  - Server deletes Sanctum `PersonalAccessToken`, invalidates session, and returns expired cookie `Set-Cookie: tixolve_access_token=deleted; Expires=...; Domain=.tixolve.com`.
  - Redirects user to `/auth/login`.

### 3. Registration & Multi-Factor Email OTP
- **Initiation Endpoint**: `POST /api/auth/register`
- **Verification Endpoint**: `POST /api/auth/register/verify-otp`
- **Resend Endpoint**: `POST /api/auth/resend-otp`
- **Hooks**: `useRegister`, `useRegisterEmailVerification`, `useRegisterResendOtp`
- **Flow**:
  1. User fills name, company name, email, and password on `/auth/register`.
  2. Backend caches registration and emails a 6-digit verification code.
  3. Frontend redirects to `/auth/register/email_verification?email=...`.
  4. User enters 6-digit code. Submitting triggers `verify-otp`.
  5. Upon OTP validation, account is activated, auth cookie is attached, and user navigates to plan selection (`/auth/register/plans`).

### 4. Password Reset Flow
- **Request OTP**: `POST /api/auth/forgot-password` (`useForgotPassword`)
- **Verify OTP**: `POST /api/auth/verify-otp` (`useVerifyOtp`)
- **Submit New Password**: `POST /api/auth/reset-password` (`useResetPassword`)
- **Component**: `ForgotPasswordFlow.tsx` (`src/components/forgot_password/ForgotPasswordFlow.tsx`)
- **Behavior**: Multi-step state machine managing email submission, OTP verification, and password reset with 60-second resend cooldown timer.

### 5. Google OAuth Integration
- **Client Configuration**: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` injected in `ReduxProvider.tsx`.
- **Button Component**: `GoogleSignInButton.tsx` (`src/components/shared/GoogleSignInButton.tsx`).
- **Dual Initiation Paths**:
  1. **Popup Flow (`@react-oauth/google`)**:
     * Clicking button invokes `useGoogleLogin`.
     * Browser opens Google popup window.
     * Requires `Cross-Origin-Opener-Policy: same-origin-allow-popups` in `next.config.ts`.
     * Returns Google access token to `useSocialLogin.mutate({ provider: "google", token })`.
  2. **Redirect Route Handler (`/api/auth/google`)**:
     * Full-page OAuth redirect to `accounts.google.com/o/oauth2/v2/auth`.
     * Redirect URI: `${origin}/auth/callback`.
  3. **Callback Handler (`/auth/callback`)**:
     * Reads `access_token` from URL hash or query params.
     * Calls `POST /api/social-login`.
     * Backend exchanges Google credential, issues `tixolve_access_token` cookie, and returns user payload.

---

## 4. Route Protection & Authorization Matrix

| Route Pattern | Access Level | Enforcement Mechanism | Failure Action |
|---|---|---|---|
| `/auth/login`<br>`/auth/register`<br>`/auth/forgot_password` | Public | Unrestricted. `proxy.ts` redirects already-logged-in users to `/`. | Allowed |
| `/auth/callback` | Public | Unrestricted. Verifies OAuth code/token. | Redirects to `/auth/login` on failure |
| `/auth/accept-invitation/[token]`<br>`/auth/accept-agent-invitation` | Public / Token | Reads invite token, inspects read-only GET, submits POST. | Shows error card if expired |
| `/accept-invitation`<br>`/accept-agent-invitation` | Legacy Alias | Client redirect to `/auth/...` preserving query parameters. | Redirected to canonical path |
| `/` (Overview) | Protected: Owner | `DashboardLayout` checks `GET /api/user`. Role check in page. | Redirected to `/auth/login` |
| `/tickets` | Protected: All Staff | `DashboardLayout` checks `GET /api/user`. | Redirected to `/auth/login` |
| `/customers`<br>`/knowledge_base`<br>`/ai_automation` | Protected: Owner / Mgr | `DashboardLayout` checks `GET /api/user` and `is_ai_configured`. | Renders `AiConfigModal` if unconfigured |
| `/settings`<br>`/team`<br>`/billing` | Protected: Owner | `DashboardLayout` checks `GET /api/user`. Sidebar hides items for agents. | Backend rejects non-owner requests (403) |

---

## 5. HTTP Error Interception & Status Code Behavior

All authenticated HTTP requests pass through `axiosPrivate` response interceptors in `src/hooks/axios/useAxiosPrivate.tsx`:

| HTTP Status | Trigger Condition | Frontend Handling |
|---|---|---|
| **401 Unauthorized** | Expired or missing `tixolve_access_token` cookie. | 1. Dispatches `logout()` in Redux.<br>2. Verifies route is not public (prevents redirect loops).<br>3. Toasts *"Session expired. Please log in again."* if user was logged in.<br>4. Redirects to `/auth/login?callbackUrl=${pathname}`. |
| **403 Forbidden** | `error_code: "AI_NOT_CONFIGURED"` | Dispatches custom window event `show-ai-config-modal` with user type payload. Halts error toast. |
| **403 Forbidden** | Standard unauthorized action (e.g. agent hitting owner endpoint). | Displays `error.response.data.message` via toast notification. |
| **422 Unprocessable** | Laravel form validation failure. | Extracts first message from `error.response.data.errors` and displays via toast. |
| **429 Rate Limited** | OTP brute force / resend threshold exceeded. | Toasts *"Too many requests — please slow down."* |
| **500+ Server Error** | Unhandled backend exception or database downtime. | Toasts *"Server error — please try again later."* |

---

## 6. Security Limitations & Backend Dependencies

1. **Edge Middleware Scope Limitation**:
   * Next.js edge proxy (`src/proxy.ts`) can read cookies only when the frontend and backend share a parent domain (e.g. `app.tixolve.com` and `api.tixolve.com` sharing `.tixolve.com`).
   * Edge middleware does **not** query Laravel's database to verify token revocation. Authoritative verification occurs exclusively via `GET /api/user`.
2. **Local Cross-Port Development**:
   * On `localhost:3000` (frontend) and `localhost:8000` (backend), browsers treat different ports as different origins for cookie sharing unless the backend sets `SameSite=None; Secure`. In standard local development, run a reverse proxy or use consistent hostnames.
3. **Absence of CSRF Tokens on Bearer Cookie Flow**:
   * The backend relies on `SameSite=Lax` and HttpOnly flags on `tixolve_access_token`. If cross-site requests are introduced, Laravel Sanctum's `/sanctum/csrf-cookie` endpoint must be integrated into Axios interceptors.
