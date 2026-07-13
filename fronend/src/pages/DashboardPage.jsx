import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { listPatents } from '../api/patents'
import { listDisclosures } from '../api/disclosures'
import { listDeadlines } from '../api/deadlines'
import { listLicenses } from '../api/licenses'
import PageHeader from '../components/ui/PageHeader'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import Skeleton from '../components/ui/Skeleton'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState({ filed: 43, granted: 12, pending: 19, renewals: 6, revenue: 128000 })
  const [patents, setPatents] = useState([])
  const [disclosures, setDisclosures] = useState([])
  const [deadlines, setDeadlines] = useState([])
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      listPatents(),
      listDisclosures(),
      listDeadlines(),
      listLicenses()
    ]).then(([patRes, discRes, dlRes, licRes]) => {
      const pats = patRes.status === 'fulfilled' ? patRes.value : []
      const discs = discRes.status === 'fulfilled' ? discRes.value : []
      const dls = dlRes.status === 'fulfilled' ? dlRes.value : []
      const lics = licRes.status === 'fulfilled' ? licRes.value : []

      setPatents(pats)
      setDisclosures(discs)
      setDeadlines(dls)
      setLicenses(lics)

      // Dynamically calculate metrics based on db entries, falling back to Figma design defaults
      const filedCount = pats.filter(p => p.status === 'filed').length || 43
      const grantedCount = pats.filter(p => p.status === 'granted').length || 12
      const pendingCount = discs.length || 19
      const renewalsCount = dls.filter(d => d.severity === 'critical' || d.severity === 'high').length || 6
      const revenueSum = lics.reduce((acc, l) => acc + (l.revenue_ytd || 0), 0) || 128000

      setStats({
        filed: filedCount,
        granted: grantedCount,
        pending: pendingCount,
        renewals: renewalsCount,
        revenue: revenueSum
      })
    }).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Monitor filing throughput, deadline risk, licensing progress, recent activity, and tasks from a single institutional view."
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
          </svg>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-8">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} variant="card" />)}
        </div>
      ) : (
        /* Stat Cards */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-8 stagger-children">
          <div className="bg-surface border border-line rounded-2xl p-5 shadow-xs card-hover border-l-4 border-l-indigo">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-ink/40 uppercase tracking-wider">Filed</p>
              <div className="w-7 h-7 rounded-lg bg-indigo-light flex items-center justify-center text-indigo">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-ink"><AnimatedCounter value={stats.filed} /></h3>
            <p className="text-[10px] text-ink/40 mt-1.5 font-medium">+6 this quarter</p>
          </div>

          <div className="bg-surface border border-line rounded-2xl p-5 shadow-xs card-hover border-l-4 border-l-teal">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-ink/40 uppercase tracking-wider">Granted</p>
              <div className="w-7 h-7 rounded-lg bg-teal-light flex items-center justify-center text-teal">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-ink"><AnimatedCounter value={stats.granted} /></h3>
            <p className="text-[10px] text-ink/40 mt-1.5 font-medium">2 notices this month</p>
          </div>

          <div className="bg-surface border border-line rounded-2xl p-5 shadow-xs card-hover border-l-4 border-l-amber">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-ink/40 uppercase tracking-wider">Pending</p>
              <div className="w-7 h-7 rounded-lg bg-amber-light flex items-center justify-center text-amber">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-ink"><AnimatedCounter value={stats.pending} /></h3>
            <p className="text-[10px] text-ink/40 mt-1.5 font-medium">Under internal review</p>
          </div>

          <div className="bg-surface border border-line rounded-2xl p-5 shadow-xs card-hover border-l-4 border-l-rust">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-ink/40 uppercase tracking-wider">Renewals Due</p>
              <div className="w-7 h-7 rounded-lg bg-rust-light flex items-center justify-center text-rust">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-ink"><AnimatedCounter value={stats.renewals} /></h3>
            <p className="text-[10px] text-ink/40 mt-1.5 font-medium">3 high priority</p>
          </div>

          <div className="bg-surface border border-line rounded-2xl p-5 shadow-xs card-hover border-l-4 border-l-indigo">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-ink/40 uppercase tracking-wider">Licensing Rev</p>
              <div className="w-7 h-7 rounded-lg bg-indigo-light flex items-center justify-center text-indigo">
                <span className="text-xs font-bold">$</span>
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-ink">${(stats.revenue / 1000).toFixed(0)}k</h3>
            <p className="text-[10px] text-ink/40 mt-1.5 font-medium">YTD recognized</p>
          </div>
        </div>
      )}

      {/* Pipeline & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Prosecution Pipeline */}
        <div className="lg:col-span-2 bg-surface border border-line rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Prosecution Pipeline</h3>
              <p className="text-[11px] text-ink/45 mt-0.5">Volume by lifecycle stage across active disclosures & patents.</p>
            </div>
            <svg className="w-5 h-5 text-indigo/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          
          <div className="space-y-4 pt-2">
            {[
              { label: 'Disclosure', value: disclosures.length || 24, max: 30, color: 'bg-indigo' },
              { label: 'Review', value: disclosures.filter(d => d.status === 'under_review').length || 17, max: 30, color: 'bg-teal' },
              { label: 'Drafting', value: patents.filter(p => p.status === 'drafting').length || 13, max: 30, color: 'bg-amber' },
              { label: 'Filed', value: patents.filter(p => p.status === 'filed').length || 19, max: 30, color: 'bg-indigo-dark' },
              { label: 'Granted', value: patents.filter(p => p.status === 'granted').length || 8, max: 30, color: 'bg-teal' },
            ].map((bar, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-ink">
                  <span>{bar.label}</span>
                  <span className="tabular">{bar.value}</span>
                </div>
                <div className="h-2 w-full bg-paper rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${bar.color}`}
                    style={{ width: `${(bar.value / bar.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Deadline Risk Heatmap</h3>
            <p className="text-[11px] text-ink/45 mt-0.5">Escalation density by urgency and compliance impact.</p>
          </div>
          
          <div className="grid grid-cols-4 gap-3 my-4">
            <div className="heatmap-box heatmap-low">Low</div>
            <div className="heatmap-box heatmap-low">Low</div>
            <div className="heatmap-box heatmap-moderate">Moderate</div>
            <div className="heatmap-box heatmap-high">High</div>
            <div className="heatmap-box heatmap-low">Low</div>
            <div className="heatmap-box heatmap-moderate">Moderate</div>
            <div className="heatmap-box heatmap-high">High</div>
            <div className="heatmap-box heatmap-high">High</div>
            <div className="heatmap-box heatmap-low">Low</div>
            <div className="heatmap-box heatmap-moderate">Moderate</div>
            <div className="heatmap-box heatmap-moderate">Moderate</div>
            <div className="heatmap-box heatmap-critical">Critical</div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-ink/35 border-t border-line pt-3">
            <span>Low Risk</span>
            <span>Critical Risk</span>
          </div>
        </div>
      </div>

      {/* Activity & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Recent Activity</h3>
            <button className="text-xs font-bold text-indigo hover:underline cursor-pointer">View All</button>
          </div>
          
          <div className="space-y-4">
            {[
              { text: "Disclosure DISC-1024 routed for internal review", tag: "Workflow", time: "09:20", color: "text-indigo bg-indigo-light" },
              { text: "Document DOC-888 uploaded version 3", tag: "Document", time: "10:15", color: "text-teal bg-teal-light" },
              { text: "Deadline escalation triggered for PAT-8841", tag: "Deadline", time: "11:40", color: "text-rust bg-rust-light" },
              { text: "License LIC-233 milestone reminder sent", tag: "Commercialization", time: "12:25", color: "text-amber bg-amber-light" }
            ].map((act, i) => (
              <div key={i} className="flex items-start justify-between gap-4 py-1 border-b border-line/30 last:border-0">
                <div className="flex gap-3">
                  <div className="mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo animate-pulse-dot" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink/80">{act.text}</p>
                    <span className={`inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg mt-1.5 ${act.color}`}>
                      {act.tag}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-ink/35 font-semibold shrink-0 tabular">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">My Tasks</h3>
            <span className="bg-indigo-light text-indigo text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full">4 Open</span>
          </div>

          <div className="space-y-3">
            {[
              { title: "Respond to office action for PAT-8841", details: "Aisha Bennett", due: "Due Today", sev: "Critical", style: "bg-rust-light text-rust", route: "/patents" },
              { title: "Review revised inventor declarations", details: "You", due: "Due Tomorrow", sev: "Medium", style: "bg-amber-light text-amber", route: "/disclosures" },
              { title: "Approve license milestone invoice", details: "You", due: "Due in 2 days", sev: "High", style: "bg-rust-light text-rust", route: "/licenses" },
              { title: "Update saved report for quarterly board review", details: "Rohan Gupta", due: "Due in 4 days", sev: "Low", style: "bg-paper text-ink/50", route: "/reports" }
            ].map((task, i) => (
              <div
                key={i}
                onClick={() => navigate(task.route)}
                className="flex items-center justify-between gap-4 p-3 border border-line rounded-xl hover:border-ink/20 hover:bg-paper/20 transition-all duration-150 cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-bold text-ink hover:text-indigo transition-colors">{task.title}</h4>
                  <p className="text-[10px] text-ink/40 font-semibold mt-0.5">{task.details} · {task.due}</p>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${task.style}`}>
                  {task.sev}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
