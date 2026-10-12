# Tixolve Frontend — Production Deployment & Infrastructure Guide

**Target Application**: `tixolve-app`  
**Intended Production Hostname**: `https://app.tixolve.com`  
**Production Backend Hosts**: `https://api.tixolve.com` / `https://admin.tixolve.com`  
**Node.js Runtime**: Node.js 20 LTS / 22 LTS  
**Framework**: Next.js 16.2.2 (App Router with Standalone Output)

---

## 1. Deployment Architecture Overview

The repository is configured for containerized or standalone Node.js server deployment via `output: "standalone"` in `next.config.ts`.

### Topology & Domain Mapping

```
                                  ┌─────────────────────────────┐
                                  │       Cloudflare / DNS      │
                                  └──────────────┬──────────────┘
                                                 │
                   ┌─────────────────────────────┴─────────────────────────────┐
                   ▼                                                           ▼
    ┌─────────────────────────────┐                             ┌─────────────────────────────┐
    │     app.tixolve.com         │                             │     admin.tixolve.com /     │
    │  Next.js 16 Tenant Frontend │                             │       api.tixolve.com       │
    │   (Node.js / PM2 / Docker)  │                             │     Laravel 11 Backend      │
    └──────────────┬──────────────┘                             └──────────────┬──────────────┘
                   │                                                           │
                   │               HTTPS + Credentials (CORS)                  │
                   └───────────────────────────────────────────────────────────┘
                                Cookie: Domain=.tixolve.com; HttpOnly
```

### Environment URL Matrix

| Environment | Frontend URL | Backend API URL | Primary Purpose |
|---|---|---|---|
| **Local Development** | `http://localhost:3000` | `http://localhost:8000` | Local developer workspace |
| **Local Staging** | `http://localhost:3000` | `http://illogri-issue.test` | Legacy local virtual host |
| **Production Application** | `https://app.tixolve.com` | `https://api.tixolve.com` (API)<br>`https://admin.tixolve.com` (Admin Panel) | Live tenant-facing portal |

> [!IMPORTANT]
> The URLs listed above represent intended production configurations based on codebase references and client documentation. They must be verified against live infrastructure before production cutover.

---

## 2. Environment Variables Specification

The frontend requires the following environment variables injected at build and run time:

| Variable Name | Required | Default / Example Value | Description |
|---|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | **Yes** | `https://api.tixolve.com` | Base URL of the backend Laravel API (without trailing `/api`). |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Optional | `your-id.apps.googleusercontent.com` | Google Cloud OAuth 2.0 Web Client ID. Required for Google sign-in. |
| `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` | Optional | `https://app.tixolve.com/auth/callback` | OAuth redirect URI configured in Google Console. |
| `NEXT_PUBLIC_ENABLE_NGROK_WARNING_SKIP` | No | `false` | Development-only flag to inject ngrok skip header during tunnel testing. |
| `PORT` | No | `3000` | Port for the standalone Node.js server process. |
| `NODE_ENV` | **Yes** | `production` | Node runtime mode. |

---

## 3. Production Build & Execution

### Option A: Standalone Node.js / PM2 (Recommended)

Next.js 16 compiles a self-contained runtime into `.next/standalone/`, tracing only necessary `node_modules` and files.

1. **Build the Application**:
   ```bash
   npm ci
   npm run build
   ```

2. **Prepare Static Assets**:
   Next.js standalone server requires static assets copied alongside the server entry point:
   ```bash
   cp -r public .next/standalone/
   cp -r .next/static .next/standalone/.next/
   ```

3. **Start the Process**:
   ```bash
   cd .next/standalone
   PORT=3000 node server.js
   ```

4. **PM2 Ecosystem Configuration (`ecosystem.config.js`)**:
   ```javascript
   module.exports = {
     apps: [
       {
         name: "tixolve-frontend",
         script: "./.next/standalone/server.js",
         instances: "max",
         exec_mode: "cluster",
         env: {
           PORT: 3000,
           NODE_ENV: "production",
           NEXT_PUBLIC_BASE_URL: "https://api.tixolve.com",
         },
       },
     ],
   };
   ```

---

### Option B: Docker Container Deployment

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 4. Hosting & Routing Considerations

### Vercel Deployment Conflict (`vercel.json`)
The repository contains a `vercel.json` file with:
```json
{
  "rewrites": [{ "source": "/:path*", "destination": "/:path*.html" }]
}
```
> [!WARNING]
> This rewrite rule is designed for static HTML single-page applications. In Next.js App Router, it breaks dynamic server routes (`/tickets/[id]`, `/customers/[id]`, `/api/auth/google`).
> - **Recommendation**: If deploying to a standalone Linux VM, Docker, or CloudPanel, `vercel.json` is ignored by the Node runtime. If deploying to Vercel, remove or disable `vercel.json`.

---

## 5. Security & Network Prerequisites

Before launching the frontend in production, verify the following network prerequisites:

### 1. SSL / TLS Termination
- Both `app.tixolve.com` and `api.tixolve.com` must have valid SSL certificates.
- Browser security policies block `Secure` cookies over unencrypted HTTP.

### 2. Cross-Subdomain Cookie Configuration
- In Laravel `config/session.php` and `config/auth.php`, confirm the cookie domain is set to:
  ```php
  'domain' => '.tixolve.com',
  ```
- This ensures the `tixolve_access_token` cookie set by `api.tixolve.com` is automatically sent by the browser to `app.tixolve.com`.

### 3. Cross-Origin Resource Sharing (CORS)
- In Laravel `config/cors.php`, confirm:
  ```php
  'paths' => ['api/*', 'sanctum/csrf-cookie'],
  'allowed_origins' => ['https://app.tixolve.com'],
  'supports_credentials' => true,
  ```

### 4. Next.js Image Optimization Domains
- In `next.config.ts`, `remotePatterns` allows loading profile images and attachments from:
  * `https://app.tixolve.com/**`
  * `https://admin.tixolve.com/**`
  * `https://api.tixolve.com/**`

### 5. Google OAuth Cloud Console
- In Google Cloud Console APIs & Services:
  * **Authorized JavaScript origins**: `https://app.tixolve.com`
  * **Authorized redirect URIs**: `https://app.tixolve.com/auth/callback`

---

## 6. Rollback & Emergency Procedures

1. **Rollback Strategy**:
   * Maintain the previous `.next/standalone` directory as a standby backup.
   * In container deployments, roll back the Docker image tag to the last known stable release.
2. **Health Check Endpoint**:
   * Verify HTTP 200 response on `GET https://app.tixolve.com/auth/login`.
   * Verify API connectivity by checking `GET https://api.tixolve.com/api/user` returns 401 Unauthorized (confirming endpoint is reachable and rejecting unauthenticated calls).
