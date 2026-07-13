import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProject, updateProjectStatus } from '../../api/projects'
import { listAgreements } from '../../api/agreements'
import PageHeader from '../../components/ui/PageHeader'
import StatusDot from '../../components/ui/StatusDot'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Skeleton from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [project, setProject] = useState(null)
  const [agreements, setAgreements] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  async function loadData() {
    try {
      const projData = await getProject(id)
      setProject(projData)
      const agreementsData = await listAgreements()
      const filtered = agreementsData.filter((a) => a.project_id === Number(id))
      setAgreements(filtered)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  async function handleStatusChange(newStatus) {
    setUpdating(true)
    try {
      await updateProjectStatus(id, newStatus)
      addToast('Project status updated.', 'success')
      await loadData()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to update status.', 'error')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton lines={2} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2"><Skeleton variant="card" /></div>
          <Skeleton variant="card" />
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-lg font-bold text-rust">Project Not Found</h2>
        <p className="text-sm text-ink/50 mt-1">The project you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/projects')} className="mt-6">
          Back to Projects
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-4 animate-fade-in">
        <button
          onClick={() => navigate('/projects')}
          className="text-sm text-indigo hover:underline flex items-center gap-1.5 cursor-pointer font-medium group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Industry Projects
        </button>
      </div>

      <PageHeader
        title={project.title}
        description={`Collaboration with ${project.industry_partner_name}`}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
        action={
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink/40 font-medium">Status:</span>
            <Select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
            >
              <option value="proposed">Proposed</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 stagger-children">
        {/* Description Card */}
        <div className="md:col-span-2 bg-surface border border-line rounded-xl p-6 space-y-4 shadow-xs">
          <div>
            <h3 className="text-xs font-bold text-ink/40 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-sm text-ink/75 whitespace-pre-wrap leading-relaxed">
              {project.description || 'No description provided.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-line">
            <div>
              <h3 className="text-xs font-bold text-ink/40 uppercase tracking-wider">Start Date</h3>
              <p className="text-sm text-ink/75 mt-1 font-medium tabular">{project.start_date || 'Not set'}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-ink/40 uppercase tracking-wider">End Date</h3>
              <p className="text-sm text-ink/75 mt-1 font-medium tabular">{project.end_date || 'Not set'}</p>
            </div>
          </div>
        </div>

        {/* Metadata Sidebar */}
        <div className="bg-surface border border-line rounded-xl p-6 space-y-4 h-fit shadow-xs accent-left-indigo">
          <h3 className="font-bold text-ink text-sm">Project Metadata</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-ink/40 text-xs font-medium">Status</span>
              <StatusDot status={project.status} />
            </div>
            <div className="flex justify-between items-center border-t border-line pt-3">
              <span className="text-ink/40 text-xs font-medium">Budget</span>
              <span className="font-bold tabular text-ink">
                {project.budget ? `$${project.budget.toLocaleString()}` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-line pt-3">
              <span className="text-ink/40 text-xs font-medium">Partner</span>
              <span className="text-ink font-semibold text-xs">{project.industry_partner_name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Agreements */}
      <div className="bg-surface border border-line rounded-xl p-6 shadow-xs animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h3 className="font-bold text-ink text-sm mb-4">Linked Legal Agreements</h3>
        {agreements.length === 0 ? (
          <p className="text-sm text-ink/40 italic">No agreements linked to this project yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-paper/80 text-ink/50">
                <tr>
                  <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">Agreement Title</th>
                  <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">Party Name</th>
                  <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="tabular">
                {agreements.map((a, i) => (
                  <tr key={a.id} className="border-t border-line hover:bg-indigo/[0.03] transition-colors table-row-animate" style={{ animationDelay: `${i * 50}ms` }}>
                    <td className="px-4 py-3 font-medium text-ink">{a.title}</td>
                    <td className="px-4 py-3 capitalize text-ink/60">{a.agreement_type}</td>
                    <td className="px-4 py-3 text-ink/60">{a.party_name}</td>
                    <td className="px-4 py-3"><StatusDot status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
