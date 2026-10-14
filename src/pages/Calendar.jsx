import { useState, useRef, useEffect } from 'react'
import {
  ChevronLeft, ChevronRight, StickyNote, CheckSquare, Trash2, Pencil,
} from 'lucide-react'
import { useTasks } from '../context/TaskContext'
import { useNotes } from '../context/NoteContext'
import { getEffectiveStatus, getTodayLocalStr, dateToLocalStr } from '../utils/taskHelpers'
import { IllustrationCalendar } from '../components/Illustrations'

/* ─────────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────── */
const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

// 4 pastel item-level colors — belong to the individual task/note, never the cell
const ITEM_COLORS = [
  { id: 'pink',   label: 'Soft Pink',   hex: '#F4D5D5', text: '#8B5555' },
  { id: 'yellow', label: 'Soft Yellow', hex: '#FFE5A3', text: '#7A5C00' },
  { id: 'green',  label: 'Sage Green',  hex: '#D8E8D5', text: '#3A5A3A' },
  { id: 'blue',   label: 'Baby Blue',   hex: '#D9E8F5', text: '#2A5A7A' },
]
const getColor = (id) => ITEM_COLORS.find((c) => c.id === id) ?? null

const PRIORITIES = ['low', 'medium', 'high']
const REMINDER_OPTIONS = [
  { label: 'None',           value: '' },
  { label: '5 min before',   value: '5min' },
  { label: '15 min before',  value: '15min' },
  { label: '30 min before',  value: '30min' },
  { label: '1 hour before',  value: '1hr' },
  { label: '1 day before',   value: '1day' },
]

// Computed once per page load — today in YYYY-MM-DD (local timezone)
const todayStr = getTodayLocalStr()

function toKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

// A date is "past" only if it is strictly before today (today itself is selectable)
function isStrictlyPast(key) {
  return key < todayStr
}

/* ─────────────────────────────────────────────────────────────────
   Compact color swatch popover (sits beside the Title input)
───────────────────────────────────────────────────────────────── */
function ColorSwatch({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = getColor(value)

  useEffect(() => {
    function outside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', outside)
    return () => document.removeEventListener('mousedown', outside)
  }, [])

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Pick color"
        className="w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center"
        style={{
          background: selected ? selected.hex : 'var(--bg-muted)',
          borderColor: selected ? selected.text : 'var(--border)',
        }}
      >
        {!selected && (
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>○</span>
        )}
      </button>

      {open && (
        <div
          className="absolute top-10 right-0 z-50 p-2 rounded-xl flex gap-1.5 animate-scale-in"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* No color */}
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false) }}
            className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px]"
            style={{
              background: 'var(--bg-muted)',
              borderColor: value === '' ? 'var(--accent)' : 'var(--border)',
              color: 'var(--text-muted)',
            }}
            title="None"
          >✕</button>
          {ITEM_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => { onChange(c.id); setOpen(false) }}
              className="w-6 h-6 rounded-full border-2 transition-all"
              style={{
                background: c.hex,
                borderColor: value === c.id ? c.text : 'transparent',
                transform: value === c.id ? 'scale(1.2)' : 'scale(1)',
              }}
              title={c.label}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Task inline form
