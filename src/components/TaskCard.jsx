import { useState } from 'react'
import { Calendar, Clock, Tag, Trash2, Pencil, CheckCircle2, Circle, Bell } from 'lucide-react'
import { getEffectiveStatus, getRemainingTime, formatDateTime } from '../utils/taskHelpers'

function priorityConfig(priority) {
  switch (priority) {
    case 'high':   return { bg: 'var(--danger-light)',  color: 'var(--danger)',   label: 'High' }
    case 'medium': return { bg: 'var(--warning-light)', color: 'var(--warning)',  label: 'Med' }
    case 'low':    return { bg: 'var(--success-light)', color: 'var(--success)',  label: 'Low' }
    default:       return { bg: 'var(--bg-elevated)',   color: 'var(--text-muted)', label: '—' }
  }
}

export default function TaskCard({ task, onEdit, onDelete, onComplete, onUncomplete }) {
  const [justCompleted, setJustCompleted] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const status    = getEffectiveStatus(task)
  const remaining = getRemainingTime(task)
  const isDone    = status === 'completed'
  const isOverdue = status === 'overdue'
  const priority  = priorityConfig(task.priority)

  const handleComplete = () => {
    if (isDone) return
    setJustCompleted(true)
    setTimeout(() => onComplete(task.id), 320)
  }

  const handleUncomplete = () => {
    setJustCompleted(false)
    onUncomplete(task.id)
  }

  return (
    <div
      className="group relative flex flex-col gap-3.5 rounded-2xl p-5 transition-all duration-250"
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${isOverdue ? 'var(--danger)' : isDone ? 'var(--border-subtle)' : 'var(--border)'}`,
        boxShadow: 'var(--shadow)',
        opacity: isDone ? 0.72 : 1,
        transform: justCompleted ? 'scale(0.97)' : 'scale(1)',
        transition: 'box-shadow 0.2s ease, transform 0.3s ease, opacity 0.3s ease',
      }}
      onMouseEnter={(e) => {
        if (!isDone) e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow)'
      }}
    >
      {/* Overdue accent strip */}
      {isOverdue && (
        <span
          className="absolute left-0 top-4 bottom-4 w-1 rounded-full"
          style={{ background: 'var(--danger)' }}
        />
      )}

      {/* ── Top row ─────────────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        {/* Complete toggle */}
        <button
          onClick={isDone ? handleUncomplete : handleComplete}
          className={`mt-0.5 shrink-0 transition-all duration-200 ${justCompleted ? 'animate-check-pop' : ''}`}
          style={{
            color: isDone ? 'var(--success)' : 'var(--border)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = isDone ? 'var(--warning)' : 'var(--accent)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = isDone ? 'var(--success)' : 'var(--border)'
          }}
          title={isDone ? 'Mark incomplete' : 'Mark complete'}
        >
          {isDone
            ? <CheckCircle2 size={20} />
            : <Circle size={20} />
          }
        </button>

        {/* Title + description — fixed height block by default, expands on click */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-semibold leading-snug truncate"
            style={{
              color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: isDone ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </h3>
          {/* Description: 2-line clamp by default, full text when expanded.
              minHeight keeps cards aligned when collapsed. */}
          {task.description ? (
            <>
              <p
                className={`text-xs mt-1 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}
                style={{
                  color: 'var(--text-muted)',
                  minHeight: expanded ? 'auto' : '2.25rem',
                }}
              >
                {task.description}
              </p>
              {/* Show "more"/"less" toggle only when description is long enough to truncate */}
              {task.description.length > 100 && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="text-xs font-semibold mt-0.5 transition-colors"
                  style={{ color: 'var(--accent)' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  {expanded ? 'less' : 'more…'}
                </button>
              )}
            </>
          ) : (
            <p
              className="text-xs mt-1 leading-relaxed"
              style={{ color: 'var(--text-muted)', minHeight: '2.25rem' }}
            />
          )}
        </div>

        {/* Priority badge */}
        {task.priority && (
          <span
            className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full capitalize"
            style={{ background: priority.bg, color: priority.color }}
          >
            {priority.label}
          </span>
        )}
      </div>

      {/* ── Meta row ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pl-8 mt-auto">
        {task.category && (
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Tag size={11} style={{ color: 'var(--accent)' }} />
            {task.category}
          </span>
        )}
        {task.dueDate && (
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Calendar size={11} style={{ color: 'var(--info)' }} />
            {formatDateTime(task.dueDate, task.dueTime)}
          </span>
        )}
        {task.reminder && (
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--warning)' }}>
            <Bell size={11} />
            Reminder set
          </span>
        )}
      </div>

      {/* ── Bottom row ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between pl-8 gap-2">
        {/* Remaining time / done state */}
        <div>
          {remaining && !isDone && (
            <span
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: remaining === 'Overdue' ? 'var(--danger)' : 'var(--text-muted)' }}
            >
              <Clock size={11} />
              {remaining}
            </span>
          )}
          {isDone && (
            <button
              onClick={handleUncomplete}
              className="flex items-center gap-1 text-xs font-semibold transition-colors"
              style={{ color: 'var(--success)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--warning)'; e.currentTarget.title = 'Click to undo' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--success)' }}
              title="Mark incomplete"
            >
              <CheckCircle2 size={11} /> Done
            </button>
          )}
        </div>

        {/* Action buttons — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {!isDone && (
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg transition-all duration-150"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent)'
                e.currentTarget.style.background = 'var(--accent-light)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)'
                e.currentTarget.style.background = 'transparent'
              }}
              title="Edit"
            >
              <Pencil size={13} />
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg transition-all duration-150"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--danger)'
              e.currentTarget.style.background = 'var(--danger-light)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.background = 'transparent'
            }}
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
          {isDone ? (
            <button
              onClick={handleUncomplete}
              className="ml-1 px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-150"
              style={{
                background: 'var(--warning-light)',
                color: 'var(--warning)',
                border: '1px solid color-mix(in srgb, var(--warning) 30%, transparent)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Undo
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="ml-1 px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-150"
              style={{
                background: 'var(--accent)',
                color: 'var(--accent-text)',
                boxShadow: '0 2px 8px color-mix(in srgb, var(--accent) 30%, transparent)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
