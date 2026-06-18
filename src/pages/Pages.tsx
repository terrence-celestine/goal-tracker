import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { User, Mail, Trophy, Target, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface UserProfile {
  userId: number
  email: string
  displayName: string
}

interface Stats {
  total: number
  completed: number
  active: number
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [achievements, setAchievements] = useState(0)
  const [loading, setLoading] = useState(true)
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      const [authRes, goalsRes, achievementsRes] = await Promise.all([
        fetch('/api/auth'),
        fetch('/api/user-goals'),
        fetch('/api/achievements'),
      ])

      if (authRes.ok) {
        const user = await authRes.json()
        setProfile(user)
      }

      if (goalsRes.ok) {
        const goals = await goalsRes.json()
        if (Array.isArray(goals)) {
          setStats({
            total: goals.length,
            completed: goals.filter((g: { status: string }) => g.status === 'done').length,
            active: goals.filter((g: { status: string }) => g.status === 'active').length,
          })
        }
      }

      if (achievementsRes.ok) {
        const data = await achievementsRes.json()
        if (Array.isArray(data)) {
          setAchievements(data.filter((a: { earned: boolean }) => a.earned).length)
        }
      }

      setLoading(false)
    }

    load()
  }, [])

  const handleSignOut = async () => {
    await logout()
    navigate('/login')
  }

  const initials = profile?.displayName
    ? profile.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  if (loading) return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#EDEBE6]">
        <div className="h-6 w-24 bg-[#E5E3DE] rounded-lg animate-pulse" />
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-xl mx-auto flex flex-col gap-4">
          <div className="bg-white border border-[#EDEBE6] rounded-2xl p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#E5E3DE]" />
              <div>
                <div className="h-5 w-32 bg-[#E5E3DE] rounded-md mb-2" />
                <div className="h-3 w-48 bg-[#E5E3DE] rounded-md" />
              </div>
            </div>
          </div>
          {Array(2).fill(null).map((_, i) => (
            <div key={i} className="bg-white border border-[#EDEBE6] rounded-2xl p-5 animate-pulse h-32" />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Helmet>
        <title>Profile · goal.</title>
      </Helmet>

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#EDEBE6] bg-[#F7F6F2]">
        <p className="text-[20px] font-bold text-[#1A1A2E]">Profile</p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 pb-24 md:pb-6">
        <div className="max-w-xl mx-auto flex flex-col gap-4">

          {/* Avatar card */}
          <div className="bg-white border border-[#EDEBE6] rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[22px] font-bold text-[#7C3AED]">
                {initials}
              </div>
              <div>
                <p className="text-[18px] font-bold text-[#1A1A2E]">{profile?.displayName}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Mail size={12} color="#9CA3AF" />
                  <p className="text-[13px] text-[#9CA3AF]">{profile?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="bg-white border border-[#EDEBE6] rounded-2xl p-5">
              <p className="text-[11px] font-semibold tracking-widest text-[#9CA3AF] uppercase mb-4">Your stats</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#EDE9FE] mx-auto mb-2">
                    <Target size={18} color="#7C3AED" />
                  </div>
                  <p className="text-[22px] font-bold text-[#1A1A2E]">{stats.total}</p>
                  <p className="text-[11px] text-[#9CA3AF]">Total goals</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#DCFCE7] mx-auto mb-2">
                    <Target size={18} color="#15803D" />
                  </div>
                  <p className="text-[22px] font-bold text-[#1A1A2E]">{stats.completed}</p>
                  <p className="text-[11px] text-[#9CA3AF]">Completed</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FEF3C7] mx-auto mb-2">
                    <Trophy size={18} color="#B45309" />
                  </div>
                  <p className="text-[22px] font-bold text-[#1A1A2E]">{achievements}</p>
                  <p className="text-[11px] text-[#9CA3AF]">Achievements</p>
                </div>
              </div>
            </div>
          )}

          {/* Account */}
          <div className="bg-white border border-[#EDEBE6] rounded-2xl overflow-hidden">
            <p className="text-[11px] font-semibold tracking-widest text-[#9CA3AF] uppercase px-5 pt-5 pb-3">Account</p>
            <div className="flex items-center gap-3 px-5 py-3.5 border-t border-[#EDEBE6]">
              <User size={16} color="#9CA3AF" />
              <p className="text-[14px] text-[#374151] flex-1">Display name</p>
              <p className="text-[14px] font-medium text-[#1A1A2E]">{profile?.displayName}</p>
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5 border-t border-[#EDEBE6]">
              <Mail size={16} color="#9CA3AF" />
              <p className="text-[14px] text-[#374151] flex-1">Email</p>
              <p className="text-[14px] font-medium text-[#1A1A2E]">{profile?.email}</p>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full py-4 rounded-2xl text-[15px] font-semibold border border-[#FECACA] text-[#EF4444] bg-white cursor-pointer flex items-center justify-center gap-2 transition-colors hover:bg-[#FEF2F2]"
          >
            <LogOut size={16} />
            Sign out
          </button>

        </div>
      </div>
    </div>
  )
}