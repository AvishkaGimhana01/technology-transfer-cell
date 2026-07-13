import { useEffect, useState } from 'react'
import { listPatents, getPatent, updatePatentStatus, getPatentTimeline, addPatentTimelineEvent, createPatent } from '../api/patents'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import StatusDot from '../components/ui/StatusDot'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'

const columns = [
  { key: 'patent_number', label: 'Case Number', render: (r) => <span className="font-bold text-indigo">{r.patent_number}</span> },
  { key: 'title', label: 'Patent Title' },
  { key: 'jurisdiction', label: 'Jurisdiction' },
  { key: 'attorney', label: 'Attorney' },
  { key: 'status', label: 'Status', render: (r) => <StatusDot status={r.status} /> },
  { key: 'next_due_date', label: 'Next Due', render: (r) => r.next_due_date || '—' },
]

export default function PatentsPage() {
  const { addToast } = useToast()
  const [patents, setPatents] = useState([])
  const [selectedPatent, setSelectedPatent] = useState(null)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [showAdvanced, setShowAdvanced] = useState(true)
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  // Creation forms
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [newPatent, setNewPatent] = useState({
    title: '',
    patent_number: '',
    jurisdiction: 'US / PCT',
    assignee: 'Technology Transfer Cell',
    attorney: '',
    budget: '',
    claims_text: '',
    legal_notes: '',
  })

  // Timeline form
  const [showTimelineForm, setShowTimelineForm] = useState(false)
  const [newEvent, setNewEvent] = useState({ event_title: '', event_date: '', notes: '' })

  // Document upload simulation state
  const [uploadedDocs, setUploadedDocs] = useState([
    { name: 'Patent_Abstract_Draft.pdf', size: '2.4 MB', date: '2026-06-15' },
    { name: 'Claims_Comparison_Report.docx', size: '840 KB', date: '2026-06-20' }
  ])
  const [showDocUploadModal, setShowDocUploadModal] = useState(false)
  const [newDocName, setNewDocName] = useState('')

  async function loadPatents() {
    try {
      const data = await listPatents()
      setPatents(data)
      if (data.length > 0 && !selectedPatent) {
        setSelectedPatent(data[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPatents()
  }, [])

  useEffect(() => {
    if (selectedPatent) {
      setTimelineLoading(true)
      getPatentTimeline(selectedPatent.id)
        .then(setTimeline)
        .catch(console.error)
        .finally(() => setTimelineLoading(false))
    }
  }, [selectedPatent])

  async function handleStatusChange(newStatus) {
    if (!selectedPatent) return
    setStatusUpdating(true)
    try {
      const updated = await updatePatentStatus(selectedPatent.id, newStatus)
      setSelectedPatent(updated)
      addToast('Status updated.', 'success')
      loadPatents()
    } catch (err) {
      addToast('Failed to update status.', 'error')
    } finally {
      setStatusUpdating(false)
    }
  }

  async function handleTimelineEventSubmit(e) {
    e.preventDefault()
    if (!selectedPatent) return
    try {
      const added = await addPatentTimelineEvent(selectedPatent.id, newEvent)
      setTimeline([...timeline, added])
      setNewEvent({ event_title: '', event_date: '', notes: '' })
      setShowTimelineForm(false)
      addToast('Timeline event logged.', 'success')
    } catch (err) {
      addToast('Failed to add event.', 'error')
    }
  }

  async function handlePatentCreate(e) {
    e.preventDefault()
    setCreateSubmitting(true)
    try {
      const payload = {
        ...newPatent,
        budget: newPatent.budget ? parseFloat(newPatent.budget) : 0,
        filing_date: new Date().toISOString().split('T')[0],
        next_due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days out
      }
      const created = await createPatent(payload)
      setPatents([...patents, created])
      setSelectedPatent(created)
      setOpenCreateModal(false)
      setNewPatent({
        title: '',
        patent_number: '',
        jurisdiction: 'US / PCT',
        assignee: 'Technology Transfer Cell',
        attorney: '',
        budget: '',
        claims_text: '',
        legal_notes: '',
      })
      addToast('New patent portfolio case initialized!', 'success')
    } catch (err) {
      addToast('Failed to initialize patent case.', 'error')
    } finally {
      setCreateSubmitting(false)
    }
  }

  const handleDocUpload = (e) => {
    e.preventDefault()
    if (!newDocName) return
    setUploadedDocs([
      ...uploadedDocs,
      { name: newDocName, size: '1.2 MB', date: new Date().toISOString().split('T')[0] }
    ])
    setNewDocName('')
    setShowDocUploadModal(false)
    addToast('Document successfully cataloged.', 'success')
  }

  return (
    <>
      <PageHeader
        title="Patent Portfolio"
        description="Portfolio-level view with detailed timeline, critical due dates, and jurisdictional status monitoring."
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        }
        action={<Button onClick={() => setOpenCreateModal(true)}>+ Initialize Case</Button>}
      />

      {/* Selected Patent Details Section (Figma redrawn premium drawer) */}
      {selectedPatent && (
        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4 border-b border-line pb-4 mb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo bg-indigo-light px-2.5 py-0.5 rounded-full">
                {selectedPatent.patent_number}
              </span>
              <h2 className="text-base font-bold text-ink mt-1.5">{selectedPatent.title}</h2>
              <p className="text-[11px] text-ink/45 mt-0.5">Filing agent: {selectedPatent.attorney}</p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setShowTimelineForm(true)} className="py-1 px-3 text-xs">
                Log Event
              </Button>
              <Select
                value={selectedPatent.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={statusUpdating}
                className="py-1 px-2 text-xs"
              >
                <option value="drafting">Drafting</option>
                <option value="office_action">Office Action</option>
                <option value="filed">Filed</option>
                <option value="granted">Granted</option>
              </Select>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex border-b border-line gap-2 mb-5">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'timeline', label: 'Legal Timeline' },
              { id: 'documents', label: 'Documents' },
              { id: 'stakeholders', label: 'Stakeholders' },
              { id: 'financials', label: 'Financials' },
              { id: 'audit', label: 'Audit Trail' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`pb-2.5 text-xs font-bold transition-all relative border-b-2 px-1 cursor-pointer ${
                  selectedTab === tab.id
                    ? 'border-indigo text-indigo font-extrabold'
                    : 'border-transparent text-ink/50 hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tabs content */}
          {selectedTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Case Overview</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-ink/45">Jurisdiction</span>
                    <p className="font-bold text-ink/80 mt-0.5">{selectedPatent.jurisdiction}</p>
                  </div>
                  <div>
                    <span className="text-ink/45">Assignee</span>
                    <p className="font-bold text-ink/80 mt-0.5">{selectedPatent.assignee}</p>
                  </div>
                  <div>
                    <span className="text-ink/45">Filing Date</span>
                    <p className="font-bold text-ink/80 mt-0.5 tabular">{selectedPatent.filing_date || '—'}</p>
                  </div>
                  <div>
                    <span className="text-ink/45">Next Due Date</span>
                    <p className="font-bold text-ink/80 mt-0.5 tabular">{selectedPatent.next_due_date || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Advanced Metadata collapsible block */}
              <div className="bg-paper border border-line rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-ink/50 uppercase tracking-wider">Advanced Metadata</h4>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-[10px] text-indigo font-bold hover:underline cursor-pointer"
                  >
                    {showAdvanced ? 'Hide metadata' : 'Show metadata'}
                  </button>
                </div>
                {showAdvanced && (
                  <div className="text-xs space-y-2.5 text-ink/70 animate-slide-down">
                    <p>{selectedPatent.claims_text || 'No claims summary extracted.'}</p>
                    <p className="italic text-ink/50 border-t border-line/50 pt-2">
                      {selectedPatent.legal_notes || 'No attorney annotations logged.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'timeline' && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Prosecution Timeline Events</h4>
              {timelineLoading ? (
                <Skeleton lines={3} />
              ) : timeline.length === 0 ? (
                <p className="text-xs text-ink/40 italic">No events logged in the timeline.</p>
              ) : (
                <div className="relative pl-6 border-l-2 border-line space-y-5 py-2">
                  {timeline.map((evt, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-indigo border-4 border-surface shadow-xs" />
                      <span className="text-[10px] text-ink/35 font-bold tabular">{evt.event_date}</span>
                      <h5 className="text-xs font-bold text-ink/80 mt-0.5">{evt.event_title}</h5>
                      {evt.notes && <p className="text-xs text-ink/50 mt-1">{evt.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedTab === 'documents' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Linked Case Documents</h4>
                <Button variant="ghost" onClick={() => setShowDocUploadModal(true)} className="py-1 px-3 text-xs">
                  Upload Doc
                </Button>
              </div>
              <div className="space-y-2">
                {uploadedDocs.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-line rounded-xl bg-paper/20">
                    <div className="flex items-center gap-2.5">
                      <svg className="w-5 h-5 text-ink/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-xs font-bold text-ink/85">{doc.name}</p>
                        <p className="text-[10px] text-ink/40 font-semibold mt-0.5">{doc.size} · Uploaded {doc.date}</p>
                      </div>
                    </div>
                    <button className="text-xs text-indigo font-bold hover:underline cursor-pointer">Open</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'stakeholders' && (
            <div className="space-y-3 animate-fade-in text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-light text-indigo flex items-center justify-center font-bold">AB</div>
                <div>
                  <p className="font-bold text-ink">Aisha Bennett</p>
                  <p className="text-[10px] text-ink/40">Filing Attorney & IP Manager</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-line/40 pt-2">
                <div className="w-8 h-8 rounded-full bg-teal-light text-teal flex items-center justify-center font-bold">TTC</div>
                <div>
                  <p className="font-bold text-ink">University of Ruhuna TTC</p>
                  <p className="text-[10px] text-ink/40">Assignee Organization</p>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'financials' && (
            <div className="space-y-3 text-xs animate-fade-in">
              <div className="flex justify-between border-b border-line/30 pb-2">
                <span className="text-ink/50">Allocated IP Budget</span>
                <span className="font-bold text-ink/80 tabular">Rs. {selectedPatent.budget?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between border-b border-line/30 pb-2">
                <span className="text-ink/50">Attorney Fees Paid</span>
                <span className="font-bold text-ink/80 tabular">Rs. 12,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/50">Remaining Budget</span>
                <span className="font-bold text-teal tabular">Rs. {(selectedPatent.budget - 12500 || 0).toLocaleString()}</span>
              </div>
            </div>
          )}

          {selectedTab === 'audit' && (
            <div className="text-xs space-y-2 text-ink/50 animate-fade-in">
              <p>· Case initialized by System Admin on 2026-07-13 08:30</p>
              <p>· Status promoted from Drafting to {selectedPatent.status} on 2026-07-13 08:35</p>
            </div>
          )}
        </div>
      )}

      {/* Log Timeline Event Modal */}
      <Modal open={showTimelineForm} onClose={() => setShowTimelineForm(false)} title="Log Legal Timeline Event">
        <form onSubmit={handleTimelineEventSubmit} className="space-y-4">
          <Input
            label="Event Description"
            placeholder="e.g. Received filing search report"
            value={newEvent.event_title}
            onChange={(e) => setNewEvent({ ...newEvent, event_title: e.target.value })}
            required
          />
          <Input
            label="Event Date"
            type="date"
            value={newEvent.event_date}
            onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
            required
          />
          <label className="block text-sm">
            <span className="text-ink/70 mb-1.5 block font-medium text-xs uppercase tracking-wider">Notes (Optional)</span>
            <textarea
              className="w-full rounded-xl border border-line px-3.5 py-2.5 outline-none bg-surface text-ink text-xs focus-glow transition-all duration-200"
              rows={3}
              placeholder="Provide event annotations..."
              value={newEvent.notes}
              onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
            />
          </label>
          <Button type="submit" className="w-full">Save Event Log</Button>
        </form>
      </Modal>

      {/* Document Upload Simulation Modal */}
      <Modal open={showDocUploadModal} onClose={() => setShowDocUploadModal(false)} title="Upload Specification Document">
        <form onSubmit={handleDocUpload} className="space-y-4">
          <Input
            label="Document Name"
            placeholder="e.g. Claims_Amendment_Draft_v2.pdf"
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            required
          />
          <div className="border border-dashed border-line rounded-xl p-8 text-center bg-paper/30 hover:bg-paper/50 cursor-pointer transition-colors">
            <svg className="w-8 h-8 text-ink/20 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-xs font-bold text-ink/70 block">Select specification file from directory</span>
            <span className="text-[10px] text-ink/40 mt-1 block">PDF, DOCX, XLSX formats supported (Max 10MB)</span>
          </div>
          <Button type="submit" className="w-full">Attach Case File</Button>
        </form>
      </Modal>

      {/* Create Patent Modal */}
      <Modal open={openCreateModal} onClose={() => setOpenCreateModal(null)} title="Initialize Patent Case">
        <form onSubmit={handlePatentCreate} className="space-y-4">
          <Input
            label="Patent Title"
            placeholder="e.g. Adaptive edge AI scheduler"
            value={newPatent.title}
            onChange={(e) => setNewPatent({ ...newPatent, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Case Number (ID)"
              placeholder="e.g. PAT-8841"
              value={newPatent.patent_number}
              onChange={(e) => setNewPatent({ ...newPatent, patent_number: e.target.value })}
              required
            />
            <Select
              label="Jurisdiction"
              value={newPatent.jurisdiction}
              onChange={(e) => setNewPatent({ ...newPatent, jurisdiction: e.target.value })}
              required
            >
              <option value="US / PCT">US / PCT</option>
              <option value="EP">European Patent Office (EP)</option>
              <option value="IN">Indian Patent Office (IN)</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Lead Attorney"
              placeholder="e.g. Aisha Bennett"
              value={newPatent.attorney}
              onChange={(e) => setNewPatent({ ...newPatent, attorney: e.target.value })}
              required
            />
            <Input
              label="IP budget Allocation"
              type="number"
              placeholder="e.g. 50000"
              value={newPatent.budget}
              onChange={(e) => setNewPatent({ ...newPatent, budget: e.target.value })}
              required
            />
          </div>
          <label className="block text-sm">
            <span className="text-ink/70 mb-1.5 block font-medium text-xs uppercase tracking-wider">Claims Summary</span>
            <textarea
              className="w-full rounded-xl border border-line px-3.5 py-2.5 outline-none bg-surface text-ink text-xs focus-glow transition-all duration-200"
              rows={3}
              placeholder="Provide summary description of key claim points..."
              value={newPatent.claims_text}
              onChange={(e) => setNewPatent({ ...newPatent, claims_text: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            <span className="text-ink/70 mb-1.5 block font-medium text-xs uppercase tracking-wider">Legal Notes</span>
            <textarea
              className="w-full rounded-xl border border-line px-3.5 py-2.5 outline-none bg-surface text-ink text-xs focus-glow transition-all duration-200"
              rows={2}
              placeholder="Log initial attorney notes..."
              value={newPatent.legal_notes}
              onChange={(e) => setNewPatent({ ...newPatent, legal_notes: e.target.value })}
            />
          </label>
          <Button type="submit" className="w-full" loading={createSubmitting}>Initialize Case Portfolio</Button>
        </form>
      </Modal>

      {/* Patents List */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Patent Portfolio Cases</h3>
      </div>
      <DataTable
        columns={columns}
        rows={patents}
        loading={loading}
        onRowClick={(row) => setSelectedPatent(row)}
      />
    </>
  )
}
