# Developer Handover Guide: Tixolve / Illogre

Handover document for the incoming in-house frontend engineer. Contains essential onboarding context, critical files to review, verified build diagnostics, confirmed technical debt, unresolved feature limitations, and a prioritized engineering roadmap.

---

## 1. Quick Start Guide for New Developers

Follow these steps to get your local environment running:

### Step 1: Clone & Install
```bash
git clone <repository-url> illogry-frontend
cd illogry-frontend
npm install
```

### Step 2: Configure Environment
Create a `.env` file in the project root:
```env
# Point to your local Laravel backend instance (without /api)
NEXT_PUBLIC_BASE_URL=http://localhost:8000

# Optional: Add Google OAuth Client ID for local Google sign-in testing
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
```

### Step 3: Launch Local Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Top 10 Files to Understand First

To build a rapid mental model of the codebase, review these 10 core files in the following sequence:

| Priority | File Path | Why It Matters |
| :---: | :--- | :--- |
| **1** | `src/app/(dashboard)/layout.tsx` | **The Core Gatekeeper**. Manages authentication validation, Redux user sync, subscription gating, and the blocking AI configuration modal. |
| **2** | `src/hooks/axios/useAxiosPrivate.tsx` | **Authenticated HTTP Client**. Configures `withCredentials: true`, interceptors handling 401 session expiry, 403 AI modal events, and Laravel 422 error normalization. |
| **3** | `src/hooks/axios/useAxiosPublic.tsx` | **Public HTTP Client**. Contains base URL resolution and Laravel validation formatting for guest endpoints. |
| **4** | `src/store/slices/authSlice.ts` | **Client Authentication Store**. Manages Redux auth state, hydrates user metadata from `tixolve_access_user` cookie, and sets `token: null`. |
| **5** | `src/proxy.ts` | **Next.js 16 Proxy / Middleware**. Handles edge routing hints and login redirection. |
| **6** | `src/hooks/mutation/useApiMutation.tsx` | **Generic Data Layer**. Standardized wrapper over TanStack Query (`useApiQuery` and `useApiMutation`). |
| **7** | `src/hooks/auth.api.ts` | **Authentication Service**. Implements login, social login, registration, 6-digit OTP verification, and session logout hooks. |
| **8** | `src/hooks/tickets.api.ts` | **Helpdesk Service**. Implements ticket queue polling, conversation details, replies, internal notes, and `assigned_user_id` assignment. |
| **9** | `src/components/ticket/TicketChat.tsx` | **Conversation Interface**. Implements conversation history rendering and the embedded Tiptap rich-text editor for agent replies. |
| **10**| `src/shared/Sidebar.tsx` | **Navigation System**. Demonstrates how menu navigation items and routes are filtered based on the active user role (`owner`, `Support Manager`, `Support Agent`). |

---

## 3. Build & Verification Checklist

Verification commands executed during this audit:

| Command | Status | Exit Code | Verified Output & Diagnostic Findings |
| :--- | :---: | :---: | :--- |
| `npx tsc --noEmit` | **PASSED** | `0` | **0 errors**. TypeScript type-checking completed cleanly with `strict: true` enabled. |
| `npm run build` | **PASSED** | `0` | Compiled successfully with Turbopack in 7.2s. TypeScript checks finished in 9.1s. Generated 27 static pages and 6 dynamic server routes into standalone output (`.next/standalone`). |
| `npm run lint` | **FAILED** | `1` | **280 problems (184 errors, 96 warnings)**. Overwhelmingly strict `@typescript-eslint/no-explicit-any` violations across API hooks (`src/hooks/*.api.ts`) and React Hook dependency warnings. |
| `npm test` | **N/A** | N/A | **No test script exists** in `package.json`. No automated test suite is installed. |

---

## 4. Confirmed Limitations & Technical Debt

Each of the following previously reported limitations has been audited directly against active source code and confirmed:

### 1. Ticket Reassignment Location
- **Status**: **CONFIRMED**
- **Evidence**: In `src/components/TicketsComponents/TicketsTable.tsx`, the `Assigned` column is strictly read-only (`ticket.assigned_user?.name || ticket.assigned || "Unassigned"`). Reassigning a ticket via `useAssignTicket` (`PATCH /api/shared/tickets/${id}/assign`) with `assigned_user_id` is only implemented inside `TicketHeader.tsx` on the `/tickets/[id]` conversation page.

### 2. Placeholder Integration Channels
- **Status**: **CONFIRMED**
- **Evidence**: In `src/app/(dashboard)/integrations/page.tsx` (lines 138–144), active connection modals exist only for `gmail`, `smtp`, `outlook`, `whatsapp`, and `shopify`. Selecting Zendesk, Gorgias, Zoho, Klaviyo, Webhook, or Instagram triggers `toast.info("Integration coming soon")`.

### 3. Missing Administrative Pricing Plan CRUD
- **Status**: **CONFIRMED**
- **Evidence**: `src/hooks/pricing.api.ts` only provides `usePricingPlans()` (read-only query) and `useCheckout()` (Stripe checkout session). The frontend provides consumer plan browsing and checkout, but has no administrative UI or hooks to create, edit, or delete subscription tiers.

