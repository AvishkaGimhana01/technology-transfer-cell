import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listProjects, createProject, updateProject, deleteProject } from '../../api/projects'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import StatusDot from '../../components/ui/StatusDot'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useToast } from '../../components/ui/Toast'

export default function ProjectsListPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [form, setForm] = useState({
    title: '',
    industry_partner_name: '',
    description: '',
    budget: '',
    start_date: '',
    end_date: '',
    status: 'proposed',
  })

  const columns = [
    { key: 'title', label: 'Project' },
    { key: 'industry_partner_name', label: 'Partner' },
    { key: 'status', label: 'Status', render: (r) => <StatusDot status={r.status} /> },
    { key: 'budget', label: 'Budget', render: (r) => r.budget ? `Rs. ${r.budget.toLocaleString()}` : '—' },
    { key: 'start_date', label: 'Start', render: (r) => r.start_date || '—' },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleEditClick(r)}
            className="p-1 hover:bg-indigo/10 text-indigo rounded-lg transition-colors cursor-pointer active:scale-90"
            title="Edit Project"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteClick(r.id)}
            className="p-1 hover:bg-rust/10 text-rust rounded-lg transition-colors cursor-pointer active:scale-90"
            title="Delete Project"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ]

  async function refresh() {
    try {
      const data = await listProjects()
      setProjects(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleEditClick = (project) => {
    setEditingProject(project)
    setForm({
      title: project.title,
      industry_partner_name: project.industry_partner_name,
      description: project.description || '',
      budget: project.budget || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      status: project.status,
    })
    setOpen(true)
  }

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return
    try {
      await deleteProject(id)
      addToast('Project deleted successfully!', 'success')
      refresh()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to delete project.', 'error')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    const payload = {
      ...form,
      budget: form.budget ? parseFloat(form.budget) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    }
    try {
      if (editingProject) {
        await updateProject(editingProject.id, payload)
        addToast('Project updated successfully!', 'success')
      } else {
        await createProject(payload)
        addToast('Project created successfully!', 'success')
      }
      setOpen(false)
      setEditingProject(null)
      setForm({ title: '', industry_partner_name: '', description: '', budget: '', start_date: '', end_date: '', status: 'proposed' })
      refresh()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to save project.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Industry Projects & Consultancy"
        description="Track collaborations and researcher lead consultancies with industry partners."
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
        action={
          <Button
            onClick={() => {
              setEditingProject(null)
              setForm({ title: '', industry_partner_name: '', description: '', budget: '', start_date: '', end_date: '', status: 'proposed' })
              setOpen(true)
            }}
          >
            + New Project
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={projects}
        loading={loading}
        onRowClick={(row) => navigate(`/projects/${row.id}`)}
        emptyLabel="No projects yet — add the first one."
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editingProject ? "Edit Industry Project" : "New Industry Project"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Industry Partner" value={form.industry_partner_name} onChange={(e) => setForm({ ...form, industry_partner_name: e.target.value })} required />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} required>
              <option value="proposed">Proposed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="suspended">Suspended</option>
            </Select>
          </div>
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Budget (LKR)" type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <Input label="End Date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
          <Button type="submit" className="w-full" loading={submitting}>
            {editingProject ? "Update Project" : "Create Project"}
          </Button>
        </form>
      </Modal>
    </>
  )
}
