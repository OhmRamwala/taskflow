import { useState, useEffect } from 'react'
import { X, Calendar, Clock, Bell, Tag, Flag, AlignLeft, Type } from 'lucide-react'

// Today's date in YYYY-MM-DD (local timezone), used as min for the date picker
import { getTodayLocalStr } from '../utils/taskHelpers'
const todayDate = getTodayLocalStr()

const CATEGORIES = ['Work', 'Personal', 'Health', 'Finance', 'Learning', 'Shopping', 'Other']
const PRIORITIES = ['low', 'medium', 'high']
const REMINDER_OPTIONS = [
  { label: 'None',             value: '' },
  { label: '5 min before',    value: '5min' },
  { label: '15 min before',   value: '15min' },
  { label: '30 min before',   value: '30min' },
  { label: '1 hour before',   value: '1hr' },
  { label: '1 day before',    value: '1day' },
]

const empty = {
  title: '', description: '', category: '',
  priority: 'medium', dueDate: '', dueTime: '',
  reminder: '',
}

const priorityStyles = {
  low:    { active: { background: 'var(--success)',  color: '#fff' }, idle: {} },
  medium: { active: { background: 'var(--warning)',  color: '#fff' }, idle: {} },
  high:   { active: { background: 'var(--danger)',   color: '#fff' }, idle: {} },
}

function Label({ icon: Icon, children }) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5"
      style={{ color: 'var(--text-secondary)' }}>
      <Icon size={11} style={{ color: 'var(--accent)' }} />
      {children}
    </label>
  )
}

export default function TaskForm({ open, onClose, onSave, initialData }) {
  const [form, setForm]     = useState(empty)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...empty, ...initialData } : empty)
      setErrors({})
    }
  }, [open, initialData])

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setErrors({ title: 'Title is required' }); return }
    onSave(form)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg flex flex-col rounded-2xl overflow-hidden animate-scale-in"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {initialData ? 'Edit Task' : 'New Task'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {initialData ? 'Update task details below' : 'Fill in the details for your new task'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors btn-ghost"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-6 py-5 space-y-5">

            {/* Title */}
            <div>
              <Label icon={Type}>Title <span style={{ color: 'var(--danger)' }}>*</span></Label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm input-theme"
                style={errors.title ? { borderColor: 'var(--danger)', background: 'var(--danger-light)' } : {}}
                autoFocus
              />
              {errors.title && (
                <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label icon={AlignLeft}>Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Add more details (optional)…"
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm input-theme resize-none"
              />
            </div>

            {/* Category + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label icon={Tag}>Category</Label>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm input-theme appearance-none cursor-pointer"
                >
                  <option value="">None</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <Label icon={Flag}>Priority</Label>
                <div className="flex gap-1.5">
                  {PRIORITIES.map((p) => {
                    const isActive = form.priority === p
                    const styles = priorityStyles[p]
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => set('priority', p)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all duration-150"
                        style={{
                          ...(isActive ? styles.active : {
                            background: 'var(--bg-elevated)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border)',
                          }),
                          transform: isActive ? 'scale(1.03)' : 'scale(1)',
                          boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                        }}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Due Date + Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label icon={Calendar}>Due Date</Label>
                <input
                  type="date"
                  value={form.dueDate}
                  min={todayDate}
                  onChange={(e) => set('dueDate', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm input-theme"
                />
              </div>
              <div>
                <Label icon={Clock}>Due Time</Label>
                <input
                  type="time"
                  value={form.dueTime}
                  onChange={(e) => set('dueTime', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm input-theme"
                />
              </div>
            </div>

            {/* Reminder */}
            <div>
              <Label icon={Bell}>Reminder</Label>
              <select
                value={form.reminder}
                onChange={(e) => set('reminder', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm input-theme appearance-none cursor-pointer"
              >
                {REMINDER_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-3 px-6 py-4 shrink-0"
            style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-muted)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-xl transition-colors btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-xl btn-accent"
              style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
            >
              {initialData ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
