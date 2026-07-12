import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProject, updateProjectStatus } from '../../api/projects'
import { listAgreements } from '../../api/agreements'
import PageHeader from '../../components/ui/PageHeader'
import StatusDot from '../../components/ui/StatusDot'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
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
      await loadData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="text-sm text-ink/50 py-10 text-center">Loading project details...</div>
  }

  if (!project) {
    return (
      <div className="text-center py-10">
        <h2 className="text-lg font-semibold text-rust">Project Not Found</h2>
        <Button onClick={() => navigate('/projects')} className="mt-4">
          Back to Projects
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4">
        <button
          onClick={() => navigate('/projects')}
          className="text-sm text-indigo hover:underline flex items-center gap-1 cursor-pointer font-medium"
        >
          ← Back to Industry Projects
        </button>
      </div>

      <PageHeader
        title={project.title}
        description={`Collaboration with ${project.industry_partner_name}`}
        action={
          <div className="flex items-center gap-3">
            <span className="text-xs text-ink/50 font-medium">Update Status:</span>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-surface border border-line rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-ink/50 uppercase tracking-wider">Description</h3>
            <p className="text-sm text-ink/80 mt-1 whitespace-pre-wrap">
              {project.description || 'No description provided.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-line">
            <div>
              <h3 className="text-xs font-semibold text-ink/50 uppercase tracking-wider">Start Date</h3>
              <p className="text-sm text-ink/80 mt-1">{project.start_date || 'Not set'}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-ink/50 uppercase tracking-wider">End Date</h3>
              <p className="text-sm text-ink/80 mt-1">{project.end_date || 'Not set'}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-lg p-6 space-y-4 h-fit">
          <h3 className="font-semibold text-ink">Metadata Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/50">Current Status:</span>
              <StatusDot status={project.status} />
            </div>
            <div className="flex justify-between border-t border-line pt-2">
              <span className="text-ink/50">Budget:</span>
              <span className="font-semibold tabular text-ink">
                {project.budget ? `$${project.budget.toLocaleString()}` : 'Not set'}
              </span>
            </div>
            <div className="flex justify-between border-t border-line pt-2">
              <span className="text-ink/50">Partner:</span>
              <span className="text-ink font-medium">{project.industry_partner_name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-line rounded-lg p-6">
        <h3 className="font-semibold text-ink mb-4">Linked Legal Agreements</h3>
        {agreements.length === 0 ? (
          <p className="text-sm text-ink/50 italic">No agreements linked to this project yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-paper text-ink/60">
                <tr>
                  <th className="px-4 py-2 font-medium">Agreement Title</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">Party Name</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line tabular">
                {agreements.map((a) => (
                  <tr key={a.id} className="hover:bg-paper">
                    <td className="px-4 py-3 font-medium text-ink">{a.title}</td>
                    <td className="px-4 py-3 capitalize">{a.agreement_type}</td>
                    <td className="px-4 py-3">{a.party_name}</td>
                    <td className="px-4 py-3">
                      <StatusDot status={a.status} />
                    </td>
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
