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

export default function AgreementsListPage() {
  const [agreements, setAgreements] = useState([])
  const [projects, setProjects] = useState([])
  const [open, setOpen] = useState(false)
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
      const agreementsData = await listAgreements()
      setAgreements(agreementsData)
      
      const projectsData = await listProjects()
      setProjects(projectsData)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
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
      setForm({
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
      refresh()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create agreement.')
    }
  }

  const columns = [
    { key: 'title', label: 'Agreement' },
    { key: 'agreement_type', label: 'Type', render: (r) => <span className="uppercase text-xs font-semibold">{r.agreement_type}</span> },
    { key: 'party_name', label: 'Party Name' },
    {
      key: 'project_id',
      label: 'Linked Project',
      render: (r) => {
        const proj = projects.find((p) => p.id === r.project_id)
        return proj ? proj.title : '-'
      },
    },
    { key: 'status', label: 'Status', render: (r) => <StatusDot status={r.status} /> },
    { key: 'end_date', label: 'Expiry Date', render: (r) => r.end_date || '-' },
  ]

  return (
    <>
      <PageHeader
        title="Legal Agreements Registry"
        description="NDA, licensing, and joint consultancy legal documentation tracker."
        action={<Button onClick={() => setOpen(true)}>New Agreement</Button>}
      />
      <DataTable columns={columns} rows={agreements} emptyLabel="No agreements yet — registry is empty." />

      <Modal open={open} onClose={() => setOpen(false)} title="New Legal Agreement">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Agreement Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Agreement Type"
              value={form.agreement_type}
              onChange={(e) => setForm({ ...form, agreement_type: e.target.value })}
              required
            >
              <option value="nda">NDA (Non-Disclosure)</option>
              <option value="licensing">Licensing</option>
              <option value="consultancy">Consultancy</option>
              <option value="other">Other</option>
            </Select>
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              required
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
            </Select>
          </div>
          <Input
            label="Party Name"
            value={form.party_name}
            onChange={(e) => setForm({ ...form, party_name: e.target.value })}
            required
          />
          <Select
            label="Linked Industry Project (Optional)"
            value={form.project_id}
            onChange={(e) => setForm({ ...form, project_id: e.target.value })}
          >
            <option value="">-- No Linked Project --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.industry_partner_name})
              </option>
            ))}
          </Select>
          <Input
            label="File Path / Reference Link (Optional)"
            value={form.file_path}
            onChange={(e) => setForm({ ...form, file_path: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Start Date"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
            <Input
              label="Reminder Date"
              type="date"
              value={form.reminder_date}
              onChange={(e) => setForm({ ...form, reminder_date: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full justify-center">
            Create Agreement
          </Button>
        </form>
      </Modal>
    </>
  )
}
