# Frontend Modules Guide: Tixolve / Illogre

Module-by-module reference detailing UI components, routing, data sources, API dependencies, business rules, feature implementation statuses, and source file locations.

---

## 1. Feature Implementation Status Matrix

Every major module and sub-feature in the Tixolve frontend has been audited against actual source code and classified using the standard 6-tier readiness taxonomy:

1. **Implemented and code-verified**: Complete end-to-end integration with working UI, custom hooks, and active backend API calls.
2. **Partially implemented**: Core functionality exists, but specific workflows (such as inline table editing or component mounting) are incomplete.
3. **UI only / backend integration unverified**: User interface exists, but is currently commented out, disabled, or lacks an active API hook.
4. **Coming soon / placeholder**: Explicitly stubbed in code with user-facing "Coming soon" toasts or placeholder cards.
5. **Not implemented**: Feature is absent from the frontend codebase.
6. **Requires external credentials or infrastructure**: Code implementation is complete, but relies on third-party service configuration (Google OAuth, Shopify Partner App, Stripe Portal).

### Comprehensive Status Audit

| Module / Feature | Route / Component | Verified Status | Evidence & Code References |
| :--- | :--- | :---: | :--- |
| **Email/Password Login** | `/auth/login` | **1. Implemented and code-verified** | `LoginForm.tsx`, `useLogin`, `POST /api/auth/login`. |
| **Multi-Step Registration** | `/auth/register/*` | **1. Implemented and code-verified** | `RegisterForm.tsx`, `useRegister`, `POST /api/auth/register`. |
| **6-Digit Email OTP Verification** | `/auth/register/email_verification` | **1. Implemented and code-verified** | `EmailVerification.tsx`, `useRegisterEmailVerification`, `POST /api/auth/register/verify-otp`. Exactly 6 digits with auto-advancing inputs. |
| **OTP Resend (60s Cooldown & 429)** | `/auth/register/email_verification` | **1. Implemented and code-verified** | `useRegisterResendOtp`, `POST /api/auth/resend-otp`. 60s client timer and 429 rate limit error handling. |
| **3-Step Password Reset Flow** | `/auth/forgot_password` | **1. Implemented and code-verified** | `ForgotPasswordFlow.tsx`, `useForgotPassword`, `useVerifyOtp`, `useResetPassword`. |
| **Google OAuth Social Sign-In** | `/auth/login`, `/auth/callback` | **6. Requires external credentials or infrastructure** | `api/auth/google/route.ts`, `@react-oauth/google`, `useSocialLogin` (`POST /api/social-login`). Requires valid Google Client ID in `.env`. |
| **Session Termination (Logout)** | Global Header / Sidebar | **1. Implemented and code-verified** | `LogoutModal.tsx`, `useLogout`, `POST /api/auth/logout`. Clears Redux state, query cache, and triggers backend cookie invalidation. |
| **User Profile Hydration** | `DashboardLayout` | **1. Implemented and code-verified** | `useCurrentUser`, `GET /api/user`. Validates session and syncs Redux `setUser`. |
| **Overview KPI Cards** | `/` | **1. Implemented and code-verified** | `StatsOverview.tsx`, `useOwnerOverview`, `GET /api/owner/dashboard/overview`. |
| **Overview Charts (Volume & Resolution)** | `/` | **1. Implemented and code-verified** | `TicketVolumeChart.tsx`, `ResolutionRateChart.tsx` (Recharts). |
| **Overview Date Range Selector** | `/` | **3. UI only / backend integration unverified** | `<Select defaultValue="7days">` in `src/app/(dashboard)/page.tsx` (lines 34–42) is currently commented out in JSX. |
| **Ticket Queue with Search & Filters** | `/tickets` | **1. Implemented and code-verified** | `TicketsTable.tsx`, `useTickets`, `GET /api/shared/tickets`. Polled every 1000ms. |
| **Ticket Reassignment (Detail View)** | `/tickets/[id]` | **1. Implemented and code-verified** | `TicketHeader.tsx`, `useAssignTicket`, `PATCH /api/shared/tickets/{id}/assign`. Supports `assigned_user_id` and named assignee. |
| **Ticket Reassignment (Inline Table)** | `/tickets` | **5. Not implemented** | `TicketsTable.tsx` provides read-only display (`ticket.assigned_user?.name || ticket.assigned || "Unassigned"`); reassignment requires opening the ticket detail view. |
| **Conversation Chat & Tiptap Editor**| `/tickets/[id]` | **1. Implemented and code-verified** | `TicketChat.tsx`, Tiptap WYSIWYG editor. Supports public replies (`POST .../reply`) and internal notes (`POST .../internal-notes`). |
| **AI Sentiment & Intent Analysis** | `/tickets/[id]` | **1. Implemented and code-verified** | `TicketAIAnalysis.tsx`. Displays confidence, sentiment, intent, and suggested answer. |
| **1-Click Approve AI Suggestion** | `/tickets/[id]` | **1. Implemented and code-verified** | `handleApproveSuggested` in `TicketDetailsPage`. Switches mode to public and populates Tiptap editor. |
| **Customer Shopify Context in Ticket** | `/tickets/[id]` | **1. Implemented and code-verified** | `TicketCustomerInfo.tsx`. Displays customer profile and recent orders. |
| **Customer Directory CRUD** | `/customers`, `/customers/[id]` | **1. Implemented and code-verified** | `CustomerTable.tsx`, `CustomerDetailsView.tsx`, `AddEditCustomerModal.tsx`, `useCustomers`, `useCreateCustomer`, `useUpdateCustomer`, `useDeleteCustomer`. |
| **Knowledge Base Document Ingestion** | `/knowledge_base` | **1. Implemented and code-verified** | `AddSourceModal.tsx`, `useAddKnowledgeSource` (`POST /api/{prefix}/knowledge-base`, multipart/form-data). |
| **Text-Indexed Document Retrieval** | `/knowledge_base/[id]` | **1. Implemented and code-verified** | `SourceDetailView.tsx`, `ArticleTable.tsx`, `useKnowledgeBaseDetails`. Chunks and indexing progress displayed. |
| **Interactive Test Query Console** | `/knowledge_base/[id]` | **1. Implemented and code-verified** | `SourceDetailView.tsx`, `useTestKnowledgeQuery` (`POST .../test-query`). Displays AI response, latency, model, and index status. |
| **Vector DB / Embedding Pipeline** | N/A | **5. Not implemented** | The frontend treats retrieval strictly as text-indexed; vector database configuration and embedding generation are backend-managed. |
| **AI Mode & Threshold Sliders** | `/ai_automation` | **1. Implemented and code-verified** | `QuickSetupConfig.tsx`, `useAutomationSettings`, `useSaveAutomationSettings`. Configures Copilot/Autonomous modes and confidence zones. |
| **Custom Rule Editor & Permissions** | `/ai_automation` | **2. Partially implemented** | `ActionPermissions.tsx`, `AutomationRuleCard.tsx`, `RuleEditor.tsx` exist as components, but are not mounted in `/ai_automation/page.tsx` (only `QuickSetupConfig` is currently mounted). |
| **Manual Mailbox Synchronization** | `/integrations` | **1. Implemented and code-verified** | "Sync Inbound Mailbox" button in header calls `useFetchEmails` (`POST /api/owner/integrations/email/fetch`). |
| **Active Channel Integrations** | `/integrations` | **1. Implemented and code-verified** | `ConnectIntegrationModal.tsx`, `useConnectIntegration`. Working modals for Gmail, SMTP, Outlook, and WhatsApp. |
| **Shopify OAuth Integration** | `/integrations` | **6. Requires external credentials or infrastructure** | `ShopifyConnectModal.tsx`, `useConnectShopify` (`POST /api/owner/shopify/install`). Requires live Shopify Partner App credentials. |
| **Third-Party Helpdesk Integrations** | `/integrations` | **4. Coming soon / placeholder** | Zendesk, Gorgias, Zoho, Klaviyo, Webhooks, Instagram trigger `toast.info("Integration coming soon")`. |
| **Team Roster & Invitations** | `/team` | **1. Implemented and code-verified** | `TeamTable.tsx`, `InviteMemberModal.tsx`, `EditMemberModal.tsx`, `DeleteMemberModal.tsx`, `useTeamOverview`, `useInviteTeamMember`, `useUpdateTeamRole`, `useRemoveTeamMember`. |
| **Subscription Overview & Quotas** | `/billing` | **1. Implemented and code-verified** | `ActiveSubscriptionCard.tsx`, `UsageCard.tsx`, `useBillingOverview`. |
| **Stripe Billing Portal Redirect** | `/billing` | **6. Requires external credentials or infrastructure** | `useBillingPortal` (`POST /api/owner/billing/portal`). Requires configured Stripe customer portal on backend. |
| **Cancel / Resume Auto-Renewal** | `/billing` | **1. Implemented and code-verified** | `useCancelSubscription`, `useResumeSubscription`. |
| **Consumer Plan Selection & Checkout**| `/auth/register/plans` | **1. Implemented and code-verified** | `usePricingPlans`, `useCheckout` (`POST /api/auth/register/checkout`). |
| **Admin Pricing Plan CRUD** | N/A | **5. Not implemented** | No frontend UI or hooks exist to create, edit, or delete subscription tiers. |
| **Branded Analytics PDF Export** | `/analytics` | **1. Implemented and code-verified** | `handleExportPDF` in `AnalyticsPage`. Generates Tixolve-branded PDF report (`#cae555`). |
| **Branded Invoice PDF Export** | `/billing` | **1. Implemented and code-verified** | `generateInvoicePDF` in `BillingHistory.tsx`. Generates Tixolve-branded invoice PDF (`#B2E08A`). |
| **Workspace & Profile Settings** | `/settings` | **1. Implemented and code-verified** | `GeneralTab.tsx`, `WorkspaceTab.tsx`, `AISettingsTab.tsx`, `NotificationsTab.tsx`, `SecurityTab.tsx`, `GoogleAuthSettingsCard.tsx`. |

