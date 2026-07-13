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

  return (
    <>
      {/* Premium macOS Greeting Banner with Real-time Operating Watch */}
      <div className="bg-gradient-to-r from-[#FFFFFF] to-[#F5F5F7] border border-[#E5E5E7] rounded-2xl p-6 mb-8 shadow-xs flex items-center justify-between gap-4 animate-scale-in">
        <div>
          <span className="text-[10px] font-bold text-[#0071E3] uppercase tracking-widest">Operational Console</span>
          <h2 className="text-xl font-bold text-[#1D1D1F] mt-1">
            {getGreeting()}, {user?.full_name || 'IP Manager'}
          </h2>
          <p className="text-xs text-[#86868B] mt-0.5">Track upcoming due dates, disclosures, patent filings, and licensing royalty metrics.</p>
        </div>
        
        {/* Real-time Ticking Analog & Digital Watch Component */}
        <div className="flex items-center gap-3 bg-white border border-[#E5E5E7] p-2 rounded-xl shadow-2xs shrink-0 select-none">
          <div className="flex flex-col items-end leading-none">
            <span className="text-[8px] font-bold text-[#86868B] uppercase tracking-wider">Local Time</span>
            <span className="text-xs font-bold text-[#1D1D1F] mt-1 tabular-nums">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#F5F5F7] flex items-center justify-center shrink-0 border border-[#D2D2D7]/50 relative">
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
  )
}
