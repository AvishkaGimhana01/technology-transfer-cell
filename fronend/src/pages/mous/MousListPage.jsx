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

const columns = [
  { key: 'title', label: 'MOU Title' },
  { key: 'partner_organization', label: 'Partner Organization' },
  { key: 'signatory_internal', label: 'Internal Signatory', render: (r) => r.signatory_internal || <span className="text-ink/25">—</span> },
  { key: 'signatory_external', label: 'External Signatory', render: (r) => r.signatory_external || <span className="text-ink/25">—</span> },
  { key: 'status', label: 'Status', render: (r) => <StatusDot status={r.status} /> },
  { key: 'expiry_date', label: 'Expiry Date', render: (r) => r.expiry_date || <span className="text-ink/25">—</span> },
]

export default function MousListPage() {
  const { addToast } = useToast()
  const [mous, setMous] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
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
      <DataTable columns={columns} rows={mous} loading={loading} emptyLabel="No MOUs yet — registry is empty." />

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
          <Button type="submit" className="w-full" loading={submitting}>Create MOU</Button>
        </form>
      </Modal>
    </>
  )
}