---

## 2. Executive Overview Module

### Purpose & Scope
Provides workspace owners with an executive summary of customer service operations, ticket inflow, AI automation resolution rates, and recently submitted tickets.

### Route & File Structure
- **Route**: `/`
- **Page File**: `src/app/(dashboard)/page.tsx`
- **Components**:
  * `StatsOverview.tsx` (`src/components/dashboard/StatsOverview.tsx`): Metric cards (Total Tickets, Open Tickets, AI Resolution Rate, Avg Response Time).
  * `TicketVolumeChart.tsx` (`src/components/dashboard/TicketVolumeChart.tsx`): Recharts bar chart showing daily ticket volume.
  * `ResolutionRateChart.tsx` (`src/components/dashboard/ResolutionRateChart.tsx`): Recharts area chart contrasting AI vs. Human resolution.
  * `RecentTicketsTable.tsx` (`src/components/dashboard/RecentTicketsTable.tsx`): Compact table of recent tickets with links to conversation details.

### Data Sources & API Dependencies
- **Hook**: `useOwnerOverview()` (`src/hooks/owner.api.ts`)
- **Query Key**: `["owner-overview"]`
- **Endpoint**: `GET /api/owner/dashboard/overview`

### Business Rules & UX Logic
- **Access Rule**: Accessible exclusively to users with `role === "owner"`. Support Managers and Agents are automatically routed to `/tickets`.
- **Loading State**: Displays skeleton placeholders while overview metrics load.
- **Empty States**: Renders placeholders when no tickets have been ingested yet.
- **Limitation**: The date range selector (`<Select defaultValue="7days">`) is commented out in JSX and does not currently filter overview data.

