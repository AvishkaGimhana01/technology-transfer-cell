import { useEffect, useState } from 'react'
import { listMous, createMou } from '../../api/mous'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import StatusDot from '../../components/ui/StatusDot'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useToast } from '../../components/ui/Toast'
import AnimatedCounter from '../../components/ui/AnimatedCounter'

export default function MousListPage() {
  const { addToast } = useToast()
  const [mous, setMous] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Search, filter, and selection state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedMou, setSelectedMou] = useState(null)

  const [form, setForm] = useState({
    title: '',
    partner_organization: '',
    signatory_internal: '',
    signatory_external: '',
    status: 'draft',
    sign_date: '',
    expiry_date: '',
    file_path: '',
  })

  const columns = [
    { key: 'title', label: 'MOU Title' },
    { key: 'partner_organization', label: 'Partner Organization' },
    { key: 'signatory_internal', label: 'Internal Signatory', render: (r) => r.signatory_internal || <span className="text-ink/25">—</span> },
    { key: 'signatory_external', label: 'External Signatory', render: (r) => r.signatory_external || <span className="text-ink/25">—</span> },
    { key: 'status', label: 'Status', render: (r) => <StatusDot status={r.status} /> },
    { 
      key: 'expiry_date', 
      label: 'Expiry Date', 
      render: (r) => {
        if (!r.expiry_date) return <span className="text-ink/25">—</span>
        
        let expiringSoon = false
        let daysLeft = 0
        if (r.status === 'signed') {
          const expiry = new Date(r.expiry_date)
          const today = new Date()
          const diffTime = expiry - today
          daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          expiringSoon = daysLeft > 0 && daysLeft <= 30
        }
        
        return (
          <div className="flex flex-col">
            <span>{r.expiry_date}</span>
            {expiringSoon && (
              <span className="text-[10px] font-semibold text-amber flex items-center gap-0.5 mt-0.5 animate-pulse">
                ⚠️ Expiring in {daysLeft} days
              </span>
            )}
          </div>
        )
      }
    },
  ]

  async function refresh() {
    try {
      const data = await listMous()
      setMous(data)
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
      sign_date: form.sign_date || null,
      expiry_date: form.expiry_date || null,
      signatory_internal: form.signatory_internal || null,
      signatory_external: form.signatory_external || null,
      file_path: form.file_path || null,
    }
    try {
      await createMou(payload)
      setOpen(false)
      setForm({ title: '', partner_organization: '', signatory_internal: '', signatory_external: '', status: 'draft', sign_date: '', expiry_date: '', file_path: '' })
      addToast('MOU created successfully!', 'success')
      refresh()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to create MOU.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Statistics calculations
  const totalCount = mous.length
  const signedCount = mous.filter(m => m.status === 'signed').length
  const pendingCount = mous.filter(m => m.status === 'pending_signature').length
  const expiredCount = mous.filter(m => m.status === 'expired').length

  // Filtered MOUs for search and status
  const filteredMous = mous.filter(m => {
    const matchesSearch = 
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.partner_organization.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Export filtered items to CSV
  const handleExportCSV = () => {
    if (filteredMous.length === 0) {
      addToast('No records to export', 'error')
      return
    }
    const headers = ['MOU Title', 'Partner Organization', 'Internal Signatory', 'External Signatory', 'Status', 'Sign Date', 'Expiry Date', 'Document Link']
    const csvRows = filteredMous.map(m => [
      m.title,
      m.partner_organization,
      m.signatory_internal || '',
      m.signatory_external || '',
      m.status,
      m.sign_date || '',
      m.expiry_date || '',
      m.file_path || ''
    ])

    const content = [headers.join(','), ...csvRows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n')
    
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `mou_registry_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    addToast('CSV exported successfully!', 'success')
  }

  return (
    <>
      <PageHeader
        title="Memorandums of Understanding"
        description="Registry of active and draft institutional agreements."
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        }
        action={<Button onClick={() => setOpen(true)}>+ New MOU</Button>}
      />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface border border-line rounded-xl p-4 shadow-sm flex items-center gap-4 transition-all duration-200 hover:shadow-md animate-fade-in">
          <div className="h-10 w-10 rounded-lg bg-indigo/10 flex items-center justify-center text-indigo shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-ink/40 font-semibold">Total MOUs</p>
            <p className="text-xl font-bold text-ink"><AnimatedCounter value={totalCount} /></p>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-xl p-4 shadow-sm flex items-center gap-4 transition-all duration-200 hover:shadow-md animate-fade-in [animation-delay:50ms]">
          <div className="h-10 w-10 rounded-lg bg-teal/10 flex items-center justify-center text-teal shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-ink/40 font-semibold">Active & Signed</p>
            <p className="text-xl font-bold text-teal"><AnimatedCounter value={signedCount} /></p>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-xl p-4 shadow-sm flex items-center gap-4 transition-all duration-200 hover:shadow-md animate-fade-in [animation-delay:100ms]">
          <div className="h-10 w-10 rounded-lg bg-amber/10 flex items-center justify-center text-amber shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-ink/40 font-semibold">Pending Sign</p>
            <p className="text-xl font-bold text-amber"><AnimatedCounter value={pendingCount} /></p>
          </div>
        </div>

        <div className="bg-surface border border-line rounded-xl p-4 shadow-sm flex items-center gap-4 transition-all duration-200 hover:shadow-md animate-fade-in [animation-delay:150ms]">
          <div className="h-10 w-10 rounded-lg bg-rust/10 flex items-center justify-center text-rust shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-ink/40 font-semibold">Expired</p>
            <p className="text-xl font-bold text-rust"><AnimatedCounter value={expiredCount} /></p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative max-w-sm flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-ink/40">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or partner..."
              className="w-full pl-10 rounded-xl border border-line bg-surface px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo/35 focus:border-indigo transition-all placeholder-ink/35"
            />
          </div>

          {/* Status Dropdown */}
          <div className="min-w-[160px]">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending_signature">Pending Signature</option>
              <option value="signed">Signed</option>
              <option value="expired">Expired</option>
            </Select>
          </div>
        </div>

        {/* CSV Export Button */}
        <Button variant="ghost" onClick={handleExportCSV} className="rounded-xl flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </Button>
      </div>

      {/* Main Data Table */}
      <DataTable 
        columns={columns} 
        rows={filteredMous} 
        loading={loading} 
        onRowClick={(row) => setSelectedMou(row)}
        emptyLabel="No MOUs found matching your search or filters." 
      />

      {/* New MOU Creation Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="New MOU Record">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="MOU Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Partner Organization" value={form.partner_organization} onChange={(e) => setForm({ ...form, partner_organization: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Internal Signatory" value={form.signatory_internal} onChange={(e) => setForm({ ...form, signatory_internal: e.target.value })} placeholder="Optional" />
            <Input label="External Signatory" value={form.signatory_external} onChange={(e) => setForm({ ...form, signatory_external: e.target.value })} placeholder="Optional" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} required>
              <option value="draft">Draft</option>
              <option value="pending_signature">Pending Signature</option>
              <option value="signed">Signed</option>
              <option value="expired">Expired</option>
            </Select>
            <Input label="Document Link" value={form.file_path} onChange={(e) => setForm({ ...form, file_path: e.target.value })} placeholder="Optional" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Sign Date" type="date" value={form.sign_date} onChange={(e) => setForm({ ...form, sign_date: e.target.value })} />
            <Input label="Expiry Date" type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
          </div>
          <Button type="submit" className="w-full rounded-xl" loading={submitting}>Create MOU</Button>
        </form>
      </Modal>

      {/* MOU Details View Modal */}
      <Modal open={!!selectedMou} onClose={() => setSelectedMou(null)} title="MOU Details Registry">
        {selectedMou && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-ink leading-tight">{selectedMou.title}</h3>
              <p className="text-sm text-indigo font-medium mt-1">{selectedMou.partner_organization}</p>
            </div>

            {/* Signature Progress Timeline */}
            <div className="border-t border-b border-line py-4">
              <p className="text-xs uppercase tracking-wider font-semibold text-ink/40 mb-3">Signature Lifecycle Progress</p>
              <SignProgressTimeline status={selectedMou.status} />
              
              {selectedMou.status === 'expired' && (
                <div className="mt-3 bg-rust/5 border border-rust/10 text-rust text-xs rounded-lg p-2.5 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>This Memorandum of Understanding has passed its expiry date and is now inactive.</span>
                </div>
              )}
            </div>

            {/* Metadata Information Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <p className="text-xs font-semibold text-ink/40 uppercase tracking-wider">Internal Signatory</p>
                <p className="text-ink font-medium mt-0.5">{selectedMou.signatory_internal || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink/40 uppercase tracking-wider">External Signatory</p>
                <p className="text-ink font-medium mt-0.5">{selectedMou.signatory_external || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink/40 uppercase tracking-wider">Sign Date</p>
                <p className="text-ink mt-0.5">{selectedMou.sign_date || 'Not signed yet'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink/40 uppercase tracking-wider">Expiry Date</p>
                <p className="text-ink mt-0.5">
                  {selectedMou.expiry_date || 'No expiry date set'}
                  {selectedMou.status === 'signed' && selectedMou.expiry_date && (
                    <span className="block text-[11px] text-ink/45 font-medium mt-0.5">
                      ({Math.ceil((new Date(selectedMou.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)) > 0 
                        ? `${Math.ceil((new Date(selectedMou.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))} days remaining` 
                        : 'Expired'}
                      )
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Document Link Actions */}
            <div className="flex items-center gap-3 pt-2">
              {selectedMou.file_path ? (
                <a
                  href={selectedMou.file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-dark transition-all shadow-xs"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open Signed Document
                </a>
              ) : (
                <div className="flex-1 bg-paper border border-line text-ink/40 py-2.5 rounded-xl text-xs text-center font-medium">
                  No scanned document link uploaded yet
                </div>
              )}
              <Button variant="ghost" onClick={() => setSelectedMou(null)} className="rounded-xl px-5">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

// Stepper visual timeline helper component
function SignProgressTimeline({ status }) {
  const steps = [
    { key: 'draft', label: 'Draft' },
    { key: 'pending_signature', label: 'Pending Signature' },
    { key: 'signed', label: 'Signed' }
  ]
  
  const getStepState = (stepKey) => {
    if (status === 'expired') return 'expired'
    
    const order = ['draft', 'pending_signature', 'signed']
    const currentIndex = order.indexOf(status)
    const stepIndex = order.indexOf(stepKey)
    
    if (currentIndex >= stepIndex) return 'completed'
    return 'pending'
  }

  return (
    <div className="py-4 px-2">
      <div className="flex items-center justify-between relative">
        {/* Connector Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-line -translate-y-1/2 z-0" />
        
        {steps.map((step, idx) => {
          const state = getStepState(step.key)
          let circleClass = 'bg-line text-ink/40 border-2 border-line'
          let textClass = 'text-ink/40 font-semibold'
          
          if (state === 'completed') {
            circleClass = 'bg-teal border-teal text-white ring-4 ring-teal/10'
            textClass = 'text-teal font-bold'
          } else if (state === 'expired') {
            circleClass = 'bg-rust border-rust text-white'
            textClass = 'text-rust font-bold'
          } else if (status === step.key) {
            circleClass = 'bg-surface border-indigo text-indigo font-bold ring-4 ring-indigo/10'
            textClass = 'text-indigo font-bold'
          }
          
          return (
            <div key={step.key} className="flex flex-col items-center z-10 relative bg-surface px-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${circleClass}`}>
                {state === 'completed' ? (
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span className={`text-[10px] uppercase tracking-wider mt-2.5 text-center ${textClass}`}>{step.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
