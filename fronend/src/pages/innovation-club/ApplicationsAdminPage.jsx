import { useEffect, useState } from 'react'
import { listApplications, updateApplicationStatus } from '../../api/innovationClub'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import StatusDot from '../../components/ui/StatusDot'
import Button from '../../components/ui/Button'
import RoleGate from '../../auth/RoleGate'
import EmptyState from '../../components/ui/EmptyState'
import { useToast } from '../../components/ui/Toast'

export default function ApplicationsAdminPage() {
  const { addToast } = useToast()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    try {
      const data = await listApplications()
      setApps(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleStatus(id, status) {
    try {
      await updateApplicationStatus(id, status)
      addToast(`Application ${status} successfully.`, status === 'approved' ? 'success' : 'warning')
      refresh()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to update application status.', 'error')
    }
  }

  const columns = [
    { key: 'applicant_name', label: 'Applicant' },
    { key: 'applicant_email', label: 'Email' },
    {
      key: 'applicant_type',
      label: 'Type',
      render: (r) => (
        <span className="capitalize bg-paper px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider text-ink/50">
          {r.applicant_type}
        </span>
      ),
    },
    { key: 'idea_title', label: 'Idea Title' },
    { key: 'status', label: 'Status', render: (r) => <StatusDot status={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) =>
        r.status === 'pending' ? (
          <div className="flex gap-2">
            <Button
              variant="success"
              onClick={() => handleStatus(r.id, 'approved')}
              className="py-1 px-2.5 text-xs"
            >
              Approve
            </Button>
            <Button
              variant="danger"
              onClick={() => handleStatus(r.id, 'rejected')}
              className="py-1 px-2.5 text-xs"
            >
              Reject
            </Button>
          </div>
        ) : (
          <span className="text-ink/25 text-xs">—</span>
        ),
    },
  ]

  return (
    <RoleGate
      roles={['super_admin', 'ttc_staff']}
      fallback={
        <EmptyState
          title="Access Denied"
          message="Only TTC Staff and Admins are authorized to view club applications."
          icon="🔒"
        />
      }
    >
      <PageHeader
        title="Innovation Club Applications"
        description="Review student and faculty idea submissions to the Innovation Club."
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        }
      />
      <DataTable columns={columns} rows={apps} loading={loading} emptyLabel="No applications received yet." />
    </RoleGate>
  )
}
