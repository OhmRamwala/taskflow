/**
 * ProfileNotifications — Notifications panel
 * Rendered at /profile/notifications inside ProfileLayout
 */
import { useState } from 'react'
import { Bell, Mail, CheckCircle2 } from 'lucide-react'

/* ── Toggle row ─────────────────────────────────────────────────── */
function Toggle({ label, description, checked, onChange }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0"
        style={{ background: checked ? 'var(--accent)' : 'var(--border)' }}
        role="switch"
        aria-checked={checked}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  )
}

export default function ProfileNotifications() {
  const [saved, setSaved] = useState(false)
  const [cfg, setCfg] = useState({
    pushNotifications: true,
    emailReminders:    false,
  })
  const set = (k, v) => setCfg((prev) => ({ ...prev, [k]: v }))

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  return (
    <div className="space-y-5 animate-fade-up">

      {/* Panel heading */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Control how and when TaskFlow notifies you.
        </p>
      </div>

      {/* Push notifications card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
      >
        <div className="flex items-center gap-2.5 px-5 py-3.5"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent-light)' }}>
            <Bell size={14} style={{ color: 'var(--accent)' }} />
          </div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Push Notifications</h3>
        </div>
        <Toggle
          label="Enable Push Notifications"
          description="Get notified about task reminders and due dates."
          checked={cfg.pushNotifications}
          onChange={(v) => set('pushNotifications', v)}
        />
      </div>

      {/* Email reminders card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
      >
        <div className="flex items-center gap-2.5 px-5 py-3.5"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent-light)' }}>
            <Mail size={14} style={{ color: 'var(--accent)' }} />
          </div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Email Reminders</h3>
        </div>
        <Toggle
          label="Enable Email Reminders"
          description="Receive task reminders via email."
          checked={cfg.emailReminders}
          onChange={(v) => set('emailReminders', v)}
        />
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3 pt-1">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium animate-fade-in"
            style={{ color: 'var(--success)' }}>
            <CheckCircle2 size={15} /> Saved
          </span>
        )}
        <button
          onClick={handleSave}
          className="px-6 py-2.5 text-sm font-semibold rounded-xl btn-accent"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
        >
          Save Notifications
        </button>
      </div>
    </div>
  )
}
