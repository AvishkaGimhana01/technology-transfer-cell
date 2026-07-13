# Frontend Documentation — TTC-IPMS

> **Technology Transfer Cell — Intellectual Property Management System**  
> Stack: **React 19 · Vite 8 · TailwindCSS 4 · React Router 7 · Axios**

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Routing & Navigation](#4-routing--navigation)
5. [Authentication Flow](#5-authentication-flow)
6. [API Layer](#6-api-layer)
7. [Pages Reference](#7-pages-reference)
8. [Components](#8-components)
9. [State Management](#9-state-management)
10. [Design System](#10-design-system)
11. [Environment Configuration](#11-environment-configuration)
12. [Running the App](#12-running-the-app)

---

## 1. Overview

The frontend is a **Single Page Application (SPA)** built with React 19 and bundled with Vite 8. It is the user-facing layer of the TTC-IPMS (Technology Transfer Cell — Intellectual Property Management System), designed for:

- **Faculty** — submit invention disclosures, view patent status, track deadlines
- **TTC Staff** — manage the full IP portfolio, agreements, MOUs, projects
- **Super Admins** — full system access including user management and reports
- **Innovation Club Members** — apply to the club and track application status
- **Public users** — submit innovation club applications without logging in

The app communicates with the FastAPI backend exclusively via REST API calls through a centralized Axios instance.

---

## 2. Tech Stack

| Package | Version | Role |
|---|---|---|
| `react` | `^19.2.7` | UI component framework |
| `react-dom` | `^19.2.7` | DOM renderer |
| `react-router-dom` | `^7.18.1` | Client-side SPA routing |
| `vite` | `^8.1.1` | Dev server & production bundler |
| `@vitejs/plugin-react` | `^6.0.3` | Vite plugin for React/JSX |
| `tailwindcss` | `^4.3.2` | Utility-first CSS framework |
| `@tailwindcss/vite` | `^4.3.2` | Vite integration for Tailwind v4 |
| `axios` | `^1.18.1` | HTTP client for backend API calls |
| `eslint` | `^10.6.0` | Code linting |

---

## 3. Project Structure

```
fronend/                         ← (note: folder is named "fronend" in repo)
├── index.html                   # HTML shell — single <div id="root">
├── vite.config.js               # Vite + Tailwind plugin config
├── package.json                 # npm dependencies & scripts
├── eslint.config.js             # ESLint rules
├── .env                         # VITE_API_BASE_URL env var
│
└── src/
    ├── main.jsx                 # React app bootstrap (createRoot)
    ├── App.jsx                  # Root component — all route definitions
    ├── App.css                  # Minimal global CSS overrides
    ├── index.css                # Tailwind v4 @import + global body styles
    │
    ├── api/                     # Domain-split API service modules
    │   ├── client.js            # Axios instance with JWT & auto-logout interceptors
    │   ├── auth.js              # POST /auth/login, POST /auth/register
    │   ├── patents.js           # GET/POST/PATCH /patents, GET /patents/:id/timeline
    │   ├── disclosures.js       # GET/POST/PATCH /disclosures
    │   ├── licenses.js          # GET/POST/PATCH /licenses
    │   ├── deadlines.js         # GET/POST/PATCH /deadlines
    │   ├── projects.js          # GET/POST/PATCH /projects
    │   ├── agreements.js        # GET/POST /agreements
    │   ├── mous.js              # GET/POST /mous
    │   ├── noticeboard.js       # GET/POST /noticeboard
    │   ├── innovationClub.js    # POST /innovation-club/apply, GET/PATCH applications
    │   └── iprViolations.js     # GET/POST/PATCH /ipr-violations
    │
    ├── auth/                    # Auth context, route guards
    │   ├── AuthContext.jsx      # React Context — holds user, login(), logout()
    │   └── ProtectedRoute.jsx   # Redirects unauthenticated users to /login
    │
    ├── components/              # Shared UI components
    │   ├── layout/
    │   │   └── AppShell.jsx     # Sidebar + Topbar wrapper used by all protected pages
    │   └── ui/
    │       └── Toast.jsx        # Global toast notification system + ToastProvider
    │
    └── pages/                   # One component per route
        ├── LoginPage.jsx
        ├── RegisterPage.jsx
        ├── DashboardPage.jsx          # KPI overview dashboard
        ├── DisclosuresPage.jsx        # Invention disclosures
        ├── PatentsPage.jsx            # Patent portfolio
        ├── ProsecutionPage.jsx        # Patent prosecution timeline
        ├── DeadlinesPage.jsx          # Deadline tracker
        ├── LicensesPage.jsx           # License management
        ├── DocumentsPage.jsx          # Document repository
        ├── ReportsPage.jsx            # Reports & analytics
        ├── AdminPage.jsx              # Admin — user management
        ├── projects/
        │   ├── ProjectsListPage.jsx
        │   └── ProjectDetailPage.jsx
        ├── agreements/
        │   └── AgreementsListPage.jsx
        ├── mous/
        │   └── MousListPage.jsx
        ├── noticeboard/
        │   └── NoticeboardPage.jsx
        ├── innovation-club/
        │   ├── ApplyPage.jsx              # Public — no auth required
        │   └── ApplicationsAdminPage.jsx  # Admin review of applications
        └── ipr/
            └── IprViolationsPage.jsx
```

---

## 4. Routing & Navigation

All routes are centrally defined in [`src/App.jsx`](file:///c:/Users/ASUS/Documents/GitHub/technology-transfer-cell/fronend/src/App.jsx).

The app uses **React Router v7** with a nested route structure:

```
BrowserRouter
└── AuthProvider
    └── ToastProvider
        └── Routes
            ├── /login          → LoginPage      (public)
            ├── /register       → RegisterPage   (public)
            ├── /apply          → ApplyPage      (public)
            └── ProtectedRoute  (checks JWT in localStorage)
                └── AppShell    (sidebar + topbar layout)
                    ├── /                          → DashboardPage
                    ├── /projects                  → ProjectsListPage
                    ├── /projects/:id              → ProjectDetailPage
                    ├── /agreements                → AgreementsListPage
                    ├── /mous                      → MousListPage
                    ├── /noticeboard               → NoticeboardPage
                    ├── /innovation-club/applications → ApplicationsAdminPage
                    ├── /ipr-violations            → IprViolationsPage
                    ├── /disclosures               → DisclosuresPage
                    ├── /patents                   → PatentsPage
                    ├── /prosecution               → ProsecutionPage
                    ├── /deadlines                 → DeadlinesPage
                    ├── /licenses                  → LicensesPage
                    ├── /documents                 → DocumentsPage
                    ├── /reports                   → ReportsPage
                    └── /admin                     → AdminPage
```

### All Routes Table

| Path | Component | Auth | Description |
|---|---|---|---|
| `/login` | `LoginPage` | ❌ Public | User sign-in form |
| `/register` | `RegisterPage` | ❌ Public | New account registration |
| `/apply` | `ApplyPage` | ❌ Public | Innovation club application |
| `/` | `DashboardPage` | ✅ Required | Main KPI dashboard |
| `/projects` | `ProjectsListPage` | ✅ Required | Industry collaborations list |
| `/projects/:id` | `ProjectDetailPage` | ✅ Required | Project detail view |
| `/agreements` | `AgreementsListPage` | ✅ Required | Legal agreements |
| `/mous` | `MousListPage` | ✅ Required | Memoranda of Understanding |
| `/noticeboard` | `NoticeboardPage` | ✅ Required | Announcements |
| `/innovation-club/applications` | `ApplicationsAdminPage` | ✅ Required | Admin review queue |
| `/ipr-violations` | `IprViolationsPage` | ✅ Required | IPR violation reports |
| `/disclosures` | `DisclosuresPage` | ✅ Required | Invention disclosures |
| `/patents` | `PatentsPage` | ✅ Required | Patent portfolio |
| `/prosecution` | `ProsecutionPage` | ✅ Required | Prosecution timelines |
| `/deadlines` | `DeadlinesPage` | ✅ Required | Critical deadlines tracker |
| `/licenses` | `LicensesPage` | ✅ Required | Technology licenses |
| `/documents` | `DocumentsPage` | ✅ Required | Document repository |
| `/reports` | `ReportsPage` | ✅ Required | Analytics & reports |
| `/admin` | `AdminPage` | ✅ Required | User management |

---

## 5. Authentication Flow

### Login Sequence

```
User enters credentials
  → LoginPage calls POST /auth/login (OAuth2PasswordRequestForm format)
  → Backend returns { access_token, token_type: "bearer" }
  → Token stored in localStorage["ttc_token"]
  → All subsequent Axios requests attach header: Authorization: Bearer <token>
  → User redirected to "/"
```

### AuthContext (`src/auth/AuthContext.jsx`)

A React Context that provides:

| Value | Type | Description |
|---|---|---|
| `user` | Object \| null | Current authenticated user object |
| `loading` | boolean | True while checking stored token on app mount |
| `login(email, pw)` | async function | Authenticates and sets user state |
| `logout()` | function | Clears token and user state |

### ProtectedRoute (`src/auth/ProtectedRoute.jsx`)

Wraps all protected routes. If `user` is null (after loading completes), redirects to `/login`. Otherwise renders `<Outlet />`.

### Axios JWT Interceptor

Defined in `src/api/client.js`:

```js
// Attach token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ttc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ttc_token')
      // Don't redirect if already on public pages
      const path = window.location.pathname
      if (path !== '/login' && path !== '/register' && path !== '/apply') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)
```

---

## 6. API Layer

### Client Configuration (`src/api/client.js`)

```js
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL  // e.g. http://localhost:8000
})
```

### API Modules

| File | Backend Router Prefix | Key Functions |
|---|---|---|
| `auth.js` | `/auth` | `login()`, `register()` |
| `patents.js` | `/patents` | `listPatents()`, `createPatent()`, `updatePatentStatus()`, `getPatentTimeline()` |
| `disclosures.js` | `/disclosures` | `listDisclosures()`, `createDisclosure()`, `updateDisclosureStatus()` |
| `licenses.js` | `/licenses` | `listLicenses()`, `createLicense()`, `updateLicenseStatus()` |
| `deadlines.js` | `/deadlines` | `listDeadlines()`, `createDeadline()`, `updateDeadlineStatus()` |
| `projects.js` | `/projects` | `listProjects()`, `getProject()`, `createProject()`, `updateProjectStatus()` |
| `agreements.js` | `/agreements` | `listAgreements()`, `createAgreement()` |
| `mous.js` | `/mous` | `listMous()`, `createMou()` |
| `noticeboard.js` | `/noticeboard` | `listPosts()`, `createPost()` |
| `innovationClub.js` | `/innovation-club` | `applyToClub()`, `listApplications()`, `updateApplicationStatus()` |
| `iprViolations.js` | `/ipr-violations` | `reportViolation()`, `listViolations()`, `updateViolationStatus()` |

---

## 7. Pages Reference

### DashboardPage (`/`)
The main landing page after login. Displays high-level summary of the IP portfolio:
- Total patents, active disclosures, upcoming deadlines count
- License revenue YTD figures
- Recent activity feed
- Critical deadline alerts

### PatentsPage (`/patents`)
Full patent portfolio management:
- Tabular list of all patents with status badges
- Filter by status: `drafting` · `filed` · `office_action` · `granted`
- Create new patent via modal form
- Click patent to view detail / update status

### DisclosuresPage (`/disclosures`)
Invention disclosure forms management:
- List with statuses: `under_review` · `needs_revision` · `ready_for_filing`
- Create new disclosure form
- Status update capability

### ProsecutionPage (`/prosecution`)
Prosecution event timeline:
- View all prosecution events per patent
- Timeline-style rendering of key filing milestones

### DeadlinesPage (`/deadlines`)
Critical deadline tracker:
- Color-coded by severity: `low` · `moderate` · `high` · `critical`
- Status: `pending` · `completed` · `overdue`
- Assignee column for accountability

### LicensesPage (`/licenses`)
License revenue and portfolio:
- Licensee company, royalty rate (%), revenue YTD
- Status: `active` · `pending` · `expired` · `terminated`
- Linked patent association (optional)

### ProjectsListPage / ProjectDetailPage (`/projects`, `/projects/:id`)
Industry collaboration projects:
- List view with status: `proposed` · `ongoing` · `completed` · `cancelled`
- Budget, industry partner name, faculty lead
- Detail view shows full project info

### AgreementsListPage (`/agreements`)
Legal agreements (NDAs, licensing, consultancy):
- Type: `nda` · `licensing` · `consultancy` · `other`
- Status: `draft` · `active` · `expired` · `terminated`
- Linked to project, start/end dates, reminders

### MousListPage (`/mous`)
Memoranda of Understanding:
- Status: `draft` · `pending_signature` · `signed` · `expired`
- Internal and external signatories, file path

### NoticeboardPage (`/noticeboard`)
Announcements and notices:
- Published/unpublished posts
- Category tagging, publish and expiry dates

### ApplicationsAdminPage (`/innovation-club/applications`)
Admin review queue for innovation club applications:
- List pending, approved, rejected applications
- Approve / reject actions with status update

### ApplyPage (`/apply`) — **Public**
Innovation club application form (no login required):
- Applicant name, email, type (student/faculty)
- Idea title and description

### IprViolationsPage (`/ipr-violations`)
IPR violation reports:
- Status: `reported` · `investigating` · `resolved` · `dismissed`
- Severity: `low` · `medium` · `high` · `critical`
- Related patent or project reference

### AdminPage (`/admin`)
User management (super_admin only):
- List all registered users
- View roles, departments, contact info

---

## 8. Components

### `AppShell` (`src/components/layout/AppShell.jsx`)

The outer layout shell used by every protected page. Renders:
- **Sidebar** — navigation links to all modules, role-aware visibility
- **Top Navigation Bar** — shows current user's name and role, logout button
- **`<Outlet />`** — where the active page component is rendered

### `Toast` / `ToastProvider` (`src/components/ui/Toast.jsx`)

Global toast notification system. `ToastProvider` wraps the entire app. Pages call toast functions to show:
- ✅ Success messages (e.g. "Patent created successfully")
- ❌ Error messages (e.g. "Failed to update status")
- ℹ️ Info messages

Toasts auto-dismiss after a timeout.

---

## 9. State Management

No external state library (e.g. Redux, Zustand) is used. State is managed at two levels:

| Level | Mechanism | Used For |
|---|---|---|
| **Global** | React Context API | Auth state, toast notifications |
| **Local** | `useState` + `useEffect` | Page-level data fetching and form state |

Each page component:
1. Fetches its own data on mount via `useEffect` calling an API module
2. Stores data in local `useState`
3. Re-fetches after mutations (create / update)

---

## 10. Design System

The app uses **TailwindCSS v4** with a CSS-first `@theme` configuration in `src/index.css`:

### Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `--color-ink` | `#1B2430` | Primary text |
| `--color-paper` | `#F7F8FA` | App background |
| `--color-surface` | `#FFFFFF` | Cards and panels |
| `--color-line` | `#E2E5EA` | Borders and dividers |
| `--color-indigo` | `#2C3E6B` | Brand / primary actions |
| `--color-teal` | `#1E7F72` | Success / active / approved |
| `--color-amber` | `#B8791A` | Pending / warning |
| `--color-rust` | `#B0432F` | Error / rejected / destructive |

### Typography
- Font family: **Inter** (grotesk system font stack)
- Tabular numbers (`font-variant-numeric: tabular-nums`) for data tables

### Status Display
Status values are always shown as a **colored dot + text label** — consistent across all modules so users learn one visual pattern for record state.

---

## 11. Environment Configuration

The frontend reads one environment variable from `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

> **Important:** In production, update this to the deployed backend URL. Vite inlines env variables at build time — any change requires a rebuild.

---

## 12. Running the App

```bash
# Navigate to the frontend directory
cd fronend

# Install dependencies
npm install

# Start the development server
npm run dev
# → App available at http://localhost:5173

# Lint the codebase
npm run lint

# Build for production
npm run build

# Preview the production build locally
npm run preview
```

> The Vite dev server listens on **port 5173**. The FastAPI backend explicitly allows CORS from `http://localhost:5173` in `main.py`. Both must be running together for full functionality.