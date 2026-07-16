import { useEffect, useState } from 'react'
import { listPosts, createPost } from '../../api/noticeboard'
import { useAuth } from '../../auth/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Skeleton from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'

const CATEGORY_COLORS = {
  General: 'bg-indigo-light text-indigo',
  Policy: 'bg-amber-light text-amber',
  Events: 'bg-teal-light text-teal',
  'Call for Proposals': 'bg-rust-light text-rust',
}

export default function NoticeboardPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'General',
    expiry_date: '',
  })

  async function refresh() {
    try {
      const data = await listPosts()
      setPosts(data)
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
      is_published: true,
      publish_date: new Date().toISOString().split('T')[0],
      expiry_date: form.expiry_date || null,
    }
    try {
      await createPost(payload)
      setOpen(false)
      setForm({ title: '', content: '', category: 'General', expiry_date: '' })
      addToast('Announcement published!', 'success')
      refresh()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to publish post.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const canPost = user && ['super_admin', 'ttc_staff', 'faculty'].includes(user.role)

  return (
    <>
      <PageHeader
        title="Virtual Noticeboard"
        description="Public announcements, event schedules, and IP policies from the Technology Transfer Cell."
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        }
        action={canPost ? <Button onClick={() => setOpen(true)}>+ New Post</Button> : null}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-sm text-ink/40 border border-dashed border-line rounded-xl p-16 text-center bg-surface animate-fade-in">
          <svg className="w-12 h-12 mx-auto mb-3 text-ink/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          No announcements published yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-surface border border-line rounded-xl p-6 shadow-xs card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${CATEGORY_COLORS[post.category] || 'bg-paper text-ink/50'}`}>
                    {post.category || 'General'}
                  </span>
                  <span className="text-[10px] text-ink/35 tabular font-medium">
                    {post.publish_date || new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-ink mb-2 leading-snug">{post.title}</h3>
                <p className="text-xs text-ink/60 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              </div>

              {post.expiry_date && (
                <div className="border-t border-line mt-4 pt-3 text-[10px] text-ink/35 font-medium flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Active until {post.expiry_date}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Announcement">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Announcement Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
              <option value="General">General</option>
              <option value="Policy">Policy & Guidelines</option>
              <option value="Events">Funding & Events</option>
              <option value="Call for Proposals">Call for Proposals</option>
            </Select>
            <Input label="Expiry Date" type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
          </div>
          <label className="block text-sm">
            <span className="text-ink/70 mb-1.5 block font-medium text-xs uppercase tracking-wider">Content</span>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-line px-3.5 py-2.5 outline-none bg-surface text-ink text-sm focus-glow transition-all duration-200 shadow-xs hover:border-ink/20"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />
          </label>
          <Button type="submit" className="w-full" loading={submitting}>Publish Post</Button>
        </form>
      </Modal>
    </>
  )
}