---

## 3. Tickets & Conversation Helpdesk Module

### Purpose & Scope
The core workspace triage engine. Enables support agents, managers, and owners to view incoming tickets across email and connected channels, inspect conversation histories, draft rich-text replies, log internal notes, approve AI suggested answers, and reassign tickets.

### Route & File Structure
- **Routes**:
  * `/tickets`: Ticket queue list.
  * `/tickets/[id]`: Multi-panel conversation triage and assignment interface.
- **Page Files**:
  * `src/app/(dashboard)/tickets/page.tsx`
  * `src/app/(dashboard)/tickets/[id]/page.tsx`
- **Components**:
  * `TicketsTable.tsx` (`src/components/TicketsComponents/TicketsTable.tsx`): TanStack Table with search, status filters (`All`, `Open`, `Pending`, `Resolved`, `Closed`), priority badges, pagination, and read-only assignee display (`ticket.assigned_user?.name || ticket.assigned || "Unassigned"`).
  * `TicketHeader.tsx` (`src/components/ticket/TicketHeader.tsx`): Header showing ticket ID, subject, SLA counter, interactive status dropdown, priority dropdown, and **interactive Assignee dropdown** supporting `assigned_user_id`.
  * `TicketChat.tsx` (`src/components/ticket/TicketChat.tsx`): Conversation stream displaying customer messages, AI drafts, agent replies, internal notes, and an embedded Tiptap WYSIWYG editor.
  * `TicketAIAnalysis.tsx` (`src/components/ticket/TicketAIAnalysis.tsx`): AI panel showcasing confidence scores, detected intent, sentiment analysis, and a 1-click **"Approve & Insert Reply"** button.
  * `TicketCustomerInfo.tsx` (`src/components/ticket/TicketCustomerInfo.tsx`): Contextual sidebar displaying customer profile, email, phone, lifetime value, and recent Shopify orders.

