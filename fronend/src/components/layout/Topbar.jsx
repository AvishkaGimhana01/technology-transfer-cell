import { useAuth } from '../../auth/AuthContext'

export default function Topbar() {
  const { user, logout } = useAuth()
  return (
    <header className="h-14 border-b border-line bg-surface/80 backdrop-blur-md flex items-center justify-end px-6 gap-4 sticky top-0 z-45">
      <div className="flex items-center gap-3">
        <span className="text-sm text-ink/80 font-semibold">{user?.full_name}</span>
        <span className="bg-paper border border-line text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full text-ink/55 tabular">
          {user?.role?.replaceAll('_', ' ')}
        </span>
      </div>
      <div className="h-4 w-[1px] bg-line" />
      <button
        onClick={logout}
        className="text-sm text-ink/50 hover:text-rust cursor-pointer transition-colors duration-150 font-medium"
      >
        Sign out
      </button>
    </header>
  )
}
