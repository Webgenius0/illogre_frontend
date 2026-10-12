# Tixolve Frontend Application

Production customer support and AI helpdesk web interface for the **Tixolve** platform (repository: `illogry-frontend`).

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Redux Toolkit**, **TanStack Query**, and **Tailwind CSS v4**, communicating with a **Laravel REST API** using an HttpOnly-cookie-based authentication architecture.

---

## Technical Documentation Suite

Comprehensive technical documentation is maintained in the [`docs/`](./docs) directory:

| Document | Description |
| :--- | :--- |
| **[FRONTEND_OVERVIEW.md](./docs/FRONTEND_OVERVIEW.md)** | System overview, tech stack versions, lifecycle, role responsibilities, and architecture. |
| **[FRONTEND_AUTHENTICATION.md](./docs/FRONTEND_AUTHENTICATION.md)** | HttpOnly cookie session model, Google OAuth, route guards, error interception, and security boundaries. |
| **[FRONTEND_API_INTEGRATION.md](./docs/FRONTEND_API_INTEGRATION.md)** | Base URL resolution, dual Axios clients, CORS/credentials, role-prefixed endpoints, and API catalog. |
| **[FRONTEND_MODULES.md](./docs/FRONTEND_MODULES.md)** | Feature-by-feature reference across all 11 modules with verified implementation classifications. |
| **[FRONTEND_DEPLOYMENT.md](./docs/FRONTEND_DEPLOYMENT.md)** | Production topology (`app.tixolve.com`), containerization, standalone execution, and domain configurations. |
| **[FRONTEND_SETUP.md](./docs/FRONTEND_SETUP.md)** | Node.js 20+ prerequisites, environment variables, development scripts, and verified build output. |
| **[FRONTEND_HANDOVER.md](./docs/FRONTEND_HANDOVER.md)** | Practical handover guide for incoming developers, top files, known debt, and engineering roadmap. |
| **[FRONTEND_TROUBLESHOOTING.md](./docs/FRONTEND_TROUBLESHOOTING.md)** | Incident diagnostics for sessions, CORS, OAuth, remote images, build failures, and polling. |

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

## Environment & URL Mapping

| Environment | Frontend Host | Backend Host | Notes |
| :--- | :--- | :--- | :--- |
| **Local Development** | `http://localhost:3000` | `http://localhost:8000` | Standard developer setup |
| **Production Application** | `https://app.tixolve.com` | `https://api.tixolve.com` (API)<br>`https://admin.tixolve.com` (Admin Panel) | Live tenant application |

---

## Quick Start

### 1. Prerequisites
- **Node.js**: `>= 20.9.0` (LTS recommended)
- **Package Manager**: `npm >= 10.0.0` (uses `package-lock.json`)
- **Backend API**: Running Laravel API server (`http://localhost:8000` locally)

### 2. Installation
```bash
git clone <repository-url> illogry-frontend
cd illogry-frontend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Backend API Base URL (Do not append /api; Axios handles /api automatically)
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
| `build` | `npm run build` | Compiles production standalone bundle. | **PASSED** (0 errors, 11.2s Turbopack) |
| `start` | `npm run start` | Serves compiled production build locally. | Functional |
| `lint` | `npm run lint` | Runs ESLint 9 checks (`eslint.config.mjs`). | **FAILED** (279 problems: 183 errors, 96 warnings from `@typescript-eslint/no-explicit-any`) |
| `tsc` | `npx tsc --noEmit` | Runs full TypeScript type check. | **PASSED** (0 errors) |
| `test` | `npm test` | Automated unit/integration tests. | **Not Configured** (Missing test script) |

---

## Key Architectural Principles

1. **HttpOnly Cookie Authentication**:
   Authentication tokens (`tixolve_access_token`) are managed exclusively as server-side HttpOnly cookies with `Domain=.tixolve.com`. The browser transmits credentials automatically via `withCredentials: true`. Bearer tokens are completely absent from `localStorage`, `sessionStorage`, and Redux state.
2. **Server-Authoritative Route Protection**:
   `DashboardLayout` validates session authenticity against `GET /api/user` before unblocking protected routes. Client-side user metadata in `tixolve_access_user` provides optimistic UI rendering only and is never accepted as authoritative proof.
3. **Throttled Background Polling**:
   TanStack Query handles real-time revalidation with ticket queue polling set to 10 seconds and active ticket details set to 5 seconds. Polling automatically pauses when tabs are hidden (`refetchIntervalInBackground: false`) and resumes on focus.
4. **Narrowed Cross-Origin Opener Policy**:
   `next.config.ts` enforces `Cross-Origin-Opener-Policy: same-origin-allow-popups` to support Google OAuth popups while preserving browser-level cross-origin isolation.
5. **Role-Prefixed Endpoints**:
   API hooks inspect `user.role` from Redux and automatically prepend role routes (`/owner`, `/manager`, `/agent`, or `/shared`) to backend requests.
6. **AI Configuration Gatekeeper**:
   If an authenticated user has `is_ai_configured === false`, restricted modules (`/tickets`, `/customers`, `/ai_automation`, `/knowledge_base`) suppress page content and trigger a blocking configuration modal.


---

## License & Handover

This codebase is proprietary intellectual property of **Tixolve** / **Illogre**. For detailed technical handover context, refer to [docs/FRONTEND_HANDOVER.md](./docs/FRONTEND_HANDOVER.md).