### Data Sources & API Dependencies
- **Hooks**:
  * `useTickets(params)` (`src/hooks/tickets.api.ts`) - Polled every `1000ms`.
  * `useTicketDetails(id)` (`src/hooks/tickets.api.ts`) - Polled every `5000ms`.
  * `useSendTicketReply(id)` (`src/hooks/tickets.api.ts`)
  * `useAddInternalNote(id)` (`src/hooks/tickets.api.ts`)
  * `useUpdateTicketStatus(id)` (`src/hooks/tickets.api.ts`)
  * `useAssignTicket(id)` (`src/hooks/tickets.api.ts`)
  * `useTeamOverview()` (`src/hooks/team.api.ts`) - Populates assignee choices in `TicketHeader`.
- **Query Keys**: `["shared-tickets", params]`, `["ticket-details", id]`
- **Endpoints**: `GET /api/shared/tickets`, `GET /api/shared/tickets/{id}`, `POST /api/shared/tickets/{id}/reply`, `POST /api/shared/tickets/{id}/internal-notes`, `PATCH /api/shared/tickets/{id}/status`, `PATCH /api/shared/tickets/{id}/assign`

### Business Rules & UX Logic
- **Ticket Assignment Workflow**:
  * Reassignment is executed from `TicketHeader.tsx` on the `/tickets/[id]` page.
  * The Assignee dropdown allows choosing:
    1. `"ai_agent"`: Sends `{ assigned_user_id: null, assigned: "AI Agent" }`.
    2. `"support_team"`: Sends `{ assigned_user_id: null, assigned: "Support Team" }`.
    3. Specific Team Member: Sends `{ assigned_user_id: Number(member.id), assigned: member.name }`.
  * The queue table (`TicketsTable.tsx`) displays the current assignee but does **not** provide inline table reassignment; users must open the ticket detail view.
- **AI Configuration Guard**: If `user.is_ai_configured === false`, viewing `/tickets` triggers the blocking `AiConfigModal`.
- **Public Reply vs. Internal Note**: The Tiptap composer includes a toggle switch (`public` vs `internal`). Public replies call `/reply` (triggering customer email delivery); internal notes call `/internal-notes` (visible only to team agents).
- **Suggested Response Approval**: Clicking "Approve & Insert" in `TicketAIAnalysis` switches the editor mode to `public` and populates the Tiptap editor with the AI draft for review before sending.
- **Short Polling**: Ticket queue and ticket detail views feature background polling (1s on queue, 5s on details) to simulate live chat updates.

---

## 4. Knowledge Base Module

### Purpose & Scope
Manages the documentation and policy data that powers the platform's AI answer generation. Allows owners and managers to upload documents (PDF, TXT) or paste raw text, view text-indexing status, trigger re-indexing, and interactively test queries against indexed document chunks.

### Route & File Structure
- **Routes**:
  * `/knowledge_base`: Source directory and summary metrics.
  * `/knowledge_base/[id]`: Document details, extracted chunks, and interactive test query console.
- **Page Files**:
  * `src/app/(dashboard)/knowledge_base/page.tsx`
  * `src/app/(dashboard)/knowledge_base/[id]/page.tsx`
- **Components**:
  * `SourceCard.tsx` (`src/components/knowledge-base/SourceCard.tsx`): Card displaying source type, article count, indexing status badge (`Indexed`, `Processing`, `Error`), and action menus.
  * `KnowledgeBaseStats.tsx` (`src/components/knowledge-base/KnowledgeBaseStats.tsx`): Overview metrics (Total Sources, Indexed Articles, Last Synced).
  * `AddSourceModal.tsx` (`src/components/knowledge-base/AddSourceModal.tsx`): Upload modal supporting file selection or direct text input with category selection (`Policies`, `FAQs`).
  * `EditSourceModal.tsx` (`src/components/knowledge-base/EditSourceModal.tsx`): Modal to edit source metadata, category, or replace content.
  * `SourceDetailView.tsx` (`src/components/knowledge-base/SourceDetailView.tsx`): Detail layout with extracted chunks table, indexing progress indicator, re-index action button, and an embedded test query console.
  * `ArticleTable.tsx` (`src/components/knowledge-base/ArticleTable.tsx`): Extracted chunk browser with search.

