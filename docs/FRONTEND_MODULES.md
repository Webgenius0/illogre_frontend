# Frontend Modules Guide: Tixolve / Illogre

Module-by-module reference detailing UI components, routing, data sources, API dependencies, business rules, and source file locations.

---

## 1. Executive Overview Module

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

---

## 2. Tickets & Conversation Helpdesk Module

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
  * `useTeamOverview()` (`src/hooks/team.api.ts`) - Used by `TicketHeader` to populate agent assignment choices.
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

## 3. Knowledge Base Module

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
- **Role Restrictions**: Restricted to `owner` and `Support Manager`. Support Agents are blocked.

---

## 4. AI Automation Module

### Purpose & Scope
Allows administrators to calibrate AI confidence thresholds and select operational automation modes that control how autonomously AI responds to incoming customer inquiries.

### Route & File Structure
- **Route**: `/ai_automation`
- **Page File**: `src/app/(dashboard)/ai_automation/page.tsx`
- **Components**:
  * `QuickSetupConfig.tsx` (`src/components/automation/QuickSetupConfig.tsx`): Mode selection cards (`Copilot`, `Autonomous`) and slider controls for Human-Led (<60%), AI-Assisted (60-80%), and Fully Automated (>80%) confidence zones.
  * `AutomationRuleCard.tsx` (`src/components/automation/AutomationRuleCard.tsx`): Display cards for active automation rules.
  * `ActionPermissions.tsx` (`src/components/automation/ActionPermissions.tsx`): Risk-level toggles (High, Medium, Low risk permissions).
  * `RuleEditor.tsx` (`src/components/automation/RuleEditor.tsx`): Parameter condition builder for custom triggers.

### Data Sources & API Dependencies
- **Hooks**:
  * `useAutomationSettings()` (`src/hooks/automation.api.ts`)
  * `useSaveAutomationSettings()` (`src/hooks/automation.api.ts`)
- **Query Key**: `["automation-settings"]`
- **Endpoints**: Role-prefixed: `GET /api/{prefix}/automations/settings`, `POST /api/{prefix}/automations/settings`.

### Business Rules & UX Logic
- **Mode Switching Logic**: Selecting a preset mode (`Copilot` vs `Autonomous`) automatically resets the slider thresholds based on the mode's defined default zones from the backend response.
- **Unsaved Changes Bar**: Adjusting slider thresholds reveals an action bar with "Cancel" and "Save Changes" buttons.

---

## 5. Customer Management Module

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

### Business Rules & UX Logic
- **Permissions**: Owners and Managers have full create/update/delete permissions; Support Agents have read-only access.

---

## 6. Analytics & Reporting Module

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

## 7. Integrations Hub Module

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

## 8. Team Management Module

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

## 9. Billing & Subscription Module

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

## 10. Workspace Settings Module

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

## 11. Authentication & Onboarding Module

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
