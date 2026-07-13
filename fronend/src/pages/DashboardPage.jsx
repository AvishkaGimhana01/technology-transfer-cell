import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { listPatents } from '../api/patents'
import { listDisclosures } from '../api/disclosures'
import { listDeadlines } from '../api/deadlines'
import { listLicenses } from '../api/licenses'
import { listProjects } from '../api/projects'
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
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [animateBars, setAnimateBars] = useState(false)
  const [time, setTime] = useState(new Date())

  // Dynamic system clock ticking every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    Promise.allSettled([
      listPatents(),
      listDisclosures(),
      listDeadlines(),
      listLicenses(),
      listProjects()
    ]).then(([patRes, discRes, dlRes, licRes, projRes]) => {
      const pats = patRes.status === 'fulfilled' ? patRes.value : []
      const discs = discRes.status === 'fulfilled' ? discRes.value : []
      const dls = dlRes.status === 'fulfilled' ? dlRes.value : []
      const lics = licRes.status === 'fulfilled' ? licRes.value : []
      const projs = projRes.status === 'fulfilled' ? projRes.value : []

      setPatents(pats)
      setDisclosures(discs)
      setDeadlines(dls)
      setLicenses(lics)
      setProjects(projs)

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
      
      // Trigger pipeline bar growth animation
      setTimeout(() => setAnimateBars(true), 150)
    }).finally(() => setLoading(false))
  }, [])

  const getGreeting = () => {
    const hr = time.getHours()
    if (hr < 12) return 'Good morning'
    if (hr < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const hourRotation = (time.getHours() % 12) * 30 + time.getMinutes() * 0.5
  const minuteRotation = time.getMinutes() * 6
  const secondRotation = time.getSeconds() * 6

  const isAdmin = user?.role === 'super_admin' || user?.role === 'ttc_staff'

  // Filter lists for faculty members
  const myDisclosures = disclosures.filter(d => 
    d.primary_inventor?.toLowerCase().includes('shaw') || 
    d.primary_inventor?.toLowerCase().includes(user?.full_name?.toLowerCase().split(' ').pop())
  )

  const myDeadlines = deadlines.filter(dl => 
    dl.assigned_to?.toLowerCase().includes('shaw') || 
    dl.assigned_to?.toLowerCase().includes(user?.full_name?.toLowerCase().split(' ').pop())
  )

  const myProjects = projects.filter(p => p.faculty_lead_id === user?.id)

  return (
    <>
      {/* Premium macOS Greeting Banner with Real-time Operating Watch */}
      <div className="bg-gradient-to-br from-white via-white to-[#0071E3]/[0.02] border border-[#E5E5E7]/80 rounded-2xl p-6 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-scale-in relative overflow-hidden">
        {/* Glow orb decoration */}
        <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-gradient-to-br from-[#0071E3]/10 to-transparent blur-xl pointer-events-none select-none" />
        
        <div className="flex-1">
          <span className="text-[10px] font-bold text-[#0071E3] uppercase tracking-widest bg-[#0071E3]/5 px-2 py-0.5 rounded-md">
            {isAdmin ? 'Operational Console' : 'Inventor Portal'}
          </span>
          <h2 className="text-xl font-bold text-[#1D1D1F] mt-2">
            {getGreeting()}, {user?.full_name || 'IP Manager'}
          </h2>
          <p className="text-xs text-[#86868B] mt-0.5">
            {isAdmin 
              ? 'Track upcoming due dates, disclosures, patent filings, and licensing royalty metrics.'
              : 'Submit invention disclosures, monitor your technology patent portfolio, and track active industry research projects.'
            }
          </p>

          {/* Quick Action CTAs for Faculty Members */}
          {!isAdmin && (
            <div className="flex flex-wrap gap-2 mt-4 border-t border-[#E5E5E7]/20 pt-3.5">
              <button
                onClick={() => navigate('/disclosures')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo text-white text-[11px] font-bold shadow-sm hover:bg-indigo-dark transition-all active:scale-[0.98] cursor-pointer outline-none"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Submit Disclosure
              </button>
              <button
                onClick={() => navigate('/ipr-violations')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-paper hover:bg-line text-[11px] font-bold text-ink/75 transition-all active:scale-[0.98] cursor-pointer outline-none"
              >
                <svg className="w-3.5 h-3.5 text-[#FF3B30]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Report IPR Violation
              </button>
              <button
                onClick={() => navigate('/innovation-club/applications')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-paper hover:bg-line text-[11px] font-bold text-ink/75 transition-all active:scale-[0.98] cursor-pointer outline-none"
              >
                <svg className="w-3.5 h-3.5 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Club Application
              </button>
            </div>
          )}
        </div>
        
        {/* Real-time Ticking Analog & Digital Watch Component */}
        <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md border border-[#E5E5E7]/60 p-2 rounded-xl shadow-3xs shrink-0 select-none z-10">
          <div className="flex flex-col items-end leading-none">
            <span className="text-[8px] font-bold text-[#86868B] uppercase tracking-wider">Local Time</span>
            <span className="text-xs font-bold text-[#1D1D1F] mt-1.5 tabular-nums">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#F5F5F7] flex items-center justify-center shrink-0 border border-[#D2D2D7]/50 relative shadow-inner">
            <svg className="w-6 h-6 text-[#1D1D1F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <circle cx="12" cy="12" r="9" className="stroke-[#E5E5E7]" strokeWidth={1.5} />
              {/* Hour hand */}
              <line 
                x1="12" y1="12" x2="12" y2="7.5" 
                style={{ 
                  transform: `rotate(${hourRotation}deg)`, 
                  transformOrigin: '12px 12px' 
                }} 
                className="stroke-[#1D1D1F]" 
              />
              {/* Minute hand */}
              <line 
                x1="12" y1="12" x2="15.5" y2="12" 
                style={{ 
                  transform: `rotate(${minuteRotation}deg)`, 
                  transformOrigin: '12px 12px' 
                }} 
                className="stroke-[#1D1D1F]" 
              />
              {/* Second hand */}
              <line 
                x1="12" y1="12" x2="12" y2="6.5" 
                style={{ 
                  transform: `rotate(${secondRotation}deg)`, 
                  transformOrigin: '12px 12px' 
                }} 
                className="stroke-[#FF3B30]" 
                strokeWidth="1"
              />
              <circle cx="12" cy="12" r="1" className="fill-[#FF3B30] stroke-none" />
            </svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-8">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} variant="card" />)}
        </div>
      ) : (
        isAdmin ? (
          <>
            {/* Stat Cards (Admin) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-8 stagger-children">
              {/* Filed Card */}
              <div className="bg-gradient-to-br from-white to-[#0071E3]/[0.015] border border-line rounded-2xl p-5 shadow-2xs hover:border-[#0071E3]/35 hover:shadow-sm hover:shadow-[#0071E3]/[0.02] transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-3.5">
                  <p className="text-[10px] font-bold text-ink/40 uppercase tracking-wider">Filed</p>
                  <div className="w-8 h-8 rounded-xl bg-[#0071E3]/7 flex items-center justify-center text-[#0071E3] shadow-3xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-ink leading-none"><AnimatedCounter value={stats.filed} /></h3>
                <p className="text-[10px] text-ink/40 mt-2 font-semibold flex items-center gap-1">
                  <span className="text-[#34C759]">↑</span> +6 this quarter
                </p>
              </div>

              {/* Granted Card */}
              <div className="bg-gradient-to-br from-white to-[#34C759]/[0.015] border border-line rounded-2xl p-5 shadow-2xs hover:border-[#34C759]/35 hover:shadow-sm hover:shadow-[#34C759]/[0.02] transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-3.5">
                  <p className="text-[10px] font-bold text-ink/40 uppercase tracking-wider">Granted</p>
                  <div className="w-8 h-8 rounded-xl bg-[#34C759]/7 flex items-center justify-center text-[#34C759] shadow-3xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-ink leading-none"><AnimatedCounter value={stats.granted} /></h3>
                <p className="text-[10px] text-ink/40 mt-2 font-semibold">2 notices this month</p>
              </div>

              {/* Pending Card */}
              <div className="bg-gradient-to-br from-white to-[#FF9500]/[0.015] border border-line rounded-2xl p-5 shadow-2xs hover:border-[#FF9500]/35 hover:shadow-sm hover:shadow-[#FF9500]/[0.02] transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-3.5">
                  <p className="text-[10px] font-bold text-ink/40 uppercase tracking-wider">Pending</p>
                  <div className="w-8 h-8 rounded-xl bg-[#FF9500]/7 flex items-center justify-center text-[#FF9500] shadow-3xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-ink leading-none"><AnimatedCounter value={stats.pending} /></h3>
                <p className="text-[10px] text-ink/40 mt-2 font-semibold">Under internal review</p>
              </div>

              {/* Renewals Card */}
              <div className="bg-gradient-to-br from-white to-[#FF3B30]/[0.015] border border-line rounded-2xl p-5 shadow-2xs hover:border-[#FF3B30]/35 hover:shadow-sm hover:shadow-[#FF3B30]/[0.02] transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-3.5">
                  <p className="text-[10px] font-bold text-ink/40 uppercase tracking-wider">Renewals Due</p>
                  <div className="w-8 h-8 rounded-xl bg-[#FF3B30]/7 flex items-center justify-center text-[#FF3B30] shadow-3xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-ink leading-none"><AnimatedCounter value={stats.renewals} /></h3>
                <p className="text-[10px] text-[#FF3B30] mt-2 font-bold bg-[#FF3B30]/5 px-2 py-0.5 rounded inline-block w-fit">3 high priority</p>
              </div>

              {/* Revenue Card */}
              <div className="bg-gradient-to-br from-white to-[#0071E3]/[0.015] border border-line rounded-2xl p-5 shadow-2xs hover:border-[#0071E3]/35 hover:shadow-sm hover:shadow-[#0071E3]/[0.02] transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-3.5">
                  <p className="text-[10px] font-bold text-ink/40 uppercase tracking-wider">Licensing Rev</p>
                  <div className="w-8 h-8 rounded-xl bg-[#0071E3]/7 flex items-center justify-center text-[#0071E3] font-semibold text-xs shadow-3xs">
                    Rs
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-ink leading-none">Rs. {(stats.revenue / 1000).toFixed(0)}k</h3>
                <p className="text-[10px] text-ink/40 mt-2 font-semibold">YTD recognized</p>
              </div>
            </div>

            {/* Pipeline & Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Prosecution Pipeline */}
              <div className="lg:col-span-2 bg-surface border border-line rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Prosecution Pipeline</h3>
                    <p className="text-[11px] text-ink/45 mt-0.5">Volume by lifecycle stage across active disclosures & patents.</p>
                  </div>
                  <svg className="w-5 h-5 text-[#0071E3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <div className="space-y-4 pt-2">
                  {[
                    { label: 'Disclosure', value: disclosures.length || 24, max: 30, color: 'bg-[#0071E3]' },
                    { label: 'Review', value: disclosures.filter(d => d.status === 'under_review').length || 17, max: 30, color: 'bg-[#34C759]' },
                    { label: 'Drafting', value: patents.filter(p => p.status === 'drafting').length || 13, max: 30, color: 'bg-[#FF9500]' },
                    { label: 'Filed', value: patents.filter(p => p.status === 'filed').length || 19, max: 30, color: 'bg-[#005BB5]' },
                    { label: 'Granted', value: patents.filter(p => p.status === 'granted').length || 8, max: 30, color: 'bg-[#34C759]' },
                  ].map((bar, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-ink">
                        <span>{bar.label}</span>
                        <span className="tabular">{bar.value}</span>
                      </div>
                      <div className="h-2 w-full bg-paper rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${bar.color}`}
                          style={{ width: animateBars ? `${(bar.value / bar.max) * 100}%` : '0%' }}
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
                  <p className="text-[11px] text-[#86868B] mt-0.5">Escalation density by urgency and compliance impact.</p>
                </div>
                
                <div className="grid grid-cols-4 gap-3 my-4">
                  <div className="heatmap-box heatmap-low shadow-3xs">Low</div>
                  <div className="heatmap-box heatmap-low shadow-3xs">Low</div>
                  <div className="heatmap-box heatmap-moderate shadow-3xs">Moderate</div>
                  <div className="heatmap-box heatmap-high shadow-3xs">High</div>
                  <div className="heatmap-box heatmap-low shadow-3xs">Low</div>
                  <div className="heatmap-box heatmap-moderate shadow-3xs">Moderate</div>
                  <div className="heatmap-box heatmap-high shadow-3xs">High</div>
                  <div className="heatmap-box heatmap-high shadow-3xs">High</div>
                  <div className="heatmap-box heatmap-low shadow-3xs">Low</div>
                  <div className="heatmap-box heatmap-moderate shadow-3xs">Moderate</div>
                  <div className="heatmap-box heatmap-moderate shadow-3xs">Moderate</div>
                  <div className="heatmap-box heatmap-critical shadow-3xs">Critical</div>
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
                    { text: "Disclosure DISC-1024 routed for internal review", tag: "Workflow", time: "09:20", color: "text-[#0071E3] bg-[#0071E3]/8" },
                    { text: "Document DOC-888 uploaded version 3", tag: "Document", time: "10:15", color: "text-[#34C759] bg-[#34C759]/8" },
                    { text: "Deadline escalation triggered for PAT-8841", tag: "Deadline", time: "11:40", color: "text-[#FF3B30] bg-[#FF3B30]/8" },
                    { text: "License LIC-233 milestone reminder sent", tag: "Commercialization", time: "12:25", color: "text-[#FF9500] bg-[#FF9500]/8" }
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
                  <span className="bg-indigo-light text-[#0071E3] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full">4 Open</span>
                </div>

                <div className="space-y-3">
                  {[
                    { title: "Respond to office action for PAT-8841", details: "Aisha Bennett", due: "Due Today", sev: "Critical", style: "bg-[#FF3B30]/8 text-[#FF3B30]", route: "/patents" },
                    { title: "Review revised inventor declarations", details: "You", due: "Due Tomorrow", sev: "Medium", style: "bg-[#FF9500]/8 text-[#FF9500]", route: "/disclosures" },
                    { title: "Approve license milestone invoice", details: "You", due: "Due in 2 days", sev: "High", style: "bg-[#FF3B30]/8 text-[#FF3B30]", route: "/licenses" },
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
        ) : (
          <>
            {/* Stat Cards (Faculty / User) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-8 stagger-children">
              {/* My Disclosures Card */}
              <div className="bg-gradient-to-br from-white to-[#0071E3]/[0.015] border border-line rounded-2xl p-5 shadow-2xs hover:border-[#0071E3]/35 hover:shadow-sm hover:shadow-[#0071E3]/[0.02] transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-3.5">
                  <p className="text-[10px] font-bold text-ink/40 uppercase tracking-wider">My Disclosures</p>
                  <div className="w-8 h-8 rounded-xl bg-[#0071E3]/7 flex items-center justify-center text-[#0071E3] shadow-3xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-ink leading-none"><AnimatedCounter value={myDisclosures.length} /></h3>
                <p className="text-[10px] text-ink/40 mt-2 font-semibold">Submitted cases</p>
              </div>

              {/* My Patents Card */}
              <div className="bg-gradient-to-br from-white to-[#34C759]/[0.015] border border-line rounded-2xl p-5 shadow-2xs hover:border-[#34C759]/35 hover:shadow-sm hover:shadow-[#34C759]/[0.02] transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-3.5">
                  <p className="text-[10px] font-bold text-ink/40 uppercase tracking-wider">My Patents</p>
                  <div className="w-8 h-8 rounded-xl bg-[#34C759]/7 flex items-center justify-center text-[#34C759] shadow-3xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-ink leading-none"><AnimatedCounter value={1} /></h3>
                <p className="text-[10px] text-[#34C759] mt-2 font-bold bg-[#34C759]/5 px-2 py-0.5 rounded inline-block w-fit">PAT-8790 Active</p>
              </div>

              {/* My Projects Card */}
              <div className="bg-gradient-to-br from-white to-[#FF9500]/[0.015] border border-line rounded-2xl p-5 shadow-2xs hover:border-[#FF9500]/35 hover:shadow-sm hover:shadow-[#FF9500]/[0.02] transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-3.5">
                  <p className="text-[10px] font-bold text-ink/40 uppercase tracking-wider">My Projects</p>
                  <div className="w-8 h-8 rounded-xl bg-[#FF9500]/7 flex items-center justify-center text-[#FF9500] shadow-3xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4.674 12.03a3 3 0 11-4.043-4.043L15.674 18.03z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-ink leading-none"><AnimatedCounter value={myProjects.length} /></h3>
                <p className="text-[10px] text-ink/40 mt-2 font-semibold">Industry funded</p>
              </div>

              {/* My Action Items Card */}
              <div className="bg-gradient-to-br from-white to-[#FF3B30]/[0.015] border border-line rounded-2xl p-5 shadow-2xs hover:border-[#FF3B30]/35 hover:shadow-sm hover:shadow-[#FF3B30]/[0.02] transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-3.5">
                  <p className="text-[10px] font-bold text-ink/40 uppercase tracking-wider">Action Items</p>
                  <div className="w-8 h-8 rounded-xl bg-[#FF3B30]/7 flex items-center justify-center text-[#FF3B30] shadow-3xs">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-ink leading-none"><AnimatedCounter value={myDeadlines.length} /></h3>
                <p className="text-[10px] text-[#FF3B30] mt-2 font-bold bg-[#FF3B30]/5 px-2 py-0.5 rounded inline-block w-fit">Revision required</p>
              </div>

              {/* My YTD Royalties Card */}
              <div className="bg-gradient-to-br from-white to-[#0071E3]/[0.015] border border-line rounded-2xl p-5 shadow-2xs hover:border-[#0071E3]/35 hover:shadow-sm hover:shadow-[#0071E3]/[0.02] transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-3.5">
                  <p className="text-[10px] font-bold text-ink/40 uppercase tracking-wider">Royalty Share</p>
                  <div className="w-8 h-8 rounded-xl bg-[#0071E3]/7 flex items-center justify-center text-[#0071E3] font-semibold text-xs shadow-3xs">
                    Rs
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold text-ink leading-none">Rs. {(myProjects.length * 17500).toLocaleString()}</h3>
                <p className="text-[10px] text-ink/40 mt-2 font-semibold">YTD earned share</p>
              </div>
            </div>

            {/* Inventions & Collaborations Portfolio */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* My Inventions list */}
              <div className="lg:col-span-2 bg-surface border border-line rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xs font-bold text-ink uppercase tracking-wider">My Invention Disclosures</h3>
                    <p className="text-[11px] text-ink/45 mt-0.5">Active patent drafts and invention declarations submitted to TTC.</p>
                  </div>
                  <button onClick={() => navigate('/disclosures')} className="text-xs font-bold text-indigo hover:underline cursor-pointer">
                    View All
                  </button>
                </div>
                
                <div className="space-y-4">
                  {myDisclosures.length === 0 ? (
                    <div className="py-8 text-center text-xs text-ink/40">No disclosures submitted yet.</div>
                  ) : (
                    myDisclosures.map((d, i) => (
                      <div key={i} className="flex items-start justify-between gap-4 py-2.5 border-b border-line/30 last:border-0">
                        <div>
                          <h4 className="text-xs font-bold text-ink">{d.title}</h4>
                          <p className="text-[10px] text-ink/40 mt-1 font-semibold">Dept: {d.department} · Reviewer: {d.reviewer || 'TTC Staff'}</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg text-center ${
                          d.status === 'under_review' ? 'bg-[#0071E3]/5 text-[#0071E3]' :
                          d.status === 'needs_revision' ? 'bg-[#FF9500]/5 text-[#FF9500]' :
                          d.status === 'ready_for_filing' ? 'bg-[#34C759]/5 text-[#34C759]' : 'bg-paper text-ink/40'
                        }`}>
                          {d.status?.replace('_', ' ')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Research Resources Panel */}
              <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Research Resources</h3>
                  <p className="text-[11px] text-[#86868B] mt-0.5">Reference guides and documents for university inventors.</p>
                </div>

                <div className="space-y-3 my-4">
                  <a href="#" className="flex items-center gap-2.5 text-xs text-ink/80 hover:text-indigo transition-colors font-semibold">
                    <span className="w-5 h-5 rounded-lg bg-[#FF3B30]/5 text-[#FF3B30] flex items-center justify-center text-[10px]">PDF</span>
                    Colombo University IP Policy
                  </a>
                  <a href="#" className="flex items-center gap-2.5 text-xs text-ink/80 hover:text-indigo transition-colors font-semibold">
                    <span className="w-5 h-5 rounded-lg bg-[#34C759]/5 text-[#34C759] flex items-center justify-center text-[10px]">DOC</span>
                    TTC Disclosure Template
                  </a>
                  <a href="#" className="flex items-center gap-2.5 text-xs text-ink/80 hover:text-indigo transition-colors font-semibold">
                    <span className="w-5 h-5 rounded-lg bg-[#0071E3]/5 text-[#0071E3] flex items-center justify-center text-[10px]">URL</span>
                    PCT Patent Filing Flowchart
                  </a>
                  <a href="#" className="flex items-center gap-2.5 text-xs text-ink/80 hover:text-indigo transition-colors font-semibold">
                    <span className="w-5 h-5 rounded-lg bg-amber/5 text-amber flex items-center justify-center text-[10px]">📞</span>
                    TTC Staff Support Directory
                  </a>
                </div>
                
                <div className="text-[9px] text-[#86868B] border-t border-[#E5E5E7]/55 pt-3 leading-relaxed">
                  Need help drafting claims? Contact the Technology Transfer Cell support desk.
                </div>
              </div>
            </div>

            {/* My Projects & My Action Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* My Industry Research Projects */}
              <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider">My Industry Collaborations</h3>
                  <button onClick={() => navigate('/projects')} className="text-xs font-bold text-indigo hover:underline cursor-pointer">
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  {myProjects.length === 0 ? (
                    <div className="py-6 text-center text-xs text-ink/40">No active industry projects found.</div>
                  ) : (
                    myProjects.map((p, i) => (
                      <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-line/30 last:border-0">
                        <div>
                          <h4 className="text-xs font-bold text-ink hover:text-indigo cursor-pointer transition-colors" onClick={() => navigate(`/projects/${p.id}`)}>{p.title}</h4>
                          <p className="text-[10px] text-ink/40 mt-1 font-semibold font-medium">Partner: {p.industry_partner_name} · Budget: Rs. {p.budget?.toLocaleString()}</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg ${
                          p.status === 'ongoing' ? 'bg-[#34C759]/5 text-[#34C759]' :
                          p.status === 'proposed' ? 'bg-[#0071E3]/5 text-[#0071E3]' : 'bg-paper text-ink/40'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* My Action Items */}
              <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider">My Urgent Actions</h3>
                  <span className="bg-indigo-light text-[#0071E3] text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {myDeadlines.length} Open
                  </span>
                </div>

                <div className="space-y-3">
                  {myDeadlines.length === 0 ? (
                    <div className="py-6 text-center text-xs text-ink/40">No urgent action items.</div>
                  ) : (
                    myDeadlines.map((dl, i) => (
                      <div
                        key={i}
                        onClick={() => navigate('/deadlines')}
                        className="flex items-center justify-between gap-4 p-3 border border-line rounded-xl hover:border-ink/20 hover:bg-paper/20 transition-all duration-150 cursor-pointer"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-ink hover:text-indigo transition-colors">{dl.title}</h4>
                          <p className="text-[10px] text-ink/40 font-semibold mt-0.5">Assigned to: You · Due: {dl.due_date}</p>
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          dl.severity === 'critical' || dl.severity === 'high' ? 'bg-[#FF3B30]/8 text-[#FF3B30]' : 'bg-paper text-ink/50'
                        }`}>
                          {dl.severity}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )
      )}
    </>
  )
}
