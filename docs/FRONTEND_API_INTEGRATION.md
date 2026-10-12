# Frontend API Integration: Tixolve / Illogre

Complete documentation of the API integration architecture, HTTP client configurations, authentication headers, error handling interceptors, and verified endpoints consumed by the frontend.

---

## 1. API Base URL Configuration

The base URL for all API traffic is dynamically resolved at runtime in `src/hooks/axios/useAxiosPublic.tsx` and `useAxiosPrivate.tsx`:

```typescript
const API_HOST =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://api.tixolve.com"
    : "http://localhost:8000");

const BASE_URL = `${API_HOST}/api`;
```

### Resolution Priority Order
1. `process.env.NEXT_PUBLIC_BASE_URL` (Always takes precedence if defined)
2. `https://api.tixolve.com` (When `NODE_ENV === "production"`)
3. `http://localhost:8000` (Local development fallback)

All endpoint paths are appended to `${BASE_URL}`.

---

## 2. HTTP Client Configuration

The application implements a dual Axios client architecture:

| Feature / Setting | `axiosPublic` | `axiosPrivate` |
| :--- | :--- | :--- |
| **Location** | `src/hooks/axios/useAxiosPublic.tsx` | `src/hooks/axios/useAxiosPrivate.tsx` |
| **Timeout** | `10000ms` (10 seconds) | `30000ms` (30 seconds for AI & file uploads) |
| **Credentials** | `withCredentials: true` | `withCredentials: true` |
| **Default Headers** | `Content-Type: application/json`<br>`Accept: application/json` | `Content-Type: application/json`<br>`Accept: application/json` |
| **Conditional Headers**| `ngrok-skip-browser-warning: "true"` only if `NEXT_PUBLIC_ENABLE_NGROK_WARNING_SKIP="true"` | `ngrok-skip-browser-warning: "true"` only if `NEXT_PUBLIC_ENABLE_NGROK_WARNING_SKIP="true"` |
| **Request Interceptor** | Pass-through | Pass-through (pure HttpOnly cookie session architecture) |
| **Response Interceptor** | Network error detection, Laravel 422 error object formatting. | Global status code handling (401, 403, 400, 422, 404, 429, 500), Sonner toast dispatch, custom event emission for AI gating. |

---

## 3. Authentication & Cookie-Based Sessions

Authentication is implemented via a **server-managed HttpOnly cookie architecture**:

1. **HttpOnly Cookie Primary Transport**:
   - The backend sets an HttpOnly, Secure cookie named `tixolve_access_token` with `Domain=.tixolve.com` upon successful login.
   - `withCredentials: true` instructs the browser to attach this cookie automatically on cross-origin requests.
   - **Frontend Inaccessibility**: Client-side JavaScript cannot read, inspect, or clear the `tixolve_access_token` cookie.
   - **Absence in Client Storage**: Tokens are completely absent from `localStorage`, `sessionStorage`, client-accessible cookies, and Redux state.
2. **Pure Cookie Session Architecture**:
   - Redux `authSlice` does not maintain a `token` state.
   - Request interceptors in `useAxiosPrivate.tsx` do not inject `Authorization: Bearer` headers. All authentication relies on browser-managed cookies.
