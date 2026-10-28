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
  const [expanded, setExpanded]           = useState(false)
  const status    = getEffectiveStatus(task)
  const remaining = getRemainingTime(task)
  const isDone    = status === 'completed'
  const isOverdue = status === 'overdue'
  const priority  = priorityConfig(task.priority)

  const hasLongDesc  = (task.description || '').length > 100
  const hasDesc      = Boolean(task.description)

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
    /* h-full lets the card stretch to fill the grid cell height set by its tallest sibling */
    <div
      className="group relative flex flex-col h-full rounded-2xl p-5 transition-all duration-250"
      style={{
        background:  'var(--bg-surface)',
        border:      `1px solid ${isOverdue ? 'var(--danger)' : isDone ? 'var(--border-subtle)' : 'var(--border)'}`,
        boxShadow:   'var(--shadow)',
        opacity:     isDone ? 0.72 : 1,
        transform:   justCompleted ? 'scale(0.97)' : 'scale(1)',
        transition:  'box-shadow 0.2s ease, transform 0.3s ease, opacity 0.3s ease',
      }}
      onMouseEnter={(e) => { if (!isDone) e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
      onMouseLeave={(e) => {              e.currentTarget.style.boxShadow = 'var(--shadow)'    }}
    >
      {/* Overdue accent strip */}
      {isOverdue && (
        <span
          className="absolute left-0 top-4 bottom-4 w-1 rounded-full"
          style={{ background: 'var(--danger)' }}
        />
      )}

      {/* ── TOP SECTION: checkbox · title · description · priority ─ */}
      {/*   flex-1 makes this section absorb all spare vertical space  */}
      {/*   so meta + bottom rows are always pushed to the same spot   */}
      <div className="flex items-start gap-3 flex-1">

        {/* Complete toggle */}
        <button
          onClick={isDone ? handleUncomplete : handleComplete}
          className={`mt-0.5 shrink-0 transition-all duration-200 ${justCompleted ? 'animate-check-pop' : ''}`}
          style={{ color: isDone ? 'var(--success)' : 'var(--border)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = isDone ? 'var(--warning)' : 'var(--accent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = isDone ? 'var(--success)' : 'var(--border)' }}
          title={isDone ? 'Mark incomplete' : 'Mark complete'}
        >
          {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>

        {/* Title + description block */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Title — single line with truncate */}
          <h3
            className="text-sm font-semibold leading-snug truncate"
            style={{
              color:          isDone ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: isDone ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </h3>

          {/*
           * Description area — always occupies exactly the same vertical space:
           *   • 2-line clamp block: fixed height of 2 × line-height (1.5rem/line → 3rem)
           *   • "more…/less" toggle: fixed 1.25rem (text-xs line-height) always present
           *     but invisible/non-interactive when there's nothing to expand
           *
           * This means every card has the same description+toggle block height,
           * regardless of whether a description exists or how long it is.
           *)
          */}
          <div className="mt-1 flex-1">
            {/* Fixed-height 2-line description block */}
            <p
              className={`text-xs leading-6 ${expanded ? '' : 'line-clamp-2'}`}
              style={{
                color:     'var(--text-muted)',
                /* When collapsed, lock to exactly 2 lines (line-height 1.5rem × 2) */
                minHeight: expanded ? 'auto' : '3rem',
                maxHeight: expanded ? 'none' : '3rem',
                overflow:  expanded ? 'visible' : 'hidden',
              }}
            >
              {hasDesc ? task.description : ''}
            </p>

            {/* Toggle row — always rendered, invisible when not needed */}
            <div style={{ height: '1.25rem', display: 'flex', alignItems: 'center' }}>
              {hasLongDesc && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="text-xs font-semibold transition-opacity"
                  style={{ color: 'var(--accent)', lineHeight: 1 }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  {expanded ? 'less' : 'more…'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Priority badge — shrink-0 so it never wraps */}
        {task.priority && (
          <span
            className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full capitalize"
            style={{ background: priority.bg, color: priority.color }}
          >
            {priority.label}
          </span>
        )}
      </div>

      {/* ── META ROW ────────────────────────────────────────────── */}
      {/*   Fixed 1-line height. Items are nowrap; each truncates if  */}
      {/*   the card is narrow. pl-8 aligns under the title text.     */}
      <div
        className="flex items-center gap-x-3 pl-8 mt-3"
        style={{ minHeight: '1.25rem', flexWrap: 'nowrap', overflow: 'hidden' }}
      >
        {task.category && (
          <span
            className="flex items-center gap-1 text-xs shrink-0 truncate"
            style={{ color: 'var(--text-secondary)', maxWidth: '8rem' }}
          >
            <Tag size={11} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span className="truncate">{task.category}</span>
          </span>
        )}
        {task.dueDate && (
          <span
            className="flex items-center gap-1 text-xs shrink-0 truncate"
            style={{ color: 'var(--text-secondary)', maxWidth: '10rem' }}
          >
            <Calendar size={11} style={{ color: 'var(--info)', flexShrink: 0 }} />
            <span className="truncate">{formatDateTime(task.dueDate, task.dueTime)}</span>
          </span>
        )}
        {task.reminder && (
          <span
            className="flex items-center gap-1 text-xs font-medium shrink-0"
            style={{ color: 'var(--warning)' }}
          >
            <Bell size={11} />
            Reminder
          </span>
        )}
      </div>

      {/* ── BOTTOM ROW ──────────────────────────────────────────── */}
      {/*   Always present at the bottom, same height on every card.  */}
      <div className="flex items-center justify-between pl-8 mt-3 gap-2">

        {/* Remaining time / done state */}
        <div style={{ minHeight: '1.5rem', display: 'flex', alignItems: 'center' }}>
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
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--warning)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--success)' }}
              title="Mark incomplete"
            >
              <CheckCircle2 size={11} /> Done
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {!isDone && (
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg transition-all duration-150"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
              title="Edit"
            >
              <Pencil size={13} />
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg transition-all duration-150"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-light)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
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
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Undo
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="ml-1 px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-150"
              style={{
                background:  'var(--accent)',
                color:       'var(--accent-text)',
                boxShadow:   '0 2px 8px color-mix(in srgb, var(--accent) 30%, transparent)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
