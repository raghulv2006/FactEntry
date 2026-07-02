# Layout & Guard Components

This directory contains the layout shell and routing safety valves for the React application.

---

## 1. [Layout.tsx](file:///d:/Raghul/FactEntry/frontend/src/components/Layout.tsx)

`Layout` is the primary structural shell component of the workstation. It wraps all authenticated screens and provides navigation, branding, notification alerts, and theme preferences.

### Key Functional Responsibilities:
* **Responsive Sidebar Drawer**:
  - Displays main options (Dashboard, Queries, New Query, Reports, User Management, Audit Logs) filtered automatically based on the user's role.
  - Automatically collapses into a compact icon-only bar on smaller viewports or when toggled by the user.
* **Branding**:
  - Renders the corporate logo `FactEntry.png` (configured at a clean `35px` height) inside the sidebar header.
* **Theme Customization**:
  - Toggles between Dark Mode and Light Mode, applying changes instantly across CSS variables and the MUI Theme Provider.
* **Realtime Notifications Dropdown**:
  - Fetches notifications every 10 seconds from `/api/notifications`.
  - Displays unread notifications in an interactive popover header dropdown.
  - Allows marking notifications as read by clicking.
* **User Settings & Session Termination**:
  - Displays the active user's initials, name, and role badge.
  - Includes a quick menu to logout, destroying JWT local storage credentials.

---

## 2. [ProtectedRoute.tsx](file:///d:/Raghul/FactEntry/frontend/src/components/ProtectedRoute.tsx)

`ProtectedRoute` is a high-order routing guard component that validates authentication and role permissions before rendering children routes.

### Logic Flow:
1. **Loading State**: If authentication status is still being resolved by `AuthContext` (e.g. validating local storage tokens on load), it displays a centralized `<CircularProgress />` loader.
2. **Authentication Check**: If the user is unauthenticated, it redirects them to the `/login` route.
3. **Role Validation**: If the route specifies an array of `allowedRoles` (e.g., `['ADMIN']` for User Management or `['ANALYST']` for raising queries) and the authenticated user's role does not match, it redirects them safely back to the home `/` route.
4. **Access Granted**: If both checks pass, it renders the requested child view components.
