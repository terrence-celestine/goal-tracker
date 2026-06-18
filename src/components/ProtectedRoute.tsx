import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute() {
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    fetch('/api/auth')
      .then(res => {
        setAuthenticated(res.ok)
      })
      .finally(() => setChecking(false))
  }, [])

  if (checking) return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#E5E3DE] border-t-[#A78BFA] animate-spin" />
        <p className="text-[13px] text-[#9CA3AF]">Checking session...</p>
      </div>
    </div>
  )

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />
}