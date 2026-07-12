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
