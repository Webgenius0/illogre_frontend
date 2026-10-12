# Developer Handover Guide: Tixolve / Illogre

Handover document for the incoming in-house frontend engineer. Contains essential onboarding context, critical files to review, verified build diagnostics, discovered technical debt, unresolved limitations, and recommended next steps.

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

The codebase has undergone verification via CLI tooling:

- [x] **TypeScript Strict Type Check**: Executed `npx tsc --noEmit`. Completed with **0 errors**.
- [x] **Next.js Standalone Build**: Executed `npm run build`. Build succeeded in **6.9s** compilation + **7.0s** TypeScript checks, outputting 27 static pages and 6 dynamic server routes with standalone output (`.next/standalone`).
- [x] **Routing Map Verification**: All 33 routes verified to compile and map properly under the App Router hierarchy.
- [x] **No Secrets Exposed**: Confirmed that `.env` files contain development or placeholder values only. No production credentials or private keys are committed.
- [x] **No Dependencies Altered**: Package configurations, lockfiles, and source files remain unmodified.
- [!] **ESLint Compliance**: Executed `npm run lint`. Failed with exit code 1 (**184 errors, 96 warnings**). See details below.
- [!] **Automated Testing Suite**: No tests exist in `package.json` (`npm test` is unconfigured).

---

## 4. Known Issues & Discovered Technical Debt

During codebase inspection and build diagnostics, several key issues were identified:

### 1. High Volume of ESLint Strict Typing Errors
- **Issue**: Running `npm run lint` generates 280 problems (184 errors and 96 warnings).
- **Cause**: The flat ESLint 9 configuration (`eslint.config.mjs`) activates `@typescript-eslint/no-explicit-any`. Most API hooks (`src/hooks/*.api.ts`) use `any` in generic type parameters and response handlers.
- **Impact**: While `next build` bypasses these during production builds, any CI/CD pipeline enforcing `npm run lint` will fail.
- **Recommended Fix**: Define explicit TypeScript response interfaces for each domain endpoint (building upon `src/types/api.ts` and `src/lib/types/*`), and replace `any` across the API service layer.

### 2. Duplicate Invitation Acceptance Routes
- **Issue**: The codebase contains duplicate route pairs for handling invitations:
  * Team invites: `/accept-invitation` vs `/auth/accept-invitation`
  * Agent invites: `/accept-agent-invitation` vs `/auth/accept-agent-invitation`
- **Cause**: Created during an onboarding refactor without deprecating the original paths.
- **Recommended Fix**: Standardize on the `/auth/accept-*` routes and add redirect rules in `next.config.ts` from the root paths to prevent breaking legacy invitation email links.

### 3. Vercel Rewrite Wildcard in `vercel.json`
- **Issue**: `vercel.json` contains `rewrites: [{ source: "/:path*", destination: "/:path*.html" }]`.
- **Risk**: This wildcard rewrite to `*.html` is suited for static site exports, not dynamic Next.js App Router applications with server handlers (`/api/auth/google`, `/tickets/[id]`, `/customers/[id]`). If deploying to Vercel, this rewrite should be evaluated or removed.

### 4. Aggressive Polling Intervals on Tickets
- **Issue**: `useTickets` in `src/hooks/tickets.api.ts` sets `refreshInterval: 1000` (1-second polling).
- **Impact**: In a multi-agent environment with dozens of active tabs, 1-second polling creates significant HTTP load and server pressure on the Laravel backend.
- **Recommended Fix**: Upgrade ticket synchronization to WebSockets / Server-Sent Events (e.g. Laravel Reverb or Pusher) or increase the polling interval to 10-15 seconds.

### 5. Inconsistent Platform Branding
- **Issue**: The repository is named `illogry-frontend`, but internal package names, favicons, logos, and UI copy refer to **Tixolve** (`tixolve-next-frontend`, `tixolve_logo.ico`, `tixolve_access_user`).
- **Clarification**: Confirm with stakeholders whether this frontend is being re-branded or white-labeled under the Illogre identity.

---

## 5. Unresolved Limitations & Incomplete Features

