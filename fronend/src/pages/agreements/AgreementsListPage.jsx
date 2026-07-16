import { useEffect, useState } from 'react'
import { listAgreements, createAgreement } from '../../api/agreements'
import { listProjects } from '../../api/projects'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import StatusDot from '../../components/ui/StatusDot'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useToast } from '../../components/ui/Toast'

export default function AgreementsListPage() {
  const { addToast } = useToast()
  const [agreements, setAgreements] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    agreement_type: 'other',
    party_name: '',
    project_id: '',
    file_path: '',
    start_date: '',
    end_date: '',
    reminder_date: '',
    status: 'draft',
  })

  async function refresh() {
    try {
      const [agreementsData, projectsData] = await Promise.all([listAgreements(), listProjects()])
      setAgreements(agreementsData)
      setProjects(projectsData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setSubmitting(true)
    const payload = {
      ...form,
      project_id: form.project_id ? Number(form.project_id) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      reminder_date: form.reminder_date || null,
      file_path: form.file_path || null,
    }
    try {
      await createAgreement(payload)
      setOpen(false)
      setForm({ title: '', agreement_type: 'other', party_name: '', project_id: '', file_path: '', start_date: '', end_date: '', reminder_date: '', status: 'draft' })
      addToast('Agreement created successfully!', 'success')
      refresh()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to create agreement.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    { key: 'title', label: 'Agreement' },
    { key: 'agreement_type', label: 'Type', render: (r) => <span className="uppercase text-[10px] font-bold tracking-wider bg-paper px-2 py-0.5 rounded-md text-ink/50">{r.agreement_type}</span> },
    { key: 'party_name', label: 'Party Name' },
    {
      key: 'project_id',
      label: 'Linked Project',
      render: (r) => {
        const proj = projects.find((p) => p.id === r.project_id)
        return proj ? <span className="text-indigo font-medium">{proj.title}</span> : <span className="text-ink/25">—</span>
      },
    },
    { key: 'status', label: 'Status', render: (r) => <StatusDot status={r.status} /> },
    { key: 'end_date', label: 'Expiry Date', render: (r) => r.end_date || <span className="text-ink/25">—</span> },
  ]

  return (
    <>
      <PageHeader
        title="Legal Agreements Registry"
        description="NDA, licensing, and joint consultancy legal documentation tracker."
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        action={<Button onClick={() => setOpen(true)}>+ New Agreement</Button>}
      />
      <DataTable columns={columns} rows={agreements} loading={loading} emptyLabel="No agreements yet — registry is empty." />

      <Modal open={open} onClose={() => setOpen(false)} title="New Legal Agreement">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Agreement Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Agreement Type" value={form.agreement_type} onChange={(e) => setForm({ ...form, agreement_type: e.target.value })} required>
              <option value="nda">NDA (Non-Disclosure)</option>
              <option value="licensing">Licensing</option>
              <option value="consultancy">Consultancy</option>
              <option value="other">Other</option>
            </Select>
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} required>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
            </Select>
          </div>
          <Input label="Party Name" value={form.party_name} onChange={(e) => setForm({ ...form, party_name: e.target.value })} required />
          <Select label="Linked Industry Project" value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
            <option value="">— No Linked Project —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title} ({p.industry_partner_name})</option>
            ))}
          </Select>
          <Input label="File Path / Reference Link" value={form.file_path} onChange={(e) => setForm({ ...form, file_path: e.target.value })} placeholder="Optional" />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Start Date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <Input label="End Date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            <Input label="Reminder" type="date" value={form.reminder_date} onChange={(e) => setForm({ ...form, reminder_date: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" loading={submitting}>Create Agreement</Button>
        </form>
      </Modal>
    </>
  )
}
