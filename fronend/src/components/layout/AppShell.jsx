import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'

const TABS = [
  { to: '/', label: 'Dashboard' },
  { to: '/disclosures', label: 'Disclosures' },
  { to: '/patents', label: 'Patents' },
  { to: '/prosecution', label: 'Prosecution' },
  { to: '/deadlines', label: 'Deadlines' },
  { to: '/licenses', label: 'Licenses' },
  { to: '/documents', label: 'Documents' },
  { to: '/reports', label: 'Reports' },
  { to: '/admin', label: 'Admin', roles: ['super_admin', 'ttc_staff'] },
]

export default function AppShell() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [transitionKey, setTransitionKey] = useState(location.pathname)

  useEffect(() => {
    setTransitionKey(location.pathname)
  }, [location.pathname])

  const initials = user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'IP'

  // Helper to format breadcrumb segments
  const segments = location.pathname.split('/').filter(Boolean)
  const getBreadcrumbName = (seg) => {
    if (!isNaN(seg)) return `#${seg}`
    return seg.charAt(0).toUpperCase() + seg.slice(1)
  }

  return (
    <div className="flex flex-col min-h-screen bg-paper">
      {/* Dynamic Upper Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-indigo via-indigo-dark to-teal w-full" />

      {/* Main Top Header Console */}
      <header className="sticky top-0 z-50 bg-surface border-b border-line shadow-xs px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          {/* Workspace Central Dropdown Indicator */}
          <div className="flex items-center gap-2 border border-line rounded-xl px-3.5 py-1.5 bg-paper/50 cursor-pointer hover:bg-paper transition-colors duration-150">
            <div className="w-5 h-5 rounded-lg bg-indigo flex items-center justify-center text-white shrink-0">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </div>
            <div className="text-left leading-none">
              <p className="text-[9px] text-ink/35 uppercase font-bold tracking-wider">Workspace</p>
              <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                TTC Central
                <svg className="w-3 h-3 text-ink/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </p>
            </div>
          </div>

          {/* Navigation Horizontal Tabs */}
          <nav className="flex items-center gap-1">
            {TABS.filter((tab) => !tab.roles || tab.roles.includes(user?.role)).map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === '/'}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'nav-tab-active bg-indigo-light text-indigo shadow-xs'
                      : 'text-ink/60 hover:bg-paper hover:text-ink'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right Console Actions */}
        <div className="flex items-center gap-4">
          {/* Quick Search */}
          <div className="relative max-w-[240px] hidden lg:block">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search records, owners, tags..."
              className="w-full rounded-xl bg-paper border border-line pl-8.5 pr-3 py-1.5 text-xs text-ink placeholder-ink/30 outline-none focus-glow transition-all duration-150"
              readOnly
            />
          </div>

          {/* Help Center */}
          <button className="p-1.5 hover:bg-paper text-ink/40 hover:text-ink rounded-lg transition-colors shrink-0 cursor-pointer" title="Help Center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Notifications */}
          <button className="relative p-1.5 hover:bg-paper text-ink/40 hover:text-ink rounded-lg transition-colors shrink-0 cursor-pointer" title="Notifications">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1.5 w-2 h-2 bg-rust rounded-full animate-pulse" />
          </button>

          <div className="h-5 w-px bg-line shrink-0" />

          {/* User Controls */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo to-indigo-dark flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {initials}
            </div>
            <div className="hidden md:block leading-none text-left">
              <p className="text-xs font-bold text-ink leading-tight">{user?.full_name || 'User'}</p>
              <p className="text-[9px] text-ink/40 font-bold uppercase tracking-wider mt-0.5">{user?.role?.replaceAll('_', ' ') || 'IP Manager'}</p>
            </div>
            <button
              onClick={logout}
              className="text-xs text-ink/40 hover:text-rust p-1 hover:bg-paper rounded-lg cursor-pointer transition-colors"
              title="Sign Out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Subheader & Breadcrumbs navigation */}
      <div className="bg-surface/50 border-b border-line px-6 py-2 flex items-center gap-2 text-xs font-medium text-ink/50">
        <NavLink to="/" className="hover:text-ink transition-colors">Home</NavLink>
        {segments.map((seg, i) => (
          <span key={i} className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-ink/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className={i === segments.length - 1 ? "text-ink font-semibold" : "hover:text-ink transition-colors"}>
              {getBreadcrumbName(seg)}
            </span>
          </span>
        ))}
      </div>

      {/* Primary Page Canvas */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div key={transitionKey} className="page-transition">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
