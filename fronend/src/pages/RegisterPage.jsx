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
    department: '',
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
    <div className="min-h-screen flex items-center justify-center bg-paper px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-line rounded-lg p-8 w-full max-w-md space-y-4 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-semibold text-indigo">Technology Transfer Cell</h1>
          <p className="text-sm text-ink/60">Create your account</p>
        </div>

        <Input
          label="Full Name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
        />
        <Input
          label="Email Address"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
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

        <Input
          label="Department (Optional)"
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
        />
        <Input
          label="Phone Number (Optional)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        {error && <p className="text-sm text-rust">{error}</p>}

        <Button type="submit" className="w-full justify-center" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
        <p className="text-xs text-center text-ink/50 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo hover:underline font-medium">
            Sign in here
          </Link>
        </p>
      </form>
    </div>
  )
}
