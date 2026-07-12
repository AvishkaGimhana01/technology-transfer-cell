import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { listProjects } from '../api/projects'
import { listAgreements } from '../api/agreements'
import { listMous } from '../api/mous'
import { listPosts } from '../api/noticeboard'
import PageHeader from '../components/ui/PageHeader'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ projects: 0, agreements: 0, mous: 0, notices: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      listProjects(),
      listAgreements(),
      listMous(),
      listPosts()
    ]).then(([projRes, agrRes, mouRes, noteRes]) => {
      setStats({
        projects: projRes.status === 'fulfilled' ? projRes.value.length : 0,
        agreements: agrRes.status === 'fulfilled' ? agrRes.value.length : 0,
        mous: mouRes.status === 'fulfilled' ? mouRes.value.length : 0,
        notices: noteRes.status === 'fulfilled' ? noteRes.value.length : 0,
      })
    }).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.full_name || 'User'}. Here is a summary of the Technology Transfer Cell activities.`}
      />
      {loading ? (
        <div className="text-sm text-ink/50 py-10 text-center">Loading summary metrics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface border border-line rounded-lg p-5 shadow-sm">
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wider">Industry Projects</p>
            <h3 className="text-3xl font-bold text-indigo mt-2 tabular">{stats.projects}</h3>
            <p className="text-xs text-ink/40 mt-1">Consultancy & collaborations</p>
          </div>
          <div className="bg-surface border border-line rounded-lg p-5 shadow-sm">
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wider">Agreements</p>
            <h3 className="text-3xl font-bold text-teal mt-2 tabular">{stats.agreements}</h3>
            <p className="text-xs text-ink/40 mt-1">NDAs, Licensing & more</p>
          </div>
          <div className="bg-surface border border-line rounded-lg p-5 shadow-sm">
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wider">Signed MOUs</p>
            <h3 className="text-3xl font-bold text-amber mt-2 tabular">{stats.mous}</h3>
            <p className="text-xs text-ink/40 mt-1">Partnership Memorandums</p>
          </div>
          <div className="bg-surface border border-line rounded-lg p-5 shadow-sm">
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wider">Noticeboard</p>
            <h3 className="text-3xl font-bold text-ink mt-2 tabular">{stats.notices}</h3>
            <p className="text-xs text-ink/40 mt-1">Active announcements</p>
          </div>
        </div>
      )}

      <div className="bg-surface border border-line rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-ink mb-2">University Quick Links</h2>
        <p className="text-sm text-ink/60 mb-4">Access key forms and report mechanisms below:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/apply" className="block border border-line rounded-md p-4 hover:bg-paper transition-colors group">
            <h4 className="text-sm font-semibold text-indigo group-hover:underline">Innovation Club Application</h4>
            <p className="text-xs text-ink/50 mt-1">Submit innovative ideas and applications (Public link).</p>
          </a>
          <a href="/ipr-violations" className="block border border-line rounded-md p-4 hover:bg-paper transition-colors group">
            <h4 className="text-sm font-semibold text-rust group-hover:underline">IPR Violation Report Form</h4>
            <p className="text-xs text-ink/50 mt-1">Submit reports regarding potential intellectual property violations.</p>
          </a>
        </div>
      </div>
    </>
  )
}
