import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import uorLogo from '../assets/uor-logo.png'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
    <div className="auth-page-wrapper">
      {/* ── Left Hero Panel ─────────────────────────── */}
      <div className="auth-hero-panel">
        {/* Animated orbs */}
        <div className="auth-orb auth-orb--1" />
        <div className="auth-orb auth-orb--2" />
        <div className="auth-orb auth-orb--3" />
        <div className="auth-orb auth-orb--4" />

        {/* Noise texture overlay */}
        <div className="auth-noise" />

        {/* Grid overlay */}
        <div className="auth-grid-overlay" />

        {/* Content */}
        <div className="auth-hero-content">
          {/* University Logo */}
          <div className="auth-hero-logo--img">
            <img src={uorLogo} alt="University of Ruhuna" className="auth-uni-logo" />
          </div>
          <h2 className="auth-hero-title">
            Technology<br />Transfer Cell
          </h2>
          <p className="auth-hero-uni-name">University of Ruhuna</p>
          <p className="auth-hero-subtitle">
            Bridging academic innovation with industry impact. Manage disclosures, patents, licenses & research partnerships — all in one place.
          </p>

        </div>

        {/* Bottom attribution */}
        <div className="auth-hero-footer">
          <span>© 2026 University of Ruhuna</span>
          <span className="auth-hero-dot">·</span>
          <span>Technology Transfer Cell</span>
        </div>
      </div>

      {/* ── Right Form Panel ────────────────────────── */}
      <div className="auth-form-panel">
        <div className="auth-form-scroll">
          <form onSubmit={handleSubmit} className="auth-form-card animate-scale-in">
            {/* Mobile logo (hidden on desktop) */}
            <div className="auth-mobile-logo">
              <img src={uorLogo} alt="University of Ruhuna" className="auth-mobile-uni-logo" />
            </div>

            {/* Header */}
            <div className="auth-form-header">
              <h1 className="auth-form-title">Welcome back</h1>
              <p className="auth-form-subtitle">Sign in to continue to your dashboard</p>
            </div>

            {/* Fields */}
            <div className="auth-fields">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.ac.lk"
                required
              />

              <div className="auth-password-wrapper">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="auth-error animate-slide-down">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full auth-submit-btn" loading={loading}>
              Sign in
            </Button>

            {/* Divider */}
            <div className="auth-divider">
              <span>Quick Demo Access</span>
            </div>

            {/* Quick login */}
            <div className="auth-quick-login">
              <button
                id="demo-admin-btn"
                type="button"
                onClick={() => handleQuickLogin('admin@university.ac.lk', 'admin123')}
                className="auth-demo-btn"
              >
                <span className="auth-demo-icon">💼</span>
                <div className="auth-demo-text">
                  <span className="auth-demo-role">Admin</span>
                  <span className="auth-demo-desc">Full access</span>
                </div>
              </button>
              <button
                id="demo-user-btn"
                type="button"
                onClick={() => handleQuickLogin('user@university.ac.lk', 'user123')}
                className="auth-demo-btn"
              >
                <span className="auth-demo-icon">🎓</span>
                <div className="auth-demo-text">
                  <span className="auth-demo-role">Faculty</span>
                  <span className="auth-demo-desc">Research lead</span>
                </div>
              </button>
            </div>

            {/* Footer link */}
            <p className="auth-footer-text">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="auth-footer-link">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
