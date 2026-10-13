# Tixolve — Master Handover Documentation Index & Single Source of Truth

Welcome to the **Tixolve** platform repository handover index. This document serves as the master roadmap and single source of truth for engineering teams, DevOps operators, and client technical leads taking ownership of the Tixolve system.

---

## 1. System Overview & Architecture Boundary

Tixolve is a multi-tenant AI-assisted customer support and ticketing platform designed for e-commerce and SaaS operators.

```
+----------------------------------------------------------------------------------------------------+
|                                    TIXOLVE PLATFORM ECOSYSTEM                                      |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  [ Frontend Application ]                                                                          |
|  Next.js 16 (React 19, Turbopack, Redux Toolkit, Tailwind CSS v4)                                  |
|  - Production: https://app.tixolve.com                                                              |
|  - Local Dev:   http://localhost:3000                                                              |
|  - Auth State:  HttpOnly session cookie (`tixolve_access_token`) with Domain=.tixolve.com           |
|                                                                                                    |
|                                        |  (Credentials: true, CORS + CSRF Origin Guarded)         |
|                                        v                                                           |
|                                                                                                    |
|  [ Backend API & Administration ]                                                                  |
|  Laravel 12 (PHP 8.2+, Sanctum, Eloquent, MySQL/MariaDB, Redis/Database Queues)                    |
|  - Production: https://admin.tixolve.com (API base fallback: https://api.tixolve.com)               |
|  - Local Dev:   http://localhost:8000                                                              |
|  - Database:    MySQL 8.0+ / MariaDB 10.11+                                                         |
|                                                                                                    |
|          +-----------------------------+-------------------------------+                           |
|          |                             |                               |                           |
|          v                             v                               v                           |
|  [ External Inbound ]        [ Async Processing ]             [ External Gateways ]                |
|  - Gmail Pub/Sub Push        - Queue Worker:                  - OpenAI (Chat Completions)          |
|    `POST /api/webhooks/gmail`  `php artisan queue:work`       - Shopify Partner App                |
|  - Inbound Mail Webhook      - Scheduler Cron:                - Stripe Billing & Portal            |
|    `POST /api/webhooks/inbound-  `php artisan schedule:run`   - Resend Transactional Mail          |
|    email`                    - Mailbox Sync Lock: 120s                                             |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Reading Sequence for New Engineers & Client Handover

Follow this strict chronological reading order during onboarding:

| Step | Target Audience | Repository | Document | Core Focus |
|:---:|:---|:---|:---|:---|
| **1** | All Developers & Operators | Frontend | [HANDOVER_INDEX.md](file:///c:/Users/arifu/working-server/illogry-frontend/docs/HANDOVER_INDEX.md) | High-level system inventory and index (this document). |
| **2** | All Developers | Backend | [BACKEND_OVERVIEW.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_OVERVIEW.md)<br>[FRONTEND_OVERVIEW.md](file:///c:/Users/arifu/working-server/illogry-frontend/docs/FRONTEND_OVERVIEW.md) | Platform domain model, high-level business logic, and UI map. |
| **3** | Developers & DevOps | Backend & Frontend | [BACKEND_SETUP.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_SETUP.md)<br>[FRONTEND_SETUP.md](file:///c:/Users/arifu/working-server/illogry-frontend/docs/FRONTEND_SETUP.md) | Local environment prerequisites, composer/npm setup, and verified test execution. |
| **4** | Security & Backend Leads | Backend | [BACKEND_AUTHENTICATION_SECURITY.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_AUTHENTICATION_SECURITY.md) | HttpOnly cookie architecture, CSRF origins, SSRF mitigation, and webhook replay protection. |
| **5** | Frontend & API Engineers | Backend & Frontend | [BACKEND_API_REFERENCE.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_API_REFERENCE.md)<br>[FRONTEND_API_INTEGRATION.md](file:///c:/Users/arifu/working-server/illogry-frontend/docs/FRONTEND_API_INTEGRATION.md) | Endpoint catalog, payload contracts, error formats, and hook bindings. |
| **6** | Backend Engineers | Backend | [BACKEND_DATABASE.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_DATABASE.md)<br>[BACKEND_JOBS_SCHEDULER.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_JOBS_SCHEDULER.md) | 26 database migrations, indexes, scheduled commands, and mailbox concurrency locking. |
| **7** | Integration Leads | Backend | [BACKEND_INTEGRATIONS.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_INTEGRATIONS.md) | External provider setup: Google Cloud Pub/Sub, Shopify Partner, Stripe, OpenAI, Resend. |
| **8** | DevOps & Cloud Engineers | Backend & Frontend | [BACKEND_DEPLOYMENT.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_DEPLOYMENT.md)<br>[FRONTEND_DEPLOYMENT.md](file:///c:/Users/arifu/working-server/illogry-frontend/docs/FRONTEND_DEPLOYMENT.md) | Nginx reverse proxy, Certbot SSL, systemd queue daemons, Vercel/Node standalone runtime. |
| **9** | Technical Auditors | Backend | [BACKEND_REMEDIATION_STATUS.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_REMEDIATION_STATUS.md)<br>[REMEDIATION_REPORT.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/REMEDIATION_REPORT.md) | Detailed verification record of 15 security remediations and test suite baselines. |

---

## 3. Complete Documentation Inventory

### 3.1 Frontend Repository (`illogry-frontend`)

| File Name | Absolute Path | Topics Covered | Status |
|:---|:---|:---|:---:|
| `README.md` | [README.md](file:///c:/Users/arifu/working-server/illogry-frontend/README.md) | Next.js getting started, local scripts, Turbopack usage | Verified |
| `docs/HANDOVER_INDEX.md` | [HANDOVER_INDEX.md](file:///c:/Users/arifu/working-server/illogry-frontend/docs/HANDOVER_INDEX.md) | Master cross-repository handover index & single source of truth | **Newly Created** |
| `docs/FRONTEND_OVERVIEW.md` | [FRONTEND_OVERVIEW.md](file:///c:/Users/arifu/working-server/illogry-frontend/docs/FRONTEND_OVERVIEW.md) | Tech stack, module landscape, component directory map | Verified |
| `docs/FRONTEND_SETUP.md` | [FRONTEND_SETUP.md](file:///c:/Users/arifu/working-server/illogry-frontend/docs/FRONTEND_SETUP.md) | Node 18/20 prerequisites, `.env` file variables, Turbopack run | Verified |
| `docs/FRONTEND_ARCHITECTURE.md` | [FRONTEND_ARCHITECTURE.md](file:///c:/Users/arifu/working-server/illogry-frontend/docs/FRONTEND_ARCHITECTURE.md) | Architecture layers, Redux store, cookie auth interception | Verified |
| `docs/FRONTEND_AUTHENTICATION.md`| [FRONTEND_AUTHENTICATION.md](file:///c:/Users/arifu/working-server/illogry-frontend/docs/FRONTEND_AUTHENTICATION.md) | Cookie flow, 401 handling, redirect rules, public route guards | Verified |
| `docs/FRONTEND_API_INTEGRATION.md`| [FRONTEND_API_INTEGRATION.md](file:///c:/Users/arifu/working-server/illogry-frontend/docs/FRONTEND_API_INTEGRATION.md) | REST endpoint catalog, payload structures, TanStack query hooks | Verified |
| `docs/FRONTEND_MODULES.md` | [FRONTEND_MODULES.md](file:///c:/Users/arifu/working-server/illogry-frontend/docs/FRONTEND_MODULES.md) | Feature-by-feature deep dive (Tickets, KB, Settings, Team) | Verified |
| `docs/FRONTEND_DEPLOYMENT.md` | [FRONTEND_DEPLOYMENT.md](file:///c:/Users/arifu/working-server/illogry-frontend/docs/FRONTEND_DEPLOYMENT.md) | Production build, standalone Docker/Vercel setup, SSL headers | Verified |
| `docs/FRONTEND_TROUBLESHOOTING.md`| [FRONTEND_TROUBLESHOOTING.md](file:///c:/Users/arifu/working-server/illogry-frontend/docs/FRONTEND_TROUBLESHOOTING.md) | CORS errors, cookie isolation gotchas, hydration issues | Verified |
| `docs/FRONTEND_HANDOVER.md` | [FRONTEND_HANDOVER.md](file:///c:/Users/arifu/working-server/illogry-frontend/docs/FRONTEND_HANDOVER.md) | Frontend checklist, verified build baseline, backlog | Verified |

### 3.2 Backend Repository (`illogry_backend-main`)

| File Name | Absolute Path | Topics Covered | Status |
|:---|:---|:---|:---:|
| `README.md` | [README.md](file:///c:/Users/arifu/working-server/illogry_backend-main/README.md) | Laravel architecture, core commands, environment flags | Verified |
| `docs/BACKEND_OVERVIEW.md` | [BACKEND_OVERVIEW.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_OVERVIEW.md) | Clean Architecture layers, controllers, services, repositories | Verified |
| `docs/BACKEND_SETUP.md` | [BACKEND_SETUP.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_SETUP.md) | PHP 8.2+, MariaDB/MySQL setup, seed commands, test baseline (121 tests) | Verified (Reconciled) |
| `docs/BACKEND_ARCHITECTURE.md` | [BACKEND_ARCHITECTURE.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_ARCHITECTURE.md) | Multi-tenant scoping, request lifecycle, service container | Verified |
| `docs/BACKEND_AUTHENTICATION_SECURITY.md` | [BACKEND_AUTHENTICATION_SECURITY.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_AUTHENTICATION_SECURITY.md) | Sanctum cookies, CSRF origin middleware, SSRF safeguards, secrets encryption | Verified |
| `docs/BACKEND_BUSINESS_LOGIC.md` | [BACKEND_BUSINESS_LOGIC.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_BUSINESS_LOGIC.md) | Ticketing workflows, AI draft generation, email threading | Verified |
| `docs/BACKEND_DATABASE.md` | [BACKEND_DATABASE.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_DATABASE.md) | 26 migrations, schema relationships, indexing strategy | Verified |
| `docs/BACKEND_API_REFERENCE.md` | [BACKEND_API_REFERENCE.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_API_REFERENCE.md) | Exhaustive REST API reference across 170 registered routes | Verified |
| `docs/BACKEND_INTEGRATIONS.md` | [BACKEND_INTEGRATIONS.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_INTEGRATIONS.md) | Google Cloud Pub/Sub, Shopify OAuth & Webhooks, Stripe, OpenAI, Resend | Verified |
| `docs/BACKEND_JOBS_SCHEDULER.md` | [BACKEND_JOBS_SCHEDULER.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_JOBS_SCHEDULER.md) | Queue workers, scheduler crons, cache locks for IMAP fetch | Verified |
| `docs/BACKEND_DEPLOYMENT.md` | [BACKEND_DEPLOYMENT.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_DEPLOYMENT.md) | Ubuntu/Nginx deployment, supervisor worker, server hardening checklist | Verified |
| `docs/BACKEND_REMEDIATION_STATUS.md`| [BACKEND_REMEDIATION_STATUS.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_REMEDIATION_STATUS.md) | Security vulnerability audit status matrix (SEC-01 to SEC-15) | Verified |
| `docs/REMEDIATION_REPORT.md` | [REMEDIATION_REPORT.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/REMEDIATION_REPORT.md) | Comprehensive engineering audit report with diffs & test evidence | Verified |
| `docs/BACKEND_HANDOVER.md` | [BACKEND_HANDOVER.md](file:///c:/Users/arifu/working-server/illogry_backend-main/docs/BACKEND_HANDOVER.md) | Handover sign-off checklist, verified test baselines, ops runbook | Verified |

---

## 4. Environment & URL Standard Reference

| Environment | Frontend Application URL | Backend API & Admin URL | Domain Scope / Host Cookie |
|:---|:---|:---|:---|
| **Local Development** | `http://localhost:3000` | `http://localhost:8000` | Host-only (no domain attribute, HTTP supported) |
| **Staging / Testing Tunnel** | Tunnel URL (e.g. ngrok / cloudflared) | Tunnel URL | Matches tunnel host |
| **Production Target** | `https://app.tixolve.com` | `https://admin.tixolve.com`<br>*(API host alias: `https://api.tixolve.com`)* | `AUTH_COOKIE_DOMAIN=.tixolve.com`<br>`AUTH_COOKIE_SECURE=true`<br>`SameSite=Lax` |

