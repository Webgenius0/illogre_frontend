# Frontend Setup & Developer Guide: Tixolve / Illogre

Complete local environment setup, build instructions, environment variable configurations, and deployment guidelines for incoming engineers.

---

## 1. Prerequisites

Before setting up the project locally, verify that your development environment meets the following requirements:

| Dependency | Required Version | Verification Command | Notes |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 20.9.0` (LTS recommended) | `node -v` | Next.js 16 and React 19 require Node 20+. |
| **Package Manager** | `npm >= 10.0.0` | `npm -v` | Project uses `package-lock.json`. Do not mix with yarn/pnpm unless converting lockfiles. |
| **Git** | `>= 2.30.0` | `git --version` | Standard version control. |
| **Backend API** | Compatible Laravel API | N/A | Local Laravel instance (e.g. `http://localhost:8000` or local domain). |

---

## 2. Installation Commands

Clone the repository and install dependencies using `npm`:

```bash
# 1. Clone repository
git clone <repository-url> illogry-frontend
cd illogry-frontend

# 2. Clean install dependencies matching package-lock.json
npm install
```

---

## 3. Environment Configuration

### API Base URL Resolution Priority
The application resolves the backend API host in `src/hooks/axios/useAxiosPublic.tsx` and `useAxiosPrivate.tsx` following this exact priority order:

1. `process.env.NEXT_PUBLIC_BASE_URL` (Always takes precedence if defined)
2. `https://api.tixolve.com` (Default when `process.env.NODE_ENV === "production"`)
3. `http://illogri-issue.test` (Default when running in local development mode)

The target request URL is constructed as `${API_HOST}/api`.

### Environment Variables Reference

| Variable Name | Required | Default / Fallback | Purpose |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_BASE_URL` | **Yes** | Dev: `http://illogri-issue.test`<br>Prod: `https://api.tixolve.com` | Base URL of the backend Laravel API host (without `/api` suffix). |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Optional | `undefined` | Google OAuth Web Client ID obtained from Google Cloud Console. |
| `NEXT_PUBLIC_GOOGLE_REDIRECT_URI`| Optional | `${origin}/auth/callback` | Authorized redirect URI configured in Google Cloud OAuth credentials. |

### Safe `.env.example` Template

Create a local `.env` file in the project root based on this template:

```env
# =====================================================================
# Tixolve Frontend - Environment Variables Template
# =====================================================================

# Backend API Host (Do NOT append /api; the HTTP client attaches /api automatically)
# Local development example:
NEXT_PUBLIC_BASE_URL=http://localhost:8000

# Production example:
# NEXT_PUBLIC_BASE_URL=https://api.yourdomain.com

# Google OAuth 2.0 Credentials (Optional, from Google Cloud Console)
# Format: <client-id>.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# Google OAuth Authorized Redirect URI
# Local: http://localhost:3000/auth/callback
# Production: https://app.yourdomain.com/auth/callback
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
```

> [!CAUTION]
> Never commit real production secrets, API keys, or live credentials to version control. The repository `.gitignore` includes `.env*` overrides.

---

## 4. Development & Build Scripts

All commands are defined in `package.json`:

```bash
# Start local development server with Turbopack (http://localhost:3000)
npm run dev

# Run full TypeScript type check without emitting files
npx tsc --noEmit

# Run ESLint validation
npm run lint

# Run production build (compiles standalone server and static pages)
npm run build

# Start the production build locally (after running build)
npm run start
```

---

## 5. Verified Command Execution Results

Actual CLI checks executed in this repository:

| Command | Status | Verified Result & Diagnostic Findings |
| :--- | :---: | :--- |
| `npx tsc --noEmit` | **PASSED** | 0 errors. TypeScript compiler completed cleanly with strict mode enabled. |
| `npm run build` | **PASSED** | Compiled successfully with Turbopack in 6.9s. TypeScript checks finished in 7.0s. Generated 27 static pages and 6 dynamic server routes. Next.js 16 standalone bundle generated successfully. |
| `npm run lint` | **FAILED** | Exit code 1: **280 problems (184 errors, 96 warnings)**. The majority of failures stem from `@typescript-eslint/no-explicit-any` across API service hooks and minor unused variables. |
| `npm test` | **N/A** | **No test script exists** in `package.json`. No automated test suite is installed. |

---

## 6. Common Setup & Build Problems

### 1. Cross-Origin Cookie Session Failures
- **Symptom**: Login succeeds, but dashboard views redirect immediately back to `/auth/login`.
- **Root Cause**: The backend sets an HttpOnly cookie that is rejected by the browser due to CORS origin mismatch or missing credentials header.
- **Solution**:
  1. Backend `config/cors.php` must set `'supports_credentials' => true`.
  2. Backend `config/cors.php` must explicitly whitelist the frontend origin (e.g., `http://localhost:3000`). Wildcard `*` is disallowed when credentials are true.
  3. When frontend and backend use different domains, backend session cookies must specify `SameSite=None; Secure`, requiring HTTPS.

### 2. ESLint Blocking CI/CD Pipelines
- **Symptom**: CI pipelines running `npm run lint` fail with exit code 1.
- **Root Cause**: The repository enforces `@typescript-eslint/no-explicit-any`. Many API response handlers and mutation options currently use `any`.
- **Solution**: `npm run build` runs Next.js build and TypeScript compilation successfully without blocking on ESLint. For CI, progressively replace `any` in `src/hooks/*.api.ts` with typed interfaces.

### 3. Google Sign-In Error: "missing_client_id"
- **Symptom**: Visiting Google login redirects to `/auth/callback?error=missing_client_id`.
- **Root Cause**: `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is unset, empty, or set to placeholder string `"your_client_id_here"`.
- **Solution**: Provide a valid Google Client ID containing `.apps.googleusercontent.com` in your `.env` file.

---

## 7. Production Deployment Process

### Standalone Deployment (Docker / Node Server)
The repository is configured with `output: "standalone"` in `next.config.ts`. This produces a standalone server in `.next/standalone/server.js`:

1. **Build Artifact Generation**:
   ```bash
   npm run build
   ```
2. **Output Structure**:
   - The standalone server is generated at `.next/standalone/server.js`.
   - Static assets reside in `.next/static` and `public/`.
3. **Deployment Dockerfile Pattern**:
   ```dockerfile
   FROM node:20-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV=production
   ENV PORT=3000

   COPY .next/standalone ./
   COPY .next/static ./.next/static
   COPY public ./public

   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

### Vercel Deployment Considerations
The repository contains a `vercel.json` file:
```json
{
  "rewrites": [{ "source": "/:path*", "destination": "/:path*.html" }]
}
```
> [!WARNING]
> This wildcard rewrite to `*.html` is suited for static site exports, not dynamic Next.js App Router applications with server handlers (`/api/auth/google`, `/tickets/[id]`, `/customers/[id]`). When deploying to Vercel with standard App Router architecture, evaluate or remove this rewrite to avoid routing conflicts.
