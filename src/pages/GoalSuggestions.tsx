import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { Goal } from '../types/goal'
import { Helmet } from 'react-helmet-async'


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
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0F1117]">
      <Helmet>
        <title>Your suggestions · goal.</title>
      </Helmet>
  
      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-8 pb-6">
        <div className="max-w-2xl mx-auto">
  
          <button
            onClick={() => navigate('/onboarding')}
            className="flex items-center gap-1.5 text-sm text-[#6B7280] mb-6 bg-transparent border-none cursor-pointer p-0"
          >
            ← Back
          </button>
  
          <p className="text-[26px] font-bold text-white leading-snug mb-2">
            Here are your goals
          </p>
          <p className="text-[14px] text-[#6B7280] mb-6">
            Select the ones you want to work on
          </p>
  
          {error && (
            <div className="bg-[#1F0F0F] border border-red-900 rounded-xl px-5 py-4 text-red-300 text-sm mb-4">
              {error}
            </div>
          )}
  
          {loading ? (
            <div className="space-y-3 mb-6">
              {Array(5).fill(null).map((_, i) => (
                <div key={i} className="bg-[#1A1D27] rounded-2xl p-5 animate-pulse">
                  <div className="h-3.5 bg-[#2A2D3A] rounded-md w-3/5 mb-3" />
                  <div className="h-3 bg-[#2A2D3A] rounded-md w-11/12 mb-2" />
                  <div className="h-3 bg-[#2A2D3A] rounded-md w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {goals.map((goal, i) => {
                const isSelected = selected.has(i)
                return (
                  <div
                    key={i}
                    onClick={() => toggle(i)}
                    className="flex items-start gap-3 rounded-2xl p-5 cursor-pointer transition-all duration-150"
                    style={{
                      background: isSelected ? '#1F1A0F' : '#1A1D27',
                      border: isSelected ? '1.5px solid #F5A623' : '1.5px solid #2A2D3A',
                    }}
                  >
                    <div style={{
                      width: '20px', height: '20px', minWidth: '20px',
                      borderRadius: '50%',
                      background: isSelected ? '#F5A623' : 'transparent',
                      border: isSelected ? '1.5px solid #F5A623' : '1.5px solid #2A2D3A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', color: '#0F1117', marginTop: '2px',
                    }}>
                      {isSelected ? '✓' : ''}
                    </div>
                    <div className="flex-1">
                      <p className={`text-left text-[15px] font-semibold mb-1 ${isSelected ? 'text-[#F5A623]' : 'text-[#E5E7EB]'}`}>
                        {goal.title}
                      </p>
                      <p className="text-left text-[13px] text-[#6B7280] leading-relaxed">
                        {goal.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
  
          <p className="text-[13px] text-[#6B7280] text-center mb-4">
            {counterText()}
          </p>
  
          <button
            onClick={handleAddGoals}
            disabled={selected.size === 0}
            className="w-full py-4 rounded-2xl text-[15px] font-semibold border-none transition-all duration-150"
            style={{
              background: selected.size === 0 ? '#2A2D3A' : '#F5A623',
              color: selected.size === 0 ? '#4B5563' : '#0F1117',
              cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Add to my goals →
          </button>
  
        </div>
      </div>
    </div>
  )
}