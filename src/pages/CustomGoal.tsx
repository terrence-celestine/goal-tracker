import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'

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

type Step = 'details' | 'category' | 'schedule'

export default function CustomGoal() {
  const [step, setStep] = useState<Step>('details')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [dueDate, setDueDate] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
  }, [])

  const steps: Step[] = ['details', 'category', 'schedule']
  const stepIndex = steps.indexOf(step)

  const canProceedFromDetails = title.trim().length > 0 && description.trim().length > 0

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/custom-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, categoryId, dueDate: dueDate || null }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F6F2]">
  <Helmet>
    <title>New goal · goal.</title>
  </Helmet>
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#EDEBE6] bg-[#F7F6F2]">
        <button
          onClick={() => step === 'details' ? navigate('/') : setStep(steps[stepIndex - 1])}
          className="flex items-center gap-2 text-[13px] font-medium text-[#6B7280] bg-transparent border-none cursor-pointer p-0"
        >
          <i className="ti ti-arrow-left" style={{ fontSize: '16px' }} aria-hidden="true" />
          {step === 'details' ? 'Back to goals' : 'Back'}
        </button>
        <p className="text-[13px] font-semibold text-[#9CA3AF]">
          Step {stepIndex + 1} of {steps.length}
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#EDEBE6]">
        <div
          className="h-full bg-[#1A1A2E] transition-all duration-500"
          style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8 max-w-xl mx-auto w-full">

        {/* STEP 1 — Details */}
        {step === 'details' && (
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-[#9CA3AF] uppercase mb-2">
              Step 1 — The goal
            </p>
            <h1 className="text-[24px] font-bold text-[#1A1A2E] mb-1 leading-snug">
              What do you want to achieve?
            </h1>
            <p className="text-[13px] text-[#9CA3AF] mb-8">
              Be specific — the more detail, the better.
            </p>

            <div className="mb-5">
              <label className="block text-[11px] font-semibold tracking-widest text-[#6B7280] uppercase mb-2">
                Goal title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Run a 5k in under 30 minutes"
                autoFocus
                className="w-full bg-white border border-[#EDEBE6] rounded-2xl px-4 py-3.5 text-[14px] text-[#1A1A2E] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A2E] transition-colors"
              />
              <p className="text-[11px] text-[#D1D5DB] mt-1.5 text-right">
                {title.length}/100
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-[11px] font-semibold tracking-widest text-[#6B7280] uppercase mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what success looks like for this goal..."
                rows={4}
                className="w-full bg-white border border-[#EDEBE6] rounded-2xl px-4 py-3.5 text-[14px] text-[#1A1A2E] placeholder:text-[#D1D5DB] outline-none focus:border-[#1A1A2E] transition-colors resize-none"
              />
            </div>

            <button
              onClick={() => canProceedFromDetails && setStep('category')}
              disabled={!canProceedFromDetails}
              className="w-full py-4 rounded-2xl text-[15px] font-semibold border-none transition-all duration-150"
              style={{
                background: canProceedFromDetails ? '#1A1A2E' : '#E5E7EB',
                color: canProceedFromDetails ? '#fff' : '#9CA3AF',
                cursor: canProceedFromDetails ? 'pointer' : 'not-allowed',
              }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 2 — Category */}
        {step === 'category' && (
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-[#9CA3AF] uppercase mb-2">
              Step 2 — Category
            </p>
            <h1 className="text-[24px] font-bold text-[#1A1A2E] mb-1 leading-snug">
              What area of life is this?
            </h1>
            <p className="text-[13px] text-[#9CA3AF] mb-8">
              Optional — helps organise your goals.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {categories.map(category => {
                const isSelected = categoryId === category.id
                return (
                  <div
                    key={category.id}
                    onClick={() => setCategoryId(isSelected ? null : category.id)}
                    className="bg-white rounded-2xl px-4 py-4 flex items-center gap-3 cursor-pointer transition-all duration-150"
                    style={{
                      border: isSelected ? '2px solid #1A1A2E' : '1px solid #EDEBE6',
                    }}
                  >
                    <span className="text-[22px]">
                      {CATEGORY_ICONS[category.name] ?? '🎯'}
                    </span>
                    <span className={`text-[13px] font-semibold ${isSelected ? 'text-[#1A1A2E]' : 'text-[#6B7280]'}`}>
                      {category.name}
                    </span>
                    {isSelected && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-[#1A1A2E] flex items-center justify-center">
                        <i className="ti ti-check" style={{ fontSize: '11px', color: '#fff' }} aria-hidden="true" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => setStep('schedule')}
              className="w-full py-4 rounded-2xl text-[15px] font-semibold border-none cursor-pointer bg-[#1A1A2E] text-white transition-all duration-150"
            >
              {categoryId ? 'Continue →' : 'Skip for now →'}
            </button>
          </div>
        )}

        {/* STEP 3 — Schedule */}
        {step === 'schedule' && (
          <div>
            <p className="text-[11px] font-semibold tracking-widest text-[#9CA3AF] uppercase mb-2">
              Step 3 — Schedule
            </p>
            <h1 className="text-[24px] font-bold text-[#1A1A2E] mb-1 leading-snug">
              When do you want to hit this?
            </h1>
            <p className="text-[13px] text-[#9CA3AF] mb-8">
              Optional — setting a deadline boosts follow-through.
            </p>

            {/* Goal summary card */}
            <div className="bg-white border border-[#EDEBE6] rounded-2xl p-5 mb-6">
              <p className="text-[11px] font-semibold tracking-widest text-[#9CA3AF] uppercase mb-2">Your goal</p>
              <p className="text-[15px] font-bold text-[#1A1A2E] mb-1">{title}</p>
              <p className="text-[13px] text-[#9CA3AF] leading-relaxed">{description}</p>
              {categoryId && (
                <div className="mt-3 pt-3 border-t border-[#EDEBE6]">
                  <span className="text-[12px] font-semibold text-[#6B7280]">
                    {CATEGORY_ICONS[categories.find(c => c.id === categoryId)?.name ?? ''] ?? '🎯'}{' '}
                    {categories.find(c => c.id === categoryId)?.name}
                  </span>
                </div>
              )}
            </div>

            <div className="mb-8">
              <label className="block text-[11px] font-semibold tracking-widest text-[#6B7280] uppercase mb-2">
                Due date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white border border-[#EDEBE6] rounded-2xl px-4 py-3.5 text-[14px] text-[#1A1A2E] outline-none focus:border-[#1A1A2E] transition-colors"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <span className="text-red-500 text-[13px]">⚠ {error}</span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-2xl text-[15px] font-semibold border-none transition-all duration-150 mb-3"
              style={{
                background: loading ? '#E5E7EB' : '#1A1A2E',
                color: loading ? '#9CA3AF' : '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Saving...' : dueDate ? 'Add goal →' : 'Add without deadline →'}
            </button>

            <button
              onClick={() => setDueDate('')}
              className="w-full py-3 rounded-2xl text-[13px] font-medium text-[#9CA3AF] bg-transparent border-none cursor-pointer"
            >
              Clear date
            </button>
          </div>
        )}

      </div>
    </div>
  )
}