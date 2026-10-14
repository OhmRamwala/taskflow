import { X, CheckSquare, StickyNote, Bell, AlertCircle } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'

const CONFIG = {
  task:     { icon: CheckSquare, accent: 'var(--accent)',   bg: 'var(--accent-light)',   label: 'Task' },
  note:     { icon: StickyNote,  accent: 'var(--warning)',         bg: 'var(--warning-light)',               label: 'Note' },
  reminder: { icon: Bell,        accent: 'var(--warning)',         bg: 'var(--warning-light)',               label: 'Reminder' },
  overdue:  { icon: AlertCircle, accent: 'var(--danger)',   bg: 'var(--danger-light)',   label: 'Overdue' },
}

function Toast({ toast, onDismiss }) {
  const cfg = CONFIG[toast.type] || CONFIG.reminder
  const Icon = cfg.icon

  return (
    <div
      className="flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)] rounded-2xl p-4 shadow-theme-lg animate-slide-left"
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid var(--border)`,
        boxShadow: 'var(--shadow-lg)',
      }}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: cfg.bg }}
      >
        <Icon size={16} style={{ color: cfg.accent }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
            style={{ background: cfg.bg, color: cfg.accent }}
          >
            {cfg.label}
          </span>
        </div>
        <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
          {toast.title}
        </p>
        {toast.body && (
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {toast.body}
          </p>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg shrink-0 transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-elevated)'
          e.currentTarget.style.color = 'var(--text-primary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--text-muted)'
        }}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>

      {/* Progress bar — animates from full to empty over 6s */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl overflow-hidden"
        style={{ background: 'var(--border)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            background: cfg.accent,
            animation: 'toast-drain 6s linear forwards',
          }}
        />
      </div>

      <style>{`
        @keyframes toast-drain {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  )
}

export default function NotificationToast() {
  const { toasts, dismiss } = useNotifications()

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  )
}
