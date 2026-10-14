import { TrendingUp, CheckCircle2, Clock, AlertCircle, BarChart3, Tag } from 'lucide-react'
import { useTasks } from '../context/TaskContext'
import { getEffectiveStatus } from '../utils/taskHelpers'
import { IllustrationEmptyProgress } from '../components/Illustrations'

/* ── Progress ring ──────────────────────────────────────────────── */
function RingChart({ pct }) {
  const r = 52, stroke = 10
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          cx="64" cy="64" r={r} fill="none"
          stroke="var(--accent)" strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{pct}%</span>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>done</p>
      </div>
    </div>
  )
}

/* ── Thin progress bar ──────────────────────────────────────────── */
function ProgressBar({ value, max, color }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, background: color, transition: 'width 0.6s ease' }}
      />
    </div>
  )
}

/* ── Stat badge ─────────────────────────────────────────────────── */
function StatBadge({ icon: Icon, label, value, accentBg, accentColor }) {
  return (
    <div
      className="card rounded-2xl p-5 flex items-center gap-4"
      style={{ background: 'var(--bg-surface)' }}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: accentBg }}>
        <Icon size={20} style={{ color: accentColor }} />
      </div>
      <div>
        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-2xl font-bold" style={{ color: accentColor }}>{value}</p>
      </div>
    </div>
  )
}

export default function Progress() {
  const { tasks } = useTasks()

  const total     = tasks.length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const active    = tasks.filter((t) => getEffectiveStatus(t) === 'active').length
  const overdue   = tasks.filter((t) => getEffectiveStatus(t) === 'overdue').length
  const rate      = total === 0 ? 0 : Math.round((completed / total) * 100)

  // By priority
  const byPriority = ['high', 'medium', 'low'].map((p) => ({
    label: p,
    total: tasks.filter((t) => t.priority === p).length,
    done:  tasks.filter((t) => t.priority === p && t.status === 'completed').length,
    color: p === 'high' ? 'var(--danger)' : p === 'medium' ? 'var(--warning)' : 'var(--success)',
  }))

  // By category
  const catMap = {}
  tasks.forEach((t) => {
    const c = t.category || 'Uncategorized'
    if (!catMap[c]) catMap[c] = { total: 0, done: 0 }
    catMap[c].total++
    if (t.status === 'completed') catMap[c].done++
  })
  const byCategory = Object.entries(catMap).sort((a, b) => b[1].total - a[1].total)

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Progress</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Track your task completion stats.</p>
      </div>

      {total === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in"
          style={{ color: 'var(--text-muted)' }}
        >
          <IllustrationEmptyProgress width={130} />
          <div className="text-center">
            <p className="font-semibold" style={{ color: 'var(--text-secondary)' }}>No data yet</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Add tasks to see your progress.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            <StatBadge icon={TrendingUp}   label="Total"     value={total}     accentBg="var(--accent-light)"  accentColor="var(--accent)" />
            <StatBadge icon={CheckCircle2} label="Completed" value={completed} accentBg="var(--success-light)" accentColor="var(--success)" />
            <StatBadge icon={Clock}        label="Active"    value={active}    accentBg="var(--info-light)"    accentColor="var(--info)" />
            <StatBadge icon={AlertCircle}  label="Overdue"   value={overdue}   accentBg="var(--danger-light)"  accentColor="var(--danger)" />
          </div>

          {/* Ring + priority breakdown */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Completion ring */}
            <div
              className="rounded-2xl p-6 flex items-center gap-8 animate-fade-up"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
                animationDelay: '80ms',
              }}
            >
              <RingChart pct={rate} />
              <div className="space-y-3 flex-1 min-w-0">
                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Overall Completion</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {completed} of {total} tasks completed
                  </p>
                </div>
                <div className="space-y-2 pt-1">
                  <ProgressRow label="Completed" value={completed} total={total} color="var(--success)" />
                  <ProgressRow label="Active"    value={active}    total={total} color="var(--info)" />
                  {overdue > 0 && (
                    <ProgressRow label="Overdue" value={overdue}   total={total} color="var(--danger)" />
                  )}
                </div>
              </div>
            </div>

            {/* By priority */}
            <div
              className="rounded-2xl p-6 animate-fade-up"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
                animationDelay: '120ms',
              }}
            >
              <h3 className="font-semibold mb-5 flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}>
                <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
                By Priority
              </h3>
              {byPriority.every((p) => p.total === 0) ? (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tasks with priority set.</p>
              ) : (
                <div className="space-y-4">
                  {byPriority.map(({ label, total: t, done, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>
                          {label}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>{done}/{t} done</span>
                      </div>
                      <ProgressBar value={done} max={t} color={color} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* By category */}
          {byCategory.length > 0 && (
            <div
              className="rounded-2xl p-6 animate-fade-up"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
                animationDelay: '160ms',
              }}
            >
              <h3 className="font-semibold mb-5 flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}>
                <Tag size={16} style={{ color: 'var(--accent)' }} />
                By Category
              </h3>
              <div className="space-y-4">
                {byCategory.map(([cat, { total: t, done }]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cat}</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {done}/{t} · {t === 0 ? 0 : Math.round((done / t) * 100)}%
                      </span>
                    </div>
                    <ProgressBar value={done} max={t} color="var(--accent)" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ProgressRow({ label, value, total, color }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100)
  return (
    <div className="flex items-center justify-between text-xs gap-3">
      <span className="w-20 shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, transition: 'width 0.6s ease' }} />
      </div>
      <span className="w-8 text-right font-semibold shrink-0" style={{ color }}>{value}</span>
    </div>
  )
}
