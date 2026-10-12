# Frontend Overview: Tixolve / Illogre

Technical documentation and developer handover guide for the Tixolve customer support AI platform frontend (repository: `illogry-frontend`).

---

## 1. Project Purpose & Scope

**Tixolve** is an enterprise-grade AI-powered customer support and helpdesk automation platform. The frontend provides a responsive, high-performance web interface designed for three primary personas:

1. **Workspace Owner**: Oversees team operations, subscribes to billing tiers, manages global AI confidence thresholds, integrates third-party channels (Shopify, Gmail, Outlook, Slack, WhatsApp, etc.), and configures workspace security.
2. **Support Manager**: Oversees support agents, inspects team metrics, tunes automation zones, reviews customer directories, and trains knowledge base sources.
3. **Support Agent**: Handles daily customer ticket triage, conducts customer conversations, reviews AI-generated response drafts, and logs internal notes.

The frontend is architected as a Next.js App Router Single Page Application with client-side hydration, communicating with a RESTful backend API (Laravel) using an HttpOnly-cookie-based authentication architecture.

---

## 2. Verified Technology Stack

All technology versions have been verified directly from `package.json` and active lockfiles in the repository:

| Layer / Concern | Technology | Verified Version | Purpose & Notes |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js | `16.2.2` | App Router architecture with Turbopack bundler and standalone output (`output: "standalone"`). |
| **Runtime & Core** | React / React DOM | `19.2.4` | Modern React with Server and Client Components (`"use client"`). |
| **Language** | TypeScript | `^5.0.0` | Strict type-checking (`strict: true`) with `@/*` path mapping. |
| **Styling** | Tailwind CSS | `v4.0.0` (`@tailwindcss/postcss`) | CSS-first Tailwind configuration via `@import "tailwindcss"` and `@theme inline` in `globals.css`. |
| **CSS Animations** | `tw-animate-css` | `^1.4.0` | Tailwind CSS animation extensions for smooth UI transitions. |
| **UI Component System** | Base UI / Shadcn CLI | `@base-ui/react ^1.3.0`, Shadcn `^4.1.2` | Headless primitives styled with Tailwind and OKLCH color tokens. |
| **Icons** | Lucide React | `^1.7.0` | Iconography throughout headers, tables, badges, and modals. |
| **State Management** | Redux Toolkit | `^2.11.2` (`react-redux ^9.2.0`) | Client-side user profile hydration, session state, and UI flags. |
| **Server State & Caching**| TanStack React Query | `^5.99.2` | Server state fetching, automatic polling, caching, and mutation lifecycle. |
| **Data Tables** | TanStack React Table | `^8.21.3` | Headless table management for customer, ticket, and team member grids. |
| **Rich Text Editor** | Tiptap Editor Suite | `^3.26.1` | Embedded WYSIWYG editor for ticket replies and internal team notes (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder`). |
| **Data Visualization** | Recharts | `^3.8.1` | Ticket volume bar charts, AI resolution rate metrics, and category analytics. |
| **Forms & Validation** | React Hook Form | `^7.72.1` | Controlled form inputs with custom validator utilities (`src/utils/validator.ts`). |
| **Toasts & Feedback** | Sonner | `^2.0.7` | Toast notifications for errors, mutation feedback, and network warnings. |
| **Social Authentication**| `@react-oauth/google` | `^0.13.5` | Google Identity Services OAuth provider and sign-in components. |
| **HTTP Client** | Axios | `^1.15.1` | Dual instance architecture (`axiosPublic` and `axiosPrivate`) with `withCredentials: true`. |
| **Export Utilities** | jsPDF & html2canvas | jsPDF `^4.2.1`, html2canvas `^1.4.1` | PDF export capability for analytics reports and invoice generation. |
| **Code Quality** | ESLint | `^9.0.0` (`eslint-config-next 16.2.2`) | Flat ESLint configuration (`eslint.config.mjs`) for TypeScript and Next.js Core Web Vitals. |

---

## 3. Frontend Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js 16 (App Router)                         │
├──────────────────────────────────┬─────────────────────────────────────┤
│      Public / Guest Routes       │        Protected Route Group        │
│  - /auth/login                   │           /(dashboard)              │
│  - /auth/register/*              │  - / (Overview)     - /customers    │
│  - /auth/forgot_password         │  - /tickets         - /analytics    │
│  - /accept-invitation/*          │  - /knowledge_base  - /integrations │
│  - /terms-and-conditions         │  - /ai_automation   - /settings     │
│  - /api/auth/google              │  - /team            - /billing      │
└─────────────────┬────────────────┴──────────────────┬──────────────────┘
                  │                                   │
                  ▼                                   ▼
┌──────────────────────────────────┐ ┌───────────────────────────────────┐
│     Global Application Shell     │ │        Dashboard Gatekeeper       │
│ - QueryProvider (TanStack Query) │ │ - Validates GET /api/user         │
│ - ReduxProvider (authSlice)      │ │ - Checks Subscription status      │
│ - GoogleOAuthProvider            │ │ - Checks is_ai_configured flag   │
│ - Toaster (Sonner)               │ │ - Role-based navigation filtering │
└─────────────────┬────────────────┘ └─────────────────┬─────────────────┘
                  │                                   │
                  ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Data Layer & API Clients                        │
│ - axiosPublic: Timeout 10s, withCredentials: true, 422 Laravel errors  │
│ - axiosPrivate: Timeout 30s, withCredentials: true, 401 redirect, 403  │
│ - useApiQuery / useApiMutation: Abstracted TanStack Query hooks        │
│ - Background Polling: Tickets (1s/5s), Notifications (30s)             │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Backend API (Laravel REST API)                     │
│        HttpOnly Cookie Sessions (tixolve_access_token)                 │
└────────────────────────────────────────────────────────────────────────┘
```

The frontend uses Next.js App Router with client-side hydration:

- **Root Layout (`src/app/layout.tsx`)**: Sets global fonts (`Urbanist` and `Geist`), mounts `QueryProvider`, `ReduxProvider`, and `Toaster`.
- **Proxy Middleware (`src/proxy.ts`)**: Follows Next.js 16 file conventions (`src/proxy.ts` / `Proxy (Middleware)`) to provide preliminary routing hints based on cookies.
- **Dashboard Layout Gatekeeper (`src/app/(dashboard)/layout.tsx`)**: The primary authorization boundary. Validates user sessions against `GET /api/user`, enforces subscription plan selection for unsubscribed owners, and renders a blocking `AiConfigModal` when AI configuration is incomplete.
- **Role-Based Views**: The application shell adjusts navigation, available actions, and API request prefixes dynamically based on whether the logged-in user is an `owner`, `Support Manager`, or `Support Agent`.

---

## 4. Application Lifecycle

1. **Bootstrap & Mount**:
   - `RootLayout` initializes Google Fonts (`Urbanist` and `Geist`).
   - `ReduxProvider` mounts, initializes the Redux store, and runs `injectStore(store)` into the Axios private instance.
   - If a valid `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is present, `GoogleOAuthProvider` wraps the tree.
   - Initial user metadata is hydrated from the non-sensitive browser cookie `tixolve_access_user` into Redux `authSlice`.

2. **Route Resolution**:
   - Next.js 16 proxy middleware (`src/proxy.ts`) inspects incoming requests. If a session token exists and the user hits `/auth/login` without callback/error queries, it suggests a redirect to `/`.
   - The user enters either the Public Auth tree (`/auth/*`) or the Protected Dashboard group (`/(dashboard)/*`).

3. **Authentication Verification**:
   - Upon entering `/(dashboard)`, `DashboardLayout` executes `useCurrentUser()` (`GET /api/user`).
   - If the request returns `401 Unauthorized`, `axiosPrivate` triggers `logout()` and redirects the browser to `/auth/login?callbackUrl=...`.
   - If the user is authenticated, the returned profile syncs into Redux (`setUser`).
   - If the user is an `owner` but `is_subscribed === false`, they are redirected to `/auth/register/plans`.
   - If the user navigates to restricted routes (`/tickets`, `/customers`, `/ai_automation`, `/knowledge_base`) and `is_ai_configured === false`, content rendering is suppressed and `AiConfigModal` displays.

4. **Continuous Synchronization**:
   - Real-time ticket updates are simulated via background short-polling (1-second intervals for the ticket list, 5-second intervals for active ticket details).
   - Global notifications poll every 30 seconds (`/api/notifications`).

---

## 5. Communication with the Backend & Security Model

All communication between the frontend and backend conforms to the following security rules:

1. **Protocol & Transports**:
   - Standard RESTful HTTP/HTTPS requests over JSON (`Accept: application/json`, `Content-Type: application/json`).
   - File uploads (avatars, workspace logos, knowledge base documents) use `multipart/form-data`.
2. **HttpOnly Cookie Authentication**:
   - The primary authentication token (`tixolve_access_token`) is issued by the Laravel backend as an **HttpOnly cookie**.
   - Because the cookie is HttpOnly, frontend JavaScript **cannot read, manipulate, or clear it directly**.
   - Requests configure `withCredentials: true`, instructing the browser to attach the session cookie automatically on cross-origin requests.
   - **Logout**: Because client JavaScript cannot clear HttpOnly cookies, logout **must call the backend endpoint** (`POST /api/auth/logout`) so the server invalidates the session and sends an expired `Set-Cookie` header.
3. **Storage Security Verification**:
   - Authentication tokens are **completely absent** from `localStorage`, `sessionStorage`, client-readable cookies, and Redux state.
   - In `authSlice.ts`, `state.token` is explicitly set to `null`.
   - The only browser cookie written by frontend JavaScript is `tixolve_access_user`, which contains non-sensitive serialized user metadata (name, email, role) to avoid blank profile headers during initial mount.
4. **CORS & Domain Requirements**:
   - Enabling `withCredentials: true` on the frontend is necessary but **not sufficient** for security. The backend must configure:
     * `Access-Control-Allow-Credentials: true`
     * `Access-Control-Allow-Origin: <exact_frontend_origin>` (Wildcard `*` is rejected by browsers when credentials are included)
     * Cookies must specify `SameSite=None; Secure` (requiring HTTPS) when frontend and backend are hosted on different domains, or a shared root domain scope (e.g., `.tixolve.com`) for subdomains.
5. **Base URL Resolution Priority**:
   - Primary: `process.env.NEXT_PUBLIC_BASE_URL`
   - Production Fallback: `https://api.tixolve.com`
   - Local Fallback: `http://illogri-issue.test`
   - Target prefix: `${API_HOST}/api`
6. **Role-Based Endpoint Prefixing**:
   - The Laravel backend organizes routes by actor roles. The frontend dynamically prefixes endpoints according to `user.role`:
     * Owner routes: `/owner/...` (e.g. `/owner/dashboard/overview`, `/owner/settings`, `/owner/team`)
     * Manager routes: `/manager/...` (e.g. `/manager/agents`, `/manager/automations/settings`)
     * Agent routes: `/agent/...` (e.g. `/agent/customers`)
     * Shared routes: `/shared/...` (e.g. `/shared/tickets`)

---

## 6. Major Application Modules & Responsibilities

| Module | Route(s) | Primary Purpose | Key Components |
| :--- | :--- | :--- | :--- |
| **Authentication & Onboarding** | `/auth/login`<br>`/auth/register/*`<br>`/auth/forgot_password`<br>`/auth/callback` | Registration, 6-digit OTP verification, plan selection, Google OAuth, and password recovery. | `LoginForm`, `RegisterForm`, `EmailVerification`, `ForgotPasswordFlow`, `GoogleSignInButton` |
| **Invitations** | `/accept-invitation/*`<br>`/auth/accept-agent-invitation` | Team member and support agent invitation verification and one-click account activation. | `AcceptInvitationPage`, `AcceptAgentInvitationPage` |
| **Dashboard Overview** | `/` | Executive metrics, ticket volume charts, AI resolution rates, and recent tickets table. | `StatsOverview`, `TicketVolumeChart`, `ResolutionRateChart`, `RecentTicketsTable` |
| **Tickets / Helpdesk** | `/tickets`<br>`/tickets/[id]` | Real-time ticket management, customer chat, AI sentiment & intent analysis, draft approvals, and ticket assignment. | `TicketsTable`, `TicketHeader`, `TicketChat`, `TicketAIAnalysis`, `TicketCustomerInfo` |
| **Knowledge Base** | `/knowledge_base`<br>`/knowledge_base/[id]` | Training document ingestion (PDF, TXT), category management (Policies, FAQs), re-indexing, and interactive text-indexed query testing. | `ArticleTable`, `SourceCard`, `AddSourceModal`, `EditSourceModal`, `SourceDetailView` |
| **AI Automation** | `/ai_automation` | Threshold tuning for human-led vs. AI-assisted automation modes (Copilot, Autonomous), confidence zone controls. | `QuickSetupConfig`, `AutomationRuleCard`, `ActionPermissions`, `RuleEditor` |
| **Customer Directory** | `/customers`<br>`/customers/[id]` | Searchable customer directory with lifetime spend, tickets, and customer profile editing. | `CustomerTable`, `CustomerDetailsView`, `AddEditCustomerModal`, `DeleteCustomerModal` |
| **Analytics** | `/analytics` | Operational analytics, accuracy trends, resolution comparisons, category distribution breakdowns, and Tixolve-branded PDF report export. | `AnalyticsCards`, `AccuracyTrendChart`, `ResolutionComparison`, `CategoryDistribution` |
| **Integrations** | `/integrations` | External channel management: Shopify store connection, email sync (Gmail, Outlook, custom IMAP), manual mailbox sync, Slack, WhatsApp. | `IntegrationCard`, `ShopifyConnectModal`, `ConnectIntegrationModal`, `ShopifyProcessingModal` |
| **Team Management** | `/team` | Workspace member roster, role assignment (`Support Manager`, `Support Agent`), invites, and access revocation. | `TeamTable`, `TeamStats`, `InviteMemberModal`, `EditMemberModal`, `DeleteMemberModal` |
| **Billing & Plans** | `/billing` | Active subscription details, payment method overview, usage metrics, invoice PDF generation, cancel/resume auto-renewal, and Stripe portal redirect. | `ActiveSubscriptionCard`, `BillingHistory`, `PlanCard`, `UsageCard` |
| **Settings** | `/settings` | General profile, workspace branding, AI model settings, notification preferences, security/password update, and Google OAuth credentials config. | `GeneralTab`, `WorkspaceTab`, `AISettingsTab`, `NotificationsTab`, `SecurityTab`, `GoogleAuthSettingsCard` |
