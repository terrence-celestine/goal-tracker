import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Calendar, FileText, AlertTriangle, CircleCheck, Clock, PlayCircle } from 'lucide-react'
import type { Goal } from '../types/goal'

const CATEGORY_COLORS: Record<number, { bg: string; text: string; dot: string }> = {
  0: { bg: '#EDE9FE', text: '#7C3AED', dot: '#A78BFA' },
  1: { bg: '#DCFCE7', text: '#15803D', dot: '#4ADE80' },
  2: { bg: '#FEF3C7', text: '#B45309', dot: '#FCD34D' },
  3: { bg: '#FCE7F3', text: '#BE185D', dot: '#F472B6' },
  4: { bg: '#E0F2FE', text: '#0369A1', dot: '#38BDF8' },
}

export default function GoalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [goal, setGoal] = useState<Goal | null>(null)
  const [completed, setCompleted] = useState(false)
  const [dueDate, setDueDate] = useState<string>('')
  const [editingDate, setEditingDate] = useState(false)
  const [notes, setNotes] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [saving, setSaving] = useState(false)

  const colorIndex = Number(id) % 5
  const color = CATEGORY_COLORS[colorIndex]

  useEffect(() => {
    const load = async () => {
      const authRes = await fetch('/api/auth')
    
      if (authRes.ok) {
        setIsAuthenticated(true)
        const data = await fetch('/api/user-goals').then(r => r.json())
        const found = Array.isArray(data) ? data.find((g: Goal) => g.id === Number(id)) : null
        if (!found) {
          setError(true)
          setLoading(false)
          return
        }
        setGoal(found)
        setDueDate(found.dueDate ?? '')
        setCompleted(found.status === 'done')
      } else {
        const stored = localStorage.getItem('pendingGoals')
        if (!stored) {
          setError(true)
          setLoading(false)
          return
        }
        const goals: Goal[] = JSON.parse(stored)
        const found = goals[Number(id)]
        if (!found) {
          setError(true)
          setLoading(false)
          return
        }
        setGoal(found)
        setDueDate(found.dueDate ?? '')
        const completedIds: number[] = JSON.parse(localStorage.getItem('completedGoals') ?? '[]')
        setCompleted(completedIds.includes(Number(id)))
      }
    
      const savedNotes = localStorage.getItem(`goal_notes_${id}`) ?? ''
      setNotes(savedNotes)
      setLoading(false)
    }
    load()
  }, [id])

  const isOverdue = dueDate && new Date(dueDate) < new Date() && !completed

  const toggleComplete = async () => {
    const newStatus = completed ? 'active' : 'done'
    setSaving(true)
  
    if (isAuthenticated && goal?.id) {
      await fetch(`/api/user-goals/${goal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
  
      // Check and award achievements after every status change
      if (newStatus === 'done') {
        await fetch('/api/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
      }
    } else {
      const completedIds: number[] = JSON.parse(localStorage.getItem('completedGoals') ?? '[]')
      if (completed) {
        localStorage.setItem('completedGoals', JSON.stringify(completedIds.filter(i => i !== Number(id))))
      } else {
        localStorage.setItem('completedGoals', JSON.stringify([...completedIds, Number(id)]))
      }
    }
  
    setCompleted(prev => !prev)
    setGoal(prev => prev ? { ...prev, status: newStatus } : prev)
    setSaving(false)
  }

  const saveDate = async (newDate: string) => {
    if (isAuthenticated && goal?.id) {
      await fetch(`/api/user-goals/${goal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate: newDate }),
      })
    } else {
      const stored = localStorage.getItem('pendingGoals')
      if (stored) {
        const goals: Goal[] = JSON.parse(stored)
        goals[Number(id)].dueDate = newDate
        localStorage.setItem('pendingGoals', JSON.stringify(goals))
      }
    }
    setDueDate(newDate)
    setEditingDate(false)
  }

  const saveNotes = () => {
    localStorage.setItem(`goal_notes_${id}`, notes)
    setEditingNotes(false)
  }

  const formattedDueDate = dueDate
    ? new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  if (loading) return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Hero skeleton */}
      <div className="bg-[#1A1A2E] px-8 pt-8 pb-10">
        <div className="h-4 w-24 bg-[#2A2A45] rounded-lg animate-pulse mb-8" />
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="h-5 w-20 bg-[#2A2A45] rounded-full animate-pulse mb-3" />
            <div className="h-7 w-3/4 bg-[#2A2A45] rounded-lg animate-pulse mb-2" />
            <div className="h-7 w-1/2 bg-[#2A2A45] rounded-lg animate-pulse" />
          </div>
          <div className="w-14 h-14 rounded-full bg-[#2A2A45] animate-pulse shrink-0" />
        </div>
      </div>
  
      {/* Cards skeleton */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          {Array(3).fill(null).map((_, i) => (
            <div key={i} className="bg-white border border-[#EDEBE6] rounded-2xl p-5 animate-pulse">
              <div className="h-3 w-24 bg-[#E5E3DE] rounded-md mb-4" />
              <div className="h-4 w-full bg-[#E5E3DE] rounded-md mb-2" />
              <div className="h-4 w-3/4 bg-[#E5E3DE] rounded-md" />
            </div>
          ))}
          <div className="h-14 bg-[#E5E3DE] rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <div className="w-16 h-16 bg-[#EDE9FE] rounded-2xl flex items-center justify-center text-3xl mb-5">
        🔍
      </div>
      <p className="text-[20px] font-bold text-[#1A1A2E] mb-2">Goal not found</p>
      <p className="text-[13px] text-[#9CA3AF] mb-6">This goal doesn't exist or may have been deleted.</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3.5 rounded-2xl bg-[#1A1A2E] text-white text-[14px] font-semibold border-none cursor-pointer"
      >
        Back to goals
      </button>
    </div>
  )
  
  if (!goal) return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-[#1A1A2E] px-8 pt-8 pb-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#7C7CA8] text-[13px] font-medium bg-transparent border-none cursor-pointer p-0"
        >
          <ArrowLeft size={16} />
          Back to goals
        </button>
      </div>
  
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div className="w-20 h-20 bg-[#EDE9FE] rounded-3xl flex items-center justify-center mb-6">
          <span className="text-4xl">🎯</span>
        </div>
        <p className="text-[22px] font-bold text-[#1A1A2E] mb-2">Nothing here yet</p>
        <p className="text-[13px] text-[#9CA3AF] leading-relaxed mb-8 max-w-xs">
          This goal couldn't be loaded. It may have been deleted or something went wrong.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3.5 rounded-2xl bg-[#1A1A2E] text-white text-[14px] font-semibold border-none cursor-pointer mb-3 w-full max-w-xs"
        >
          Back to goals
        </button>
        <button
          onClick={() => navigate('/goals/new')}
          className="px-6 py-3.5 rounded-2xl border border-[#EDEBE6] text-[#A78BFA] text-[14px] font-semibold bg-transparent cursor-pointer w-full max-w-xs"
        >
          Create a new goal
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Hero header */}
      <div className="bg-[#1A1A2E] px-8 pt-8 pb-10 relative overflow-hidden">
        <div
          className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10"
          style={{ background: color.dot }}
        />

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#7C7CA8] text-[13px] font-medium mb-8 bg-transparent border-none cursor-pointer p-0"
        >
          <ArrowLeft size={16} />
          Back to goals
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 mb-3">
              {completed ? (
                <span className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-[#14532D] text-[#4ADE80]">
                  <CircleCheck size={13} /> Completed
                </span>
              ) : isOverdue ? (
                <span className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-[#450A0A] text-[#F87171]">
                  <Clock size={13} /> Overdue
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-[#2A2A45] text-[#A78BFA]">
                  <PlayCircle size={13} /> In progress
                </span>
              )}
            </div>
            <h1 className="text-[22px] font-bold text-white leading-snug">{goal.title}</h1>
          </div>

          <button
            onClick={toggleComplete}
            disabled={saving}
            className="shrink-0 w-14 h-14 rounded-full border-none cursor-pointer flex items-center justify-center transition-all duration-200"
            style={{
              background: saving ? '#2A2A45' : completed ? color.dot : 'transparent',
              border: `2.5px solid ${saving ? '#2A2A45' : completed ? color.dot : '#2A2A45'}`,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
            aria-label="Toggle complete"
          >
            {saving
              ? <Clock size={18} color="#7C7CA8" />
              : completed
              ? <Check size={22} color="#fff" />
              : null
            }
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 pb-24 md:pb-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">

          {isOverdue && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl px-4 py-3.5 flex items-start gap-3">
              <AlertTriangle size={18} color="#EF4444" className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#991B1B] mb-0.5">This goal is overdue</p>
                <p className="text-[12px] text-[#B91C1C]">Pick a new due date to get back on track.</p>
              </div>
              <button
                onClick={() => setEditingDate(true)}
                className="text-[12px] font-semibold text-[#991B1B] bg-[#FECACA] border-none rounded-lg px-3 py-1.5 cursor-pointer whitespace-nowrap"
              >
                Reschedule
              </button>
            </div>
          )}

          <div className="bg-white border border-[#EDEBE6] rounded-2xl p-5">
            <p className="text-[11px] font-semibold tracking-widest text-[#9CA3AF] uppercase mb-3">About this goal</p>
            <p className="text-[14px] text-[#374151] leading-relaxed">{goal.description}</p>
          </div>

          <div className="bg-white border border-[#EDEBE6] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-semibold tracking-widest text-[#9CA3AF] uppercase">Due date</p>
              <button
                onClick={() => setEditingDate(true)}
                className="text-[12px] font-medium text-[#A78BFA] bg-transparent border-none cursor-pointer p-0"
              >
                {dueDate ? 'Change' : 'Set date'}
              </button>
            </div>

            {editingDate ? (
              <div className="flex items-center gap-3 mt-3">
                <input
                  type="date"
                  defaultValue={dueDate}
                  onChange={e => saveDate(e.target.value)}
                  className="flex-1 bg-[#F7F6F2] border border-[#EDEBE6] rounded-xl px-3 py-2 text-[14px] text-[#1A1A2E] outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setEditingDate(false)}
                  className="text-[13px] text-[#9CA3AF] bg-transparent border-none cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <Calendar size={18} color={isOverdue ? '#EF4444' : '#A78BFA'} />
                <p className={`text-[16px] font-semibold ${isOverdue ? 'text-[#EF4444]' : 'text-[#1A1A2E]'}`}>
                  {formattedDueDate ?? 'No due date set'}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white border border-[#EDEBE6] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText size={14} color="#9CA3AF" />
                <p className="text-[11px] font-semibold tracking-widest text-[#9CA3AF] uppercase">Notes</p>
              </div>
              {!editingNotes && (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="text-[12px] font-medium text-[#A78BFA] bg-transparent border-none cursor-pointer p-0"
                >
                  {notes ? 'Edit' : 'Add note'}
                </button>
              )}
            </div>

            {editingNotes ? (
              <div className="flex flex-col gap-3">
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add any notes, reminders, or progress updates..."
                  rows={4}
                  className="w-full bg-[#F7F6F2] border border-[#EDEBE6] rounded-xl px-3 py-2.5 text-[14px] text-[#1A1A2E] outline-none resize-none placeholder:text-[#D1D5DB]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveNotes}
                    className="flex-1 py-2.5 rounded-xl bg-[#1A1A2E] text-white text-[13px] font-semibold border-none cursor-pointer"
                  >
                    Save note
                  </button>
                  <button
                    onClick={() => setEditingNotes(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#F3F4F6] text-[#6B7280] text-[13px] font-semibold border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[14px] text-[#374151] leading-relaxed">
                {notes || <span className="text-[#D1D5DB]">No notes yet</span>}
              </p>
            )}
          </div>

          <button
            onClick={toggleComplete}
            disabled={saving}
            className="w-full py-4 rounded-2xl text-[15px] font-semibold border-none cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              background: saving ? '#E5E7EB' : completed ? '#F3F4F6' : '#1A1A2E',
              color: saving ? '#9CA3AF' : completed ? '#6B7280' : '#fff',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving
              ? <><Clock size={16} /> Saving...</>
              : completed
              ? <><ArrowLeft size={16} /> Mark as incomplete</>
              : <><Check size={16} /> Mark as complete</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}