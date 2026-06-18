import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { Goal } from '../types/goal'


export default function GoalSuggestions() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const location = useLocation()
  const navigate = useNavigate()
  const categories: string[] = location.state?.categories ?? []

  useEffect(() => {
    if (categories.length === 0) {
      navigate('/onboarding')
      return
    }

    fetch('/api/suggest-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories }),
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setGoals(data)
        } else {
          setError('Failed to load suggestions. Please try again.')
        }
      })
      .catch(() => setError('Something went wrong. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (index: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  const counterText = () => {
    if (selected.size === 0) return 'Select at least 1 goal'
    return `${selected.size} goal${selected.size > 1 ? 's' : ''} selected`
  }

  const handleAddGoals = () => {
    const selectedGoals = goals.filter((_, i) => selected.has(i))
    localStorage.setItem('pendingGoals', JSON.stringify(selectedGoals))
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0F1117] text-white px-5 pt-8 pb-32 font-sans">

      <button
        onClick={() => navigate('/onboarding')}
        className="flex items-center gap-1.5 text-sm text-gray-400 mb-6 bg-transparent border-none cursor-pointer p-0"
      >
        ← Back
      </button>

      <p className="text-[26px] font-semibold leading-snug mb-1.5">
        Here are your goals
      </p>
      <p className="text-sm text-gray-400 mb-8">
        Select the ones you want to work on
      </p>

      {error && (
        <div className="bg-[#1F0F0F] border border-red-900 rounded-xl px-5 py-4 text-red-300 text-sm mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(null).map((_, i) => (
            <div key={i} className="bg-[#1A1D27] rounded-2xl p-5 animate-pulse">
              <div className="h-3.5 bg-[#2A2D3A] rounded-md w-3/5 mb-3" />
              <div className="h-3 bg-[#2A2D3A] rounded-md w-11/12 mb-2" />
              <div className="h-3 bg-[#2A2D3A] rounded-md w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal, i) => {
            const isSelected = selected.has(i)
            return (
              <div
                key={i}
                onClick={() => toggle(i)}
                className={`flex items-start gap-3 rounded-2xl p-5 cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#1F1A0F] border-[1.5px] border-[#F5A623]'
                    : 'bg-[#1A1D27] border-[1.5px] border-[#2A2D3A]'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 min-w-[20px] rounded-full flex items-center justify-center text-[11px] transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#F5A623] border-[#F5A623] border-[1.5px] text-[#0F1117]'
                    : 'border-[1.5px] border-[#2A2D3A]'
                }`}>
                  {isSelected ? '✓' : ''}
                </div>
                <div className="flex-1">
                  <p className={`text-left text-[15px] font-semibold mb-1 ${isSelected ? 'text-[#F5A623]' : 'text-gray-200'}`}>
                    {goal.title}
                  </p>
                  <p className="text-left text-[13px] text-gray-500 leading-relaxed">
                    {goal.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 px-5 pt-4 pb-6 bg-[#0F1117] border-t border-[#1A1D27]">
        <p className="text-[13px] text-gray-400 text-center mb-2.5">
          {counterText()}
        </p>
        <button
          onClick={handleAddGoals}
          disabled={selected.size === 0}
          className={`w-full py-4 rounded-2xl text-base font-semibold transition-all duration-150 ${
            selected.size === 0
              ? 'bg-[#2A2D3A] text-gray-600 cursor-not-allowed'
              : 'bg-[#F5A623] text-[#0F1117] cursor-pointer'
          }`}
        >
          Add to my goals →
        </button>
      </div>

    </div>
  )
}