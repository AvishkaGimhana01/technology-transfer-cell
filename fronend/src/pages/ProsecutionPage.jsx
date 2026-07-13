import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listPatents } from '../api/patents'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import StatusDot from '../components/ui/StatusDot'
import Input from '../components/ui/Input'

const columns = [
  { key: 'patent_number', label: 'Case Number', render: (r) => <span className="font-bold text-indigo">{r.patent_number}</span> },
  { key: 'title', label: 'Filing Title' },
  { key: 'attorney', label: 'Lead Attorney' },
  { key: 'jurisdiction', label: 'Department / Agency', render: (r) => `${r.jurisdiction} Patent Office` },
  { key: 'status', label: 'Prosecution Status', render: (r) => <StatusDot status={r.status} /> },
  { key: 'next_due_date', label: 'Filing Due Date', render: (r) => r.next_due_date || '—' },
]

export default function ProsecutionPage() {
  const navigate = useNavigate()
  const [patents, setPatents] = useState([])
  const [filteredPatents, setFilteredPatents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadProsecutions() {
    try {
      const data = await listPatents()
      setPatents(data)
      setFilteredPatents(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProsecutions()
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFilteredPatents(
      patents.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.patent_number.toLowerCase().includes(q) ||
        p.attorney.toLowerCase().includes(q) ||
        p.jurisdiction.toLowerCase().includes(q)
      )
    )
  }, [search, patents])

  return (
    <>
      <PageHeader
        title="Filing & Prosecution"
        description="Track office actions, assign legal responses, and maintain prosecution event histories."
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
          </svg>
        }
      />

      {/* Advanced search + filters bar */}
      <div className="bg-surface border border-line rounded-2xl p-4 shadow-xs mb-6 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search + filter by status, owner, department, jurisdiction, date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold bg-indigo-light text-indigo px-3 py-1.5 rounded-xl border border-indigo/10 cursor-pointer hover:bg-indigo/10 transition-colors">
            Filing Status: All
          </span>
          <span className="text-xs font-semibold bg-teal-light text-teal px-3 py-1.5 rounded-xl border border-teal/10 cursor-pointer hover:bg-teal/10 transition-colors">
            Jurisdictions: All
          </span>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filteredPatents}
        loading={loading}
        onRowClick={() => navigate('/patents')}
        emptyLabel="No prosecution records matched filters."
      />
    </>
  )
}
