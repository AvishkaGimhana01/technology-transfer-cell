import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Incorrect email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-line rounded-lg p-8 w-full max-w-sm space-y-4 shadow-sm"
      >
        <div>
          <h1 className="text-xl font-semibold text-indigo">Technology Transfer Cell</h1>
          <p className="text-sm text-ink/60">Sign in to continue</p>
        </div>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-rust">{error}</p>}
        <Button type="submit" className="w-full justify-center" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
        <p className="text-xs text-center text-ink/50 mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo hover:underline font-medium">
            Register here
          </Link>
        </p>
      </form>
    </div>
  )
}