3. **Session Expiry (401) Handling**:
   - When any private request receives `401 Unauthorized`:
     1. Dispatches `logout()` to Redux (clearing user metadata and the `tixolve_access_user` cookie).
     2. Checks if the user is on a public page (`/auth/login`, `/auth/register`, `/auth/register/email_verification`, `/auth/register/plans`, `/auth/forgot_password`, `/auth/callback`, `/auth/accept-invitation`, `/auth/accept-agent-invitation`).
     3. If on a protected route, displays toast `"Session expired. Please log in again."` and redirects:
        ```typescript
        window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`;
        ```
4. **Backend Logout Endpoint Requirement**:
   - Because JavaScript cannot delete HttpOnly cookies, logout **must call the backend endpoint** (`POST /api/auth/logout`) via `useLogout()` to invalidate the session and receive an expired `Set-Cookie` header.

---

## 4. API Service Organization

All API requests are organized as React custom hooks in `src/hooks/` powered by two core primitives in `src/hooks/mutation/useApiMutation.tsx`:

- **`useApiQuery<TData, TError>`**: Standardized GET requests wrapping TanStack `useQuery` with `staleTime: 10000` (10 seconds default).
- **`useApiMutation<TData, TError, TVariables>`**: Standardized POST, PUT, DELETE, PATCH mutations wrapping TanStack `useMutation`.

### Dynamic Role Prefixing Pattern
API hooks inspect `user.role` from Redux to dynamically prefix endpoint paths:

```typescript
const { user } = useSelector((state: any) => state.auth);
const prefix =
  user?.role === "Support Manager"
    ? "/manager"
    : user?.role === "Support Agent"
      ? "/agent"
      : "/owner";
```

---

## 5. Error & Validation Response Handling

### Laravel 422 Validation Error Normalization
When Laravel returns a 422 response with nested validation error arrays:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

Both `axiosPublic` and `axiosPrivate` automatically flatten `data.errors`, isolate the first string message, and feed it into `toast.error(firstErrorMsg)`:
```typescript
if (status === 422) {
  const validationErrors = response.data?.errors;
  if (validationErrors && typeof validationErrors === "object") {
    const firstErrorMsg = Object.values(validationErrors)
      .flat()
      .find((msg) => typeof msg === "string");
    toast.error((firstErrorMsg as string) || response.data?.message || "Validation failed.");
  } else {
    toast.error(response.data?.message || "Validation failed.");
  }
}
```

### AI Configuration Gatekeeper (403)
When the backend blocks a feature because AI has not been configured:
```json
{
  "status": 403,
  "error_code": "AI_NOT_CONFIGURED",
  "user_type": "owner"
}
```
The interceptor suppresses the error toast and broadcasts a DOM event:
```typescript
window.dispatchEvent(
  new CustomEvent("show-ai-config-modal", {
    detail: { userType: response.data.user_type },
  })
);
return new Promise(() => {}); // Suppress downstream error cascades
```

---

## 6. Verified API Endpoints Consumed by Frontend

Every endpoint listed below has been verified against active source code in `src/hooks/` and `src/app/`.

### 1. User & Authentication

| Method | Endpoint Path | Hook / File | Auth | Purpose & Payloads |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/user` | `useCurrentUser()` | Private | Fetches authenticated user profile, roles, and configuration flags.<br>**Response**: `{ data: UserState }` |
| `POST` | `/api/auth/login` | `useLogin()` | Public | User email & password login.<br>**Payload**: `{ email, password, remember? }`<br>**Response**: `{ data: UserState }` |
| `POST` | `/api/social-login` | `useSocialLogin()` | Public | Google OAuth social login.<br>**Payload**: `FormData` or `{ provider: "google", token: string }`<br>**Response**: `{ data: UserState, is_subscribed: boolean }` |
| `POST` | `/api/auth/register` | `useRegister()` | Public | Step 1 owner registration.<br>**Payload**: `{ name, email, password, password_confirmation, company_name }`<br>**Response**: `{ data: { message: string } }` |
| `POST` | `/api/auth/register/verify-otp` | `useRegisterEmailVerification()` | Public | Verifies 6-digit email OTP during registration.<br>**Payload**: `{ email, otp: string }`<br>**Response**: `{ data: UserState }` |
| `POST` | `/api/auth/resend-otp` | `useRegisterResendOtp()` | Public | Requests new OTP (60s cooldown, rate-limited on 429).<br>**Payload**: `{ email: string }`<br>**Response**: `{ message: string }` |
| `POST` | `/api/auth/logout` | `useLogout()` | Private | Terminates session on backend, invalidating HttpOnly cookie.<br>**Payload**: `{}` |
| `POST` | `/api/auth/forgot-password` | `useForgotPassword()` | Public | Sends 6-digit reset OTP to email.<br>**Payload**: `{ email: string }`<br>**Response**: `{ message: string }` |
| `POST` | `/api/auth/verify-otp` | `useVerifyOtp()` | Public | Verifies 6-digit OTP for password recovery.<br>**Payload**: `{ email, otp: string }`<br>**Response**: `{ message: string, token: string }` |
| `POST` | `/api/auth/reset-password` | `useResetPassword()` | Public | Sets new password using verified OTP reset token.<br>**Payload**: `{ email, token, password, password_confirmation }`<br>**Response**: `{ message: string }` |