### Data Sources & API Dependencies
- **Hooks**:
  * `useKnowledgeBaseList()` (`src/hooks/knowledge-base.api.ts`)
  * `useKnowledgeBaseDetails(id)` (`src/hooks/knowledge-base.api.ts`)
  * `useAddKnowledgeSource()` (`src/hooks/knowledge-base.api.ts`)
  * `useUpdateKnowledgeSource(id)` (`src/hooks/knowledge-base.api.ts`)
  * `useDeleteKnowledgeSource(id)` (`src/hooks/knowledge-base.api.ts`)
  * `useReindexKnowledgeSource(id)` (`src/hooks/knowledge-base.api.ts`)
  * `useTestKnowledgeQuery(id)` (`src/hooks/knowledge-base.api.ts`)
- **Query Keys**: `["knowledge-base-list"]`, `["knowledge-base-details", id]`
- **Endpoints**: Role-prefixed: `GET /api/{prefix}/knowledge-base`, `POST /api/{prefix}/knowledge-base`, `POST /api/{prefix}/knowledge-base/{id}/reindex`, `POST /api/{prefix}/knowledge-base/{id}/test-query`.

### Business Rules & Retrieval Contract
- **Text-Indexed Retrieval**: Documents are ingested, processed, and text-indexed. In `SourceDetailView.tsx`, the system explicitly describes processing as: *"Documents are processed and text-indexed so the AI can retrieve relevant information when generating responses."*
- **Query Testing Contract**: Submitting a test query calls `POST /api/{prefix}/knowledge-base/{id}/test-query` and renders `apiTestResponse.ai_response` alongside response metadata (`sources_used.response_time`, `sources_used.model`, and `sources_used.embedding` which defaults to `"Text-Indexed"`).
- **Backend Responsibility**: Embedding pipelines, chunk vectorization, and vector store configurations are backend responsibilities; the frontend interacts purely with text-indexed status flags and query testing endpoints.
- **Role Restrictions**: Restricted to `owner` and `Support Manager`. Support Agents are blocked.

---

## 5. AI Automation Module

### Purpose & Scope
Allows administrators to calibrate AI confidence thresholds and select operational automation modes that control how autonomously AI responds to incoming customer inquiries.

### Route & File Structure
- **Route**: `/ai_automation`
- **Page File**: `src/app/(dashboard)/ai_automation/page.tsx`
- **Components**:
  * `QuickSetupConfig.tsx` (`src/components/automation/QuickSetupConfig.tsx`): Mode selection cards (`Copilot`, `Autonomous`) and slider controls for Human-Led (<60%), AI-Assisted (60-80%), and Fully Automated (>80%) confidence zones.
  * `AutomationRuleCard.tsx` (`src/components/automation/AutomationRuleCard.tsx`): Display cards for active automation rules (Component created, but unmounted in active page).
  * `ActionPermissions.tsx` (`src/components/automation/ActionPermissions.tsx`): Risk-level toggles (Unmounted in active page).
  * `RuleEditor.tsx` (`src/components/automation/RuleEditor.tsx`): Parameter condition builder (Unmounted in active page).

### Data Sources & API Dependencies
- **Hooks**:
  * `useAutomationSettings()` (`src/hooks/automation.api.ts`)
  * `useSaveAutomationSettings()` (`src/hooks/automation.api.ts`)
- **Query Key**: `["automation-settings"]`
- **Endpoints**: Role-prefixed: `GET /api/{prefix}/automations/settings`, `POST /api/{prefix}/automations/settings`.

### Business Rules & UX Logic
- **Mode Switching Logic**: Selecting a preset mode (`Copilot` vs `Autonomous`) automatically resets the slider thresholds based on the mode's defined default zones from the backend response.
- **Unsaved Changes Bar**: Adjusting slider thresholds reveals an action bar with "Cancel" and "Save Changes" buttons.
- **Implementation Status**: Only `QuickSetupConfig` is currently mounted on `/ai_automation/page.tsx`. Custom rule cards and action permissions components exist in `src/components/automation/` but are not rendered on the page.

---

## 6. Customer Management Module

### Purpose & Scope
Maintains a customer directory synchronized from e-commerce platforms (e.g. Shopify) and inbound ticket channels, allowing staff to view customer history, contact details, total lifetime spend, and edit contact information.

### Route & File Structure
- **Routes**:
  * `/customers`: Paginated customer directory table.
  * `/customers/[id]`: Individual customer profile, order history, and ticket log.
- **Page Files**:
  * `src/app/(dashboard)/customers/page.tsx`
  * `src/app/(dashboard)/customers/[id]/page.tsx`