───────────────────────────────────────────────────────────────── */
function TaskInlineForm({ initialDate, initialData, onSave, onCancel }) {
  const [form, setForm] = useState(() => initialData ? {
    title:       initialData.title       || '',
    description: initialData.description || '',
    dueDate:     initialData.dueDate     || initialDate || '',
    dueTime:     initialData.dueTime     || '',
    category:    initialData.category    || '',
    priority:    initialData.priority    || 'medium',
    reminder:    initialData.reminder    || '',
    color:       initialData.color       || '',
  } : {
    title: '', description: '', dueDate: initialDate || '',
    dueTime: '', category: '', priority: 'medium', reminder: '', color: '',
  })
  const [err, setErr] = useState('')

  // Only sync date from parent when NOT editing an existing item
  useEffect(() => {
    if (!initialData) setForm((p) => ({ ...p, dueDate: initialDate || '' }))
  }, [initialDate, initialData])

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setErr('Title is required'); return }
    // Guard: form date must not be in the past
    if (form.dueDate && isStrictlyPast(form.dueDate)) {
      setErr('Cannot set a due date in the past'); return
    }
    onSave({ ...form, title: form.title.trim(), description: form.description.trim() })
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {/* Title + color swatch on same row */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={form.title}
            onChange={(e) => { set('title', e.target.value); setErr('') }}
            placeholder="Task title…"
            className="w-full px-3 py-2 rounded-xl text-sm input-theme"
            style={err && !form.title.trim() ? { borderColor: 'var(--danger)' } : {}}
            autoFocus
          />
        </div>
        <ColorSwatch value={form.color} onChange={(v) => set('color', v)} />
      </div>
      {err && <p className="text-xs -mt-1" style={{ color: 'var(--danger)' }}>{err}</p>}

      {/* Description */}
      <textarea
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
        placeholder="Description (optional)…"
        rows={2}
        className="w-full px-3 py-2 rounded-xl text-sm input-theme resize-none"
      />

      {/* Date + Time */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>
            Date
          </label>
          <input
            type="date"
            value={form.dueDate}
            min={todayStr}
            onChange={(e) => set('dueDate', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm input-theme"
          />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>
            Time
          </label>
          <input
            type="time"
            value={form.dueTime}
            onChange={(e) => set('dueTime', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm input-theme"
          />
        </div>
      </div>

      {/* Category — free-text input, no restrictions */}
      <div>
        <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>
          Category
        </label>
        <input
          type="text"
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
          placeholder="e.g. College, Meeting, Project…"
          className="w-full px-3 py-2 rounded-xl text-sm input-theme"
        />
      </div>

      {/* Priority */}
      <div>
        <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>
          Priority
        </label>
        <div className="flex gap-1.5">
          {PRIORITIES.map((p) => {
            const active = form.priority === p
            return (
              <button
                key={p}
                type="button"
                onClick={() => set('priority', p)}
                className="flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition-all"
                style={{
                  background: active
                    ? p === 'high' ? 'var(--danger)' : p === 'medium' ? 'var(--warning)' : 'var(--success)'
                    : 'var(--bg-elevated)',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${active ? 'transparent' : 'var(--border)'}`,
                }}
              >
                {p}
              </button>
            )
          })}
        </div>
      </div>

      {/* Reminder */}
      <div>
        <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>
          Reminder
        </label>
        <select
          value={form.reminder}
          onChange={(e) => set('reminder', e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm input-theme appearance-none"
        >
          {REMINDER_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 text-sm font-semibold rounded-xl btn-ghost"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-2 text-sm font-semibold rounded-xl"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          Save Task
        </button>
      </div>
    </form>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Note/Event inline form
───────────────────────────────────────────────────────────────── */
function NoteInlineForm({ initialDate, initialData, onSave, onCancel }) {
  const [form, setForm] = useState(() => initialData ? {
    title:       initialData.title       || '',
    description: initialData.description || '',
    date:        initialData.date        || initialDate || '',
    time:        initialData.time        || '',
    color:       initialData.color       || '',
  } : {
    title: '', description: '', date: initialDate || '', time: '', color: '',
  })
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!initialData) setForm((p) => ({ ...p, date: initialDate || '' }))
  }, [initialDate, initialData])

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setErr('Title is required'); return }
    if (form.date && isStrictlyPast(form.date)) {
      setErr('Cannot set a date in the past'); return
    }
    onSave({ ...form, title: form.title.trim(), description: form.description.trim() })
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {/* Title + color swatch */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={form.title}
            onChange={(e) => { set('title', e.target.value); setErr('') }}
            placeholder="Note / event title…"
            className="w-full px-3 py-2 rounded-xl text-sm input-theme"
            style={err && !form.title.trim() ? { borderColor: 'var(--danger)' } : {}}
            autoFocus
          />
        </div>
        <ColorSwatch value={form.color} onChange={(v) => set('color', v)} />
      </div>
      {err && <p className="text-xs -mt-1" style={{ color: 'var(--danger)' }}>{err}</p>}

      {/* Description */}
      <textarea
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
        placeholder="Description (optional)…"
        rows={2}
        className="w-full px-3 py-2 rounded-xl text-sm input-theme resize-none"
      />

      {/* Date + Time */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>
            Date
          </label>
          <input
            type="date"
            value={form.date}
            min={todayStr}
            onChange={(e) => set('date', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm input-theme"
          />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>
            Time
          </label>
          <input
            type="time"
            value={form.time}
            onChange={(e) => set('time', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm input-theme"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 text-sm font-semibold rounded-xl btn-ghost"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-2 text-sm font-semibold rounded-xl"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          Save Note
        </button>
      </div>
    </form>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Small item label inside a calendar cell
   Color belongs to the item only — cell background is never changed
───────────────────────────────────────────────────────────────── */
function ItemLabel({ title, colorId, isNote }) {
  const c = getColor(colorId)
  const bg   = c ? c.hex  : isNote ? 'rgba(217,119,6,0.12)' : 'rgba(0,0,0,0.07)'
  const text = c ? c.text : isNote ? '#92400e'              : 'inherit'

  return (
    <div
      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate w-full"
      style={{ background: bg, color: text }}
    >
      {isNote && <StickyNote size={8} className="shrink-0 opacity-70" />}
      <span className="truncate">{title}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────

/* -----------------------------------------------------------------
   Main Calendar
------------------------------------------------------------------ */
export default function Calendar() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks()
  const { notes, addNote, updateNote, deleteNote } = useNotes()

  const now = new Date()
  const [year, setYear]         = useState(now.getFullYear())
  const [month, setMonth]       = useState(now.getMonth())
  const [selected, setSelected] = useState(null)
  const [addMode, setAddMode]       = useState('task')
  const [addFormOpen, setAddFormOpen] = useState(true)

  // When non-null, the right-side form enters edit mode.
  // Shape: { item: object, type: 'task'|'note' } | null
  const [editTarget, setEditTarget] = useState(null)

  // Ref on the right-column panel — scrolls it into view on mobile when edit triggers
  const formPanelRef = useRef(null)

  /* ── Month navigation ──────────────────────────────────────── */
  const prevMonth = () => {
    setSelected(null); setEditTarget(null)
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    setSelected(null); setEditTarget(null)
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  /* ── Build grid ─────────────────────────────────────────────── */
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  /* ── Index data by date key ─────────────────────────────────── */
  const tasksByDate = {}
  tasks.forEach((t) => {
    if (t.dueDate) {
      if (!tasksByDate[t.dueDate]) tasksByDate[t.dueDate] = []
      tasksByDate[t.dueDate].push(t)
    }
  })
  const notesByDate = {}
  notes.forEach((n) => {
    if (!notesByDate[n.date]) notesByDate[n.date] = []
    notesByDate[n.date].push(n)
  })

  /* ── Derived selected state ─────────────────────────────────── */
  const selectedKey   = selected ? toKey(year, month, selected) : ''
  const selectedTasks = selectedKey ? (tasksByDate[selectedKey] || []) : []
  const selectedNotes = selectedKey ? (notesByDate[selectedKey] || []) : []

  /* ── Day click ──────────────────────────────────────────────── */
  const handleDayClick = (day) => {
    if (!day) return
    const key = toKey(year, month, day)
    if (isStrictlyPast(key)) return
    setEditTarget(null)
    setSelected(selected === day ? null : day)
  }

  /* ── Edit trigger — called from Selected Date Details ──────── */
  const handleEditItem = (item, type) => {
    setAddMode(type)
    setAddFormOpen(true)
    setEditTarget({ item, type })
    setTimeout(() => {
      formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }

  /* ── Save handlers ──────────────────────────────────────────── */
  const handleSaveTask = (data) => {
    if (editTarget && editTarget.type === 'task') {
      updateTask(editTarget.item.id, data)
      setEditTarget(null)
    } else {
      const dueDate = data.dueDate || selectedKey
      addTask({ ...data, dueDate, status: 'active' })
    }
    setAddFormOpen(false)
  }

  const handleSaveNote = (data) => {
    if (editTarget && editTarget.type === 'note') {
      updateNote(editTarget.item.id, data)
      setEditTarget(null)
    } else {
      const date = data.date || selectedKey
      addNote({ ...data, date })
    }
    setAddFormOpen(false)
  }

  const handleCancelForm = () => {
    setEditTarget(null)
    setAddFormOpen(false)
  }

  const selectedDateLabel = selected ? `${MONTHS[month]} ${selected}, ${year}` : null
  const isEditing = editTarget !== null

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="animate-fade-up flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Calendar</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Select a date to attach your task or note, or fill in the date manually.
          </p>
        </div>
        <div className="hidden sm:block opacity-80 pointer-events-none shrink-0">
          <IllustrationCalendar width={84} />
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 items-start">

        {/* ── LEFT: Calendar grid + selected date details (3/5) ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Calendar grid card */}
          <div className="rounded-2xl overflow-hidden animate-fade-up"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>

            {/* Month nav */}
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <button onClick={prevMonth} className="p-2 rounded-xl btn-ghost">
                <ChevronLeft size={17} style={{ color: 'var(--text-secondary)' }} />
              </button>
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {MONTHS[month]} {year}
              </h2>
              <button onClick={nextMonth} className="p-2 rounded-xl btn-ghost">
                <ChevronRight size={17} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {DAYS.map((d) => (
                <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)' }}>{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {cells.map((day, idx) => {
                const key      = day ? toKey(year, month, day) : ''
                const isToday  = key === todayStr
                const isSel    = day !== null && day === selected
                const past     = day ? isStrictlyPast(key) : false
                const dayTasks = day ? (tasksByDate[key] || []) : []
                const dayNotes = day ? (notesByDate[key] || []) : []
                const total    = dayTasks.length + dayNotes.length
                return (
                  <div key={idx}
                    onClick={() => day && !past && handleDayClick(day)}
                    className="relative flex flex-col transition-colors duration-150"
                    style={{
                      minHeight: '72px',
                      borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--border-subtle)' : 'none',
                      borderBottom: '1px solid var(--border-subtle)',
                      background: !day ? 'var(--bg-muted)' : 'transparent',
                      boxShadow: isSel ? 'inset 0 0 0 2px var(--accent)' : 'none',
                      cursor: day && !past ? 'pointer' : 'default',
                      pointerEvents: day && !past ? 'auto' : 'none',
                      opacity: past ? 0.45 : 1,
                    }}
                    onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = 'var(--bg-elevated)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = !day ? 'var(--bg-muted)' : 'transparent' }}
                  >
                    {day && (
                      <div className="p-1.5 flex flex-col gap-0.5 h-full">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold self-start"
                          style={{
                            background: isToday ? 'var(--accent)' : 'transparent',
                            color: isToday ? 'var(--accent-text)' : past ? 'var(--text-muted)' : 'var(--text-primary)',
                          }}>{day}</span>
                        {dayTasks.slice(0, 2).map((t) => (
                          <ItemLabel key={t.id} title={t.title} colorId={t.color} isNote={false} />
                        ))}
                        {dayNotes
                          .slice(0, Math.max(0, 2 - Math.min(dayTasks.length, 2)))
                          .map((n) => <ItemLabel key={n.id} title={n.title} colorId={n.color} isNote />)}
                        {total > 2 && (
                          <span className="text-[9px] font-semibold px-1" style={{ color: 'var(--text-muted)' }}>
                            +{total - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          {/* End calendar grid card */}

          {/* Selected date details — read-only list, no inline edit forms */}
          {selected && (
            <div className="rounded-2xl overflow-hidden animate-fade-up"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>

              <div className="px-5 py-3 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {selectedDateLabel}
                </p>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {selectedTasks.length + selectedNotes.length} item{selectedTasks.length + selectedNotes.length !== 1 ? 's' : ''}
                </span>
              </div>

              {selectedTasks.length + selectedNotes.length === 0 ? (
                <p className="px-5 py-4 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                  Nothing added yet
                </p>
              ) : (
                <ul>
                  {selectedTasks.map((task) => {
                    const status = getEffectiveStatus(task)
                    const c = getColor(task.color)
                    const isActiveEdit = editTarget?.item?.id === task.id
                    return (
                      <li key={task.id} className="group"
                        style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <div className="flex items-start gap-3 px-5 py-3 transition-colors"
                          style={{ background: isActiveEdit ? 'var(--accent-light)' : 'transparent' }}>
                          <span className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                            style={{ background: c ? c.hex : status === 'completed' ? '#34d399' : status === 'overdue' ? '#f87171' : 'var(--accent)' }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium" style={{
                              color: status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)',
                              textDecoration: status === 'completed' ? 'line-through' : 'none',
                            }}>{task.title}</p>
                            <div className="flex flex-wrap items-center gap-x-2 mt-0.5">
                              {task.dueTime && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{task.dueTime}</span>}
                              {task.priority && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize" style={{
                                  background: task.priority === 'high' ? '#fee2e2' : task.priority === 'medium' ? '#fef3c7' : '#d1fae5',
                                  color:      task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#059669',
                                }}>{task.priority}</span>
                              )}
                              {task.category && <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{task.category}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                            <button onClick={() => handleEditItem(task, 'task')}
                              className="p-1 rounded-lg" title="Edit task"
                              style={{ color: isActiveEdit ? 'var(--accent)' : 'var(--text-muted)' }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)' }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = isActiveEdit ? 'var(--accent)' : 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}>
                              <Pencil size={12} />
                            </button>
                            <button onClick={() => { deleteTask(task.id); if (editTarget?.item?.id === task.id) setEditTarget(null) }}
                              className="p-1 rounded-lg" title="Delete task"
                              style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-light)' }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </li>
                    )
                  })}

                  {selectedNotes.map((note) => {
                    const c = getColor(note.color)
                    const isActiveEdit = editTarget?.item?.id === note.id
                    return (
                      <li key={note.id} className="group"
                        style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <div className="flex items-start gap-3 px-5 py-3 transition-colors"
                          style={{ background: isActiveEdit ? 'var(--accent-light)' : 'transparent' }}>
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: c ? c.hex : '#fef3c7' }}>
                            <StickyNote size={11} style={{ color: c ? c.text : '#d97706' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{note.title}</p>
                            {note.description && (
                              <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{note.description}</p>
                            )}
                            {note.time && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{note.time}</span>}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                            <button onClick={() => handleEditItem(note, 'note')}
                              className="p-1 rounded-lg" title="Edit note"
                              style={{ color: isActiveEdit ? 'var(--accent)' : 'var(--text-muted)' }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)' }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = isActiveEdit ? 'var(--accent)' : 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}>
                              <Pencil size={12} />
                            </button>
                            <button onClick={() => { deleteNote(note.id); if (editTarget?.item?.id === note.id) setEditTarget(null) }}
                              className="p-1 rounded-lg" title="Delete note"
                              style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-light)' }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
        {/* End left column */}

        {/* ── RIGHT: Add / Edit form (2/5) ─────────────────────── */}
        <div className="lg:col-span-2 space-y-4" ref={formPanelRef}>
          <div className="rounded-2xl overflow-hidden animate-fade-up"
            style={{
              background: 'var(--bg-surface)',
              border: `1px solid ${isEditing ? 'var(--accent)' : 'var(--border)'}`,
              boxShadow: isEditing ? 'var(--shadow-md)' : 'var(--shadow)',
              animationDelay: '60ms',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}>

            {/* Header */}
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {isEditing ? (
                <>
                  <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                    Editing {editTarget.type === 'task' ? 'Task' : 'Note/Event'}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                    {editTarget.item.title}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selectedDateLabel ? `Add to ${selectedDateLabel}` : 'Add Task or Note'}
                  </p>
                  {selectedDateLabel && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Date pre-filled — you can change it below
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Task / Note toggle — locked to item type when editing */}
            <div className="px-5 pt-4 pb-0">
              <div className="flex rounded-xl p-1 gap-1" style={{ background: 'var(--bg-elevated)' }}>
                {[
                  { id: 'task', label: 'Task',       icon: CheckSquare },
                  { id: 'note', label: 'Note/Event', icon: StickyNote  },
                ].map(({ id, label, icon: Icon }) => {
                  const active = addMode === id
                  return (
                    <button key={id} type="button"
                      onClick={() => { if (!isEditing) { setAddMode(id); setAddFormOpen(true) } }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: active ? 'var(--bg-surface)' : 'transparent',
                        color: active ? 'var(--accent)' : 'var(--text-secondary)',
                        boxShadow: active ? 'var(--shadow)' : 'none',
                        cursor: isEditing && !active ? 'not-allowed' : 'pointer',
                        opacity: isEditing && !active ? 0.4 : 1,
                      }}>
                      <Icon size={13} />
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Form — keyed so it re-mounts with fresh state when edit target changes */}
            <div className="px-5 py-4">
              {addFormOpen ? (
                addMode === 'task' ? (
                  <TaskInlineForm
                    key={isEditing ? `edit-task-${editTarget.item.id}` : `add-task-${selectedKey}`}
                    initialDate={selectedKey}
                    initialData={isEditing ? editTarget.item : null}
                    onSave={handleSaveTask}
                    onCancel={handleCancelForm}
                  />
                ) : (
                  <NoteInlineForm
                    key={isEditing ? `edit-note-${editTarget.item.id}` : `add-note-${selectedKey}`}
                    initialDate={selectedKey}
                    initialData={isEditing ? editTarget.item : null}
                    onSave={handleSaveNote}
                    onCancel={handleCancelForm}
                  />
                )
              ) : (
                <button type="button" onClick={() => setAddFormOpen(true)}
                  className="w-full py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                  + Add {addMode === 'task' ? 'Task' : 'Note/Event'}
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
