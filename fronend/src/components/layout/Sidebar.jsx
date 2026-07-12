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
    <aside className="w-56 shrink-0 border-r border-line bg-surface/50 backdrop-blur-md h-screen sticky top-0 flex flex-col">
      <div className="px-6 py-5 border-b border-line">
        <p className="font-bold text-ink leading-tight text-lg">TTC-MS</p>
        <p className="text-xs text-ink/40 font-medium">Technology Transfer Cell</p>
      </div>
      <nav className="flex-1 py-4 space-y-1">
        {NAV.filter((item) => !item.roles || item.roles.includes(user?.role)).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `block mx-3 px-3 py-2 text-sm rounded-lg font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo/10 text-indigo font-semibold'
                  : 'text-ink/70 hover:bg-paper hover:text-ink'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
