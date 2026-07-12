# TTC-MS Frontend Implementation Plan — React + Vite + Tailwind v4

Matches your implemented stack: React `^19.2.7`, `react-dom ^19.2.7`, `vite ^8.1.1`, `tailwindcss ^4.3.2`, `@tailwindcss/vite ^4.3.2`, `eslint ^10.6.0`. Talks to the FastAPI backend from the backend plan (`localhost:8000`).

---

## 0. Design direction (so this doesn't look like a default AI scaffold)

This is an internal university operations tool, not a marketing site — the design should read as **calm, institutional, and information-dense**, closer to a registrar/ops console than a SaaS landing page.

**Tokens:**
- `--color-ink: #1B2430` — primary text / headers
- `--color-paper: #F7F8FA` — app background
- `--color-surface: #FFFFFF` — cards/panels
- `--color-line: #E2E5EA` — borders/dividers
- `--color-indigo: #2C3E6B` — primary brand (Ruhuna-adjacent deep blue, used for nav/primary actions)
- `--color-teal: #1E7F72` — success / active / approved
- `--color-amber: #B8791A` — pending / warning
- `--color-rust: #B0432F` — rejected / violation / destructive
- Type: a grotesk for UI (`Inter` or system-ui stack) for everything — this is a data tool, not a place for a display serif. Numbers/IDs/status badges use `font-variant-numeric: tabular-nums` so tables align.
- Layout: fixed left sidebar (module nav) + top bar (role badge, search, user menu) + content area with a consistent page header (title, one-line description, primary action button top-right). Tables are the workhorse component, not cards — this is a records system.
- Signature element: status is always communicated by a small colored dot + label (never color alone, never a filled badge blob) — consistent across projects/agreements/MOUs/applications/violations so the eye learns one pattern for "state" everywhere in the app.

---

## 1. Project structure

```
frontend/
├── package.json
├── vite.config.js
├── index.html
├── .env.example
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── api/
│   │   ├── client.js
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── agreements.js
│   │   ├── mous.js
│   │   ├── innovationClub.js
│   │   ├── noticeboard.js
│   │   └── iprViolations.js
│   ├── auth/
│   │   ├── AuthContext.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── RoleGate.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Topbar.jsx
│   │   └── ui/
│   │       ├── StatusDot.jsx
│   │       ├── DataTable.jsx
│   │       ├── PageHeader.jsx
│   │       ├── Modal.jsx
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Select.jsx
│   │       └── EmptyState.jsx
│   └── pages/
│       ├── LoginPage.jsx
│       ├── RegisterPage.jsx
│       ├── DashboardPage.jsx
│       ├── projects/
│       │   ├── ProjectsListPage.jsx
│       │   └── ProjectDetailPage.jsx
│       ├── agreements/
│       │   └── AgreementsListPage.jsx
│       ├── mous/
│       │   └── MousListPage.jsx
│       ├── innovation-club/
│       │   ├── ApplyPage.jsx          (public)
│       │   └── ApplicationsAdminPage.jsx
│       ├── noticeboard/
│       │   └── NoticeboardPage.jsx    (public list + staff create)
│       └── ipr/
│           └── IprViolationsPage.jsx  (restricted)
```

Install:
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom axios
npm install -D tailwindcss @tailwindcss/vite
```

---

## 2. `.env.example`

```
VITE_API_BASE_URL=http://localhost:8000
```

---

## 3. `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
})
```

---

## 4. `src/index.css` (Tailwind v4 CSS-first config — no `tailwind.config.js` needed)

```css
@import "tailwindcss";

@theme {
  --color-ink: #1B2430;
  --color-paper: #F7F8FA;
  --color-surface: #FFFFFF;
  --color-line: #E2E5EA;
  --color-indigo: #2C3E6B;
  --color-indigo-dark: #202E4E;
  --color-teal: #1E7F72;
  --color-amber: #B8791A;
  --color-rust: #B0432F;

  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
}

