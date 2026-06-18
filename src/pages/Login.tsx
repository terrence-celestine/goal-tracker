import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Helmet } from 'react-helmet-async'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Both fields are required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1117] font-sans flex flex-col">
      <Helmet>
  <title>Sign in · goal.</title>
</Helmet>
      {/* Top accent bar */}
      <div className="h-1 w-full bg-[#F5A623]" />

      <div className="flex-1 flex flex-col justify-center px-5 py-12 max-w-sm mx-auto w-full">

        {/* Logo + heading */}
        <div className="mb-10">
          <span className="text-[24px] font-black text-white tracking-tight">
            goal<span className="text-[#F5A623]">.</span>
          </span>
          <p className="text-[22px] font-bold text-white mt-4 leading-snug">
            Welcome back
          </p>
          <p className="text-[13px] text-[#6B7280] mt-1">
            Sign in to pick up where you left off
          </p>
        </div>

        {/* Email field */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold tracking-widest text-[#6B7280] uppercase mb-2">
            Email
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px]">✉️</span>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(null) }}
              placeholder="you@example.com"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl pl-11 pr-4 py-3.5 text-[14px] text-white placeholder:text-[#4B5563] outline-none focus:border-[#F5A623] transition-colors"
            />
          </div>
        </div>

        {/* Password field */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[11px] font-semibold tracking-widest text-[#6B7280] uppercase">
              Password
            </label>
            <button
              className="text-[11px] text-[#F5A623] font-semibold bg-transparent border-none cursor-pointer p-0"
              onClick={() => {}}
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px]">🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(null) }}
              placeholder="Your password"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-[#1A1D27] border border-[#2A2D3A] rounded-2xl pl-11 pr-16 py-3.5 text-[14px] text-white placeholder:text-[#4B5563] outline-none focus:border-[#F5A623] transition-colors"
            />
            <button
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4B5563] bg-transparent border-none cursor-pointer text-[12px] font-semibold"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-[#1F0F0F] border border-red-900 rounded-xl px-4 py-3 mb-4">
            <span className="text-red-400 text-[13px]">⚠ {error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-[15px] font-semibold border-none transition-all duration-150 mb-4"
          style={{
            background: loading ? '#2A2D3A' : '#F5A623',
            color: loading ? '#4B5563' : '#0F1117',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Signing in...' : 'Sign in →'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#2A2D3A]" />
          <span className="text-[11px] text-[#4B5563]">don't have an account?</span>
          <div className="flex-1 h-px bg-[#2A2D3A]" />
        </div>

        {/* Register link */}
        <Link
          to="/register"
          className="w-full py-4 rounded-2xl text-[15px] font-semibold border border-[#2A2D3A] text-[#9CA3AF] text-center block transition-colors hover:border-[#4B5563] hover:text-white"
          style={{ textDecoration: 'none' }}
        >
          Create an account
        </Link>

      </div>
    </div>
  )
}