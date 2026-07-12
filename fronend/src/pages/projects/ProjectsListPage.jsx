import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listProjects, createProject } from '../../api/projects'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import StatusDot from '../../components/ui/StatusDot'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'

const columns = [
  { key: 'title', label: 'Project' },
  { key: 'industry_partner_name', label: 'Partner' },
  { key: 'status', label: 'Status', render: (r) => <StatusDot status={r.status} /> },
  { key: 'budget', label: 'Budget', render: (r) => r.budget ? `$${r.budget.toLocaleString()}` : '-' },
  { key: 'start_date', label: 'Start' },
]

export default function ProjectsListPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    industry_partner_name: '',
    description: '',
    budget: '',
    start_date: '',
    end_date: '',
  })

  async function refresh() {
    try {
      const data = await listProjects()
      setProjects(data)
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
      budget: form.budget ? parseFloat(form.budget) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    }
    try {
      await createProject(payload)
      setOpen(false)
      setForm({
        title: '',
        industry_partner_name: '',
        description: '',
        budget: '',
        start_date: '',
        end_date: '',
      })
      refresh()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create project.')
    }
  }

  return (
    <>
      <PageHeader
        title="Industry Projects & Consultancy"
        description="Track collaborations and researcher lead consultancies with industry partners."
        action={<Button onClick={() => setOpen(true)}>New Project</Button>}
      />
      <DataTable
        columns={columns}
        rows={projects}
        onRowClick={(row) => navigate(`/projects/${row.id}`)}
        emptyLabel="No projects yet — add the first one."
      />

      <Modal open={open} onClose={() => setOpen(false)} title="New Industry Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Input
            label="Industry Partner"
            value={form.industry_partner_name}
            onChange={(e) => setForm({ ...form, industry_partner_name: e.target.value })}
            required
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Budget (USD)"
            type="number"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          <Button type="submit" className="w-full justify-center">
            Create Project
          </Button>
        </form>
      </Modal>
    </>
  )
}
