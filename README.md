# Tixolve Frontend Application

Production customer support and AI helpdesk web interface for the **Tixolve** platform (repository: `illogry-frontend`).

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Redux Toolkit**, **TanStack Query**, and **Tailwind CSS v4**, communicating with a **Laravel REST API** using an HttpOnly-cookie-based authentication architecture.

---

## Technical Documentation Suite

Comprehensive technical documentation is maintained in the [`docs/`](./docs) directory:

| Document | Description |
| :--- | :--- |
| **[FRONTEND_OVERVIEW.md](./docs/FRONTEND_OVERVIEW.md)** | System overview, verified tech stack versions, application lifecycle, role responsibilities, and backend communication. |
| **[FRONTEND_ARCHITECTURE.md](./docs/FRONTEND_ARCHITECTURE.md)** | Architecture diagrams, Next.js 16 `proxy.ts`, HttpOnly cookie session model, routing guards, and state management. |
| **[FRONTEND_SETUP.md](./docs/FRONTEND_SETUP.md)** | Node.js 20+ prerequisites, environment variables, development/build scripts, verified test/lint results, and standalone Docker deployment. |
| **[FRONTEND_API_INTEGRATION.md](./docs/FRONTEND_API_INTEGRATION.md)** | Base URL resolution, dual Axios clients, interceptor pipeline, role-prefixed endpoints (`/owner`, `/manager`, `/agent`, `/shared`), and endpoint catalog. |
| **[FRONTEND_MODULES.md](./docs/FRONTEND_MODULES.md)** | Module-by-module reference across all 11 domains (Overview, Tickets, Knowledge Base, Automation, Customers, Analytics, Integrations, Team, Billing, Settings, Onboarding). |
| **[FRONTEND_HANDOVER.md](./docs/FRONTEND_HANDOVER.md)** | Handover guide for incoming developers, top 10 files to review, technical debt audit, unresolved limitations, and phased engineering roadmap. |

---

## Tech Stack Overview

- **Framework**: Next.js `16.2.2` (App Router, Turbopack, `output: "standalone"`)
- **Core Runtime**: React `19.2.4` & React DOM `19.2.4`
- **Language**: TypeScript `^5.0.0`
- **Styling**: Tailwind CSS `v4.0.0` (`@tailwindcss/postcss`), `tw-animate-css ^1.4.0`
- **UI Primitives**: Base UI (`@base-ui/react ^1.3.0`), Shadcn CLI `^4.1.2`, Lucide React `^1.7.0`
- **State Management**: Redux Toolkit `^2.11.2`, React-Redux `^9.2.0`
- **Server Cache & Polling**: TanStack React Query `^5.99.2`
- **Tables**: TanStack React Table `^8.21.3`
- **Rich Text Editor**: Tiptap Editor Suite `^3.26.1`
- **Charts & Visualizations**: Recharts `^3.8.1`
- **Toasts**: Sonner `^2.0.7`
- **HTTP Client**: Axios `^1.15.1` (`withCredentials: true`)
- **OAuth**: `@react-oauth/google ^0.13.5`
- **PDF Export**: jsPDF `^4.2.1`

---

## Quick Start

### 1. Prerequisites
- **Node.js**: `>= 20.9.0` (LTS recommended)
- **Package Manager**: `npm >= 10.0.0` (uses `package-lock.json`)
- **Backend API**: Running Laravel API server (local or tunnel)

### 2. Installation
```bash
git clone <repository-url> illogry-frontend
cd illogry-frontend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Backend API Base URL (Do not append /api; the client handles /api automatically)
NEXT_PUBLIC_BASE_URL=http://localhost:8000

# Optional: Google OAuth 2.0 Web Client ID
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Available Scripts

| Script | Command | Purpose | Verified Status |
| :--- | :--- | :--- | :---: |
| `dev` | `npm run dev` | Starts Next.js development server with Turbopack. | Functional |
| `build` | `npm run build` | Compiles production standalone bundle. | **PASSED** (0 errors) |
| `start` | `npm run start` | Serves compiled production build locally. | Functional |
| `lint` | `npm run lint` | Runs ESLint 9 checks (`eslint.config.mjs`). | **FAILED** (280 issues, mostly `@typescript-eslint/no-explicit-any`) |
| `tsc` | `npx tsc --noEmit` | Runs full TypeScript type check. | **PASSED** (0 errors) |

---

## Key Architectural Principles

1. **HttpOnly Cookie Authentication**:
   Authentication tokens (`tixolve_access_token`) are issued and stored as server-side HttpOnly cookies. The browser transmits cookies automatically on cross-origin requests via `withCredentials: true`. Client-side JavaScript cannot read or clear the token directly; formal logout must call `POST /api/auth/logout`.
2. **Client State vs. Server State**:
   Redux Toolkit manages client authentication state and hydrates non-sensitive user metadata from the `tixolve_access_user` cookie. TanStack Query manages all server data caching, revalidation, and background polling (1-second ticket queue, 5-second active ticket, 30-second notifications).
3. **Role-Prefixed Endpoints**:
   API hooks inspect `user.role` from Redux and automatically prepend role routes (`/owner`, `/manager`, `/agent`, or `/shared`) to backend requests.
4. **AI Configuration Gatekeeper**:
   If an authenticated user has `is_ai_configured === false`, restricted modules (`/tickets`, `/customers`, `/ai_automation`, `/knowledge_base`) suppress page content and trigger a blocking configuration modal.

---

## License & Handover

This codebase is proprietary intellectual property of **Tixolve** / **Illogre**. For detailed technical handover context, refer to [docs/FRONTEND_HANDOVER.md](./docs/FRONTEND_HANDOVER.md).