> [!IMPORTANT]
> **Production Domain Alignment Note**:
> The backend supports `https://app.tixolve.com`, `https://admin.tixolve.com`, and `https://api.tixolve.com` across CORS and CSRF trusted origins. In production, ensure DNS routes `app.tixolve.com` to the frontend and `admin.tixolve.com` / `api.tixolve.com` to the Laravel API reverse proxy.

---

## 5. Feature Status & Verification Matrix

| Module / Feature | Verified Status | Evidence in Codebase / Runtime |
|:---|:---:|:---|
| **Authentication (Cookie Session)** | `Implemented — Test Verified` | 15 Pest tests in `HttpOnlyCookieAuthTest`, 23 tests in `ProductionAuthSecurityTest`. |
| **OTP Verification & Throttling** | `Implemented — Code Inspected, Runtime Not Verified` | Length: 6 digits; Expiry: 15 min; Attempts: 5 per 15-min window via `RateLimiter`. |
| **Inbound Email Webhook** | `Implemented — Test Verified` | 7 tests in `InboundEmailWebhookTest` (`X-Webhook-Secret`, 300s timestamp drift, 15-min cache replay lock). |
| **Gmail Pub/Sub Push Webhook** | `Implemented — Test Verified` | 8 tests in `GmailWebhookTest` (token verification, Google OIDC JWT validation, 15-min idempotency lock). |
| **Ticket Email Threading** | `Implemented — Test Verified` | 3 tests in `TicketEmailThreadingTest` (`In-Reply-To`, `References`, Subject `[#TIC-...]`). |
| **Ticket Assignment (Relational)** | `Implemented — Test Verified` | Migration `add_assigned_user_id_to_tickets_table`, 1 test in `TicketAssignmentSecurityTest`. |
| **Knowledge Base (Text Retrieval)** | `Implemented — Code Inspected, Runtime Not Verified` | SQL text search via `name` and `content` LIKE match; chunks concatenated for GPT prompt. **No vector database or embeddings exist**. |
| **AI Suggested Replies** | `Partially Implemented` | `TicketAiController@generateSuggestedReply` returns a placeholder template string; `OpenAIService` integration exists but is simulated on this endpoint. |
| **Automation Rules & SLA Controllers** | `Not Implemented` | `AutomationRuleController` and `SlaPolicyController` are empty controller skeletons. |
| **AI Automation Settings** | `Implemented — Code Inspected, Runtime Not Verified` | `AiAutomationSettingController` handles supervised/copilot/autopilot threshold settings. |
| **Temporary Shopify Test Routes** | `Partially Implemented (Dev Only)` | `TestIntegrationController` exists for testing Shopify customer listing; not wired into SPA frontend. |
| **Stripe Billing Integration** | `Blocked — External Configuration Required` | Stripe webhook handling implemented; requires live webhook secret and configured Stripe pricing IDs. |
| **Google OAuth Integration** | `Blocked — External Configuration Required` | Endpoints implemented; requires registered Google Cloud OAuth Client ID, Secret, and Redirect URI. |
| **IMAP Email Polling Scalability** | `Implemented — Test Verified` | Scalable per-mailbox jobs (`FetchSingleAccountEmailJob`) with 120s atomic cache locks (`ImapPollingScalabilityTest`). |

