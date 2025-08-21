# United Global Services (UGS) Website Manual

This manual explains the core features, roles, and day‑to‑day operations of the UGS website/app, covering both Admin and Client experiences.

- Tech stack: React + TypeScript + Vite + Tailwind CSS
- Data: Firebase/Firestore (see `src/lib/db.ts`, `firestore.rules`)
- Auth: Firebase Auth wrapper (see `src/lib/auth.tsx`)
- UI primitives: local components in `src/components/`

## Getting Started

- Prerequisites: Node 18+
- Install: `npm install`
- Run dev server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

Environment variables example: see `.env.example`.

## Roles and Access

- Client (end user): manages their applications, documents, and support.
- Admin (staff): manages global analytics, user base, and applications.

Auth state is available via `useAuth()` from `src/lib/auth.tsx`.

## Global UI Elements

- Desktop sidebar: `DesktopSidebar` (shared), collapsible on desktop.
- Mobile sidebar: `MobileSidebar` for small screens.
- Tabs: `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger` pattern across dashboards.
- Theme toggle: `getTheme`, `toggleTheme` from `src/components/theme` used by both dashboards.
- Navbar primitives: `src/components/Navbar.tsx` and example `NavbarExample.tsx`.

## Client Dashboard

File: `src/components/ClientDashboard.tsx`

- Header actions
  - Mobile menu (`MobileMenuButton`) opens side navigation.
  - Desktop collapse button toggles the left sidebar width.
  - Theme toggle (Sun/Moon).
  - Back to website (Home icon).
  - Logout.

- Layout
  - Left: `DesktopSidebar` with tabs.
  - Right: `Tabs` with per‑tab content.
  - Mobile: `MobileSidebar` mirrors navigation.

- Tabs and features
  - Overview
    - Welcome banner with membership info.
    - Stats cards: Active Applications, Visas Approved, Documents Verified, Countries Visited.
    - Recent Applications: progress bars, status badges, message shortcut.
    - Recent Activity feed.
    - Quick Actions (New Application, Upload Document, Contact Support).
  - Applications
    - List of user applications from Firestore via `listUserApplications()`.
    - Each item shows ID, country, type, status, progress, dates, amounts.
    - Actions: View details (stub), Download (stub), Contact Officer (messages).
  - Documents
    - Document list UI (stubbed data) with status badges and actions (View/Download/Delete stubs).
    - Replace with real storage integration as needed.
  - Support
    - Premium Support layout with space for FAQs/contact forms.
  - Profile
    - Space to render and edit basic profile data from Firestore (`getUser`, `upsertUser`).
  - Settings
    - Account preferences area (theme, notifications, etc.).

- Messaging (Client)
  - Open from Applications card: invokes `openMessages(appId)`.
  - Subscribes via `subscribeApplicationMessages(appId, cb)`.
  - Send via `sendApplicationMessage(appId, { text, byUid, byRole: 'user' })`.
  - Dialog shows messages with sender labels and supports live updates.

## Admin Dashboard

File: `src/components/AdminDashboard.tsx`

- Header actions
  - Mobile menu opens side navigation.
  - Desktop collapse button toggles the left sidebar width.
  - Theme toggle (Sun/Moon).

- Layout
  - Left: `DesktopSidebar` with admin tabs.
  - Right: `Tabs` with dashboard content.
  - Mobile: `MobileSidebar` mirrors nav.

- Tabs and features
  - Overview
    - KPI cards (users, revenue, applications, etc.).
    - Charts: Monthly Applications (Line/Bar), Service Distribution (Pie/Donut + Legend), Processing Time trends, Top Countries.
  - Applications
    - Recent applications table (client, service, status, date, actions).
    - Filter popover (status quick filters UI sample).
    - View Details button opens details dialog.
  - Users (stub)
    - Placeholder for user management.
  - VisaEd (stub)
    - Placeholder for educational content analytics.
  - Allen AI (stub)
    - Placeholder for AI assistant analytics.
  - Analytics (stub)
    - Placeholder for advanced BI reports.

- Messaging (Admin)
  - Admin can open application detail dialog and access messages (depending on implementation of actions wiring).
  - For two‑way messaging, use `listApplicationMessages`, `subscribeApplicationMessages`, `sendApplicationMessage` with `byRole: 'admin'`.

## Data Layer (Firestore)

See `src/lib/db.ts` for data helpers.

- Users
  - `getUser(uid)`
  - `upsertUser(user)`
- Applications
  - `listUserApplications(uid, limit)` – Client list
  - Admin‑side list helpers may exist/extend similarly.
- Messages
  - `listApplicationMessages(appId, limit)`
  - `subscribeApplicationMessages(appId, cb)`
  - `sendApplicationMessage(appId, payload)`

Rules: see `firestore.rules`. Ensure production rules restrict reads/writes to authorized users/admins.

## Theming

- `getTheme()` returns current theme.
- `toggleTheme()` toggles light/dark and dispatches `themechange` event; dashboards subscribe to update local state.

## Navigation Components

- `DesktopSidebar` (shared)
  - Props: `items`, `selected`, `onSelect`, `isCollapsed`, `onToggleCollapse`.
  - Renders icons, labels, optional badges, and collapse control.
- `MobileSidebar`
  - Props: `isOpen`, `onClose`, `onTabChange`, `selectedTab`, `tabs`, `userData`, `isAdmin`, `onLogout`.
  - Slide‑in drawer for navigation and quick user info.

## Operations (Admin)

- Review dashboard: monitor KPIs and charts on Overview.
- Manage applications: filter, inspect, open details dialog, message clients.
- Manage users/content: use placeholders as a starting point for future features.
- Toggle theme, collapse sidebar, sign out.

## Operations (Client)

- Navigate tabs: Overview, Applications, Documents, Support, Profile, Settings.
- Check application progress and statuses.
- Open Messages from an application and chat with admin.
- Upload/manage documents (stub UI), contact support, quick actions.
- Toggle theme, collapse sidebar, sign out.

## Notifications

- Placeholder badges and counts shown in sidebars/cards.
- Integrate Firebase Cloud Messaging or email/SMS as needed in future.

## Accessibility & Responsiveness

- Mobile: `MobileSidebar` + responsive grids.
- Keyboard focus via native controls; consider adding skip links and ARIA roles where needed.

## Troubleshooting

- Dev server fails to parse TSX: check for balanced JSX tags and matching `<Tabs>`/`</Tabs>` and `TabsContent`.
- Firebase permission errors: verify `firestore.rules` and authentication state.
- Charts not rendering: confirm `recharts` imports and data arrays.
- Theme not toggling: ensure `themechange` event listener is wired and `toggleTheme()` is called.

## Deployment

- Build: `npm run build` (outputs `dist/`).
- Host on Netlify/Vercel or Firebase Hosting. Add environment variables and Firebase config for production.

## File Map (selected)

- `src/components/AdminDashboard.tsx` – Admin portal
- `src/components/ClientDashboard.tsx` – Client portal
- `src/components/DesktopSidebar.tsx` – Shared desktop sidebar
- `src/components/MobileSidebar.tsx` – Mobile drawer sidebar
- `src/components/Navbar.tsx` – Navbar primitives
- `src/components/NavbarExample.tsx` – Example navbar usage
- `src/lib/auth.tsx` – Auth hooks/provider
- `src/lib/db.ts` – Firestore helpers (users, applications, messages)
- `firestore.rules` – Security rules

---

For questions or to extend functionality (payments, document storage, admin user management, notifications), use the stubs and patterns in the dashboards as templates and wire them to new Firestore collections or backend services as needed.
