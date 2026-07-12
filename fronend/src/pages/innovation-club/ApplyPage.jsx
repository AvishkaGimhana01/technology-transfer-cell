import { useState } from 'react'
import { Link } from 'react-router-dom'
import { applyToClub } from '../../api/innovationClub'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'

export default function ApplyPage() {
  const [form, setForm] = useState({
    applicant_name: '',
    applicant_email: '',
    applicant_type: 'student',
    idea_title: '',
    idea_description: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await applyToClub(form)
      setSubmitted(true)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit application.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center bg-surface border border-line rounded-lg p-8 shadow-sm">
        <div className="text-4xl mb-3">🎉</div>
        <h1 className="text-lg font-semibold text-teal">Application Submitted!</h1>
        <p className="text-sm text-ink/60 mt-2">
          The Innovation Club team will review your idea and get back to you soon.
        </p>
        <div className="mt-6">
          <Link to="/login" className="text-sm text-indigo hover:underline font-medium">
            Go to Portal Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper py-12 px-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto space-y-4 bg-surface border border-line rounded-lg p-8 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-semibold text-indigo">Innovation Club</h1>
          <p className="text-sm text-ink/60">Submit your innovative idea to join the club</p>
        </div>

        <Input
          label="Your Name"
          value={form.applicant_name}
          onChange={(e) => setForm({ ...form, applicant_name: e.target.value })}
          required
        />
        <Input
          label="Email Address"
          type="email"
          value={form.applicant_email}
          onChange={(e) => setForm({ ...form, applicant_email: e.target.value })}
          required
        />
        <Select
          label="Applicant Type"
          value={form.applicant_type}
          onChange={(e) => setForm({ ...form, applicant_type: e.target.value })}
          required
        >
          <option value="student">Student</option>
          <option value="faculty">Faculty Lead</option>
        </Select>
        <Input
          label="Idea Title"
          value={form.idea_title}
          onChange={(e) => setForm({ ...form, idea_title: e.target.value })}
          required
        />
        
        <label className="block text-sm">
          <span className="text-ink/70 mb-1 block font-medium">Describe Your Idea</span>
          <textarea
            rows={4}
            className="w-full rounded-md border border-line px-3 py-2 outline-none focus:ring-2 focus:ring-indigo/30 focus:border-indigo bg-surface text-ink text-sm"
            value={form.idea_description}
            onChange={(e) => setForm({ ...form, idea_description: e.target.value })}
            required
          />
        </label>

        <Button type="submit" className="w-full justify-center animate-pulse-subtle" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Idea Application'}
        </Button>
      </form>
    </div>
  )
}
