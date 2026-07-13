import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { useToast } from '../ui/Toast'

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

const WORKSPACES = [
  { id: 'central', name: 'TTC Central' },
  { id: 'civil', name: 'Civil & Environmental' },
  { id: 'electrical', name: 'Electrical & Info' },
  { id: 'marine', name: 'Marine & Naval' },
  { id: 'mechanical', name: 'Mechanical & Mfg' },
  { id: 'computer', name: 'Computer Eng.' }
]

export default function AppShell() {
  const { user, logout } = useAuth()
  const { addToast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [transitionKey, setTransitionKey] = useState(location.pathname)

  // Switcher Dropdown states
  const [currentWorkspace, setCurrentWorkspace] = useState('TTC Central')
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    setTransitionKey(location.pathname)
  }, [location.pathname])

  // Click outside listener for switcher dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setWorkspaceOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'IP'

  const segments = location.pathname.split('/').filter(Boolean)
  const getBreadcrumbName = (seg) => {
    if (!isNaN(seg)) return `#${seg}`
    return seg.charAt(0).toUpperCase() + seg.slice(1)
  }

  const handleWorkspaceSelect = (name) => {
    setCurrentWorkspace(name)
    setWorkspaceOpen(false)
    addToast(`Switched active workspace to: ${name}`, 'success')
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F7]">
      {/* Premium Apple Header Bar */}
      <header className="sticky top-0 z-50 bg-[#FFFFFF]/80 backdrop-blur-md border-b border-[#E5E5E7] px-6 py-2 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-6">
          {/* Interactive Workspace Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setWorkspaceOpen(!workspaceOpen)}
              className="flex items-center gap-2 border border-[#D2D2D7] rounded-lg px-2.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F5F5F7] transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98] select-none group"
            >
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#0088FF] to-[#0071E3] flex items-center justify-center text-white shrink-0 shadow-sm">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-[#1D1D1F] tracking-tight">
                {currentWorkspace}
              </span>
              <svg
                className={`w-3 h-3 text-[#86868B] shrink-0 group-hover:text-[#1D1D1F] transition-all duration-200 ${workspaceOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Switcher Dropdown Menu */}
            {workspaceOpen && (
              <div className="absolute top-10 left-0 mt-1.5 w-60 bg-white border border-[#E5E5E7] rounded-xl shadow-lg p-1.5 z-50 animate-scale-in">
                <div className="px-2.5 py-1 text-[9px] font-bold text-[#86868B] uppercase tracking-wider">
                  Select Workspace Portal
                </div>
                <div className="h-px bg-[#E5E5E7] my-1" />
                <div className="space-y-0.5">
                  {WORKSPACES.map((ws) => {
                    const isSelected = currentWorkspace === ws.name
                    return (
                      <div
                        key={ws.id}
                        onClick={() => handleWorkspaceSelect(ws.name)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#F5F9FF] text-[#0071E3] font-semibold'
                            : 'text-[#1D1D1F] hover:bg-[#F5F5F7]'
                        }`}
                      >
                        <span className="truncate">{ws.name}</span>
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 text-[#0071E3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Premium Segmented Navigation Tabs */}
          <nav className="flex items-center bg-[#E3E3E5]/50 p-1 rounded-xl border border-[#D2D2D7]/40 shadow-xs gap-0.5">
            {TABS.filter((tab) => !tab.roles || tab.roles.includes(user?.role)).map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer select-none ${
                    isActive
                      ? 'bg-white text-[#1D1D1F] shadow-sm font-bold'
                      : 'text-[#86868B] hover:text-[#1D1D1F] hover:bg-white/40'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-4">
          {/* Wider Search Bar with subtle shadow */}
          <div className="relative max-w-[220px] hidden lg:block">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-lg bg-[#E8E8ED]/40 border border-[#D2D2D7]/30 pl-8.5 pr-11 py-2 text-xs text-[#1D1D1F] placeholder-[#86868B] outline-none focus:bg-white focus:border-[#0071E3] focus-glow transition-all duration-200 shadow-inner"
              readOnly
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[#86868B] bg-white border border-[#D2D2D7]/60 rounded-md px-1.5 py-0.5 select-none leading-none shadow-3xs">
              ⌘K
            </span>
          </div>

          {/* Help Center Button */}
          <button className="p-2 hover:bg-[#E8E8ED]/60 text-[#86868B] hover:text-[#1D1D1F] rounded-lg transition-colors shrink-0 cursor-pointer active:scale-95" title="Help">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Notifications Button */}
          <button className="relative p-2 hover:bg-[#E8E8ED]/60 text-[#86868B] hover:text-[#1D1D1F] rounded-lg transition-colors shrink-0 cursor-pointer active:scale-95" title="Notifications">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3B30] rounded-full border border-white" />
          </button>

          <div className="h-5 w-px bg-[#D2D2D7] shrink-0" />

          {/* Profile Card Section */}
          <div className="flex items-center gap-3">
            {/* User Initials Avatar with smooth macOS color gradient */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0088FF] to-[#0071E3] flex items-center justify-center text-white text-xs font-bold shadow-md select-none shrink-0 border border-[#006CD7]">
              {initials}
            </div>
            
            {/* User Details label */}
            <div className="hidden md:block leading-none text-left shrink-0">
              <p className="text-xs font-bold text-[#1D1D1F] tracking-tight">{user?.full_name || 'User'}</p>
              <p className="text-[9px] text-[#86868B] font-bold uppercase tracking-wider mt-0.5">{user?.role?.replaceAll('_', ' ') || 'IP Manager'}</p>
            </div>

            {/* Logout Icon Button */}
            <button
              onClick={logout}
              className="text-[#86868B] hover:text-[#FF3B30] p-1.5 hover:bg-[#E8E8ED]/60 rounded-lg cursor-pointer transition-colors active:scale-95 shrink-0"
              title="Sign Out"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Subheader & Breadcrumbs */}
      <div className="bg-[#FFFFFF]/40 border-b border-[#E5E5E7] px-6 py-2.5 flex items-center gap-1.5 text-[10px] font-semibold text-[#86868B] select-none">
        <NavLink to="/" className="hover:text-[#1D1D1F] transition-colors">Home</NavLink>
        {segments.map((seg, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-[#C7C7CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className={i === segments.length - 1 ? "text-[#1D1D1F] font-bold" : "hover:text-[#1D1D1F] transition-colors"}>
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
