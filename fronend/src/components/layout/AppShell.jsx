import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { useToast } from '../ui/Toast'
import { listPatents } from '../../api/patents'
import { listDisclosures } from '../../api/disclosures'
import { listDeadlines } from '../../api/deadlines'
import { listLicenses } from '../../api/licenses'

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

  // Dropdown states & refs
  const [currentWorkspace, setCurrentWorkspace] = useState('TTC Central')
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const dropdownRef = useRef(null)

  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationsRef = useRef(null)

  const [helpOpen, setHelpOpen] = useState(false)

  // Notification items list
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Respond to office action for PAT-8841 due today.', time: '1 hr ago', read: false, route: '/patents' },
    { id: 2, text: 'New disclosure DISC-1024 submitted by Dr. John Doe.', time: '2 hrs ago', read: false, route: '/disclosures' },
    { id: 3, text: 'SLA Escalation threshold alert triggered on deadlines.', time: '4 hrs ago', read: true, route: '/deadlines' }
  ])

  // Global Command Search States
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [rawItems, setRawItems] = useState([])
  const searchInputRef = useRef(null)

  useEffect(() => {
    setTransitionKey(location.pathname)
  }, [location.pathname])

  // Click outside listener for switcher dropdown & notifications
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setWorkspaceOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcut listener for global search (Cmd+K, Ctrl+K, Escape)
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setHelpOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-focus search input when palette opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
      loadGlobalSearchData()
    } else {
      setSearchQuery('')
      setResults([])
      setActiveIndex(0)
    }
  }, [searchOpen])

  // Load all indexable items for global search
  async function loadGlobalSearchData() {
    try {
      const [patents, disclosures, deadlines, licenses] = await Promise.all([
        listPatents().catch(() => []),
        listDisclosures().catch(() => []),
        listDeadlines().catch(() => []),
        listLicenses().catch(() => [])
      ])

      const combined = [
        ...patents.map((p) => ({
          id: p.id,
          title: p.title,
          category: 'Patents',
          subtitle: `Attorney: ${p.attorney || '—'} · Status: ${p.status}`,
          route: '/patents'
        })),
        ...disclosures.map((d) => ({
          id: d.id,
          title: d.title,
          category: 'Disclosures',
          subtitle: `Inventor: ${d.inventor_names || '—'} · Dept: ${d.department}`,
          route: '/disclosures'
        })),
        ...deadlines.map((dl) => ({
          id: dl.id,
          title: dl.title,
          category: 'Deadlines',
          subtitle: `Due: ${dl.due_date} · Severity: ${dl.severity}`,
          route: '/deadlines'
        })),
        ...licenses.map((l) => ({
          id: l.id,
          title: l.title,
          category: 'Licenses',
          subtitle: `Licensee: ${l.licensee} · Revenue YTD: $${l.revenue_ytd?.toLocaleString() || 0}`,
          route: '/licenses'
        })),
        // Add navigation links as search items
        ...TABS.map((tab) => ({
          id: `nav-${tab.label}`,
          title: `Navigate to ${tab.label}`,
          category: 'App Navigation',
          subtitle: `Go directly to the ${tab.label} page`,
          route: tab.to
        }))
      ]

      setRawItems(combined)
    } catch (err) {
      console.error(err)
    }
  }

  // Filter items in search input
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }
    const q = searchQuery.toLowerCase()
    const filtered = rawItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
    )
    setResults(filtered)
    setActiveIndex(0)
  }, [searchQuery, rawItems])

  // Keyboard navigation inside search palette
  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[activeIndex]) {
        handleSearchResultClick(results[activeIndex])
      }
    }
  }

  const handleSearchResultClick = (item) => {
    setSearchOpen(false)
    navigate(item.route)
    addToast(`Navigating to result: ${item.title}`, 'success')
  }

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

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    addToast('All notifications marked as read', 'success')
  }

  const handleNotificationClick = (n) => {
    setNotifications(notifications.map(item => item.id === n.id ? { ...item, read: true } : item))
    setNotificationsOpen(false)
    navigate(n.route)
  }

  const hasUnread = notifications.some(n => !n.read)

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
          {/* Active Global Search Bar Trigger */}
          <div
            onClick={() => setSearchOpen(true)}
            className="relative max-w-[220px] w-48 hidden lg:block cursor-pointer select-none group"
          >
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-hover:text-[#1D1D1F] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div className="w-full rounded-lg bg-[#E8E8ED]/40 border border-[#D2D2D7]/30 pl-8.5 pr-11 py-2 text-xs text-[#86868B] hover:bg-[#E8E8ED]/70 transition-colors shadow-inner flex items-center justify-between">
              <span>Search...</span>
            </div>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[#86868B] bg-white border border-[#D2D2D7]/60 rounded-md px-1.5 py-0.5 leading-none shadow-3xs">
              ⌘K
            </span>
          </div>

          {/* Help Center Button */}
          <button
            onClick={() => setHelpOpen(true)}
            className="p-2 hover:bg-[#E8E8ED]/60 text-[#86868B] hover:text-[#1D1D1F] rounded-lg transition-colors shrink-0 cursor-pointer active:scale-95"
            title="Help Support"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Notifications Button & Dropdown menu */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-[#E8E8ED]/60 text-[#86868B] hover:text-[#1D1D1F] rounded-lg transition-colors shrink-0 cursor-pointer active:scale-95"
              title="Notifications"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3B30] rounded-full border border-white" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute top-10 right-0 mt-1.5 w-80 bg-white border border-[#E5E5E7] rounded-xl shadow-lg p-2.5 z-50 animate-scale-in">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">Alert Center</span>
                  {hasUnread && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[10px] font-bold text-[#0071E3] hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="h-px bg-[#E5E5E7] my-2" />
                <div className="max-h-60 overflow-y-auto space-y-1 scrollbar pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-2 rounded-lg cursor-pointer transition-colors relative border border-transparent ${
                        n.read ? 'text-[#86868B] hover:bg-[#F5F5F7]' : 'bg-[#F5F9FF] text-[#1D1D1F] hover:border-[#0071E3]/20 font-semibold'
                      }`}
                    >
                      <div className="flex items-start gap-2 pr-4">
                        {!n.read && (
                          <span className="w-1.5 h-1.5 bg-[#0071E3] rounded-full mt-1.5 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs leading-normal break-words">{n.text}</p>
                          <span className="text-[9px] text-[#86868B] font-bold block mt-1">{n.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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

      {/* Apple Spotlight Style Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-[#1D1D1F]/25 backdrop-blur-xs flex items-start justify-center pt-[12vh] p-4 modal-backdrop" onClick={() => setSearchOpen(false)}>
          <div
            className="w-full max-w-xl bg-white border border-[#E5E5E7] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[500px] modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Wrapper */}
            <div className="relative flex items-center border-b border-[#E5E5E7]">
              <svg className="absolute left-4 w-4.5 h-4.5 text-[#86868B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search anything... (patents, disclosures, licenses, navigation)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-11 pr-16 py-4 text-sm text-[#1D1D1F] placeholder-[#86868B] bg-transparent outline-none border-none"
              />
              <span className="absolute right-4 text-[9px] font-bold text-[#86868B] bg-[#F5F5F7] border border-[#D2D2D7]/75 rounded px-1.5 py-0.5 shadow-3xs select-none">
                ESC
              </span>
            </div>

            {/* Results Scrollbox */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar">
              {results.length > 0 ? (
                <div className="space-y-0.5">
                  {results.map((item, index) => {
                    const isFocused = index === activeIndex
                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => handleSearchResultClick(item)}
                        className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-colors ${
                          isFocused ? 'bg-[#0071E3] text-white' : 'hover:bg-[#F5F5F7]'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              isFocused
                                ? 'bg-white/20 text-white'
                                : 'bg-[#E8E8ED] text-[#86868B]'
                            }`}>
                              {item.category}
                            </span>
                            <span className={`text-xs font-semibold truncate ${
                              isFocused ? 'text-white' : 'text-[#1D1D1F]'
                            }`}>
                              {item.title}
                            </span>
                          </div>
                          {item.subtitle && (
                            <p className={`text-[10px] mt-0.5 truncate ${
                              isFocused ? 'text-white/80' : 'text-[#86868B]'
                            }`}>
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        {isFocused && (
                          <svg className="w-4 h-4 text-white shrink-0 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : searchQuery.trim() ? (
                <div className="text-center py-8 text-xs text-[#86868B] font-semibold">
                  No matching search results found.
                </div>
              ) : (
                <div className="space-y-3 p-2 select-none animate-fade-in">
                  <div>
                    <h4 className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-2">Popular Searches</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Patent Spec', 'Office Action', 'Renewals', 'Licensing Agreements'].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="text-[11px] font-medium text-[#1D1D1F] bg-[#F5F5F7] border border-[#D2D2D7]/40 hover:bg-[#E8E8ED] px-3 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-px bg-[#E5E5E7] my-3" />
                  <div>
                    <h4 className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider mb-2">Search Tips</h4>
                    <ul className="text-[11px] text-[#86868B] space-y-1.5 list-disc list-inside">
                      <li>Use <kbd className="bg-[#F5F5F7] border border-[#D2D2D7]/60 px-1 py-0.5 rounded text-[10px] font-bold text-ink">↑</kbd> and <kbd className="bg-[#F5F5F7] border border-[#D2D2D7]/60 px-1 py-0.5 rounded text-[10px] font-bold text-ink">↓</kbd> arrows to navigate list items.</li>
                      <li>Press <kbd className="bg-[#F5F5F7] border border-[#D2D2D7]/60 px-1 py-0.5 rounded text-[10px] font-bold text-ink">Enter</kbd> to execute selection immediately.</li>
                      <li>Use search queries like <code className="bg-[#F5F5F7] px-1 py-0.5 rounded text-[10px] font-mono">filed</code> or <code className="bg-[#F5F5F7] px-1 py-0.5 rounded text-[10px] font-mono">attorney</code>.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apple Spotlight Style Help & Support Dialog */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 bg-[#1D1D1F]/25 backdrop-blur-xs flex items-center justify-center p-4 modal-backdrop" onClick={() => setHelpOpen(false)}>
          <div
            className="w-full max-w-md bg-white border border-[#E5E5E7] rounded-2xl shadow-2xl overflow-hidden flex flex-col modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[#E5E5E7] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#0071E3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-sm font-bold text-[#1D1D1F]">TTC-IPMS Support Center</h3>
              </div>
              <button
                onClick={() => setHelpOpen(false)}
                className="text-[#86868B] hover:text-[#1D1D1F] text-xs font-semibold hover:bg-[#F5F5F7] px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-[#1D1D1F] mb-1">How do I submit an invention disclosure?</h4>
                <p className="text-[#86868B] leading-relaxed">
                  Go to the **Disclosures** tab, click **"+ Submit Disclosure"** on the right side, choose your academic department, list all co-inventors, enter the abstract summary, and submit.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1D1F] mb-1">What is the "Approve & Promote" workflow?</h4>
                <p className="text-[#86868B] leading-relaxed">
                  TTC staff can open any disclosure record under review and click the blue "Approve & Promote" button. This automatically registers it in the **Patents** registry, starting the legal drafting phase.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#1D1D1F] mb-1">Contact Technology Transfer Office</h4>
                <div className="bg-[#F5F5F7] border border-[#D2D2D7]/55 p-3 rounded-xl mt-2 space-y-1 text-[#86868B]">
                  <p className="font-semibold text-[#1D1D1F]">TTC Central Helpdesk</p>
                  <p>Email: <a href="mailto:ttc-support@university.edu" className="text-[#0071E3] hover:underline">ttc-support@university.edu</a></p>
                  <p>Phone: +94 (11) 234-5678 (Ext 400)</p>
                  <p>Hours: Mon–Fri, 9:00 AM – 5:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
