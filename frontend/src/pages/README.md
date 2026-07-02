# Page Components Reference

This directory contains the main views and dashboard panels of the application, rendering specific business modules for analysts, SMEs, and administrators.

---

## 1. [Login.tsx](file:///d:/Raghul/FactEntry/frontend/src/pages/Login.tsx)
The gateway interface of the workstation portal.
* **Functionality**: Collects user email/password, validates them against backend JWT auth filters, saves the token to LocalStorage, and redirects to the landing page.
* **Security Info**: Restricts access and alerts users that session activities are monitored.

---

## 2. [Dashboard.tsx](file:///d:/Raghul/FactEntry/frontend/src/pages/Dashboard.tsx)
A centralized analytical console presenting summaries and query data visualizations.
* **Metrics Cards**: Dynamic displays of counts for Total, Open, In Progress, Resolved, and Critical queries.
* **Data Visualization Charts**:
  - *Status Distribution*: Doughnut chart mapping the relative load of cases by their resolution state.
  - *Monthly Query Volume*: Area/Line chart demonstrating seasonal workload fluctuations.
  - *Flag Distribution*: Bar chart categorizing active labels and tags.
* **Recent Cases Table**: Quick search and direct navigation links to newly logged query detailed panels.

---

## 3. [QueryList.tsx](file:///d:/Raghul/FactEntry/frontend/src/pages/QueryList.tsx)
The master data grid containing all query logs.
* **Search & Filters**: Allows filtering queries by Subject/Details search string, Status selection, Assigned SME ID, Creator ID, or Criticality flag.
* **Pagination**: Interactive table pagination fetching pages on-demand from the backend server to keep memory footprints low.

---

## 4. [QueryDetails.tsx](file:///d:/Raghul/FactEntry/frontend/src/pages/QueryDetails.tsx)
The central working panel for query collaboration, assignment, and formal resolutions.
* **Case Info Details**: Renders subject, detailed inquiries, reference URL hyperlinks, and raising expert identities.
* **SME Control Panel**:
  - Allows assignment updates to specific SMEs (role-restricted to SMEs and Admins).
  - Checkbox to update the **Critical Urgency Flag** status.
  - Controls to add/modify tags (e.g. `TEAM_CLARIFICATION`, `KNOWLEDGE_SHARING`, `TRAINING_REQUIRED`).
* **Resolution Thread**:
  - Allows posting normal discussion comments or official "Resolution" statements.
  - Shows clear markings on resolution posts to highlight answers.
* **Case File Attachments**:
  - File uploader accepting files up to 20MB.
  - Lists uploaded files with direct download or deletion options.

---

## 5. [CreateQuery.tsx](file:///d:/Raghul/FactEntry/frontend/src/pages/CreateQuery.tsx)
Form for raising new issues and verification requests.
* **Form Inputs**: Subject, Reference URLs, and full Inquiry Description details.
* **Critical Flag**: A styled checkbox marking high-priority tasks.
* **Duplicate Detection System**:
  - Upon clicking "Submit", the page sends the inputs to `/api/queries/duplicate-check`.
  - If existing queries match with a similarity score threshold exceeding `15%`, a warning dialog displays similar cases, preventing duplication. The analyst can view previous cases or choose "Submit Anyway".

---

## 6. [Reports.tsx](file:///d:/Raghul/FactEntry/frontend/src/pages/Reports.tsx)
An exports panel for creating audit deliverables or executive spreadsheets.
* **Data Filtering**: Date range selectors, assignee filters, and status filters.
* **Live Preview**: Dynamically updates a local preview grid of rows matching selected criteria.
* **Export Integrations**: Downloader invoking backend services to pull **Excel (.xlsx)** sheets or **PDF** documents directly.

---

## 7. [UserManagement.tsx](file:///d:/Raghul/FactEntry/frontend/src/pages/UserManagement.tsx)
Administrative controls for personnel access (role-restricted to **Admin**).
* **Grid**: Lists all users with names, email addresses, roles, and creation timestamps.
* **Actions**: Edit names, emails, roles, reset passwords, or delete users completely.

---

## 8. [AuditLogs.tsx](file:///d:/Raghul/FactEntry/frontend/src/pages/AuditLogs.tsx)
System auditing telemetry (role-restricted to **Admin**).
* **Grid**: Lists paginated, chronological database transactions.
* **Log Details**: Captures the exact field changed, its old value, the new value, the actor responsible, and the date/time of the event.
