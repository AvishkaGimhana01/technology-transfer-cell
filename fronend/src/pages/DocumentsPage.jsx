import { useEffect, useState } from 'react'
import { listAgreements } from '../api/agreements'
import { listMous } from '../api/mous'
import { listPatents } from '../api/patents'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'

const columns = [
  { key: 'title', label: 'Document Title' },
  { key: 'category', label: 'Vault Category', render: (r) => <span className="bg-paper px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-ink/50">{r.category}</span> },
  { key: 'owner', label: 'Signing Lead / Attorney' },
  { key: 'date', label: 'Date Added / Signed', render: (r) => r.date || '—' },
]

export default function DocumentsPage() {
  const { addToast } = useToast()
  const [docs, setDocs] = useState([])
  const [filteredDocs, setFilteredDocs] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Document states
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [openUpload, setOpenUpload] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    category: 'Agreement / NDA',
    owner: '',
    date: '',
  })

  async function loadAllDocuments() {
    try {
      const [agreements, mous, patents] = await Promise.all([
        listAgreements(),
        listMous(),
        listPatents()
      ])

      const combined = [
        ...agreements.map((a) => ({
          id: `agr-${a.id}`,
          title: a.title,
          category: 'Agreement / NDA',
          owner: a.party_name,
          date: a.start_date
        })),
        ...mous.map((m) => ({
          id: `mou-${m.id}`,
          title: m.title,
          category: 'MOU',
          owner: m.partner_organization,
          date: m.sign_date
        })),
        ...patents.map((p) => ({
          id: `pat-${p.id}`,
          title: p.title,
          category: 'Patent Specification',
          owner: p.attorney,
          date: p.filing_date
        }))
      ]

      setDocs(combined)
      setFilteredDocs(combined)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllDocuments()
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFilteredDocs(
      docs.filter((d) =>
        d.title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.owner.toLowerCase().includes(q)
      )
    )
  }, [search, docs])

  const handleUploadSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      const created = {
        id: `upload-${Math.random()}`,
        ...form,
        date: form.date || new Date().toISOString().split('T')[0]
      }
      setDocs([created, ...docs])
      setOpenUpload(false)
      setForm({ title: '', category: 'Agreement / NDA', owner: '', date: '' })
      setSubmitting(false)
      addToast('Document successfully uploaded to central vault.', 'success')
    }, 600)
  }

  return (
    <>
      <PageHeader
        title="Central Document Vault"
        description="Centralized document storage for legal agreements, licensing contracts, and patent prosecution files."
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
          </svg>
        }
        action={<Button onClick={() => setOpenUpload(true)}>+ Upload Document</Button>}
      />

      <div className="mb-6">
        <Input
          placeholder="Filter documents by category, title, or signing lead..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={filteredDocs}
        loading={loading}
        onRowClick={(row) => setSelectedDoc(row)}
        emptyLabel="No documents found matching filters."
      />

      {/* Document Details Modal */}
      <Modal open={!!selectedDoc} onClose={() => setSelectedDoc(null)} title="Document Vault Info">
        {selectedDoc && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-ink/45 text-[10px] font-bold uppercase">Document Title</span>
              <p className="text-sm font-bold text-ink/80 mt-1">{selectedDoc.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-ink/45 text-[10px] font-bold uppercase">Vault Category</span>
                <p className="font-bold text-ink/80 mt-1">{selectedDoc.category}</p>
              </div>
              <div>
                <span className="text-ink/45 text-[10px] font-bold uppercase">Date Added</span>
                <p className="font-bold text-ink/80 mt-1 tabular">{selectedDoc.date || '—'}</p>
              </div>
            </div>
            <div>
              <span className="text-ink/45 text-[10px] font-bold uppercase">Lead Organization / Attorney</span>
              <p className="font-bold text-ink/80 mt-1">{selectedDoc.owner}</p>
            </div>
            <div className="border border-line rounded-xl p-3 bg-paper/30 flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-bold text-ink/75">Vault reference securely encrypted</span>
              </div>
              <button
                onClick={() => addToast('Opening secure download stream...', 'success')}
                className="text-xs text-indigo font-bold hover:underline cursor-pointer"
              >
                Download File
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload Document Modal */}
      <Modal open={openUpload} onClose={() => setOpenUpload(false)} title="Upload Vault Document">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input
            label="Document Title"
            placeholder="e.g. Licensing Contract - Apple Inc."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="Agreement / NDA">Agreement / NDA</option>
              <option value="MOU">MOU (Memorandum of Understanding)</option>
              <option value="Patent Specification">Patent Specification</option>
              <option value="Audit Trail Log">Audit Trail Log</option>
            </Select>
            <Input
              label="Date Signed / Generated"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <Input
            label="Signing Lead / Attorney Owner"
            placeholder="e.g. Dr. John Doe"
            value={form.owner}
            onChange={(e) => setForm({ ...form, owner: e.target.value })}
            required
          />
          <div className="border border-dashed border-line rounded-xl p-8 text-center bg-paper/30 hover:bg-paper/50 cursor-pointer transition-colors">
            <svg className="w-8 h-8 text-ink/20 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-xs font-bold text-ink/70 block">Drag & drop files to upload</span>
            <span className="text-[10px] text-ink/40 mt-1 block">Maximum upload size 20MB</span>
          </div>
          <Button type="submit" className="w-full" loading={submitting}>Catalog Vault File</Button>
        </form>
      </Modal>
    </>
  )
}
