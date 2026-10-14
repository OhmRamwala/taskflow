import { useState } from 'react'
import {
  Bell, BellOff, Clock, Calendar, Tag, AlertCircle,
  Plus, Trash2, X, Type, AlignLeft, CheckSquare, Pencil,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTasks } from '../context/TaskContext'
import { useReminders } from '../context/ReminderContext'
import { formatDateTime, getRemainingTime, getEffectiveStatus, getTodayLocalStr } from '../utils/taskHelpers'
import { IllustrationEmptyReminders, IllustrationBell } from '../components/Illustrations'

const todayDate = getTodayLocalStr()

const REMINDER_LABELS = {
  '5min':  '5 min before',
  '15min': '15 min before',
  '30min': '30 min before',
  '1hr':   '1 hour before',
  '1day':  '1 day before',
}

/* ── helpers ────────────────────────────────────────────────────── */
function formatReminderDate(dateStr, timeStr) {
  if (!dateStr) return ''
  const d = new Date(`${dateStr}T${timeStr || '00:00'}`)
  const today = getTodayLocalStr()
  const label = dateStr === today ? 'Today' :
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  if (!timeStr) return label
  return `${label} at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}

function isReminderPast(dateStr, timeStr) {
  if (!dateStr) return false
  return new Date(`${dateStr}T${timeStr || '23:59'}`) < new Date()
}

/* ── Edit reminder form (pre-filled, inline) ────────────────────── */
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
    <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3 animate-fade-up"
      style={{ borderTop: '1px solid var(--border-subtle)' }}>
      {/* Title */}
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

      {/* Date + Time */}
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

      {/* Note */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: 'var(--text-secondary)' }}>
          <AlignLeft size={11} style={{ color: 'var(--accent)' }} /> Note (optional)
        </label>
        <textarea value={form.note} onChange={(e) => set('note', e.target.value)}
          rows={2} className="w-full px-3 py-2 rounded-xl text-sm input-theme resize-none" />
      </div>

      {/* Actions */}
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

/* ── Section header ─────────────────────────────────────────────── */
function SectionHead({ icon: Icon, label, count, accent }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={15} style={{ color: accent }} />
      <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: accent }}>
        {label}
      </h2>
      <span
        className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ background: accent + '22', color: accent }}
      >
        {count}
      </span>
    </div>
  )
}

/* ── Task reminder card ─────────────────────────────────────────── */
function TaskReminderCard({ task, isOverdue }) {
  const remaining = getRemainingTime(task)
  return (
    <div
      className="rounded-2xl p-5 space-y-3 transition-all duration-200 group"
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${isOverdue ? 'var(--danger)' : 'var(--border)'}`,
        boxShadow: 'var(--shadow)',
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow)'}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: isOverdue ? 'var(--danger-light)' : 'var(--warning-light)' }}
        >
          <Bell size={16} style={{ color: isOverdue ? 'var(--danger)' : 'var(--warning)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <CheckSquare size={11} style={{ color: 'var(--text-muted)' }} />
            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Task
            </span>
          </div>
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
              {task.description}
            </p>
          )}
        </div>
        {task.priority && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full capitalize shrink-0"
            style={{
              background: task.priority === 'high' ? 'var(--danger-light)'
                : task.priority === 'medium' ? 'var(--warning-light)' : 'var(--success-light)',
              color: task.priority === 'high' ? 'var(--danger)'
                : task.priority === 'medium' ? 'var(--warning)' : 'var(--success)',
            }}
          >
            {task.priority}
          </span>
        )}
      </div>

      <div className="space-y-1.5 pl-12">
        {task.dueDate && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Calendar size={11} style={{ color: 'var(--info)' }} />
            {formatDateTime(task.dueDate, task.dueTime)}
          </div>
        )}
        {task.category && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Tag size={11} style={{ color: 'var(--accent)' }} />
            {task.category}
          </div>
        )}
        {task.reminder && (
          <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--warning)' }}>
            <Clock size={11} />
            {REMINDER_LABELS[task.reminder] || task.reminder}
          </div>
        )}
      </div>

      {remaining && (
        <div className="pl-12 text-xs font-semibold" style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-muted)' }}>
          {remaining}
        </div>
      )}
    </div>
  )
}

