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
  const [showPassword, setShowPassword] = useState(false)

  // Simple password strength check
  const getPasswordStrength = () => {
    const p = form.password
    if (!p) return { level: 0, label: '', color: '' }
    let score = 0
    if (p.length >= 6) score++
    if (p.length >= 10) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++

    if (score <= 1) return { level: 1, label: 'Weak', color: '#FF3B30' }
    if (score <= 2) return { level: 2, label: 'Fair', color: '#FF9500' }
    if (score <= 3) return { level: 3, label: 'Good', color: '#0071E3' }
    return { level: 4, label: 'Strong', color: '#34C759' }
  }

  const strength = getPasswordStrength()

  // Step indicator
  const [step, setStep] = useState(1)

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
    <div className="auth-page-wrapper">
      {/* ── Left Hero Panel ─────────────────────────── */}
      <div className="auth-hero-panel auth-hero-panel--register">
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
          {/* Logo mark */}
          <div className="auth-hero-logo">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="auth-hero-title">
            Join the<br />Innovation Hub
          </h2>
          <p className="auth-hero-subtitle">
            Create your account to start managing intellectual property, track inventions, and collaborate with industry partners.
          </p>

          {/* Steps preview */}
          <div className="auth-steps-preview">
            <div className={`auth-step-item ${step >= 1 ? 'auth-step-item--active' : ''}`}>
              <div className="auth-step-number">1</div>
              <span>Personal Info</span>
            </div>
            <div className="auth-step-line" />
            <div className={`auth-step-item ${step >= 2 ? 'auth-step-item--active' : ''}`}>
              <div className="auth-step-number">2</div>
              <span>Role & Department</span>
            </div>
          </div>
        </div>

        {/* Bottom attribution */}
        <div className="auth-hero-footer">
          <span>© 2026 University TTC</span>
          <span className="auth-hero-dot">·</span>
          <span>Powered by Innovation</span>
        </div>
      </div>

      {/* ── Right Form Panel ────────────────────────── */}
      <div className="auth-form-panel">
        <div className="auth-form-scroll">
          <form onSubmit={handleSubmit} className="auth-form-card auth-form-card--register animate-scale-in">
            {/* Mobile logo (hidden on desktop) */}
            <div className="auth-mobile-logo">
              <div className="auth-logo-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>

            {/* Header */}
            <div className="auth-form-header">
              <h1 className="auth-form-title">Create your account</h1>
              <p className="auth-form-subtitle">
                {step === 1 ? 'Start with your personal details' : 'Almost there! Choose your role'}
              </p>
            </div>

            {/* Step indicator bar */}
            <div className="auth-step-bar">
              <div className="auth-step-bar-track">
                <div
                  className="auth-step-bar-fill"
                  style={{ width: step === 1 ? '50%' : '100%' }}
                />
              </div>
              <span className="auth-step-label">Step {step} of 2</span>
            </div>

            {/* Step 1: Personal */}
            {step === 1 && (
              <div className="auth-fields auth-fields--animated" key="step1">
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
                <div className="auth-password-wrapper">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Create a strong password"
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

                {/* Password strength meter */}
                {form.password && (
                  <div className="auth-strength-meter">
                    <div className="auth-strength-track">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="auth-strength-segment"
                          style={{
                            backgroundColor: i <= strength.level ? strength.color : '#E8E8ED',
                          }}
                        />
                      ))}
                    </div>
                    <span className="auth-strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}

                <Button
                  type="button"
                  className="w-full auth-submit-btn"
                  onClick={() => {
                    if (form.full_name && form.email && form.password) {
                      setStep(2)
                    }
                  }}
                >
                  Continue
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4 }}>
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Button>
              </div>
            )}

            {/* Step 2: Role & Dept */}
            {step === 2 && (
              <div className="auth-fields auth-fields--animated" key="step2">
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
                  label="Phone (Optional)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+94 7X XXX XXXX"
                />

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

                <div className="auth-register-actions">
                  <button
                    type="button"
                    className="auth-back-btn"
                    onClick={() => setStep(1)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Back
                  </button>
                  <Button type="submit" className="auth-submit-btn" loading={loading} style={{ flex: 1 }}>
                    Create Account
                  </Button>
                </div>
              </div>
            )}

            {/* Footer link */}
            <p className="auth-footer-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-footer-link">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
