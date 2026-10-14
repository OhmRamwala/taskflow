import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckSquare, CheckCircle2, Bell, TrendingUp, ArrowRight,
  CalendarDays, Sparkles, StickyNote, X, Trash2, Plus,
  Clock, Tag,
} from 'lucide-react'
import { useTasks } from '../context/TaskContext'
import { useNotes } from '../context/NoteContext'
import { getEffectiveStatus, formatDateTime, getTodayLocalStr, dateToLocalStr } from '../utils/taskHelpers'
import { IllustrationStars, IllustrationPlant, IllustrationLaptop } from '../components/Illustrations'

/* ── Pastel palette ──────────────────────────────────────────────── */
const PASTEL_COLORS = [
  { id: 'pink',       label: 'Soft Pink',       hex: '#F4D5D5' },
  { id: 'peach',      label: 'Peach',           hex: '#FFE4C7' },
  { id: 'yellow',     label: 'Soft Yellow',     hex: '#FFE5A3' },
  { id: 'green',      label: 'Sage Green',      hex: '#D8E8D5' },
  { id: 'blue',       label: 'Baby Blue',       hex: '#D9E8F5' },
  { id: 'periwinkle', label: 'Soft Periwinkle', hex: '#D5D9F5' },
  { id: 'lavender',   label: 'Soft Lavender',   hex: '#E3D5F5' },
  { id: 'gray',       label: 'Soft Gray',       hex: '#E5E7EB' },
]
const getPastelHex = (id) => PASTEL_COLORS.find((c) => c.id === id)?.hex ?? null
const todayDate    = getTodayLocalStr()

/* ── Greeting + quote ───────────────────────────────────────────── */
function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

const QUOTES = [
  'Small steps every day lead to big results.',
  'Progress is the sum of small wins.',
  'Every task completed is a step forward.',
  'Focus on what matters. Let the rest wait.',
  'Done is better than perfect.',
  'One thing at a time, done well.',
  'Your future self will thank you.',
  'Consistency beats intensity.',
]
const dailyQuote = QUOTES[new Date().getDay() % QUOTES.length]

function getProfileName() {
  try {
    const raw = localStorage.getItem('taskflow-profile')
    if (!raw) return ''
    const p = JSON.parse(raw)
    return (p.name || '').trim().split(' ')[0]
  } catch {
    return ''
  }
}

/* ── Progress ring ───────────────────────────────────────────────── */
function ProgressRing({ pct, size = 96, stroke = 10 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--border)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--accent)" strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.7s ease' }} />
      </svg>
      <div className="absolute text-center">
        <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{pct}%</span>
      </div>
    </div>
  )
}

/* ── Summary card ────────────────────────────────────────────────── */
function SummaryCard({ icon: Icon, label, value, accent, delay = 0 }) {
  return (
    <div
      className="card rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: accent + '18' }}>
        <Icon size={18} style={{ color: accent }} />
      </div>
      <div className="text-center sm:text-left min-w-0">
        <p className="text-[10px] sm:text-xs font-medium leading-tight" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-xl sm:text-3xl font-bold leading-none mt-0.5" style={{ color: 'var(--text-primary)' }}>
          {value}
        </p>
      </div>
    </div>
  )
}

/* ── Priority dot ────────────────────────────────────────────────── */
function PriorityDot({ priority }) {
  const c = priority === 'high' ? 'var(--danger)' : priority === 'medium' ? 'var(--warning)' : 'var(--success)'
  return <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c }} />
}

/* ── Mini color picker ────────────────────────────────────────────── */
function MiniColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={() => onChange('')}
        className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
        style={{
          background: 'var(--bg-surface)',
          borderColor: value === '' ? 'var(--accent)' : 'var(--border)',
        }}
        title="No color"
      >
        <X size={9} style={{ color: 'var(--text-muted)' }} />
      </button>
      {PASTEL_COLORS.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onChange(c.id)}
          className="w-6 h-6 rounded-full border-2 transition-all"
          style={{
            background: c.hex,
            borderColor: value === c.id ? '#555' : 'transparent',
            transform: value === c.id ? 'scale(1.2)' : 'scale(1)',
          }}
          title={c.label}
        />
      ))}
    </div>
  )
}

