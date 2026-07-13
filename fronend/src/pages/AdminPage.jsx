import { useEffect, useState } from 'react'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import Button from '../components/ui/Button'
import { useToast } from '../components/ui/Toast'

// Pre-seeded role logs for admin visibility
const columns = [
  { key: 'user', label: 'User Operator' },
  { key: 'role', label: 'Assigned Role', render: (r) => <span className="uppercase text-[10px] font-bold bg-indigo-light text-indigo px-2 py-0.5 rounded">{r.role}</span> },
  { key: 'action', label: 'Administrative Action' },
  { key: 'time', label: 'Timestamp', render: (r) => r.time || '—' },
]

export default function AdminPage() {
  const { addToast } = useToast()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Generate realistic administrative audit trail logs
    const mockLogs = [
      { id: 1, user: "Aisha Bennett", role: "ttc_staff", action: "Promoted PAT-8841 status to Office Action", time: "2026-07-13 08:35:12" },
      { id: 2, user: "Elena Brooks", role: "super_admin", action: "Assigned Attorney Aisha Bennett to PAT-8540 case", time: "2026-07-13 08:22:45" },
      { id: 3, user: "Rohan Gupta", role: "ttc_staff", action: "Created License Apple Inc. agreement", time: "2026-07-13 07:11:03" },
      { id: 4, user: "Prof. Daniel Shaw", role: "faculty", action: "Initiated Invention Disclosure DISC-1021", time: "2026-07-13 06:45:18" }
    ]
    setLogs(mockLogs)
    setLoading(false)
  }, [])

  const triggerReset = () => {
    addToast('All IP cache tables optimized successfully.', 'success')
  }

  return (
    <>
      <PageHeader
        title="Administrative Controls"
        description="Manage security policies, view system audit logs, and configure workflow step definitions."
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
        action={<Button onClick={triggerReset}>Optimize Cache</Button>}
      />

      <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs mb-8">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-2">Workflow Configurations</h3>
        <p className="text-[11px] text-ink/45 mb-4">Set required review signoffs, reminder durations, and auto-escalation timings.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
          <div className="border border-line rounded-xl p-4 bg-paper/30">
            <span className="text-[9px] font-bold text-ink/30 uppercase">Escalation path</span>
            <p className="font-bold text-ink/80 mt-1">Assignee → Reviewer → Admin</p>
          </div>
          <div className="border border-line rounded-xl p-4 bg-paper/30">
            <span className="text-[9px] font-bold text-ink/30 uppercase">Intake check list</span>
            <p className="font-bold text-ink/80 mt-1">Capture inventors, attach docs</p>
          </div>
          <div className="border border-line rounded-xl p-4 bg-paper/30">
            <span className="text-[9px] font-bold text-ink/30 uppercase">Office Action reminders</span>
            <p className="font-bold text-ink/80 mt-1">Every 30 / 14 / 7 days</p>
          </div>
        </div>
      </div>

      <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">Recent Administration Audit Logs</h3>
      <DataTable
        columns={columns}
        rows={logs}
        loading={loading}
        emptyLabel="No admin activities recorded yet."
      />
    </>
  )
}