---

## 6. Known Limitations & Technical Debt

1. **AI Suggested Reply Generation**:
   - `TicketAiController@generateSuggestedReply` generates a static string (`"Hello {$ticket->customer_name}, this is an updated AI-generated response..."`). To enable real OpenAI generation on agent tickets, wire `OpenAIService::generateTicketReply()` into this action.
2. **Knowledge Base Storage Model**:
   - Knowledge retrieval operates strictly via database text search (`like %query%`) and chunk text concatenation passed to OpenAI prompt context. Vector embeddings (pgvector, Pinecone, or Qdrant) are not installed.
3. **Skeleton Controllers**:
   - `AutomationRuleController` and `SlaPolicyController` contain blank CRUD methods. Custom workflow automation rules and SLA deadline timers must be fully implemented if required by business logic.
4. **Historical Ticket Data Backfill**:
   - Tickets created prior to migration `2026_09_26_000001` store the assignee name as a string (`assigned`). The non-destructive data migration matches names to existing user IDs; any non-matching historical tickets remain `assigned_user_id = NULL`.
5. **Frontend Linting Baseline**:
   - TypeScript compilation (`npx tsc --noEmit`) passes with 0 errors. Next.js production build (`npm run build`) compiles cleanly (28 static pages, 6 dynamic routes). However, `npm run lint` reports 183 `@typescript-eslint/no-explicit-any` errors and 96 unused variable warnings across custom hooks.

