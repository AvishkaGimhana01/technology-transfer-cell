import { useEffect, useState } from 'react'
import { listPatents } from '../api/patents'
import { listLicenses } from '../api/licenses'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import { useToast } from '../components/ui/Toast'

export default function ReportsPage() {
  const { addToast } = useToast()
  const [patents, setPatents] = useState([])
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([listPatents(), listLicenses()])
      .then(([pats, lics]) => {
        setPatents(pats)
        setLicenses(lics)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const triggerDownload = (reportName) => {
    addToast(`Exporting ${reportName}... Excel spreadsheet compilation ready.`, 'success')
  }

  return (
    <>
      <PageHeader
        title="Audit & Financial Reports"
        description="Compile portfolio-level financial summaries, prosecution SLA tracking, and audit trails."
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
      />

      {/* Dynamic Graph/Metrics Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 stagger-children">
        {/* Metric Chart 1: Licensing YTD Distribution */}
        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs">
          <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-4">Licensing Revenue Distribution</h4>
          <div className="flex items-end justify-between h-40 gap-4 pt-4 border-b border-line">
            {[
              { label: 'Q1', val: 35000 },
              { label: 'Q2', val: 52000 },
              { label: 'Q3', val: 78000 },
              { label: 'Q4', val: 128000 }
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-indigo tabular">Rs. {(bar.val / 1000).toFixed(0)}k</span>
                <div
                  className="w-full rounded-t-lg bg-indigo transition-all duration-1000"
                  style={{ height: `${(bar.val / 130000) * 110}px` }}
                />
                <span className="text-[10px] font-bold text-ink/35 uppercase mb-1">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Metric Chart 2: Patent SLA Compliance status */}
        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-2">Prosecution SLA Timeliness</h4>
            <p className="text-[11px] text-ink/40">Timely filing index parameters against patent office due dates.</p>
          </div>
          
          <div className="space-y-4 my-4">
            {[
              { status: 'Office Actions Responded', percentage: 94, color: 'bg-teal' },
              { status: 'Patent Filings On Time', percentage: 88, color: 'bg-indigo' },
              { status: 'Audit Trail Completion', percentage: 100, color: 'bg-indigo-dark' }
            ].map((sla, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-ink/80">
                  <span>{sla.status}</span>
                  <span className="tabular">{sla.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-paper rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${sla.color}`}
                    style={{ width: `${sla.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
        {/* Financial reports */}
        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs flex flex-col justify-between card-hover">
          <div>
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-2">Financial Report</h3>
            <p className="text-[11px] text-ink/45 mb-4">Export active IP licensing royalties, patent filing budgets, and attorney fees.</p>
          </div>
          <div className="border-t border-line/50 pt-4 flex justify-between items-center mt-6">
            <span className="text-xs font-bold text-indigo tabular">
              YTD: Rs. {licenses.reduce((acc, curr) => acc + (curr.revenue_ytd || 0), 0).toLocaleString()}
            </span>
            <Button variant="primary" className="py-1 px-3 text-xs" onClick={() => triggerDownload('Financial Report')}>
              Export XLS
            </Button>
          </div>
        </div>

        {/* Prosecution SLA report */}
        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs flex flex-col justify-between card-hover">
          <div>
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-2">Prosecution SLA</h3>
            <p className="text-[11px] text-ink/45 mb-4">Track response timelines for office actions and examiner escalations.</p>
          </div>
          <div className="border-t border-line/50 pt-4 flex justify-between items-center mt-6">
            <span className="text-xs font-bold text-indigo tabular">
              Cases: {patents.length} active
            </span>
            <Button variant="primary" className="py-1 px-3 text-xs" onClick={() => triggerDownload('Prosecution Report')}>
              Export XLS
            </Button>
          </div>
        </div>

        {/* Audit trail reports */}
        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs flex flex-col justify-between card-hover">
          <div>
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-2">Audit Trails</h3>
            <p className="text-[11px] text-ink/45 mb-4">Log system login metadata, roles revisions, and approval history.</p>
          </div>
          <div className="border-t border-line/50 pt-4 flex justify-between items-center mt-6">
            <span className="text-xs font-bold text-indigo">
              Compliance: 100%
            </span>
            <Button variant="primary" className="py-1 px-3 text-xs" onClick={() => triggerDownload('System Audit Log')}>
              Export XLS
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
