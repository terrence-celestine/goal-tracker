import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

interface Category {
  id: number
  name: string
  icon: string
}

const CATEGORY_ICONS: Record<string, string> = {
  'Fitness': '💪',
  'Learning': '📚',
  'Finance': '💰',
  'Mental Health': '🧘',
  'Career': '💼',
  'Relationships': '❤️',
  'Creativity': '🎨',
  'Nutrition': '🥗',
}

export default function Onboarding() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data)
      })
      .finally(() => setLoading(false))
  }, [])

  const toggle = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (next.size >= 5) return prev
        next.add(id)
      }
      return next
    })
  }

  const counterText = () => {
    if (selected.size === 0) return 'Select at least 1 category'
    if (selected.size === 5) return '5 selected — maximum reached'
    return `${selected.size} selected`
  }

  const handleContinue = () => {
    const selectedNames = categories
      .filter(c => selected.has(c.id))
      .map(c => c.name)
    navigate('/onboarding/goals', { state: { categories: selectedNames } })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0F1117]">
      <Helmet>
        <title>Get started · goal.</title>
      </Helmet>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-8">
        <div className="max-w-2xl mx-auto">

          <p className="text-[26px] font-bold text-white leading-snug mb-2">
            What do you want<br />to work on?
          </p>
          <p className="text-[14px] text-[#6B7280] mb-6">
            Pick up to 5 areas to get started
          </p>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {Array(8).fill(null).map((_, i) => (
                <div key={i} className="bg-[#1A1D27] rounded-2xl h-24 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {categories.map(category => {
                const isSelected = selected.has(category.id)
                return (
                  <div
                    key={category.id}
                    onClick={() => toggle(category.id)}
                    className="relative rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all duration-150"
                    style={{
                      background: isSelected ? '#1F1A0F' : '#1A1D27',
                      border: isSelected ? '1.5px solid #F5A623' : '1.5px solid #2A2D3A',
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-[#F5A623] rounded-full flex items-center justify-center text-[10px] text-[#0F1117] font-bold">
                        ✓
                      </div>
                    )}
                    <span className="text-[28px] leading-none">
                      {CATEGORY_ICONS[category.name] ?? '🎯'}
                    </span>
                    <span className={`text-[13px] font-semibold text-center ${isSelected ? 'text-[#F5A623]' : 'text-[#E5E7EB]'}`}>
                      {category.name}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <p className="text-[13px] text-[#6B7280] text-center mb-4">
            {counterText()}
          </p>

          <button
            onClick={handleContinue}
            disabled={selected.size === 0}
            className="w-full py-4 rounded-2xl text-[15px] font-semibold border-none transition-all duration-150"
            style={{
              background: selected.size === 0 ? '#2A2D3A' : '#F5A623',
              color: selected.size === 0 ? '#4B5563' : '#0F1117',
              cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Find my goals →
          </button>

        </div>
      </div>
    </div>
  )
}