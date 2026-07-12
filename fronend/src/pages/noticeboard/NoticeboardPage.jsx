import { useEffect, useState } from 'react'
import { listPosts, createPost } from '../../api/noticeboard'
import { useAuth } from '../../auth/AuthContext'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

export default function NoticeboardPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [open, setOpen] = useState(false)
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
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    const payload = {
      ...form,
      is_published: true,
      publish_date: new Date().toISOString().split('T')[0],
      expiry_date: form.expiry_date || null,
    }
    try {
      await createPost(payload)
      setOpen(false)
      setForm({
        title: '',
        content: '',
        category: 'General',
        expiry_date: '',
      })
      refresh()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to publish post.')
    }
  }

  // Determine if user can post (TTC Staff, Admins, Faculty)
  const canPost = user && ['super_admin', 'ttc_staff', 'faculty'].includes(user.role)

  return (
    <>
      <PageHeader
        title="Virtual Noticeboard"
        description="Public announcements, event schedules, and IP policies from the Technology Transfer Cell."
        action={canPost ? <Button onClick={() => setOpen(true)}>New Post</Button> : null}
      />

      {posts.length === 0 ? (
        <div className="text-sm text-ink/50 border border-dashed border-line rounded-lg p-12 text-center bg-surface">
          No announcements published yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-surface border border-line rounded-lg p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="bg-indigo/10 text-indigo text-xs font-semibold px-2 py-1 rounded">
                    {post.category || 'General'}
                  </span>
                  <span className="text-xs text-ink/40 tabular">
                    Posted on {post.publish_date || new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-ink mb-2">{post.title}</h3>
                <p className="text-sm text-ink/70 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              </div>

              {post.expiry_date && (
                <div className="border-t border-line mt-4 pt-2 text-xs text-ink/40 font-medium">
                  Active until: {post.expiry_date}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Announcement">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Announcement Title"
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
              <option value="General">General</option>
              <option value="Policy">Policy & Guidelines</option>
              <option value="Events">Funding & Events</option>
              <option value="Call for Proposals">Call for Proposals</option>
            </Select>
            <Input
              label="Expiry Date (Optional)"
              type="date"
              value={form.expiry_date}
              onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
            />
          </div>
          <label className="block text-sm">
            <span className="text-ink/70 mb-1 block font-medium">Content</span>
            <textarea
              rows={4}
              className="w-full rounded-md border border-line px-3 py-2 outline-none focus:ring-2 focus:ring-indigo/30 focus:border-indigo bg-surface text-ink text-sm"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />
          </label>
          <Button type="submit" className="w-full justify-center">
            Publish Post
          </Button>
        </form>
      </Modal>
    </>
  )
}