/* ── Standalone reminder card ───────────────────────────────────── */
function StandaloneReminderCard({ reminder, onDelete, onEdit }) {
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
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow)'}
    >
      {/* Card header row */}
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
            <div className="flex items-center gap-1.5 text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>
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
        {/* Edit + Delete buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
          <button
            onClick={() => setEditing((v) => !v)}
            className="p-1.5 rounded-lg"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
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
            title="Delete reminder"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Inline edit form — shown when pencil clicked */}
      {editing && (
        <EditReminderForm
          reminder={reminder}
          onSave={(updates) => {
            onEdit(reminder.id, updates)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  )
}

/* ── Create reminder form ───────────────────────────────────────── */
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
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent-light)' }}>
            <Bell size={14} style={{ color: 'var(--accent)' }} />
          </div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            New Reminder
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg btn-ghost"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
        {/* Title */}
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

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--text-secondary)' }}>
              <Calendar size={11} style={{ color: 'var(--accent)' }} /> Date *
            </label>
            <input
              type="date"
              value={form.date}
              min={todayDate}
              onChange={(e) => set('date', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm input-theme"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--text-secondary)' }}>
              <Clock size={11} style={{ color: 'var(--accent)' }} /> Time
            </label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => set('time', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm input-theme"
            />
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: 'var(--text-secondary)' }}>
            <AlignLeft size={11} style={{ color: 'var(--accent)' }} /> Note (optional)
          </label>
          <textarea
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
            placeholder="Any extra details…"
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm input-theme resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl btn-ghost"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl btn-accent"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            Save Reminder
          </button>
        </div>
      </form>
    </div>
  )
}

/* ── Reminders page ─────────────────────────────────────────────── */
export default function Reminders() {
  const { tasks } = useTasks()
  const { reminders, deleteReminder, updateReminder } = useReminders()
  const [showForm, setShowForm] = useState(false)

  // Task-based reminders
  const withReminders = tasks
    .filter((t) => t.reminder && t.status !== 'completed')
    .sort((a, b) => {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate + 'T' + (a.dueTime || '23:59'))
           - new Date(b.dueDate + 'T' + (b.dueTime || '23:59'))
    })

  const overdueTask  = withReminders.filter((t) => getEffectiveStatus(t) === 'overdue')
  const upcomingTask = withReminders.filter((t) => getEffectiveStatus(t) === 'active')

  // Standalone reminders — split upcoming vs past
  const upcomingStandalone = reminders
    .filter((r) => !isReminderPast(r.date, r.time))
    .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`))

  const pastStandalone = reminders
    .filter((r) => isReminderPast(r.date, r.time))
    .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`) - new Date(`${a.date}T${a.time || '00:00'}`))
    .slice(0, 5)  // show last 5 past reminders

  const totalActive = upcomingTask.length + overdueTask.length + upcomingStandalone.length
  const hasAnything = reminders.length > 0 || withReminders.length > 0

  return (
    <div className="space-y-6">
      {/* Header with New Reminder button in top-right */}
      <div className="flex items-start justify-between gap-4 flex-wrap animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Reminders</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {totalActive === 0 ? 'No active reminders.' : `${totalActive} active reminder${totalActive !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0"
          style={{
            background: showForm ? 'var(--bg-elevated)' : 'var(--accent)',
            color: showForm ? 'var(--text-primary)' : 'var(--accent-text)',
          }}
        >
          {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> New Reminder</>}
        </button>
      </div>

      {/* Create form — always renderable regardless of whether items exist */}
      {showForm && (
        <div className="max-w-lg animate-fade-up">
          <CreateReminderForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Empty state — only when no items AND form is closed */}
      {!hasAnything && !showForm && (
        <div
          className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in"
          style={{ color: 'var(--text-muted)' }}
        >
          <IllustrationEmptyReminders width={130} />
          <div className="text-center">
            <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No reminders yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Create a reminder or add one when editing a task.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold btn-accent"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            <Plus size={15} /> Create your first reminder
          </button>
        </div>
      )}

      {/* Content — when items exist */}
      {hasAnything && (
        <div className="space-y-8">

          {/* Overdue task reminders */}
          {overdueTask.length > 0 && (
            <section className="animate-fade-up">
              <SectionHead icon={AlertCircle} label="Overdue" count={overdueTask.length} accent="var(--danger)" />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {overdueTask.map((t) => <TaskReminderCard key={t.id} task={t} isOverdue />)}
              </div>
            </section>
          )}

          {/* Upcoming standalone reminders */}
          {upcomingStandalone.length > 0 && (
            <section className="animate-fade-up" style={{ animationDelay: '40ms' }}>
              <SectionHead icon={Bell} label="My Reminders" count={upcomingStandalone.length} accent="var(--accent)" />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {upcomingStandalone.map((r) => (
                  <StandaloneReminderCard key={r.id} reminder={r} onDelete={deleteReminder} onEdit={updateReminder} />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming task reminders */}
          {upcomingTask.length > 0 && (
            <section className="animate-fade-up" style={{ animationDelay: '80ms' }}>
              <SectionHead icon={Bell} label="Task Reminders" count={upcomingTask.length} accent="var(--warning)" />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {upcomingTask.map((t) => <TaskReminderCard key={t.id} task={t} />)}
              </div>
            </section>
          )}

          {/* Past reminders (collapsed) */}
          {pastStandalone.length > 0 && (
            <section className="animate-fade-up" style={{ animationDelay: '120ms' }}>
              <SectionHead icon={Clock} label="Past" count={pastStandalone.length} accent="var(--text-muted)" />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {pastStandalone.map((r) => (
                  <StandaloneReminderCard key={r.id} reminder={r} onDelete={deleteReminder} onEdit={updateReminder} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  )
}
