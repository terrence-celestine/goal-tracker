import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface FormState {
  displayName: string
  email: string
  password: string
}

export default function Register() {
  const [form, setForm] = useState<FormState>({ displayName: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async () => {
    if (!form.displayName || !form.email || !form.password) {
      setError('All fields are required')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await register(form.email, form.displayName, form.password)

      // Save pending goals to DB after registration
      const stored = localStorage.getItem('pendingGoals')
      if (stored) {
        const pendingGoals = JSON.parse(stored)
        if (pendingGoals.length > 0) {
          await fetch('/api/user-goals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ goals: pendingGoals }),
          })
          localStorage.removeItem('pendingGoals')
          localStorage.removeItem('completedGoals')
        }
      }

      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    {
      key: 'displayName' as keyof FormState,
      label: 'Display name',
      type: 'text',
      placeholder: 'What should we call you?',
      icon: '👤',
    },
    {
      key: 'email' as keyof FormState,
      label: 'Email',
      type: 'email',
      placeholder: 'you@example.com',
      icon: '✉️',
    },
    {
      key: 'password' as keyof FormState,
      label: 'Password',
      type: showPassword ? 'text' : 'password',
      placeholder: 'Min. 8 characters',
      icon: '🔒',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0F1117] font-sans flex flex-col">

      {/* Top accent bar */}
      <div className="h-1 w-full bg-[#F5A623]" />

      <div className="flex-1 flex flex-col justify-center px-5 py-12 max-w-sm mx-auto w-full">

        {/* Logo */}
        <div className="mb-10">
          <span className="text-[24px] font-black text-white tracking-tight">
            goal<span className="text-[#F5A623]">.</span>
          </span>
          <p className="text-[22px] font-bold text-white mt-4 leading-snug">
            Create your account
          </p>
          <p className="text-[13px] text-[#6B7280] mt-1">
            Start tracking what matters to you
          </p>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4 mb-6">
          {fields.map(field => (
            <div key={field.key}>
              <label className="block text-[11px] font-semibold tracking-widest text-[#6B7280] uppercase mb-2">
                {field.label}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px]">
                  {field.icon}
                </span>
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={update(field.key)}
                  placeholder={field.placeholder}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl pl-11 pr-11 py-3.5 text-[14px] text-white placeholder:text-[#4B5563] outline-none focus:border-[#F5A623] transition-colors"
                />
                {field.key === 'password' && (
                  <button
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4B5563] bg-transparent border-none cursor-pointer text-[12px] font-semibold"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Password strength hint */}
        {form.password.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{
                  background:
                    form.password.length >= 12 ? '#4ADE80' :
                    form.password.length >= 8 ? '#F5A623' :
                    i === 0 ? '#F87171' : '#2A2D3A'
                }}
              />
            ))}
            <span className="text-[11px] font-medium text-[#6B7280] min-w-[40px]">
              {form.password.length >= 12 ? 'Strong' : form.password.length >= 8 ? 'Good' : 'Weak'}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-[#1F0F0F] border border-red-900 rounded-xl px-4 py-3 mb-4">
            <span className="text-red-400 text-[13px]">⚠ {error}</span>
          </div>
        )}

        {/* Pending goals notice */}
        {localStorage.getItem('pendingGoals') && (
          <div className="flex items-center gap-2 bg-[#1F1A0F] border border-[#F5A623]/30 rounded-xl px-4 py-3 mb-4">
            <span className="text-[#F5A623] text-[13px]">🎯 Your selected goals will be saved automatically</span>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-[15px] font-semibold border-none cursor-pointer transition-all duration-150 mb-4"
          style={{
            background: loading ? '#2A2D3A' : '#F5A623',
            color: loading ? '#4B5563' : '#0F1117',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creating account...' : 'Create account →'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#2A2D3A]" />
          <span className="text-[11px] text-[#4B5563]">already have an account?</span>
          <div className="flex-1 h-px bg-[#2A2D3A]" />
        </div>

        {/* Login link */}
        <Link
          to="/login"
          className="w-full py-4 rounded-2xl text-[15px] font-semibold border border-[#2A2D3A] text-[#9CA3AF] text-center block transition-colors hover:border-[#4B5563] hover:text-white"
          style={{ textDecoration: 'none' }}
        >
          Sign in
        </Link>

      </div>
    </div>
  )
}