body {
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-sans);
  font-feature-settings: "tnum" 1;
}

.tabular {
  font-variant-numeric: tabular-nums;
}
```

---

## 5. API layer

### `src/api/client.js`
```javascript
import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ttc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ttc_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default client
```

### `src/api/auth.js`
```javascript
import client from './client'

export async function login(email, password) {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  const { data } = await client.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data // { access_token, token_type }
}

export async function register(payload) {
  const { data } = await client.post('/auth/register', payload)
  return data
}

export async function fetchMe() {
  const { data } = await client.get('/users/me')
  return data
}
```

### `src/api/projects.js`
```javascript
import client from './client'

export const listProjects = (status) =>
  client.get('/projects', { params: status ? { status } : {} }).then((r) => r.data)

export const getProject = (id) => client.get(`/projects/${id}`).then((r) => r.data)

export const createProject = (payload) => client.post('/projects', payload).then((r) => r.data)

export const updateProjectStatus = (id, status) =>
  client.patch(`/projects/${id}/status`, { status }).then((r) => r.data)
```

### `src/api/agreements.js`
```javascript
import client from './client'

export const listAgreements = () => client.get('/agreements').then((r) => r.data)
export const createAgreement = (payload) => client.post('/agreements', payload).then((r) => r.data)
```

### `src/api/mous.js`
```javascript
import client from './client'

export const listMous = () => client.get('/mous').then((r) => r.data)
export const createMou = (payload) => client.post('/mous', payload).then((r) => r.data)
```

### `src/api/innovationClub.js`
```javascript
import client from './client'

export const applyToClub = (payload) =>
  client.post('/innovation-club/apply', payload).then((r) => r.data)

export const listApplications = () =>
  client.get('/innovation-club/applications').then((r) => r.data)

export const updateApplicationStatus = (id, status) =>
  client.patch(`/innovation-club/applications/${id}/status`, { status }).then((r) => r.data)
```

### `src/api/noticeboard.js`
```javascript
import client from './client'

export const listPosts = () => client.get('/noticeboard').then((r) => r.data)
export const createPost = (payload) => client.post('/noticeboard', payload).then((r) => r.data)
```

### `src/api/iprViolations.js`
```javascript
import client from './client'

export const reportViolation = (payload) =>
  client.post('/ipr-violations', payload).then((r) => r.data)

export const listViolations = () => client.get('/ipr-violations').then((r) => r.data)

export const updateViolationStatus = (id, status) =>
  client.patch(`/ipr-violations/${id}/status`, { status }).then((r) => r.data)
