import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/auth'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'faculty',
    department: 'Civil and Environmental Engineering',
    phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to register. Please check input.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center auth-gradient-bg relative overflow-hidden px-4 py-8">
      {/* Floating Shapes */}
      <div className="floating-shape w-72 h-72 bg-white top-[-5%] right-[-5%] animate-float" />
      <div className="floating-shape w-96 h-96 bg-indigo bottom-[-10%] left-[-10%] animate-float" style={{ animationDelay: '2s' }} />
      <div className="floating-shape w-48 h-48 bg-teal bottom-[20%] right-[20%] animate-float" style={{ animationDelay: '4s' }} />

      <form
        onSubmit={handleSubmit}
        className="relative glass border border-white/20 rounded-2xl p-8 w-full max-w-md space-y-4 shadow-2xl animate-scale-in"
      >
        {/* Logo */}
        <div className="text-center mb-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo to-indigo-dark flex items-center justify-center shadow-lg shadow-indigo/30 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-ink">Create Your Account</h1>
          <p className="text-sm text-ink/50 mt-1">Join the Technology Transfer Cell</p>
        </div>

        <Input
          label="Full Name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          placeholder="Dr. John Doe"
          required
        />
        <Input
          label="Email Address"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="john.doe@university.ac.lk"
          required
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="••••••••"
          required
        />

        <Select
          label="Role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          required
        >
          <option value="faculty">Faculty Lead / Lead Researcher</option>
          <option value="ttc_staff">TTC Staff Member</option>
          <option value="industry_partner">Industry Partner Representative</option>
          <option value="club_member">Innovation Club Member</option>
          <option value="super_admin">Super Administrator</option>
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          >
            <option value="Civil and Environmental Engineering">Civil and Environmental Engineering</option>
            <option value="Electrical and Information Engineering">Electrical and Information Engineering</option>
            <option value="Marine Engineering and Naval Architecture">Marine Engineering and Naval Architecture</option>
            <option value="Mechanical and Manufacturing Engineering">Mechanical and Manufacturing Engineering</option>
            <option value="Computer Engineering">Computer Engineering</option>
          </Select>
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Optional"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-rust bg-rust-light rounded-lg px-3 py-2 animate-slide-down">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          Create Account
        </Button>

        <div className="text-center pt-1">
          <p className="text-xs text-ink/40">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo hover:underline font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
