import { useEffect, useState } from 'react'
import { listApplications, updateApplicationStatus } from '../../api/innovationClub'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import StatusDot from '../../components/ui/StatusDot'
import Button from '../../components/ui/Button'
import RoleGate from '../../auth/RoleGate'
import EmptyState from '../../components/ui/EmptyState'

export default function ApplicationsAdminPage() {
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
      refresh()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update application status.')
    }
  }

  const columns = [
    { key: 'applicant_name', label: 'Applicant' },
    { key: 'applicant_email', label: 'Email' },
    {
      key: 'applicant_type',
      label: 'Type',
      render: (r) => <span className="capitalize">{r.applicant_type}</span>,
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
              variant="primary"
              onClick={() => handleStatus(r.id, 'approved')}
              className="py-1 px-2 text-xs"
            >
              Approve
            </Button>
            <Button
              variant="danger"
              onClick={() => handleStatus(r.id, 'rejected')}
              className="py-1 px-2 text-xs"
            >
              Reject
            </Button>
          </div>
        ) : (
          '-'
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
      />
      {loading ? (
        <div className="text-sm text-ink/50 py-10 text-center">Loading applications...</div>
      ) : (
        <DataTable columns={columns} rows={apps} emptyLabel="No applications received yet." />
      )}
    </RoleGate>
  )
}