---

## 7. Operational Readiness & Client Handover Runbook

Prior to opening public traffic to production:

- [ ] **Infrastructure Hardening**: Verify MySQL listens exclusively on `127.0.0.1:3306`.
- [ ] **DNS Mapping**: Map `app.tixolve.com` to Next.js frontend and `admin.tixolve.com` / `api.tixolve.com` to Laravel reverse proxy.
- [ ] **SSL Certificates**: Issue Let's Encrypt certificates via Certbot for all subdomains.
- [ ] **Environment Configuration**: Set `AUTH_COOKIE_DOMAIN=.tixolve.com`, `AUTH_COOKIE_SECURE=true`, and `SESSION_SECURE_COOKIE=true` in backend `.env`.
- [ ] **Credential Rotation**: Generate fresh `APP_KEY`, Stripe API keys, OpenAI API tokens, and Resend credentials. Ensure no development keys remain active.
- [ ] **Queue Daemons**: Configure supervisor or systemd unit to maintain `php artisan queue:work --tries=3 --timeout=120`.
- [ ] **Scheduler Daemon**: Configure system cron `* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1`.
- [ ] **External Provider Webhooks**:
  - Point Google Cloud Pub/Sub push subscription to `https://admin.tixolve.com/api/webhooks/gmail`.
  - Point Inbound Email provider to `https://admin.tixolve.com/api/webhooks/inbound-email` with header `X-Webhook-Secret`.
  - Point Stripe dashboard webhooks to `https://admin.tixolve.com/api/webhooks/stripe`.