### 2. Invitations

| Method | Endpoint Path | Hook / File | Auth | Purpose & Payloads |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/auth/accept-agent-invitation?token=...` | `AcceptAgentInvitationPage` | Public | Inspects agent invitation details without state modification. |
| `POST` | `/api/auth/accept-agent-invitation` | `AcceptAgentInvitationPage` | Public | Accepts agent invite and activates account.<br>**Payload**: `{ token: string }` |
| `GET` | `/api/auth/accept-invitation/{token}` | `AcceptInvitationPage` | Public | Inspects team invitation token details. |
| `POST` | `/api/auth/accept-invitation/{token}` | `AcceptInvitationPage` | Public | Accepts team member invitation.<br>**Payload**: `{}` |

### 3. Pricing & Checkout

| Method | Endpoint Path | Hook / File | Auth | Purpose & Payloads |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/pricing-plans` | `usePricingPlans()` | Public / Owner | Fetches available subscription tiers, pricing, and feature limits.<br>**Response**: `{ data: Plan[] }` |
| `POST` | `/api/auth/register/checkout` | `useCheckout()` | Public / Owner | Initiates Stripe checkout session.<br>**Payload**: `{ plan_id, billing_cycle }`<br>**Response**: `{ data: { checkout_url?: string, already_subscribed?: boolean } }` |

### 4. Shared Tickets (Helpdesk & Assignment)

| Method | Endpoint Path | Hook / File | Auth | Purpose & Payloads |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/shared/tickets` | `useTickets(params)` | Private | Fetches ticket queue with search and status filters (polled every 1000ms).<br>**Params**: `{ search, status, priority, channel, page }` |
| `GET` | `/api/shared/tickets/{id}` | `useTicketDetails(id)` | Private | Fetches conversation messages, AI analysis, sentiment, and customer context (polled every 5000ms). |
| `POST` | `/api/shared/tickets/{id}/reply` | `useSendTicketReply(id)` | Private | Sends public customer email reply.<br>**Payload**: `{ reply_text: string, is_internal: false }` |
| `POST` | `/api/shared/tickets/{id}/internal-notes` | `useAddInternalNote(id)` | Private | Appends internal agent note.<br>**Payload**: `{ note: string, reply_text: string }` |
| `PATCH` | `/api/shared/tickets/{id}/status` | `useUpdateTicketStatus(id)` | Private | Updates ticket status (`Open`, `Pending`, `Resolved`, `Closed`).<br>**Payload**: `{ status: string }` |
| `PATCH` | `/api/shared/tickets/{id}/assign` | `useAssignTicket(id)` | Private | Reassigns ticket to team agent or unassigns.<br>**Payload**: `{ assigned_user_id?: number \| null, assigned?: string }`<br>**Note**: Reassignment is executed from `TicketHeader.tsx` on the `/tickets/[id]` page. |

### 5. Customers

| Method | Endpoint Path | Hook / File | Auth | Purpose & Payloads |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/{prefix}/customers` | `useCustomers(params)` | Private | Lists customers with search and pagination.<br>**Prefix**: `/owner`, `/manager`, or `/agent`.<br>**Params**: `{ search, page, per_page }` |
| `GET` | `/api/{prefix}/customers/{id}` | `useCustomerDetails(id)` | Private | Retrieves customer profile, order history, and previous tickets. |
| `POST` | `/api/{prefix}/customers` | `useCreateCustomer()` | Private | Adds a new customer profile.<br>**Payload**: `{ name, email, phone?, company?, address? }` |
| `PATCH` | `/api/{prefix}/customers/{id}` | `useUpdateCustomer(id)` | Private | Updates customer profile fields. |
| `DELETE`| `/api/{prefix}/customers/{id}` | `useDeleteCustomer(id)` | Private | Removes customer profile. |

