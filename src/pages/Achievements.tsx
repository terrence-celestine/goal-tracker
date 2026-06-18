import { useState, useEffect } from 'react'
import { Lock, Trophy } from 'lucide-react'

interface Achievement {
  id: number
  name: string
  description: string
  icon: string
  triggerRule: string
  earned: boolean
  earnedAt: string | null
}

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/achievements')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAchievements(data)
      })
      .finally(() => setLoading(false))
  }, [])

  const earnedCount = achievements.filter(a => a.earned).length
  const totalCount = achievements.length
  const progressPct = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0

  const earned = achievements.filter(a => a.earned)
  const unearned = achievements.filter(a => !a.earned)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#EDEBE6] bg-[#F7F6F2]">
        <div>
          <p className="text-[20px] font-bold text-[#1A1A2E]">Achievements</p>
          <p className="text-[12px] text-[#9CA3AF] mt-0.5">
            {loading ? 'Loading...' : `${earnedCount} of ${totalCount} unlocked`}
          </p>
        </div>
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#EDE9FE]">
          <Trophy size={16} color="#7C3AED" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 pb-24 md:pb-6">

        {/* Progress bar */}
        {!loading && totalCount > 0 && (
          <div className="bg-white border border-[#EDEBE6] rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold text-[#1A1A2E]">Your progress</p>
              <p className="text-[13px] font-bold text-[#A78BFA]">{progressPct}%</p>
            </div>
            <div className="h-2 bg-[#EDE9FE] rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-[#A78BFA] rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-[#9CA3AF]">{earnedCount} earned</p>
              <p className="text-[11px] text-[#9CA3AF]">{totalCount - earnedCount} remaining</p>
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <>
            <div className="h-24 bg-white border border-[#EDEBE6] rounded-2xl mb-6 animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              {Array(6).fill(null).map((_, i) => (
                <div key={i} className="bg-white border border-[#EDEBE6] rounded-2xl p-5 animate-pulse">
                  <div className="w-10 h-10 bg-[#E5E3DE] rounded-xl mb-3" />
                  <div className="h-3.5 bg-[#E5E3DE] rounded-md w-3/4 mb-2" />
                  <div className="h-3 bg-[#E5E3DE] rounded-md w-full" />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Earned achievements */}
        {!loading && earned.length > 0 && (
          <div className="mb-6">
            <p className="text-[11px] font-semibold tracking-widest text-[#9CA3AF] uppercase mb-3">
              Unlocked · {earned.length}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {earned.map(achievement => (
                <div
                  key={achievement.id}
                  className="bg-white border border-[#EDEBE6] rounded-2xl p-5 relative overflow-hidden"
                >
                  {/* Accent corner */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#EDE9FE] rounded-bl-full opacity-50" />

                  <div className="text-[28px] mb-3">{achievement.icon}</div>
                  <p className="text-[14px] font-bold text-[#1A1A2E] mb-1">{achievement.name}</p>
                  <p className="text-[12px] text-[#9CA3AF] leading-relaxed mb-3">
                    {achievement.description}
                  </p>
                  {achievement.earnedAt && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]" />
                      <p className="text-[11px] font-semibold text-[#A78BFA]">
                        {formatDate(achievement.earnedAt)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unearned achievements */}
        {!loading && unearned.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-[#9CA3AF] uppercase mb-3">
              Locked · {unearned.length}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {unearned.map(achievement => (
                <div
                  key={achievement.id}
                  className="bg-[#FAFAF9] border border-[#EDEBE6] rounded-2xl p-5 relative"
                >
                  <div className="absolute top-4 right-4">
                    <Lock size={12} color="#D1D5DB" />
                  </div>

                  <div className="text-[28px] mb-3 grayscale opacity-40">
                    {achievement.icon}
                  </div>
                  <p className="text-[14px] font-bold text-[#9CA3AF] mb-1">{achievement.name}</p>
                  <p className="text-[12px] text-[#D1D5DB] leading-relaxed">
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && totalCount === 0 && (
          <div className="flex flex-col items-center justify-center mt-32 text-center">
            <div className="w-16 h-16 bg-[#EDE9FE] rounded-2xl flex items-center justify-center mb-5">
              <Trophy size={28} color="#A78BFA" />
            </div>
            <p className="text-[20px] font-bold text-[#1A1A2E] mb-2">No achievements yet</p>
            <p className="text-[13px] text-[#9CA3AF] leading-relaxed max-w-xs">
              Complete goals to start earning badges and tracking your progress.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}