- **Components**:
  * `CustomerTable.tsx` (`src/components/customers/CustomerTable.tsx`): TanStack Table with name search, total spend sorting, ticket count, and action menus.
  * `CustomerDetailsView.tsx` (`src/components/customers/CustomerDetailsView.tsx`): Detailed customer view with contact cards and associated ticket history.
  * `AddEditCustomerModal.tsx` (`src/components/customers/AddEditCustomerModal.tsx`): Modal form to create or update customer details.
  * `DeleteCustomerModal.tsx` (`src/components/customers/DeleteCustomerModal.tsx`): Confirmation dialog for customer deletion.

### Data Sources & API Dependencies
- **Hooks**:
  * `useCustomers(params)` (`src/hooks/customers.api.ts`)
  * `useCustomerDetails(id)` (`src/hooks/customers.api.ts`)
  * `useCreateCustomer()` (`src/hooks/customers.api.ts`)
  * `useUpdateCustomer(id)` (`src/hooks/customers.api.ts`)
  * `useDeleteCustomer(id)` (`src/hooks/customers.api.ts`)
- **Query Keys**: `["owner-customers", params]`, `["customer-details", id]`
- **Endpoints**: Role-prefixed: `GET /api/{prefix}/customers`, `POST /api/{prefix}/customers`, `PATCH /api/{prefix}/customers/{id}`, `DELETE /api/{prefix}/customers/{id}`.

---

## 7. Analytics & Reporting Module

### Purpose & Scope
Provides operational business intelligence regarding team performance, AI accuracy, resolution comparisons, and category distributions with date range filtering and client-side PDF export.

### Route & File Structure
- **Route**: `/analytics`
- **Page File**: `src/app/(dashboard)/analytics/page.tsx`
- **Components**:
  * `AnalyticsCards.tsx` (`src/components/analytics/AnalyticsCards.tsx`): Summary metrics (First Response Time, Resolution Time, CSAT Score, Deflection Rate).
  * `AccuracyTrendChart.tsx` (`src/components/analytics/AccuracyTrendChart.tsx`): Recharts line chart illustrating accuracy evolution over time.
  * `ResolutionComparison.tsx` (`src/components/analytics/ResolutionComparison.tsx`): Stacked bar chart comparing AI resolutions vs. agent escalations.
  * `CategoryDistribution.tsx` (`src/components/analytics/CategoryDistribution.tsx`): Donut/pie chart of ticket categories.
  * `TicketVolumeChart.tsx` (`src/components/analytics/TicketVolumeChart.tsx`): Volume intake chart.

### Data Sources & API Dependencies
- **Hook**: `useGetAnalytics(range)` (`src/hooks/analytics.api.ts`)
- **Query Key**: `["analytics", range]`
- **Endpoint**: `GET /api/owner/analytics?range={range}` (Defaults to `7days`, accepts `30days`, `90days`).

### Business Rules & PDF Branding
- **Tixolve-Branded PDF Generation**: Uses `jsPDF` to construct an operational PDF report. Embeds the **Tixolve** brand title (`Tixolve Analytics Report`), primary brand color (`#cae555`), date generated, and KPI metrics without requiring server rendering.
- **CSV Export**: Also supports direct CSV download of KPI rows and category distribution percentages.

---

## 8. Integrations Hub Module

### Purpose & Scope
Manages omnichannel connections feeding tickets into the platform, including e-commerce platforms (Shopify), email inboxes (Gmail, Outlook, custom IMAP/SMTP), and communication channels.

### Route & File Structure
- **Route**: `/integrations`
- **Page File**: `src/app/(dashboard)/integrations/page.tsx`
- **Components**:
  * `IntegrationCard.tsx` (`src/components/integrations/IntegrationCard.tsx`): Card for each channel showing connection status, account email/shop, and Connect/Disconnect actions.
  * `ShopifyConnectModal.tsx` (`src/components/integrations/ShopifyConnectModal.tsx`): Modal capturing `.myshopify.com` store domain to initiate OAuth handshake.
  * `ShopifyProcessingModal.tsx` (`src/components/integrations/ShopifyProcessingModal.tsx`): Animated feedback modal during installation.
  * `ConnectIntegrationModal.tsx` (`src/components/integrations/ConnectIntegrationModal.tsx`): Multi-channel modal for Email IMAP/SMTP credentials, Slack webhooks, WhatsApp API keys.