### 6. Knowledge Base (Text-Indexed Retrieval)

| Method | Endpoint Path | Hook / File | Auth | Purpose & Payloads |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/{prefix}/knowledge-base` | `useKnowledgeBaseList()` | Private | Lists ingested knowledge sources, document counts, and indexing statuses.<br>**Prefix**: `/owner` or `/manager`. |
| `GET` | `/api/{prefix}/knowledge-base/{id}` | `useKnowledgeBaseDetails(id)` | Private | Retrieves source details, chunks, and text-indexing progress. |
| `POST` | `/api/{prefix}/knowledge-base` | `useAddKnowledgeSource()` | Private | Ingests new text or document (`multipart/form-data`).<br>**Payload**: `{ name, category, type, content?, file? }` |
| `POST` | `/api/{prefix}/knowledge-base/{id}` | `useUpdateKnowledgeSource(id)` | Private | Updates knowledge source metadata or file content. |
| `DELETE`| `/api/{prefix}/knowledge-base/{id}` | `useDeleteKnowledgeSource(id)` | Private | Deletes a knowledge source. |
| `POST` | `/api/{prefix}/knowledge-base/{id}/reindex` | `useReindexKnowledgeSource(id)` | Private | Triggers text-indexing re-processing for an existing document. |
| `POST` | `/api/{prefix}/knowledge-base/{id}/test-query` | `useTestKnowledgeQuery(id)` | Private | Tests text-indexed retrieval on a document.<br>**Payload**: `{ query: string }`<br>**Response**: `{ ai_response: string, sources_used: { response_time, model, embedding } }` |

### 7. AI Automation

| Method | Endpoint Path | Hook / File | Auth | Purpose & Payloads |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/{prefix}/automations/settings` | `useAutomationSettings()` | Private | Fetches AI automation modes (`Copilot`, `Autonomous`) and confidence thresholds.<br>**Prefix**: `/owner` or `/manager`. |
| `POST` | `/api/{prefix}/automations/settings` | `useSaveAutomationSettings()` | Private | Saves updated automation mode and thresholds.<br>**Payload**: `{ mode: string, human_led_threshold: number, ai_assisted_threshold: number }` |

### 8. Team Management

