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
import { useToast } from '../../components/ui/Toast'

export default function IprViolationsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [violations, setViolations] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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
    setSubmitting(true)
    const payload = {
      ...form,
      related_patent_or_project: form.related_patent_or_project || null,
    }
    try {
      await reportViolation(payload)
      setOpen(false)
      setForm({ title: '', description: '', related_patent_or_project: '', severity: 'medium' })
      addToast('IPR Violation reported successfully.', 'success')
      refresh()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to report violation.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await updateViolationStatus(id, newStatus)
      addToast('Violation status updated.', 'info')
      refresh()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to update status.', 'error')
    }
  }

  const SEVERITY_STYLES = {
    low: 'bg-teal-light text-teal',
    medium: 'bg-amber-light text-amber',
    high: 'bg-rust-light text-rust',
    critical: 'bg-rust text-white',
  }

  const columns = [
    { key: 'title', label: 'Violation Title' },
    {
      key: 'severity',
      label: 'Severity',
      render: (r) => (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${SEVERITY_STYLES[r.severity] || ''}`}>
          {r.severity}
        </span>
      ),
    },
    { key: 'related_patent_or_project', label: 'Related Patent/Project', render: (r) => r.related_patent_or_project || <span className="text-ink/25">—</span> },
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
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        }
        action={<Button onClick={() => setOpen(true)}>+ Report Violation</Button>}
      />

      {isAdminOrStaff ? (
        <DataTable columns={columns} rows={violations} loading={loading} emptyLabel="No IPR violations reported yet." />
      ) : (
        <div className="bg-surface border border-line rounded-xl p-12 text-center shadow-xs animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-light flex items-center justify-center text-indigo mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-ink">IPR Compliance Portal</h3>
          <p className="text-sm text-ink/50 mt-2 max-w-md mx-auto leading-relaxed">
            If you suspect unauthorized usage of university patents, research project data, or proprietary artifacts, please report it immediately. Reports are treated confidentially.
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
            <Select label="Severity Level" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} required>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>
            <Input
              label="Related Patent / Project"
              placeholder="e.g. Project-501"
              value={form.related_patent_or_project}
              onChange={(e) => setForm({ ...form, related_patent_or_project: e.target.value })}
            />
          </div>
          <label className="block text-sm">
            <span className="text-ink/70 mb-1.5 block font-medium text-xs uppercase tracking-wider">Description of Violation</span>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-line px-3.5 py-2.5 outline-none bg-surface text-ink text-sm focus-glow transition-all duration-200 shadow-xs hover:border-ink/20"
              placeholder="Provide a detailed description of the suspected violation..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </label>
          <Button type="submit" className="w-full" loading={submitting}>Submit Violation Report</Button>
        </form>
      </Modal>
    </>
  )
}
