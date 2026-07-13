import { useAuth } from '../../auth/AuthContext'

export default function Topbar() {
  const { user, logout } = useAuth()

  const initials = user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  return (
    <header className="h-14 border-b border-line glass sticky top-0 z-40 flex items-center justify-between px-6">
      {/* Left — Search */}
      <div className="relative max-w-xs w-full">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search records..."
          className="w-full rounded-lg bg-paper/80 border border-line pl-9 pr-3 py-1.5 text-sm text-ink placeholder-ink/30 outline-none focus-glow transition-all duration-200"
          readOnly
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-ink/25 font-medium bg-surface border border-line rounded px-1.5 py-0.5">
          ⌘K
        </span>
      </div>

      {/* Right — User controls */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button className="relative p-1.5 rounded-lg hover:bg-paper text-ink/40 hover:text-ink transition-colors duration-150 cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-rust rounded-full" />
        </button>

        <div className="h-5 w-px bg-line" />

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo to-indigo-dark flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-ink leading-tight">{user?.full_name}</p>
            <p className="text-[10px] text-ink/40 capitalize">{user?.role?.replaceAll('_', ' ')}</p>
          </div>
        </div>

        <div className="h-5 w-px bg-line" />

        <button
          onClick={logout}
          className="text-xs text-ink/40 hover:text-rust cursor-pointer transition-colors duration-150 font-medium flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </header>
  )
}
