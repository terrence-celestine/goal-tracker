import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Goal {
    id?: number
    title: string
    description: string
    status?: string
}

const Home = () => {
  const [loadingGoals, setLoadingGoals] = useState(true)
  const [pendingGoals, setPendingGoals] = useState<Goal[]>([])
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set())
  const navigate = useNavigate()

  useEffect(() => {
    const fetchGoals = async () => {
      const completedStored: number[] = JSON.parse(localStorage.getItem('completedGoals') ?? '[]')
      setCompletedIds(new Set(completedStored))
  
      const authRes = await fetch('/api/auth')
  
      if (authRes.ok) {
        // Authenticated — fetch from DB
        const data = await fetch('/api/user-goals').then(r => r.json())
  
        if (Array.isArray(data) && data.length > 0) {
          // DB has goals — use them as source of truth
          setPendingGoals(data)
        } else {
          // DB returned empty — check localStorage as fallback
          const stored = localStorage.getItem('pendingGoals')
          if (stored) {
            const localGoals = JSON.parse(stored)
            if (localGoals.length > 0) {
              // Sync local goals to DB
              await fetch('/api/user-goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goals: localGoals }),
              }).then(() => setPendingGoals(localGoals))
              localStorage.removeItem('pendingGoals')
            }
          }
        }
      } else {
        // Not authenticated — read from localStorage only
        const stored = localStorage.getItem('pendingGoals')
        if (stored) setPendingGoals(JSON.parse(stored))
      }
  
      setLoadingGoals(false)
    }
  
    fetchGoals()
  }, [])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const toggleComplete = (index: number) => {
    setCompletedIds(prev => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      const arr = Array.from(next)
      localStorage.setItem('completedGoals', JSON.stringify(arr))
      return next
    })
  }

  const completedCount = completedIds.size
  const totalCount = pendingGoals.length
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  if (loadingGoals) return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#EDEBE6] bg-[#F7F6F2]">
        <div>
          <div className="h-6 w-40 bg-[#E5E3DE] rounded-lg animate-pulse mb-2" />
          <div className="h-3 w-24 bg-[#E5E3DE] rounded-lg animate-pulse" />
        </div>
        <div className="w-9 h-9 rounded-full bg-[#E5E3DE] animate-pulse" />
      </div>
  
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Array(3).fill(null).map((_, i) => (
            <div key={i} className="bg-white border border-[#EDEBE6] rounded-2xl p-5 animate-pulse">
              <div className="h-3 w-20 bg-[#E5E3DE] rounded-md mb-3" />
              <div className="h-8 w-12 bg-[#E5E3DE] rounded-md mb-2" />
              <div className="h-2.5 w-16 bg-[#E5E3DE] rounded-md" />
            </div>
          ))}
        </div>
  
        <div className="h-3 w-20 bg-[#E5E3DE] rounded-md mb-4 animate-pulse" />
  
        <div className="flex flex-col gap-3">
          {Array(4).fill(null).map((_, i) => (
            <div key={i} className="bg-white border border-[#EDEBE6] rounded-2xl px-5 py-4 flex items-center gap-4 animate-pulse">
              <div className="w-6 h-6 rounded-full bg-[#E5E3DE]" />
              <div className="flex-1">
                <div className="h-3.5 bg-[#E5E3DE] rounded-md w-3/5 mb-2" />
                <div className="h-3 bg-[#E5E3DE] rounded-md w-4/5" />
              </div>
              <div className="h-6 w-14 bg-[#E5E3DE] rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#EDEBE6] bg-[#F7F6F2]">
        <div>
          <p className="text-[20px] font-bold text-[#1A1A2E]">{greeting()} 👋</p>
          <p className="text-[12px] text-[#9CA3AF] mt-0.5">{today}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[13px] font-bold text-[#7C3AED]">
          T
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-8 py-6 pb-24 md:pb-6">

        {/* Unsaved banner */}
        {pendingGoals.length > 0 && (
          <div className="flex items-start gap-3 bg-[#FFF8EC] border border-[#F5A623]/30 rounded-2xl px-5 py-4 mb-6">
            <span className="text-lg mt-0.5">⚠️</span>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[#92400E] mb-0.5">Goals aren't saved yet</p>
              <p className="text-[12px] text-[#B45309] leading-relaxed">
                Sign up to keep your progress or you'll lose it when you close the app.
              </p>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="text-[12px] font-semibold text-[#92400E] bg-[#FDE68A] border-none rounded-lg px-3 py-1.5 cursor-pointer whitespace-nowrap"
            >
              Save my goals →
            </button>
          </div>
        )}

        {/* Stat cards */}
        {totalCount > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-[#EDEBE6] rounded-2xl p-5">
              <p className="text-[11px] text-[#9CA3AF] mb-1">Active goals</p>
              <p className="text-[28px] font-bold text-[#1A1A2E] leading-none">{totalCount - completedCount}</p>
              <p className="text-[11px] text-[#A78BFA] font-medium mt-1">{totalCount} total</p>
            </div>
            <div className="bg-white border border-[#EDEBE6] rounded-2xl p-5">
              <p className="text-[11px] text-[#9CA3AF] mb-1">Completed</p>
              <p className="text-[28px] font-bold text-[#1A1A2E] leading-none">{completedCount}</p>
              <p className="text-[11px] text-[#A78BFA] font-medium mt-1">🔥 Keep going</p>
            </div>
            <div className="bg-white border border-[#EDEBE6] rounded-2xl p-5 col-span-2 lg:col-span-1">
              <p className="text-[11px] text-[#9CA3AF] mb-1">Progress</p>
              <p className="text-[28px] font-bold text-[#1A1A2E] leading-none">{progressPct}%</p>
              <div className="mt-2 h-1.5 bg-[#EDE9FE] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#A78BFA] rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Goals list */}
        {pendingGoals.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold tracking-widest text-[#9CA3AF] uppercase">Your goals</p>
              <p className="text-[11px] text-[#9CA3AF]">{totalCount} total</p>
            </div>

            <div className="flex flex-col gap-3">
              {pendingGoals.map((goal, i) => {
                const isDone = completedIds.has(i)
                return (
                  <div
                    key={i}
                    className="bg-white border border-[#EDEBE6] rounded-2xl px-5 py-4 flex items-center gap-4 cursor-pointer hover:border-[#D1D5DB] transition-colors"
                    onClick={() => navigate(`/goals/${i}`)}
                  >
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        toggleComplete(i)
                      }}
                      className={`w-6 h-6 min-w-[24px] rounded-full flex items-center justify-center text-[11px] font-bold cursor-pointer transition-all duration-150 ${
                        isDone ? 'bg-[#A78BFA] text-white border-none' : 'bg-transparent text-transparent'
                      }`}
                      style={{ border: isDone ? 'none' : '1.5px solid #E5E7EB' }}
                    >
                      ✓
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-left text-[14px] font-semibold transition-all duration-150 truncate ${isDone ? 'text-[#9CA3AF] line-through' : 'text-[#1A1A2E]'}`}>
                        {goal.title}
                      </p>
                      <p className="text-left text-[12px] text-[#9CA3AF] leading-relaxed mt-0.5 truncate">
                        {goal.description}
                      </p>
                    </div>
                    <span className={`text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap ${isDone ? 'bg-[#EDE9FE] text-[#7C3AED]' : 'bg-[#F3F4F6] text-[#9CA3AF]'}`}>
                      {isDone ? 'Done' : 'Active'}
                    </span>
                    <i className="ti ti-chevron-right text-[#D1D5DB]" style={{ fontSize: '16px' }} aria-hidden="true" />
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center mt-32 text-center">
            <div className="w-16 h-16 bg-[#EDE9FE] rounded-2xl flex items-center justify-center text-3xl mb-5">
              🎯
            </div>
            <p className="text-[20px] font-bold text-[#1A1A2E] mb-2">No goals yet</p>
            <p className="text-[13px] text-[#9CA3AF] leading-relaxed mb-6 max-w-sm">
              Take the quiz to get personalized goal suggestions based on what matters to you.
            </p>
            <button
              onClick={() => navigate('/onboarding')}
              className="px-6 py-3.5 rounded-2xl bg-[#1A1A2E] text-white text-[14px] font-semibold border-none cursor-pointer"
            >
              Get started →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home