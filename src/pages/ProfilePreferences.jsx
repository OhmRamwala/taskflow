/**
 * ProfilePreferences — Preferences panel
 * Rendered at /profile/preferences inside ProfileLayout
 * Reuses the exact same theme/locale/security/data controls as Settings.jsx
 */
import { useState } from 'react'
import {
  Bell, Globe, Palette, Shield, Trash2,
  CheckCircle2, Check,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useTasks } from '../context/TaskContext'

/* ── Section wrapper ────────────────────────────────────────────── */
function Section({ icon: Icon, title, children }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
    >
      <div className="flex items-center gap-2.5 px-5 py-3.5"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--accent-light)' }}>
          <Icon size={14} style={{ color: 'var(--accent)' }} />
        </div>
        <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  )
}

/* ── Toggle row ─────────────────────────────────────────────────── */
function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between px-5 py-4"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>}
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

/* ── Select row ─────────────────────────────────────────────────── */
function SelectRow({ label, description, value, options, onChange }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 gap-4"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm rounded-xl px-3 py-1.5 input-theme cursor-pointer shrink-0"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

/* ── Theme card ─────────────────────────────────────────────────── */
function ThemeCard({ theme, isActive, onSelect }) {
  const [p1, p2, p3] = theme.preview
  return (
    <button
      onClick={() => onSelect(theme.id)}
      className="relative flex flex-col gap-3 p-4 rounded-2xl text-left transition-all duration-200"
      style={{
        background: isActive ? 'var(--accent-light)' : 'var(--bg-surface)',
        border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
        boxShadow: isActive ? '0 0 0 4px color-mix(in srgb, var(--accent) 12%, transparent)' : 'var(--shadow)',
        transform: isActive ? 'scale(1.02)' : 'scale(1)',
      }}
      onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'scale(1.01)' } }}
      onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.transform = 'scale(1)' } }}
    >
      {isActive && (
        <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: 'var(--accent)' }}>
          <Check size={11} style={{ color: 'var(--accent-text)' }} />
        </span>
      )}
      <div className="flex items-center gap-1.5">
        <span className="w-7 h-7 rounded-lg shadow-sm" style={{ background: p1, border: '1px solid rgba(0,0,0,0.08)' }} />
        <span className="w-7 h-7 rounded-lg shadow-sm" style={{ background: p2, border: '1px solid rgba(0,0,0,0.08)' }} />
        <span className="w-7 h-7 rounded-lg shadow-sm" style={{ background: p3 }} />
      </div>
      <div>
        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{theme.name}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{theme.description}</p>
      </div>
    </button>
  )
}

export default function ProfilePreferences() {
  const { themeId, setThemeId, themes } = useTheme()
  const { clearTasks } = useTasks()
  const [saved, setSaved] = useState(false)
  const [cfg, setCfg] = useState({
    language:   'en',
    dateFormat: 'DD MM, YYYY',
    weekStart:  'sunday',
    twoFactor:  false,
    autoDelete: false,
  })
  const set = (k, v) => setCfg((prev) => ({ ...prev, [k]: v }))

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  return (
    <div className="space-y-5 animate-fade-up">

      {/* Panel heading */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Preferences</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Themes, locale, security, and data settings.
        </p>
      </div>

      {/* Theme */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
      >
        <div className="flex items-center gap-2.5 px-5 py-3.5"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent-light)' }}>
            <Palette size={14} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Theme</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Choose your workspace look &amp; feel</p>
          </div>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.values(themes).map((theme) => (
            <ThemeCard key={theme.id} theme={theme} isActive={themeId === theme.id} onSelect={setThemeId} />
          ))}
        </div>
      </div>

      {/* Locale */}
      <Section icon={Globe} title="Locale">
        <SelectRow label="Language" value={cfg.language}
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
          ]}
          onChange={(v) => set('language', v)}
        />
        <SelectRow label="Date Format" value={cfg.dateFormat}
          options={[
            { value: 'MMM D, YYYY', label: 'Jan 1, 2026' },
            { value: 'DD/MM/YYYY',  label: '01/01/2026' },
            { value: 'MM/DD/YYYY',  label: '01/01/2026 (US)' },
            { value: 'YYYY-MM-DD',  label: '2026-01-01' },
          ]}
          onChange={(v) => set('dateFormat', v)}
        />
        <SelectRow label="Week Starts On" value={cfg.weekStart}
          options={[
            { value: 'sunday', label: 'Sunday' },
            { value: 'monday', label: 'Monday' },
          ]}
          onChange={(v) => set('weekStart', v)}
        />
      </Section>

      {/* Security */}
      <Section icon={Shield} title="Security">
        <Toggle
          label="Two-Factor Authentication"
          description="Add an extra layer of account security"
          checked={cfg.twoFactor}
          onChange={(v) => set('twoFactor', v)}
        />
      </Section>

      {/* Data */}
      <Section icon={Trash2} title="Data">
        <Toggle
          label="Auto-delete Completed Tasks"
          description="Remove completed tasks after 30 days"
          checked={cfg.autoDelete}
          onChange={(v) => set('autoDelete', v)}
        />
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>Clear All Tasks</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Permanently delete all your tasks</p>
          </div>
          <button
            onClick={() => { if (window.confirm('Delete all tasks? This cannot be undone.')) clearTasks() }}
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl transition-colors shrink-0"
            style={{
              color: 'var(--danger)',
              background: 'var(--danger-light)',
              border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <Trash2 size={13} /> Clear
          </button>
        </div>
      </Section>

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
          Save Preferences
        </button>
      </div>
    </div>
  )
}
