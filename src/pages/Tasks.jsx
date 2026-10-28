import { useState, useEffect } from 'react'
import {
  Plus, Search, X, Bell, Clock, Calendar,
  Trash2, Pencil, AlignLeft, Type, BellPlus, CheckSquare,
} from 'lucide-react'
import { useTasks } from '../context/TaskContext'
import { useReminders } from '../context/ReminderContext'
import { getEffectiveStatus, getTodayLocalStr } from '../utils/taskHelpers'
import TaskCard from '../components/TaskCard'
import TaskForm from '../components/TaskForm'
import { useSearchParams } from 'react-router-dom'
import { IllustrationEmptyTasks, IllustrationEmptyReminders } from '../components/Illustrations'

const todayDate = getTodayLocalStr()

/* ─────────────────────────────────────────────────────────────────
   Task filter config
───────────────────────────────────────────────────────────────── */
const TASK_FILTERS = [
  { key: 'all',       label: 'All' },
  { key: 'active',    label: 'Active' },
  { key: 'completed', label: 'Done' },
  { key: 'overdue',   label: 'Overdue' },
]

/* ─────────────────────────────────────────────────────────────────
   Reminder helpers
───────────────────────────────────────────────────────────────── */
function isReminderPast(dateStr, timeStr) {
  if (!dateStr) return false
  return new Date(`${dateStr}T${timeStr || '23:59'}`) < new Date()
}

