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
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await applyToClub(form)
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit application.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center auth-gradient-bg relative overflow-hidden px-4">
        <div className="floating-shape w-72 h-72 bg-teal top-[-5%] left-[-5%] animate-float" />
        <div className="floating-shape w-96 h-96 bg-indigo bottom-[-10%] right-[-10%] animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative glass border border-white/20 rounded-2xl p-10 max-w-sm w-full text-center shadow-2xl animate-scale-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal to-[#2ba84a] flex items-center justify-center shadow-lg shadow-teal/30 mb-5">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-ink">Application Submitted!</h1>
          <p className="text-sm text-ink/50 mt-2 leading-relaxed">
            The Innovation Club team will review your idea and get back to you soon.
          </p>
          <div className="mt-6">
            <Link to="/login" className="text-sm text-indigo hover:underline font-semibold">
              Go to Portal Login →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center auth-gradient-bg relative overflow-hidden px-4 py-10">
      {/* Floating Shapes */}
      <div className="floating-shape w-72 h-72 bg-white top-[-5%] right-[-3%] animate-float" />
      <div className="floating-shape w-80 h-80 bg-indigo bottom-[-8%] left-[-8%] animate-float" style={{ animationDelay: '2s' }} />
      <div className="floating-shape w-40 h-40 bg-amber top-[30%] left-[10%] animate-float" style={{ animationDelay: '3.5s' }} />

      <form
        onSubmit={handleSubmit}
        className="relative glass border border-white/20 rounded-2xl p-8 max-w-md w-full space-y-4 shadow-2xl animate-scale-in"
      >
        <div className="text-center mb-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo to-indigo-dark flex items-center justify-center shadow-lg shadow-indigo/30 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-ink">Innovation Club</h1>
          <p className="text-sm text-ink/50 mt-1">Submit your innovative idea to join</p>
        </div>

        <Input label="Your Name" value={form.applicant_name} onChange={(e) => setForm({ ...form, applicant_name: e.target.value })} placeholder="John Doe" required />
        <Input label="Email Address" type="email" value={form.applicant_email} onChange={(e) => setForm({ ...form, applicant_email: e.target.value })} placeholder="you@university.ac.lk" required />
        <Select label="Applicant Type" value={form.applicant_type} onChange={(e) => setForm({ ...form, applicant_type: e.target.value })} required>
          <option value="student">Student</option>
          <option value="faculty">Faculty Lead</option>
        </Select>
        <Input label="Idea Title" value={form.idea_title} onChange={(e) => setForm({ ...form, idea_title: e.target.value })} placeholder="e.g. AI-powered recycling sorter" required />

        <label className="block text-sm">
          <span className="text-ink/70 mb-1.5 block font-medium text-xs uppercase tracking-wider">Describe Your Idea</span>
          <textarea
            rows={4}
            className="w-full rounded-xl border border-line px-3.5 py-2.5 outline-none bg-surface text-ink text-sm focus-glow transition-all duration-200 shadow-xs hover:border-ink/20"
            value={form.idea_description}
            onChange={(e) => setForm({ ...form, idea_description: e.target.value })}
            placeholder="Explain what problem your idea solves and how it works..."
            required
          />
        </label>

        {error && (
          <div className="flex items-center gap-2 text-sm text-rust bg-rust-light rounded-lg px-3 py-2 animate-slide-down">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          Submit Idea Application
        </Button>

        <div className="text-center pt-1">
          <Link to="/login" className="text-xs text-ink/40 hover:text-indigo font-medium">
            Already a member? Sign in →
          </Link>
        </div>
      </form>
    </div>
  )
}