The audit identified the following specific frontend limitations:

1. **Ticket Table Assignment**: `TicketsTable.tsx` displays the assigned agent's name (`ticket.assigned_user?.name || ticket.assigned || "Unassigned"`), but does **not** provide inline table reassignment. Reassigning a ticket requires clicking into the conversation detail view (`/tickets/[id]`).
2. **Incomplete Integration Channels**: On the `/integrations` page, only Gmail, SMTP, Outlook, WhatsApp, and Shopify open connection modals. Clicking Zendesk, Gorgias, Zoho, Klaviyo, Webhook, or Instagram triggers an informational toast: `"Integration coming soon"`.
3. **Admin Pricing Plan Management**: The frontend provides consumer plan browsing and checkout via Stripe (`/auth/register/plans`), but there is no administrator interface to create, update, or delete subscription tiers.
4. **Knowledge Base Retrieval Scope**: The frontend interacts with text-indexed document retrieval. Advanced vector database management, embedding model selection, or chunk partitioning configurations are handled server-side and are not directly configurable on the frontend.
5. **No Automated Testing**: There are no unit, integration, or end-to-end tests configured in the project.

---

## 6. Missing Information Requiring Client Confirmation

The incoming engineer should request confirmation from the Illogre product and backend teams on the following items:

1. **Target Production Hosting Infrastructure**:
   * Is the application deploying as a Docker container on AWS/Kubernetes using `output: "standalone"`, or onto Vercel / Netlify?
   * If Vercel is intended, should `vercel.json` be removed or adjusted?
2. **CORS & Cookie Domain Scope**:
   * What are the exact production domains for the frontend (e.g., `app.tixolve.com`) and backend API (e.g., `api.tixolve.com`)?
   * Confirm that the backend `config/cors.php` sets `'supports_credentials' => true` and whitelists the frontend domain.
   * Confirm that session cookies specify `SameSite=None; Secure` (cross-domain) or `Domain=.tixolve.com` (subdomains).
3. **Google OAuth Production Client ID**:
   * What are the verified production Google Client IDs and authorized JavaScript origins for the deployment domains?
4. **Testing Requirements & Strategy**:
   * What test runner does the engineering team prefer (Vitest + React Testing Library vs Jest)?
   * Target coverage goals for core triage flows and the onboarding wizard.

---

## 7. Recommended Next Steps for the Incoming Developer

Use this prioritized checklist to guide your first sprints:

### Phase 1: Stability & Pipeline Health (Sprint 1)
- [ ] **Address ESLint Typing Errors**: Work through `src/hooks/*.api.ts` to replace explicit `any` types with typed contracts, enabling clean CI/CD runs with `npm run lint`.
- [ ] **Establish Unit Testing Setup**: Install `vitest`, `@testing-library/react`, and `@testing-library/user-event`. Create test suites for `authSlice`, `validator.ts`, and core form components.
- [ ] **Verify Production Environment Variables**: Ensure staging and production deployments have correct `NEXT_PUBLIC_BASE_URL` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` values injected.

### Phase 2: Performance & Real-Time Enhancements (Sprint 2)
- [ ] **Optimize Polling Strategy**: Replace 1-second polling on `useTickets` with a responsive WebSocket integration (e.g., Laravel Echo + Reverb) or an adaptive polling interval.
- [ ] **Consolidate Invitation Routes**: Add redirects in `next.config.ts` from `/accept-invitation` to `/auth/accept-invitation` and retire duplicate page components.
- [ ] **Evaluate Vercel Configuration**: Review `vercel.json` against deployment target requirements.

### Phase 3: Feature Polish & Documentation Maintenance (Sprint 3)
- [ ] **Resolve Branding Assets**: Align UI titles, metadata in `src/app/layout.tsx`, and asset filenames with client branding guidelines.
- [ ] **Inline Ticket Assignment**: If desired by product, add an inline assignment dropdown directly to `TicketsTable.tsx`.
- [ ] **Component Storybook / Catalog**: Document complex custom primitives (e.g. `TicketChat`, `SourceDetailView`, `QuickSetupConfig`) for ongoing design system maintenance.
