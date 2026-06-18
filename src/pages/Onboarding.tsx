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

const Onboarding = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
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

  if (loading) return (
    <div style={{ background: '#0F1117', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#9CA3AF' }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ background: '#0F1117', minHeight: '100vh', color: '#fff', padding: '2rem 1.25rem 8rem', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
    <Helmet>
      <title>Get started · goal.</title>
    </Helmet>
      <p style={{ fontSize: '26px', fontWeight: 600, lineHeight: 1.3, marginBottom: '6px' }}>
        What do you want<br />to work on?
      </p>
      <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '2rem' }}>
        Pick up to 5 areas to get started
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '2rem' }}>
        {categories.map(category => {
          const isSelected = selected.has(category.id)
          return (
            <div
              key={category.id}
              onClick={() => toggle(category.id)}
              style={{
                background: isSelected ? '#1F1A0F' : '#1A1D27',
                border: isSelected ? '1.5px solid #F5A623' : '1.5px solid #2A2D3A',
                borderRadius: '16px',
                padding: '1.25rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                position: 'relative',
                userSelect: 'none',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '20px',
                  height: '20px',
                  background: '#F5A623',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  color: '#0F1117',
                }}>✓</div>
              )}
              <span style={{ fontSize: '32px', lineHeight: 1 }}>
                {CATEGORY_ICONS[category.name] ?? '🎯'}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: isSelected ? '#F5A623' : '#E5E7EB', textAlign: 'center' }}>
                {category.name}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '1rem 1.25rem 1.5rem',
        background: '#0F1117',
        borderTop: '1px solid #1A1D27',
      }}>
        <p style={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center', marginBottom: '10px' }}>
          {counterText()}
        </p>
        <button
          onClick={handleContinue}
          disabled={selected.size === 0}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '14px',
            border: 'none',
            background: selected.size === 0 ? '#2A2D3A' : '#F5A623',
            color: selected.size === 0 ? '#4B5563' : '#0F1117',
            fontSize: '16px',
            fontWeight: 600,
            cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Find my goals →
        </button>
      </div>

    </div>
  )
}

export default Onboarding;