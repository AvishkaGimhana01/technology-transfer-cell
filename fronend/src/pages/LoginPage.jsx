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

  async function handleQuickLogin(emailVal, passwordVal) {
    setEmail(emailVal)
    setPassword(passwordVal)
    setError('')
    setLoading(true)
    try {
      await login(emailVal, passwordVal)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Incorrect email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center auth-gradient-bg relative overflow-hidden px-4">
      {/* Floating Shapes */}
      <div className="floating-shape w-72 h-72 bg-white top-[-5%] left-[-5%] animate-float" />
      <div className="floating-shape w-96 h-96 bg-indigo bottom-[-10%] right-[-10%] animate-float" style={{ animationDelay: '2s' }} />
      <div className="floating-shape w-48 h-48 bg-teal top-[40%] right-[15%] animate-float" style={{ animationDelay: '4s' }} />
      <div className="floating-shape w-32 h-32 bg-amber top-[20%] left-[20%] animate-float" style={{ animationDelay: '3s' }} />

      <form
        onSubmit={handleSubmit}
        className="relative glass border border-white/20 rounded-2xl p-8 w-full max-w-sm space-y-5 shadow-2xl animate-scale-in"
      >
        {/* Logo */}
        <div className="text-center mb-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo to-indigo-dark flex items-center justify-center shadow-lg shadow-indigo/30 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-ink">Technology Transfer Cell</h1>
          <p className="text-sm text-ink/50 mt-1">Sign in to your account</p>
        </div>

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@university.ac.lk"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        {error && (
          <div className="flex items-center gap-2 text-sm text-rust bg-rust-light rounded-lg px-3 py-2 animate-slide-down">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          Sign in
        </Button>

        <div className="text-center pt-1">
          <p className="text-xs text-ink/40">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-indigo hover:underline font-semibold">
              Register here
            </Link>
          </p>
        </div>

        <div className="pt-3 border-t border-line/20 space-y-2.5">
          <p className="text-[10px] font-bold text-ink/35 uppercase tracking-wider text-center">Quick Portal Demo Login</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="demo-admin-btn"
              type="button"
              onClick={() => handleQuickLogin('admin@university.ac.lk', 'admin123')}
              className="px-2 py-1.5 rounded-lg border border-line bg-paper hover:bg-line text-[11px] font-bold text-ink/75 transition-colors cursor-pointer text-center outline-none active:scale-[0.98] select-none"
            >
              💼 Admin Login
            </button>
            <button
              id="demo-user-btn"
              type="button"
              onClick={() => handleQuickLogin('user@university.ac.lk', 'user123')}
              className="px-2 py-1.5 rounded-lg border border-line bg-paper hover:bg-line text-[11px] font-bold text-ink/75 transition-colors cursor-pointer text-center outline-none active:scale-[0.98] select-none"
            >
              🎓 Faculty Login
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