/* ── 7-day calendar preview with expandable details ─────────────── */
function WeekPreview({ tasks, notes }) {
  const [selectedKey, setSelectedKey] = useState(null)

  const days = []
  const now = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    const key = dateToLocalStr(d)
    const dayTasks = tasks.filter((t) => t.dueDate === key)
    const dayNotes = notes.filter((n) => n.date === key)
    days.push({
      key,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1),
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      isToday: i === 0,
      count: dayTasks.length + dayNotes.length,
      hasItems: dayTasks.length + dayNotes.length > 0,
    })
  }

  // Real data for the selected date
  const selTasks = selectedKey ? tasks.filter((t) => t.dueDate === selectedKey) : []
  const selNotes = selectedKey ? notes.filter((n) => n.date === selectedKey) : []
  const selTotal = selTasks.length + selNotes.length
  const selLabel = days.find((d) => d.key === selectedKey)?.dayLabel || ''

  return (
    <div>
      {/* 7-day strip — each day is clickable */}
      <div className="flex justify-between gap-1.5">
        {days.map((d) => {
          const isSelected = d.key === selectedKey
          return (
            <button
              key={d.key}
              onClick={() => setSelectedKey(isSelected ? null : d.key)}
              className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all duration-200"
              style={{
                background: isSelected ? 'var(--accent-light)' : d.isToday ? 'var(--bg-elevated)' : 'transparent',
                minWidth: '40px',
                transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                boxShadow: isSelected ? 'var(--shadow)' : 'none',
                cursor: 'pointer',
              }}
            >
              <span
                className="text-[10px] font-bold uppercase"
                style={{ color: isSelected || d.isToday ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                {d.dayName}
              </span>
              <span
                className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all"
                style={{
                  background: d.isToday && !isSelected ? 'var(--accent)' : 'transparent',
                  color: d.isToday && !isSelected ? 'var(--accent-text)' : isSelected ? 'var(--accent)' : 'var(--text-primary)',
                }}
              >
                {d.dayNum}
              </span>
              {/* Item indicator dot */}
              <div className="flex gap-0.5 h-1.5">
                {d.hasItems && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: isSelected || d.isToday ? 'var(--accent)' : 'var(--text-muted)' }}
                  />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Expanded details for the selected date */}
      {selectedKey && (
        <div
          className="mt-4 pt-4 animate-fade-up"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            {selLabel}
          </p>

          {selTotal === 0 ? (
            <div className="flex flex-col items-center justify-center py-5 gap-2">
              <CalendarDays size={20} style={{ color: 'var(--border)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tasks or events</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {/* Tasks */}
              {selTasks.map((task) => {
                const status = getEffectiveStatus(task)
                const isDone = status === 'completed'
                return (
                  <li key={task.id}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl"
                    style={{ background: 'var(--bg-muted)' }}
                  >
                    <CheckCircle2 size={14}
                      className="mt-0.5 shrink-0"
                      style={{ color: isDone ? 'var(--success)' : 'var(--border)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate"
                        style={{
                          color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}>
                        {task.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1">
                        {task.dueTime && (
                          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            <Clock size={9} /> {task.dueTime}
                          </span>
                        )}
                        {task.priority && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold capitalize"
                            style={{ color: task.priority === 'high' ? 'var(--danger)' : task.priority === 'medium' ? 'var(--warning)' : 'var(--success)' }}>
                            <PriorityDot priority={task.priority} /> {task.priority}
                          </span>
                        )}
                        {task.category && (
                          <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            <Tag size={9} /> {task.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}

              {/* Notes / Events */}
              {selNotes.map((note) => {
                const hex = note.color ? getPastelHex(note.color) : null
                return (
                  <li key={note.id}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl"
                    style={{ background: hex ? hex + '40' : 'var(--bg-muted)' }}
                  >
                    <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: hex || 'var(--warning-light)' }}>
                      <StickyNote size={10} style={{ color: 'var(--warning)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {note.title}
                      </p>
                      {note.time && (
                        <span className="flex items-center gap-1 text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          <Clock size={9} /> {note.time}
                        </span>
                      )}
                      {note.description && (
                        <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                          {note.description}
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Quick Note card ─────────────────────────────────────────────── */
function QuickNoteCard() {
  const { notes, addNote, deleteNote } = useNotes()
  const [open, setOpen]   = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate]   = useState(todayDate)
  const [color, setColor] = useState('')
  const [error, setError] = useState('')

  const upcomingNotes = notes
    .filter((n) => n.date >= todayDate)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)

  const handleSave = (e) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    addNote({ title: title.trim(), date, color, description: '' })
    setTitle(''); setDate(todayDate); setColor(''); setError(''); setOpen(false)
  }

  const formatNoteDate = (d) => {
    if (d === todayDate) return 'Today'
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="card rounded-2xl overflow-hidden animate-fade-up">
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <StickyNote size={15} style={{ color: 'var(--warning)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Note</span>
        </div>
        <button
          onClick={() => { setOpen((v) => !v); setError('') }}
          className="flex items-center gap-1 text-xs font-semibold transition-colors rounded-lg px-2 py-1"
          style={{ color: open ? 'var(--danger)' : 'var(--accent)' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          {open ? <><X size={11} /> Cancel</> : <><Plus size={11} /> Add</>}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSave} className="px-5 py-4 space-y-3 animate-fade-up" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError('') }}
            placeholder="Note title…"
            className="w-full px-3 py-2 rounded-xl text-sm input-theme"
            style={error ? { borderColor: 'var(--danger)' } : {}}
            autoFocus
          />
          {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>Date</label>
            <input type="date" value={date} min={todayDate} onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm input-theme" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Day color</label>
            <MiniColorPicker value={color} onChange={setColor} />
          </div>
          <button type="submit"
            className="w-full py-2 text-sm font-semibold rounded-xl btn-accent"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
            Save Note
          </button>
        </form>
      )}

      {upcomingNotes.length === 0 && !open ? (
        <div className="px-5 py-5 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No upcoming notes</p>
        </div>
      ) : (
        <ul>
          {upcomingNotes.map((note, i) => {
            const hex = note.color ? getPastelHex(note.color) : null
            return (
              <li key={note.id}
                className="flex items-center gap-3 px-5 py-3 group transition-colors"
                style={{
                  borderBottom: i < upcomingNotes.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  background: hex ? hex + '55' : 'transparent',
                }}
                onMouseEnter={(e) => { if (!hex) e.currentTarget.style.background = 'var(--bg-muted)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = hex ? hex + '55' : 'transparent' }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: hex || 'var(--warning-light)' }}>
                  <StickyNote size={13} style={{ color: 'var(--warning)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{note.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatNoteDate(note.date)}</p>
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-150 shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-light)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
                  title="Delete note"
                >
                  <Trash2 size={12} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/* ── Dashboard ──────────────────────────────────────────────────── */
export default function Dashboard() {
  const { tasks } = useTasks()
  const { notes } = useNotes()
  const today      = todayDate
  const todayTasks = tasks.filter((t) => t.dueDate === today)
  const active     = tasks.filter((t) => getEffectiveStatus(t) === 'active')
  const completed   = tasks.filter((t) => t.status === 'completed')
  const reminders   = tasks.filter((t) => t.reminder && t.status !== 'completed')
  const rate        = tasks.length === 0 ? 0 : Math.round((completed.length / tasks.length) * 100)

  const firstName  = getProfileName()
  const greetName  = firstName || 'there'

  return (
    <div className="space-y-6">

      {/* ── 1. HEADER ────────────────────────────────────────────── */}
      <div className="animate-fade-up relative overflow-hidden">
        {/* Decorative laptop illustration — top-right corner */}
        <div className="absolute right-0 top-0 pointer-events-none opacity-80 hidden sm:block">
          <IllustrationLaptop width={120} />
        </div>
        <div className="relative z-10 pr-0 sm:pr-36">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={15} style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
            {greeting()}, {greetName}! 👋
          </h1>
          <p className="mt-0.5 text-xs italic" style={{ color: 'var(--text-muted)' }}>
            "{dailyQuote}"
          </p>
        </div>
      </div>

      {/* ── 2. SUMMARY ROW ───────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 stagger-children">
        <SummaryCard icon={CheckSquare}   label="Total Tasks"      value={tasks.length}     accent="var(--accent)"  delay={0} />
        <SummaryCard icon={CheckCircle2}  label="Completed Tasks"   value={completed.length} accent="var(--success)" delay={60} />
        <SummaryCard icon={Bell}          label="Active Reminders"  value={reminders.length} accent="var(--warning)" delay={120} />
      </div>

      {/* ── 3. MAIN ROW: Task Progress (left, larger) + Today's Tasks (right) */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Task Progress — spans 2 cols */}
        <div className="lg:col-span-2 card rounded-2xl p-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent-light)' }}>
                <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
              </div>
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Task Progress</h2>
            </div>
            <div className="flex items-center gap-2">
              <IllustrationStars width={44} />
              <Link to="/progress"
                className="text-xs font-semibold flex items-center gap-1 transition-colors"
                style={{ color: 'var(--accent)' }}>
                Details <ArrowRight size={11} />
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <ProgressRing pct={rate} size={96} stroke={10} />
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex justify-between items-center text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>Completion rate</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{rate}%</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full"
                  style={{ width: `${rate}%`, background: 'var(--accent)', transition: 'width 0.6s ease' }} />
              </div>
              <div className="flex justify-between text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
                <span><span className="font-semibold" style={{ color: 'var(--success)' }}>{completed.length}</span> completed</span>
                <span><span className="font-semibold" style={{ color: 'var(--info)' }}>{active.length}</span> active / remaining</span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="card rounded-2xl overflow-hidden animate-fade-up" style={{ animationDelay: '140ms' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent-light)' }}>
                <CheckSquare size={15} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Today's Tasks</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{todayTasks.length} scheduled</p>
              </div>
            </div>
            <Link to="/tasks"
              className="text-xs font-semibold flex items-center gap-1 transition-colors"
              style={{ color: 'var(--accent)' }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {todayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <IllustrationPlant width={56} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tasks due today 🎉</p>
            </div>
          ) : (
            <ul>
              {todayTasks.slice(0, 5).map((task, i) => {
                const status = getEffectiveStatus(task)
                const isDone = status === 'completed'
                return (
                  <li key={task.id}
                    className="flex items-center gap-2.5 px-5 py-3 transition-colors"
                    style={{ borderBottom: i < Math.min(todayTasks.length, 5) - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-muted)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <CheckCircle2 size={15}
                      style={{ color: isDone ? 'var(--success)' : 'var(--border)', shrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate"
                        style={{
                          color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.priority && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold capitalize"
                            style={{ color: task.priority === 'high' ? 'var(--danger)' : task.priority === 'medium' ? 'var(--warning)' : 'var(--success)' }}>
                            <PriorityDot priority={task.priority} /> {task.priority}
                          </span>
                        )}
                        {task.category && (
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{task.category}</span>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── 4. SECOND ROW: Upcoming/Calendar + Active Reminders ───── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Upcoming / Calendar */}
        <div className="card rounded-2xl p-5 animate-fade-up" style={{ animationDelay: '180ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent-light)' }}>
                <CalendarDays size={15} style={{ color: 'var(--accent)' }} />
              </div>
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Upcoming</h2>
            </div>
            <Link to="/calendar"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all btn-ghost"
              title="Open Calendar">
              <CalendarDays size={15} style={{ color: 'var(--text-secondary)' }} />
            </Link>
          </div>
          <WeekPreview tasks={tasks} notes={notes} />
        </div>

        {/* Active Reminders */}
        <div className="card rounded-2xl overflow-hidden animate-fade-up" style={{ animationDelay: '220ms' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--warning-light)' }}>
                <Bell size={15} style={{ color: 'var(--warning)' }} />
              </div>
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Active Reminders</h2>
            </div>
            <Link to="/reminders"
              className="text-xs font-semibold flex items-center gap-1 transition-colors"
              style={{ color: 'var(--accent)' }}>
              All <ArrowRight size={11} />
            </Link>
          </div>
          {reminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Bell size={22} style={{ color: 'var(--border)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No active reminders</p>
            </div>
          ) : (
            <ul>
              {reminders.slice(0, 4).map((task, i) => {
                const REMINDER_LABELS = {
                  '5min': '5 min before', '15min': '15 min before',
                  '30min': '30 min before', '1hr': '1 hour before', '1day': '1 day before',
                }
                return (
                  <li key={task.id}
                    className="flex items-center gap-3 px-5 py-3 transition-colors"
                    style={{ borderBottom: i < Math.min(reminders.length, 4) - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-muted)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'var(--warning-light)' }}>
                      <Bell size={12} style={{ color: 'var(--warning)' }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {task.dueDate ? formatDateTime(task.dueDate, task.dueTime) : 'No due date'}
                        {task.reminder && REMINDER_LABELS[task.reminder] && (
                          <span className="ml-1.5 font-medium" style={{ color: 'var(--warning)' }}>
                            · {REMINDER_LABELS[task.reminder]}
                          </span>
                        )}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ── Quick Note (existing feature kept) ───────────────────── */}
      <QuickNoteCard />
    </div>
  )
}
