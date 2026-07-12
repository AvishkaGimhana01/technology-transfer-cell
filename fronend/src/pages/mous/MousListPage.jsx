import { useEffect, useState } from 'react'
import { listMous, createMou } from '../../api/mous'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import StatusDot from '../../components/ui/StatusDot'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

const columns = [
  { key: 'title', label: 'MOU Title' },
  { key: 'partner_organization', label: 'Partner Organization' },
  { key: 'signatory_internal', label: 'Internal Signatory' },
  { key: 'signatory_external', label: 'External Signatory' },
  { key: 'status', label: 'Status', render: (r) => <StatusDot status={r.status} /> },
  { key: 'expiry_date', label: 'Expiry Date', render: (r) => r.expiry_date || '-' },
]

export default function MousListPage() {
  const [mous, setMous] = useState([])
  const [open, setOpen] = useState(false)
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
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
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
      setForm({
        title: '',
        partner_organization: '',
        signatory_internal: '',
        signatory_external: '',
        status: 'draft',
        sign_date: '',
        expiry_date: '',
        file_path: '',
      })
      refresh()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create MOU.')
    }
  }

  return (
    <>
      <PageHeader
        title="Memorandums of Understanding (MOUs)"
        description="Registry of active and draft institutional agreements."
        action={<Button onClick={() => setOpen(true)}>New MOU</Button>}
      />
      <DataTable columns={columns} rows={mous} emptyLabel="No MOUs yet — registry is empty." />

      <Modal open={open} onClose={() => setOpen(false)} title="New MOU Record">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="MOU Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Input
            label="Partner Organization"
            value={form.partner_organization}
            onChange={(e) => setForm({ ...form, partner_organization: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Internal Signatory"
              value={form.signatory_internal}
              onChange={(e) => setForm({ ...form, signatory_internal: e.target.value })}
            />
            <Input
              label="External Signatory"
              value={form.signatory_external}
              onChange={(e) => setForm({ ...form, signatory_external: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              required
            >
              <option value="draft">Draft</option>
              <option value="pending_signature">Pending Signature</option>
              <option value="signed">Signed</option>
              <option value="expired">Expired</option>
            </Select>
            <Input
              label="Document Link / File Path"
              value={form.file_path}
              onChange={(e) => setForm({ ...form, file_path: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Sign Date"
              type="date"
              value={form.sign_date}
              onChange={(e) => setForm({ ...form, sign_date: e.target.value })}
            />
            <Input
              label="Expiry Date"
              type="date"
              value={form.expiry_date}
              onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full justify-center">
            Create MOU
          </Button>
        </form>
      </Modal>
    </>
  )
}