### Data Sources & API Dependencies
- **Hooks**:
  * `useIntegrations()` (`src/hooks/owner.api.ts`)
  * `useConnectShopify()` (`src/hooks/owner.api.ts`)
  * `useConnectIntegration()` (`src/hooks/owner.api.ts`)
  * `useDisconnectIntegration()` (`src/hooks/owner.api.ts`)
  * `useFetchEmails()` (`src/hooks/owner.api.ts`)
- **Query Key**: `["integrations"]`
- **Endpoints**: `GET /api/owner/integrations`, `POST /api/owner/shopify/install`, `POST /api/owner/integrations/connect`, `DELETE /api/owner/integrations/{id}`, `POST /api/owner/integrations/email/fetch`.

### Business Rules & Implementation Status
- **Active Channel Integrations**: Gmail, SMTP, Outlook, WhatsApp, and Shopify open connection modals.
- **Coming Soon Channels**: Zendesk, Gorgias, Zoho, Klaviyo, Webhook, and Instagram display an informational toast (`"Integration coming soon"`) rather than opening a connection flow.
- **Manual Mailbox Synchronization**: The header includes a **"Sync Inbound Mailbox"** button calling `useFetchEmails()` (`POST /api/owner/integrations/email/fetch`) with toast notifications confirming queue dispatch.

---

## 9. Team Management Module

### Purpose & Scope
Allows owners and managers to administer workspace staffing, invite new team members by email, adjust roles, and revoke member access.

### Route & File Structure
- **Route**: `/team`
- **Page File**: `src/app/(dashboard)/team/page.tsx`
- **Components**:
  * `TeamTable.tsx` (`src/components/team/TeamTable.tsx`): Member roster displaying name, email, role badge (`Support Manager`, `Support Agent`), status (`Active`, `Pending`), and action dropdowns.
  * `TeamStats.tsx` (`src/components/team/TeamStats.tsx`): Summary metrics (Total Staff, Active Agents, Open Invites).
  * `InviteMemberModal.tsx` (`src/components/team/InviteMemberModal.tsx`): Email invitation modal with role selection.
  * `EditMemberModal.tsx` (`src/components/team/EditMemberModal.tsx`): Role modification modal.
  * `DeleteMemberModal.tsx` (`src/components/team/DeleteMemberModal.tsx`): Access revocation dialog.

### Data Sources & API Dependencies
- **Hooks**:
  * `useTeamOverview()` (`src/hooks/team.api.ts`)
  * `useInviteTeamMember()` (`src/hooks/team.api.ts`)
  * `useUpdateTeamRole(id)` (`src/hooks/team.api.ts`)
  * `useRemoveTeamMember(id)` (`src/hooks/team.api.ts`)
- **Query Key**: `["team-overview"]`
- **Endpoints**: Owner targets `/api/owner/team/*`; Manager targets `/api/manager/agents/*`.

---

## 10. Billing & Subscription Module

### Purpose & Scope
Enables workspace owners to monitor subscription plans, review credit limits, track seat and ticket consumption, cancel or resume auto-renewal, and navigate to the Stripe Customer Portal.

### Route & File Structure
- **Route**: `/billing`
- **Page File**: `src/app/(dashboard)/billing/page.tsx`
- **Components**:
  * `ActiveSubscriptionCard.tsx` (`src/components/billing/ActiveSubscriptionCard.tsx`): Plan name, price, billing cycle, renewal status badge, cancel auto-renewal trigger, and Stripe portal button.
  * `UsageCard.tsx` (`src/components/billing/UsageCard.tsx`): Progress bars displaying ticket volume and team seat usage against plan quotas.
  * `BillingHistory.tsx` (`src/components/billing/BillingHistory.tsx`): Invoice table with client-side **Tixolve-branded PDF invoice download** (`generateInvoicePDF`).

### Data Sources & API Dependencies
- **Hooks**:
  * `useBillingOverview()` (`src/hooks/billing.api.ts`)
  * `useCancelSubscription()` (`src/hooks/billing.api.ts`)
  * `useResumeSubscription()` (`src/hooks/billing.api.ts`)
  * `useBillingPortal()` (`src/hooks/billing.api.ts`)
- **Query Key**: `["billing-overview"]`
- **Endpoints**: `GET /api/owner/billing/overview`, `POST /api/owner/billing/cancel`, `POST /api/owner/billing/resume`, `POST /api/owner/billing/portal`.