| Method | Endpoint Path | Hook / File | Auth | Purpose & Payloads |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/owner/team`<br>`/api/manager/agents` | `useTeamOverview()` | Private | Fetches team roster, invitations, and active agents. Owner fetches all roles; Manager fetches agents. |
| `POST` | `/api/owner/team/invite`<br>`/api/manager/agents` | `useInviteTeamMember()` | Private | Sends team invitation email.<br>**Payload**: `{ email, role }` |
| `PATCH` | `/api/owner/team/{id}`<br>`/api/manager/agents/{id}` | `useUpdateTeamRole(id)` | Private | Updates member role.<br>**Payload**: `{ role: string }` |
| `DELETE`| `/api/owner/team/{id}`<br>`/api/manager/agents/{id}` | `useRemoveTeamMember(id)` | Private | Revokes member access and removes from workspace. |

### 9. Integrations & Manual Mailbox Sync

| Method | Endpoint Path | Hook / File | Auth | Purpose & Payloads |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/owner/integrations` | `useIntegrations()` | Private | Lists connected channels (Shopify, Gmail, Outlook, Slack, WhatsApp). |
| `POST` | `/api/owner/shopify/install` | `useConnectShopify()` | Private | Initiates Shopify OAuth installation.<br>**Payload**: `{ shop: string, api_key?, api_secret? }`<br>**Response**: `{ url: string }` |
| `POST` | `/api/owner/integrations/connect` | `useConnectIntegration()` | Private | Connects an integration (Gmail, Outlook, SMTP, WhatsApp). |
| `DELETE`| `/api/owner/integrations/{id}` | `useDisconnectIntegration()` | Private | Disconnects an active integration. |
| `POST` | `/api/owner/integrations/email/fetch` | `useFetchEmails()` | Private | **Manual Email Sync**: Manually triggers inbound email ticket synchronization from connected inboxes. Triggered via the "Sync Inbound Mailbox" button on `/integrations`. |

### 10. Billing & Subscription

| Method | Endpoint Path | Hook / File | Auth | Purpose & Payloads |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/owner/billing/overview` | `useBillingOverview()` | Private | Fetches active subscription details, usage metrics, and invoice history. |
| `POST` | `/api/owner/billing/cancel` | `useCancelSubscription()` | Private | Cancels auto-renewal at period end. |
| `POST` | `/api/owner/billing/resume` | `useResumeSubscription()` | Private | Resumes auto-renewal for cancelled subscription. |
| `POST` | `/api/owner/billing/portal` | `useBillingPortal()` | Private | Requests Stripe customer billing portal URL.<br>**Response**: `{ data: { url: string } }` |

### 11. Workspace & System Settings

| Method | Endpoint Path | Hook / File | Auth | Purpose & Payloads |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/owner/settings` | `useSettings()` | Private | Fetches owner personal profile, workspace info, and system configuration. |
| `POST` | `/api/owner/settings/general` | `useUpdateGeneralSettings()` | Private | Updates profile name, email, phone, avatar (`multipart/form-data`). |
| `POST` | `/api/owner/settings/workspace` | `useUpdateWorkspaceSettings()` | Private | Updates workspace name, domain, logo (`multipart/form-data`). |
| `PATCH` | `/api/owner/settings/ai` | `useUpdateAiSettings()` | Private | Updates default AI model, creativity temperature, response tone. |
| `PATCH` | `/api/owner/settings/notifications`| `useUpdateNotificationSettings()`| Private | Updates email and in-app notification toggles. |
| `PATCH` | `/api/owner/settings/security` | `useUpdateSecuritySettings()` | Private | Updates account password.<br>**Payload**: `{ current_password, new_password, new_password_confirmation }` |
| `GET` | `/api/owner/settings/google-auth`| `useGoogleAuthSettings()` | Private | Fetches Google OAuth Client ID, Secret, and Redirect URI. |
| `POST` | `/api/owner/settings/google-auth`| `useUpdateGoogleAuthSettings()` | Private | Updates Google OAuth credentials.<br>**Payload**: `{ google_client_id, google_client_secret, google_redirect_uri, google_auth_enabled }` |

### 12. Notifications & Analytics

| Method | Endpoint Path | Hook / File | Auth | Purpose & Payloads |
| :--- | :--- | :--- | :---: | :--- |
| `GET` | `/api/owner/dashboard/overview` | `useOwnerOverview()` | Private | Executive metrics, volume charts, resolution rate, recent tickets. |
| `GET` | `/api/owner/analytics?range=...`| `useGetAnalytics(range)` | Private | Operational metrics, response times, category distribution. |
| `GET` | `/api/notifications` | `useNotifications()` | Private | Polled every 30000ms for system notifications. |
| `POST` | `/api/notifications/mark-as-read` | `useMarkNotificationsRead()` | Private | Marks all notifications as read. |