function formatReminderDate(dateStr, timeStr) {
  if (!dateStr) return ''
  const d = new Date(`${dateStr}T${timeStr || '00:00'}`)
  const label =
    dateStr === todayDate
      ? 'Today'
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  if (!timeStr) return label
  return `${label} at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}

/* ─────────────────────────────────────────────────────────────────
   Inline edit form (inside a reminder card)
───────────────────────────────────────────────────────────────── */
function EditReminderForm({ reminder, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: reminder.title || '',
    date:  reminder.date  || todayDate,
    time:  reminder.time  || '',
    note:  reminder.note  || '',
  })
  const [error, setError] = useState('')
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.date)          { setError('Date is required');  return }
    onSave({ title: form.title.trim(), date: form.date, time: form.time, note: form.note.trim() })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="px-5 py-4 space-y-3 animate-fade-up"
      style={{ borderTop: '1px solid var(--border-subtle)' }}
    >
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: 'var(--text-secondary)' }}>
          <Type size={11} style={{ color: 'var(--accent)' }} /> Title *
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => { set('title', e.target.value); setError('') }}
          className="w-full px-3 py-2 rounded-xl text-sm input-theme"
          style={error && !form.title.trim() ? { borderColor: 'var(--danger)' } : {}}
          autoFocus
        />
        {error && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{error}</p>}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: 'var(--text-secondary)' }}>
            <Calendar size={11} style={{ color: 'var(--accent)' }} /> Date *
          </label>
          <input type="date" value={form.date}
            onChange={(e) => set('date', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm input-theme" />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: 'var(--text-secondary)' }}>
            <Clock size={11} style={{ color: 'var(--accent)' }} /> Time
          </label>
          <input type="time" value={form.time}
            onChange={(e) => set('time', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm input-theme" />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: 'var(--text-secondary)' }}>
          <AlignLeft size={11} style={{ color: 'var(--accent)' }} /> Note (optional)
        </label>
        <textarea value={form.note} onChange={(e) => set('note', e.target.value)}
          rows={2} className="w-full px-3 py-2 rounded-xl text-sm input-theme resize-none" />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2 text-sm font-semibold rounded-xl btn-ghost">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 py-2 text-sm font-semibold rounded-xl"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
          Save Changes
        </button>
      </div>
    </form>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Standalone reminder card (with inline edit)
───────────────────────────────────────────────────────────────── */
function ReminderCard({ reminder, onDelete, onEdit }) {
  const isPast = isReminderPast(reminder.date, reminder.time)
  const [editing, setEditing] = useState(false)

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${isPast ? 'var(--border-subtle)' : 'var(--border)'}`,
        boxShadow: 'var(--shadow)',
        opacity: isPast ? 0.65 : 1,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow)')}
    >
      <div className="flex items-start gap-3 p-5 group">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: isPast ? 'var(--bg-elevated)' : 'var(--accent-light)' }}
        >
          <Bell size={16} style={{ color: isPast ? 'var(--text-muted)' : 'var(--accent)' }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {reminder.title}
          </p>
          {reminder.note && (
            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
              {reminder.note}
            </p>
          )}
          {reminder.date && (
            <div className="flex items-center gap-1.5 text-xs mt-1.5 flex-wrap"
              style={{ color: 'var(--text-secondary)' }}>
              <Calendar size={11} style={{ color: 'var(--info)' }} />
              {formatReminderDate(reminder.date, reminder.time)}
              {isPast && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                  Done
                </span>
              )}
            </div>
          )}
        </div>

        {/* Edit + Delete — always visible on mobile, hover-reveal on desktop */}
        <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
          <button
            onClick={() => setEditing((v) => !v)}
            className="p-1.5 rounded-lg"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
            aria-label={editing ? 'Cancel edit' : 'Edit reminder'}
            title={editing ? 'Cancel edit' : 'Edit reminder'}
          >
            {editing ? <X size={13} /> : <Pencil size={13} />}
          </button>
          <button
            onClick={() => onDelete(reminder.id)}
            className="p-1.5 rounded-lg"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-light)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
            aria-label="Delete reminder"
            title="Delete reminder"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {editing && (
        <EditReminderForm
          reminder={reminder}
          onSave={(updates) => { onEdit(reminder.id, updates); setEditing(false) }}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Create reminder inline form
───────────────────────────────────────────────────────────────── */
function CreateReminderForm({ onClose }) {
  const { addReminder } = useReminders()
  const [form, setForm] = useState({ title: '', date: todayDate, time: '', note: '' })
  const [error, setError] = useState('')
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.date)          { setError('Date is required');  return }
    addReminder({ title: form.title.trim(), date: form.date, time: form.time, note: form.note.trim() })
    onClose()
  }

  return (
    <div
      className="rounded-2xl overflow-hidden animate-scale-in"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
    >
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent-light)' }}>
            <Bell size={14} style={{ color: 'var(--accent)' }} />
          </div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>New Reminder</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg btn-ghost"
          style={{ color: 'var(--text-muted)' }} aria-label="Close">
          <X size={15} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: 'var(--text-secondary)' }}>
            <Type size={11} style={{ color: 'var(--accent)' }} /> Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => { set('title', e.target.value); setError('') }}
            placeholder="What do you want to be reminded about?"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm input-theme"
            style={error && !form.title.trim() ? { borderColor: 'var(--danger)' } : {}}
            autoFocus
          />
          {error && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{error}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--text-secondary)' }}>
              <Calendar size={11} style={{ color: 'var(--accent)' }} /> Date *
            </label>
            <input type="date" value={form.date} min={todayDate}
              onChange={(e) => set('date', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm input-theme" />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--text-secondary)' }}>
              <Clock size={11} style={{ color: 'var(--accent)' }} /> Time
            </label>
            <input type="time" value={form.time}
              onChange={(e) => set('time', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm input-theme" />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: 'var(--text-secondary)' }}>
            <AlignLeft size={11} style={{ color: 'var(--accent)' }} /> Note (optional)
          </label>
          <textarea value={form.note} onChange={(e) => set('note', e.target.value)}
            placeholder="Any extra details…" rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm input-theme resize-none" />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl btn-ghost">
            Cancel
          </button>
          <button type="submit"
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl btn-accent"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
            Save Reminder
          </button>
        </div>
      </form>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Filter pill (shared by tasks and reminders rows)
───────────────────────────────────────────────────────────────── */
function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150"
      style={{
        background: active ? 'var(--accent)' : 'transparent',
        color: active ? 'var(--accent-text)' : 'var(--text-secondary)',
        boxShadow: active ? '0 2px 8px color-mix(in srgb, var(--accent) 30%, transparent)' : 'none',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-elevated)' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Count badge (used inside filter pills)
───────────────────────────────────────────────────────────────── */
function CountBadge({ value, active }) {
  return (
    <span
      className="text-xs rounded-full px-1.5 py-0.5 font-bold min-w-[20px] text-center"
      style={{
        background: active
          ? 'color-mix(in srgb, var(--accent-text) 20%, transparent)'
          : 'var(--bg-elevated)',
        color: active ? 'var(--accent-text)' : 'var(--text-muted)',
      }}
    >
      {value}
    </span>
  )
}

/* ═════════════════════════════════════════════════════════════════
   MAIN PAGE
═════════════════════════════════════════════════════════════════*/
export default function Tasks() {
  /* ── Task state ───────────────────────────────────────────────── */
  const { tasks, addTask, updateTask, deleteTask, completeTask, uncompleteTask } = useTasks()
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  /* ── Reminder state ───────────────────────────────────────────── */
  const { reminders, deleteReminder, updateReminder } = useReminders()
  const [reminderFilter, setReminderFilter] = useState('upcoming')
  const [showReminderForm, setShowReminderForm] = useState(false)

  /* ── Toggle state: 'tasks' | 'reminders' ─────────────────────── */
  const [tab, setTab] = useState('tasks')

  /* ── Auto-open task form via ?add=1 (mobile + button) ────────── */
  useEffect(() => {
    if (searchParams.get('add') === '1') {
      setTab('tasks')
      setFormOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  /* ── Task handlers ────────────────────────────────────────────── */
  const handleSave  = (data) => {
    if (editing) { updateTask(editing.id, data); setEditing(null) }
    else addTask(data)
  }
  const handleEdit  = (task) => { setEditing(task); setFormOpen(true) }
  const handleClose = () => { setFormOpen(false); setEditing(null) }

  const counts = {
    all:       tasks.length,
    active:    tasks.filter((t) => getEffectiveStatus(t) === 'active').length,
    completed: tasks.filter((t) => getEffectiveStatus(t) === 'completed').length,
    overdue:   tasks.filter((t) => getEffectiveStatus(t) === 'overdue').length,
  }

  const filtered = tasks.filter((t) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      (t.category    || '').toLowerCase().includes(q)
    const status = getEffectiveStatus(t)
    const matchFilter =
      filter === 'all' ||
      (filter === 'active'    && status === 'active') ||
      (filter === 'completed' && status === 'completed') ||
      (filter === 'overdue'   && status === 'overdue')
    return matchSearch && matchFilter
  })

  /* ── Reminder derived lists ───────────────────────────────────── */
  const upcoming = reminders
    .filter((r) => !isReminderPast(r.date, r.time))
    .sort((a, b) =>
      new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`)
    )
  const past = reminders
    .filter((r) => isReminderPast(r.date, r.time))
    .sort((a, b) =>
      new Date(`${b.date}T${b.time || '00:00'}`) - new Date(`${a.date}T${a.time || '00:00'}`)
    )
  const shownReminders = reminderFilter === 'upcoming' ? upcoming : past

  /* ── When switching to Reminders tab, close the task form ─────── */
  const switchTab = (next) => {
    setTab(next)
    if (next === 'reminders') { setFormOpen(false); setEditing(null) }
    if (next === 'tasks')      setShowReminderForm(false)
  }

  /* ─────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────── */
  return (
    <>
      <div className="space-y-3">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 animate-fade-up">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Tasks</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Manage your tasks and reminders.
            </p>
          </div>

          {/* Action buttons — contextual to active tab */}
          <div className="flex items-center gap-2 shrink-0">
            {tab === 'tasks' && (
              <button
                onClick={() => setFormOpen(true)}
                className="flex items-center justify-center rounded-xl font-semibold transition-all active:scale-95"
                style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                aria-label="Add task"
                title="Add task"
              >
                <span className="flex items-center justify-center sm:hidden w-9 h-9">
                  <Plus size={18} />
                </span>
                <span className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm">
                  <Plus size={15} /> Add Task
                </span>
              </button>
            )}

            {tab === 'reminders' && (
              <button
                onClick={() => setShowReminderForm((v) => !v)}
                className="flex items-center justify-center rounded-xl font-semibold transition-all active:scale-95"
                style={{
                  background: showReminderForm ? 'var(--bg-elevated)' : 'var(--accent-light)',
                  color: showReminderForm ? 'var(--text-primary)' : 'var(--accent)',
                  border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                aria-label="New reminder"
                title="New reminder"
              >
                <span className="flex items-center justify-center sm:hidden w-9 h-9">
                  {showReminderForm ? <X size={18} /> : <BellPlus size={18} />}
                </span>
                <span className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm">
                  {showReminderForm
                    ? <><X size={15} /> Cancel</>
                    : <><BellPlus size={15} /> New Reminder</>}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ── Segmented toggle ──────────────────────────────────────── */}
        <div
          className="flex items-center p-1 rounded-xl w-full animate-fade-up"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            gap: '2px',
          }}
          role="tablist"
          aria-label="View"
        >
          {/* Tasks tab */}
          <button
            role="tab"
            aria-selected={tab === 'tasks'}
            onClick={() => switchTab('tasks')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{
              background: tab === 'tasks' ? 'var(--accent)' : 'transparent',
              color: tab === 'tasks' ? 'var(--accent-text)' : 'var(--text-secondary)',
              boxShadow: tab === 'tasks'
                ? '0 2px 10px color-mix(in srgb, var(--accent) 30%, transparent)'
                : 'none',
            }}
            onMouseEnter={(e) => {
              if (tab !== 'tasks') e.currentTarget.style.background = 'var(--bg-elevated)'
            }}
            onMouseLeave={(e) => {
              if (tab !== 'tasks') e.currentTarget.style.background = 'transparent'
            }}
          >
            <CheckSquare size={15} />
            Tasks
            <span
              className="text-xs rounded-full px-1.5 py-0.5 font-bold min-w-[20px] text-center"
              style={{
                background: tab === 'tasks'
                  ? 'color-mix(in srgb, var(--accent-text) 20%, transparent)'
                  : 'var(--bg-elevated)',
                color: tab === 'tasks' ? 'var(--accent-text)' : 'var(--text-muted)',
              }}
            >
              {tasks.length}
            </span>
          </button>

          {/* Reminders tab */}
          <button
            role="tab"
            aria-selected={tab === 'reminders'}
            onClick={() => switchTab('reminders')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{
              background: tab === 'reminders' ? 'var(--accent)' : 'transparent',
              color: tab === 'reminders' ? 'var(--accent-text)' : 'var(--text-secondary)',
              boxShadow: tab === 'reminders'
                ? '0 2px 10px color-mix(in srgb, var(--accent) 30%, transparent)'
                : 'none',
            }}
            onMouseEnter={(e) => {
              if (tab !== 'reminders') e.currentTarget.style.background = 'var(--bg-elevated)'
            }}
            onMouseLeave={(e) => {
              if (tab !== 'reminders') e.currentTarget.style.background = 'transparent'
            }}
          >
            <Bell size={15} />
            Reminders
            <span
              className="text-xs rounded-full px-1.5 py-0.5 font-bold min-w-[20px] text-center"
              style={{
                background: tab === 'reminders'
                  ? 'color-mix(in srgb, var(--accent-text) 20%, transparent)'
                  : 'var(--bg-elevated)',
                color: tab === 'reminders' ? 'var(--accent-text)' : 'var(--text-muted)',
              }}
            >
              {reminders.length}
            </span>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════
            TAB: TASKS
        ══════════════════════════════════════════════════════════ */}
        {tab === 'tasks' && (
          <section className="space-y-4 animate-fade-up">

            {/* Search + filter bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tasks…"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm input-theme"
                  style={{ background: 'var(--bg-surface)' }}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filter pills */}
              <div
                className="flex items-center gap-1 p-1 rounded-xl overflow-x-auto shrink-0"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              >
                {TASK_FILTERS.map(({ key, label }) => (
                  <FilterPill key={key} active={filter === key} onClick={() => setFilter(key)}>
                    {label}
                    <CountBadge value={counts[key]} active={filter === key} />
                  </FilterPill>
                ))}
              </div>
            </div>

            {/* Task grid / empty state */}
            {filtered.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-10 gap-3 animate-fade-in"
                style={{ color: 'var(--text-muted)' }}
              >
                <IllustrationEmptyTasks width={100} />
                <div className="text-center">
                  <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {search
                      ? 'No tasks match your search.'
                      : filter !== 'all'
                      ? `No ${filter} tasks.`
                      : 'No tasks yet.'}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    {search
                      ? 'Try a different keyword.'
                      : filter !== 'all'
                      ? 'Switch to "All" to see everything.'
                      : ''}
                  </p>
                </div>
                {!search && filter === 'all' && (
                  <button
                    onClick={() => setFormOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold btn-accent"
                    style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
                  >
                    <Plus size={15} /> Add your first task
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 stagger-children items-stretch">
                {filtered.map((task) => (
                  <div key={task.id} className="animate-fade-up h-full">
                    <TaskCard
                      task={task}
                      onEdit={handleEdit}
                      onDelete={deleteTask}
                      onComplete={completeTask}
                      onUncomplete={uncompleteTask}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB: REMINDERS
        ══════════════════════════════════════════════════════════ */}
        {tab === 'reminders' && (
          <section className="space-y-4 animate-fade-up">

            {/* Section heading (left) + vertical Upcoming/Past selector (right) */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 pt-0.5">
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  My Reminders
                </h2>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                >
                  {reminders.length}
                </span>
              </div>

              {/* Vertical Upcoming / Past selector */}
              <div
                className="flex flex-col p-1 rounded-xl shrink-0"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  gap: '2px',
                  minWidth: '110px',
                }}
              >
                {[
                  { key: 'upcoming', label: 'Upcoming', count: upcoming.length },
                  { key: 'past',     label: 'Past',     count: past.length },
                ].map(({ key, label, count }) => {
                  const isActive = reminderFilter === key
                  return (
                    <button
                      key={key}
                      onClick={() => setReminderFilter(key)}
                      className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 w-full"
                      style={{
                        background: isActive ? 'var(--accent)' : 'transparent',
                        color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)',
                        boxShadow: isActive
                          ? '0 2px 8px color-mix(in srgb, var(--accent) 30%, transparent)'
                          : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'var(--bg-elevated)'
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <span>{label}</span>
                      <span
                        className="text-xs rounded-full px-1.5 py-0.5 font-bold min-w-[20px] text-center"
                        style={{
                          background: isActive
                            ? 'color-mix(in srgb, var(--accent-text) 20%, transparent)'
                            : 'var(--bg-elevated)',
                          color: isActive ? 'var(--accent-text)' : 'var(--text-muted)',
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* New reminder inline form */}
            {showReminderForm && (
              <div className="max-w-lg animate-fade-up">
                <CreateReminderForm onClose={() => setShowReminderForm(false)} />
              </div>
            )}

            {/* Empty state */}
            {shownReminders.length === 0 && !showReminderForm && (
              <div
                className="flex flex-col items-center justify-center py-10 gap-3 animate-fade-in"
                style={{ color: 'var(--text-muted)' }}
              >
                <IllustrationEmptyReminders width={100} />
                <div className="text-center">
                  <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    {reminderFilter === 'upcoming' ? 'No upcoming reminders.' : 'No past reminders.'}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    {reminderFilter === 'upcoming'
                      ? ''
                      : 'Past reminders will appear here.'}
                  </p>
                </div>
                {reminderFilter === 'upcoming' && (
                  <button
                    onClick={() => setShowReminderForm(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold btn-accent"
                    style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
                  >
                    <BellPlus size={15} /> Create your first reminder
                  </button>
                )}
              </div>
            )}

            {/* Reminder cards grid */}
            {shownReminders.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 stagger-children">
                {shownReminders.map((reminder) => (
                  <div key={reminder.id} className="animate-fade-up">
                    <ReminderCard
                      reminder={reminder}
                      onDelete={deleteReminder}
                      onEdit={updateReminder}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </div>

      {/* Task form modal — outside layout flow */}
      <TaskForm
        open={formOpen}
        onClose={handleClose}
        onSave={handleSave}
        initialData={editing}
      />
    </>
  )
}