### Business Rules & Limitations
- **Consumer Plan Selection Only**: The frontend allows users to view pricing plans (`/pricing-plans`) and check out via Stripe (`/auth/register/checkout` or `/auth/register/plans`). There is **no in-app admin module** to create, edit, or delete pricing tiers; plan configuration is managed server-side.
- **Unsubscribed Owner Exemption**: The `/billing` route is explicitly exempted from the forced redirect to plan selection in `DashboardLayout`, allowing unsubscribed owners to view billing status.

---

## 11. Workspace Settings Module

### Purpose & Scope
Central control center for owner profile configuration, workspace details, AI defaults, security credentials, notification preferences, and Google OAuth credentials.

### Route & File Structure
- **Route**: `/settings`
- **Page File**: `src/app/(dashboard)/settings/page.tsx`
- **Components**:
  * `GeneralTab.tsx` (`src/components/settings/GeneralTab.tsx`): Personal name, email, phone number, and avatar upload.
  * `WorkspaceTab.tsx` (`src/components/settings/WorkspaceTab.tsx`): Workspace name, subdomain, business hours, and brand logo upload.
  * `AISettingsTab.tsx` (`src/components/settings/AISettingsTab.tsx`): AI engine selection, temperature slider, tone presets.
  * `NotificationsTab.tsx` (`src/components/settings/NotificationsTab.tsx`): Email alert toggles for ticket assignments and daily digests.
  * `SecurityTab.tsx` (`src/components/settings/SecurityTab.tsx`): Password change form with current password verification.
  * `GoogleAuthSettingsCard.tsx` (`src/components/settings/GoogleAuthSettingsCard.tsx`): Google OAuth Client ID, Secret, and Redirect URI setup with copy-to-clipboard helpers.

### Data Sources & API Dependencies
- **Hooks**:
  * `useSettings()` (`src/hooks/settings.api.ts`)
  * `useUpdateGeneralSettings()` (`src/hooks/settings.api.ts`)
  * `useUpdateWorkspaceSettings()` (`src/hooks/settings.api.ts`)
  * `useUpdateAiSettings()` (`src/hooks/settings.api.ts`)
  * `useUpdateNotificationSettings()` (`src/hooks/settings.api.ts`)
  * `useUpdateSecuritySettings()` (`src/hooks/settings.api.ts`)
  * `useGoogleAuthSettings()` (`src/hooks/settings.api.ts`)
  * `useUpdateGoogleAuthSettings()` (`src/hooks/settings.api.ts`)
- **Query Keys**: `["settings"]`, `["google-auth-settings"]`
- **Endpoints**: `GET /api/owner/settings`, `POST /api/owner/settings/*`, `PATCH /api/owner/settings/*`.

---

## 12. Authentication & Onboarding Module

### Purpose & Scope
Public entry points for user registration, multi-factor email OTP verification, subscription plan selection, session login, Google OAuth callbacks, and token-based invite acceptance.

### Route & File Structure
- **Routes**:
  * `/auth/login`: Email/password and Google Sign-In.
  * `/auth/register`: Step 1 account creation.
  * `/auth/register/email_verification`: 6-digit OTP verification.
  * `/auth/register/plans`: Subscription plan selection.
  * `/auth/register/registration_successfull`: Onboarding completion.
  * `/auth/forgot_password`: 3-stage password recovery.
  * `/auth/callback`: Google OAuth token/code exchange.
  * `/accept-invitation/*` & `/auth/accept-agent-invitation`: Invitation acceptance.
- **Components**:
  * `LoginForm.tsx` (`src/components/login/LoginForm.tsx`)
  * `RegisterForm.tsx` (`src/components/register/RegisterForm.tsx`)
  * `EmailVerification.tsx` (`src/components/register/EmailVerification.tsx`)
  * `ForgotPasswordFlow.tsx` (`src/components/forgot_password/ForgotPasswordFlow.tsx`)
  * `GoogleSignInButton.tsx` (`src/components/shared/GoogleSignInButton.tsx`)

### Business Rules & OTP Security
- **Strict 6-Digit OTP**: OTP inputs enforce exactly 6 numerical digits with individual auto-advancing input fields, paste extraction, and backspace navigation (`validator.ts`).
- **Resend Cooldown & Rate Limiting**: The resend action enforces a 60-second client-side cooldown timer. Backend 429 responses trigger explicit rate-limit alerts (*"Too many resend attempts. Please try again later."*).
- **No Mock OTP Output**: OTP codes are strictly dispatched via email by the backend; no developer-only debug OTP toasts exist in production code.
- **Callback URL Preservation**: Unauthenticated redirects preserve the target URL via `?callbackUrl=...`, which `useLogin` honors upon successful credential verification.