### 4. Ticket Queue Polling Optimization
- **Status**: **REMEDIATED**
- **Evidence & Fix**: In `src/hooks/tickets.api.ts`, `useTickets` polling interval has been increased from 1,000ms (1 second) to 10,000ms (10 seconds), and `useApiMutation.tsx` now properly wires `refetchInterval` with `refetchIntervalInBackground: false` and `refetchOnWindowFocus: true`. Polling halts when tabs are hidden or components unmount.

### 5. Duplicate Invitation Acceptance Routes
- **Status**: **REMEDIATED**
- **Evidence & Fix**: Consolidated `/accept-agent-invitation` and `/accept-invitation` into lightweight backwards-compatible redirects pointing to canonical `/auth/accept-agent-invitation` and `/auth/accept-invitation/[token]`. Added support for query parameters (`?token=...`) on `/auth/accept-invitation`.

### 6. Authentication & Header Hardening
- **Status**: **REMEDIATED**
- **Evidence & Fix**:
  * Removed `token` from Redux `authSlice` and removed `Authorization: Bearer <token>` fallback in `useAxiosPrivate.tsx`. Session security is purely HttpOnly cookie-based (`tixolve_access_token` on `.tixolve.com`).
  * Removed hardcoded `"ngrok-skip-browser-warning": "69420"` from `useAxiosPublic.tsx` and `useAxiosPrivate.tsx`.
  * Restricted `next.config.ts` from global `unsafe-none` COOP to `same-origin-allow-popups`.
  * Removed stale ngrok guidance from `GoogleAuthSettingsCard.tsx` and removed personal developer placeholders in `Header.tsx` and `ForgotPasswordFlow.tsx`.

### 7. Vercel Rewrite Wildcard Conflict
- **Status**: **CONFIRMED**
- **Evidence**: `vercel.json` contains `rewrites: [{ source: "/:path*", destination: "/:path*.html" }]`. This wildcard rewrite is designed for static exports and conflicts with dynamic server handlers (`/api/auth/google`, `/tickets/[id]`, `/customers/[id]`) if deployed to Vercel instead of Docker standalone.

### 8. High Volume of ESLint Strict Typing Errors
- **Status**: **CONFIRMED (BASELINE)**
- **Evidence**: Running `npm run lint` yields 184 errors and 96 warnings due to `@typescript-eslint/no-explicit-any` throughout `src/hooks/*.api.ts`. Unchanged to avoid artificial suppressions or rule weakening.

---

## 5. Missing Information Requiring Client Confirmation

The incoming engineer should request confirmation from the Illogre product and backend teams on the following items:

1. **Production Hosting Infrastructure**:
   * Will the application deploy as a Docker container using `output: "standalone"`, or onto Vercel / Netlify?
   * If Vercel is intended, should `vercel.json` be removed or adjusted to prevent dynamic route conflicts?
2. **CORS & Cookie Domain Scope**:
   * What are the exact production domains for the frontend (e.g., `app.tixolve.com`) and backend API (e.g., `api.tixolve.com`)?
   * Confirm that the backend `config/cors.php` sets `'supports_credentials' => true` and whitelists the frontend domain.
   * Confirm that session cookies specify `SameSite=None; Secure` (cross-domain) or `Domain=.tixolve.com` (subdomains).
3. **Google OAuth Production Client ID**:
   * What are the verified production Google Client IDs and authorized JavaScript origins for the deployment domains?
4. **Platform Branding Scope**:
   * The repository is named `illogry-frontend`, but internal package names, favicons, logos, PDF exports, and copy refer to **Tixolve**. Confirm if a white-label re-branding is scheduled.
5. **Testing Strategy**:
   * Preferred test framework (Vitest + React Testing Library vs Jest).
   * Target coverage goals for ticket triage and onboarding flows.

---

## 6. Prioritized Engineering Roadmap

A step-by-step roadmap for the incoming developer:

### Priority 1: Security & Correctness (Sprint 1)
- [ ] **Address ESLint Typing Errors**: Replace explicit `any` types in `src/hooks/*.api.ts` with typed contracts, enabling clean CI/CD runs with `npm run lint`.
- [ ] **Establish Unit Testing Setup**: Install `vitest`, `@testing-library/react`, and `@testing-library/user-event`. Create test suites for `authSlice`, `validator.ts`, and core form components.
- [ ] **Verify Production Environment Variables**: Ensure staging and production deployments have correct `NEXT_PUBLIC_BASE_URL` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` values injected.

### Priority 2: Performance & Architecture (Sprint 2)
- [ ] **Optimize Polling Strategy**: Replace 1-second polling on `useTickets` with a responsive WebSocket integration (e.g., Laravel Echo + Reverb) or an adaptive polling interval.
- [ ] **Consolidate Invitation Routes**: Add redirects in `next.config.ts` from `/accept-invitation` to `/auth/accept-invitation` and retire duplicate page components.
- [ ] **Evaluate Vercel Configuration**: Review `vercel.json` against deployment target requirements.

### Priority 3: Feature Polish & Maintainability (Sprint 3)
- [ ] **Inline Ticket Assignment**: If requested by product, add an inline assignment dropdown directly to `TicketsTable.tsx`.
- [ ] **Mount AI Automation Rules**: Connect the unmounted `ActionPermissions`, `AutomationRuleCard`, and `RuleEditor` components into `/ai_automation/page.tsx` if custom rule editing is required.
- [ ] **Resolve Branding Assets**: Align UI titles, metadata in `src/app/layout.tsx`, and asset filenames with client branding guidelines.