```

---

## 6. Auth

### `src/auth/AuthContext.jsx`
```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { login as apiLogin, fetchMe } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ttc_token')
    if (!token) {
      setLoading(false)
      return
    }
    fetchMe()
      .then(setUser)
      .catch(() => localStorage.removeItem('ttc_token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const { access_token } = await apiLogin(email, password)
    localStorage.setItem('ttc_token', access_token)
    const me = await fetchMe()
    setUser(me)
    return me
  }

  function logout() {
    localStorage.removeItem('ttc_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

### `src/auth/ProtectedRoute.jsx`
```jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
```

### `src/auth/RoleGate.jsx`
```jsx
import { useAuth } from './AuthContext'

// Wrap admin-only UI: <RoleGate roles={['super_admin','ttc_staff']}>...</RoleGate>
export default function RoleGate({ roles, children, fallback = null }) {
  const { user } = useAuth()
  if (!user || !roles.includes(user.role)) return fallback
  return children
}
```

---

## 7. Core UI primitives

### `src/components/ui/StatusDot.jsx`
```jsx
const COLORS = {
  proposed: 'bg-amber', ongoing: 'bg-teal', completed: 'bg-indigo', cancelled: 'bg-rust',
  draft: 'bg-amber', active: 'bg-teal', expired: 'bg-rust', terminated: 'bg-rust',
  pending_signature: 'bg-amber', signed: 'bg-teal',
  pending: 'bg-amber', approved: 'bg-teal', rejected: 'bg-rust',
  reported: 'bg-amber', investigating: 'bg-indigo', resolved: 'bg-teal', dismissed: 'bg-rust',
}

export default function StatusDot({ status }) {
  const dotColor = COLORS[status] ?? 'bg-line'
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className={`h-2 w-2 rounded-full ${dotColor}`} />
      {status?.replaceAll('_', ' ')}
    </span>
  )
}
```
*(Tailwind v4 picks up `bg-amber`, `bg-teal`, `bg-indigo`, `bg-rust`, `bg-line` automatically from the `@theme` colors defined in `index.css`.)*

### `src/components/ui/PageHeader.jsx`
```jsx
export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between border-b border-line pb-4 mb-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">{title}</h1>
        {description && <p className="text-sm text-ink/60 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  )
}
```

### `src/components/ui/DataTable.jsx`
```jsx
export default function DataTable({ columns, rows, onRowClick, emptyLabel = 'No records yet.' }) {
  if (!rows?.length) {
    return <div className="text-sm text-ink/50 border border-dashed border-line rounded-lg p-8 text-center">{emptyLabel}</div>
  }
  return (
    <div className="border border-line rounded-lg overflow-hidden bg-surface">
      <table className="w-full text-sm">
        <thead className="bg-paper text-ink/60 text-left">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-2 font-medium">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular">
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`border-t border-line ${onRowClick ? 'cursor-pointer hover:bg-paper' : ''}`}
            >
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3">{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### `src/components/ui/Button.jsx`
```jsx
export default function Button({ variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors'
  const variants = {
    primary: 'bg-indigo text-white hover:bg-indigo-dark',
    ghost: 'text-ink hover:bg-paper border border-line',
    danger: 'bg-rust text-white hover:opacity-90',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
```

### `src/components/ui/Input.jsx` / `Select.jsx`
```jsx
export function Input({ label, ...props }) {
  return (
    <label className="block text-sm">
      {label && <span className="text-ink/70 mb-1 block">{label}</span>}
      <input className="w-full rounded-md border border-line px-3 py-2 outline-none focus:ring-2 focus:ring-indigo/30 focus:border-indigo" {...props} />
    </label>
  )
}

export function Select({ label, children, ...props }) {
  return (
    <label className="block text-sm">
      {label && <span className="text-ink/70 mb-1 block">{label}</span>}
      <select className="w-full rounded-md border border-line px-3 py-2 outline-none focus:ring-2 focus:ring-indigo/30 focus:border-indigo bg-surface" {...props}>
        {children}
      </select>
    </label>
  )
}
```

### `src/components/ui/Modal.jsx`
```jsx
export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg w-full max-w-lg p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="text-ink/50 hover:text-ink">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
```

---

## 8. Layout

### `src/components/layout/Sidebar.jsx`
```jsx
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

const NAV = [
  { to: '/', label: 'Dashboard' },
  { to: '/projects', label: 'Industry Projects' },
  { to: '/agreements', label: 'Agreements' },
  { to: '/mous', label: 'MOUs' },
  { to: '/noticeboard', label: 'Noticeboard' },
  { to: '/innovation-club/applications', label: 'Innovation Club', roles: ['super_admin', 'ttc_staff'] },
  { to: '/ipr-violations', label: 'IPR Violations', roles: ['super_admin', 'ttc_staff'] },
]

export default function Sidebar() {
  const { user } = useAuth()
  return (
    <aside className="w-56 shrink-0 border-r border-line bg-surface h-screen sticky top-0 flex flex-col">
      <div className="px-4 py-5 border-b border-line">
        <p className="font-semibold text-indigo leading-tight">TTC-MS</p>
        <p className="text-xs text-ink/50">Technology Transfer Cell</p>
      </div>
      <nav className="flex-1 py-3">
        {NAV.filter((item) => !item.roles || item.roles.includes(user?.role)).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `block px-4 py-2 text-sm ${isActive ? 'bg-indigo/10 text-indigo font-medium' : 'text-ink/70 hover:bg-paper'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
```

### `src/components/layout/Topbar.jsx`
```jsx
import { useAuth } from '../../auth/AuthContext'

export default function Topbar() {
  const { user, logout } = useAuth()
  return (
    <header className="h-14 border-b border-line bg-surface flex items-center justify-end px-6 gap-4">
      <span className="text-sm text-ink/60">{user?.full_name} · <span className="uppercase text-xs">{user?.role?.replaceAll('_', ' ')}</span></span>
      <button onClick={logout} className="text-sm text-ink/60 hover:text-rust">Sign out</button>
    </header>
  )
}
```

### `src/components/layout/AppShell.jsx`
```jsx
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppShell() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <Topbar />
        <main className="p-6 max-w-5xl">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

---

## 9. Pages (representative — build the rest the same pattern)

### `src/pages/LoginPage.jsx`
```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Input } from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Incorrect email or password.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-lg p-8 w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-indigo">Technology Transfer Cell</h1>
          <p className="text-sm text-ink/60">Sign in to continue</p>
        </div>
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-rust">{error}</p>}
        <Button type="submit" className="w-full justify-center">Sign in</Button>
      </form>
    </div>
  )
}
```

### `src/pages/projects/ProjectsListPage.jsx`
```jsx
import { useEffect, useState } from 'react'
import { listProjects, createProject } from '../../api/projects'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import StatusDot from '../../components/ui/StatusDot'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'

const columns = [
  { key: 'title', label: 'Project' },
  { key: 'industry_partner_name', label: 'Partner' },
  { key: 'status', label: 'Status', render: (r) => <StatusDot status={r.status} /> },
  { key: 'start_date', label: 'Start' },
]

export default function ProjectsListPage() {
  const [projects, setProjects] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', industry_partner_name: '', description: '' })

  async function refresh() {
    setProjects(await listProjects())
  }
  useEffect(() => { refresh() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    await createProject(form)
    setOpen(false)
    setForm({ title: '', industry_partner_name: '', description: '' })
    refresh()
  }

  return (
    <>
      <PageHeader
        title="Industry Projects & Consultancy"
        description="Track collaborations with industry partners."
        action={<Button onClick={() => setOpen(true)}>New project</Button>}
      />
      <DataTable columns={columns} rows={projects} emptyLabel="No projects yet — add the first one." />

      <Modal open={open} onClose={() => setOpen(false)} title="New industry project">
        <form onSubmit={handleCreate} className="space-y-3">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Industry partner" value={form.industry_partner_name} onChange={(e) => setForm({ ...form, industry_partner_name: e.target.value })} required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button type="submit" className="w-full justify-center">Create project</Button>
        </form>
      </Modal>
    </>
  )
}
```

### `src/pages/innovation-club/ApplyPage.jsx` (public, no auth)
```jsx
import { useState } from 'react'
import { applyToClub } from '../../api/innovationClub'
import { Input } from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function ApplyPage() {
  const [form, setForm] = useState({ applicant_name: '', applicant_email: '', idea_title: '', idea_description: '' })
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    await applyToClub(form)
    setSubmitted(true)
  }

  if (submitted) {
    return <div className="max-w-md mx-auto mt-20 text-center">
      <h1 className="text-lg font-semibold text-teal">Application received</h1>
      <p className="text-sm text-ink/60 mt-2">The Innovation Club team will review your idea and follow up by email.</p>
    </div>
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-16 space-y-3 bg-surface border border-line rounded-lg p-8">
      <h1 className="text-lg font-semibold text-indigo">Innovation Club — Submit your idea</h1>
      <Input label="Your name" value={form.applicant_name} onChange={(e) => setForm({ ...form, applicant_name: e.target.value })} required />
      <Input label="Email" type="email" value={form.applicant_email} onChange={(e) => setForm({ ...form, applicant_email: e.target.value })} required />
      <Input label="Idea title" value={form.idea_title} onChange={(e) => setForm({ ...form, idea_title: e.target.value })} required />
      <Input label="Describe your idea" value={form.idea_description} onChange={(e) => setForm({ ...form, idea_description: e.target.value })} />
      <Button type="submit" className="w-full justify-center">Submit application</Button>
    </form>
  )
}
```

*(Build `AgreementsListPage`, `MousListPage`, `ApplicationsAdminPage`, `NoticeboardPage`, `IprViolationsPage`, `ProjectDetailPage`, `RegisterPage`, `DashboardPage` following the exact same pattern as `ProjectsListPage` / `ApplyPage` above — same `PageHeader` + `DataTable` + `Modal`+`Input` form combo, swapping in the matching `api/*.js` functions and columns. `IprViolationsPage` and `ApplicationsAdminPage` additionally wrap their whole content in `<RoleGate roles={['super_admin','ttc_staff']} fallback={<EmptyState/>}>`.)*

---

## 10. Routing — `src/App.jsx`

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import AppShell from './components/layout/AppShell'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsListPage from './pages/projects/ProjectsListPage'
import ProjectDetailPage from './pages/projects/ProjectDetailPage'
import AgreementsListPage from './pages/agreements/AgreementsListPage'
import MousListPage from './pages/mous/MousListPage'
import ApplyPage from './pages/innovation-club/ApplyPage'
import ApplicationsAdminPage from './pages/innovation-club/ApplicationsAdminPage'
import NoticeboardPage from './pages/noticeboard/NoticeboardPage'
import IprViolationsPage from './pages/ipr/IprViolationsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/apply" element={<ApplyPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsListPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/agreements" element={<AgreementsListPage />} />
              <Route path="/mous" element={<MousListPage />} />
              <Route path="/noticeboard" element={<NoticeboardPage />} />
              <Route path="/innovation-club/applications" element={<ApplicationsAdminPage />} />
              <Route path="/ipr-violations" element={<IprViolationsPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

### `src/main.jsx`
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

## 11. Build order for your code agent

1. `npm create vite@latest frontend -- --template react`, then install the packages listed in section 1.
2. Drop in `vite.config.js`, `index.css`, `.env` (from `.env.example`).
3. Build `api/client.js` first, then the rest of `api/*.js`.
4. Build `auth/AuthContext.jsx`, `ProtectedRoute.jsx`, `RoleGate.jsx`.
5. Build the `components/ui/*` primitives (`StatusDot`, `PageHeader`, `DataTable`, `Button`, `Input`/`Select`, `Modal`).
6. Build `components/layout/*` (`Sidebar`, `Topbar`, `AppShell`).
7. Build `LoginPage` + `App.jsx` routing shell first and confirm login round-trips against the backend (`/auth/login` → token → `/users/me`).
8. Build `ProjectsListPage` fully as the reference implementation, then replicate the same pattern for Agreements, MOUs, Noticeboard, Innovation Club admin, IPR Violations.
9. Build the public, unauthenticated `ApplyPage` (Innovation Club) — this is the only page reachable without login besides `/login`.
10. `npm run dev` alongside `uv run uvicorn app.main:app --reload --port 8000` from the backend plan; confirm CORS (`http://localhost:5173`) already permits this from `main.py`.

**Not yet covered (follow-up pass once this is running):** toast notifications for create/update actions, form validation error surfaces from FastAPI's 422 responses, pagination on `DataTable`, a real `DashboardPage` with counts/charts pulled from each list endpoint, and a `ProjectDetailPage` that also lists agreements linked to that project.