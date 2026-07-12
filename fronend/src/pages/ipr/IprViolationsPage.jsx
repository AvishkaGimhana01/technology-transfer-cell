import { useEffect, useState } from 'react'
import { reportViolation, listViolations, updateViolationStatus } from '../../api/iprViolations'
import { useAuth } from '../../auth/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import StatusDot from '../../components/ui/StatusDot'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

export default function IprViolationsPage() {
  const { user } = useAuth()
  const [violations, setViolations] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    title: '',
    description: '',
    related_patent_or_project: '',
    severity: 'medium',
  })

  const isAdminOrStaff = user && ['super_admin', 'ttc_staff'].includes(user.role)

  async function refresh() {
    if (!isAdminOrStaff) {
      setLoading(false)
      return
    }
    try {
      const data = await listViolations()
      setViolations(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [user])

  async function handleReport(e) {
    e.preventDefault()
    const payload = {
      ...form,
      related_patent_or_project: form.related_patent_or_project || null,
    }
    try {
      await reportViolation(payload)
      setOpen(false)
      setForm({
        title: '',
        description: '',
        related_patent_or_project: '',
        severity: 'medium',
      })
      alert('IPR Violation reported successfully.')
      refresh()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to report violation.')
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await updateViolationStatus(id, newStatus)
      refresh()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status.')
    }
  }

  const columns = [
    { key: 'title', label: 'Violation Title' },
    {
      key: 'severity',
      label: 'Severity',
      render: (r) => {
        const colors = {
          low: 'text-teal font-semibold',
          medium: 'text-amber font-semibold',
          high: 'text-rust font-semibold',
          critical: 'text-rust font-bold animate-pulse',
        }
        return <span className={colors[r.severity] || ''}>{r.severity.toUpperCase()}</span>
      },
    },
    { key: 'related_patent_or_project', label: 'Related Patent/Project', render: (r) => r.related_patent_or_project || '-' },
    { key: 'status', label: 'Status', render: (r) => <StatusDot status={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <Select
          value={r.status}
          onChange={(e) => handleStatusChange(r.id, e.target.value)}
          className="text-xs py-1 px-2"
        >
          <option value="reported">Reported</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </Select>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title={isAdminOrStaff ? 'IPR Violations Registry' : 'IPR Violation Reporting'}
        description={
          isAdminOrStaff
            ? 'Track and manage reported intellectual property rights violations.'
            : 'File a confidential intellectual property violation report with the Technology Transfer Cell.'
        }
        action={<Button onClick={() => setOpen(true)}>Report Violation</Button>}
      />

      {isAdminOrStaff ? (
        loading ? (
          <div className="text-sm text-ink/50 py-10 text-center">Loading violations...</div>
        ) : (
          <DataTable columns={columns} rows={violations} emptyLabel="No IPR violations reported yet." />
        )
      ) : (
        <div className="bg-surface border border-line rounded-lg p-10 text-center shadow-sm">
          <span className="text-4xl mb-4 block select-none">🛡️</span>
          <h3 className="text-base font-semibold text-ink">IPR Compliance Portal</h3>
          <p className="text-sm text-ink/60 mt-2 max-w-md mx-auto">
            If you suspect unauthorized usage of university patents, research project data, or proprietary artifacts, please report it immediately. Reports are treated confidentially and investigated by the TTC committee.
          </p>
          <Button onClick={() => setOpen(true)} className="mt-6">
            File Compliance Report
          </Button>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Report IPR Violation">
        <form onSubmit={handleReport} className="space-y-4">
          <Input
            label="Violation Title"
            placeholder="e.g. Unauthorized usage of Patent RU-102"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Severity Level"
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>
            <Input
              label="Related Patent / Project (Optional)"
              placeholder="e.g. Project-501"
              value={form.related_patent_or_project}
              onChange={(e) => setForm({ ...form, related_patent_or_project: e.target.value })}
            />
          </div>
          <label className="block text-sm">
            <span className="text-ink/70 mb-1 block font-medium">Description of Violation</span>
            <textarea
              rows={4}
              className="w-full rounded-md border border-line px-3 py-2 outline-none focus:ring-2 focus:ring-indigo/30 focus:border-indigo bg-surface text-ink text-sm"
              placeholder="Provide a detailed description of the suspected violation..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </label>
          <Button type="submit" className="w-full justify-center">
            Submit Violation Report
          </Button>
        </form>
      </Modal>
    </>
  )
}
