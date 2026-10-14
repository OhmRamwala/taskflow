/**
 * Profile — Personal Information panel
 * Rendered as the index route inside ProfileLayout at /profile
 * Reads/writes localStorage key 'taskflow-profile'
 */
import { useState } from 'react'
import {
  UserCircle, Mail, Phone, MapPin, Briefcase,
  CheckCircle2, Camera, Link as LinkIcon,
} from 'lucide-react'

/* ── Field ──────────────────────────────────────────────────────── */
function Field({ label, icon: Icon, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Icon size={11} style={{ color: 'var(--accent)' }} />
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm input-theme"
      />
    </div>
  )
}

/* ── Avatar ─────────────────────────────────────────────────────── */
function Avatar({ initials, size = 72 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shadow-md shrink-0"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, #000))',
      }}
    >
      {initials
        ? <span className="font-bold" style={{ color: 'var(--accent-text)', fontSize: size * 0.33 }}>{initials}</span>
        : <UserCircle size={size * 0.55} style={{ color: 'var(--accent-text)', opacity: 0.8 }} />
      }
    </div>
  )
}

const PROFILE_KEY = 'taskflow-profile'

export default function Profile() {
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY)
      return raw ? JSON.parse(raw)
        : { name: '', email: '', phone: '', location: '', role: '', website: '', bio: '' }
    } catch {
      return { name: '', email: '', phone: '', location: '', role: '', website: '', bio: '' }
    }
  })

  const set = (k, v) => setProfile((prev) => ({ ...prev, [k]: v }))

  const handleSave = (e) => {
    e.preventDefault()
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const initials = profile.name
    ? profile.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : null

  return (
    <div className="space-y-5 animate-fade-up">

      {/* Panel heading */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Personal Information
        </h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Update your name, contact details, and bio.
        </p>
      </div>

      {/* Avatar row */}
      <div
        className="flex items-center gap-4 p-4 rounded-2xl"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
      >
        <div className="relative shrink-0">
          <Avatar initials={initials} size={64} />
          <button
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center shadow-sm transition-colors"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
            aria-label="Change avatar"
          >
            <Camera size={11} />
          </button>
        </div>
        <div className="min-w-0">
          <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
            {profile.name || 'Your Name'}
          </p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {profile.role || 'Your Role'}
          </p>
          {profile.email && (
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
              {profile.email}
            </p>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-4">

        {/* Personal card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
        >
          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Personal
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name"    icon={UserCircle} value={profile.name}  onChange={(v) => set('name', v)}  placeholder="Luan Nian" />
              <Field label="Role / Title" icon={Briefcase}  value={profile.role}  onChange={(v) => set('role', v)}  placeholder="Product Designer" />
            </div>
            <div>
              <label
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => set('bio', e.target.value)}
                placeholder="A short bio about yourself…"
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm input-theme resize-none"
              />
            </div>
          </div>
        </div>

        {/* Contact card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
        >
          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Contact
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Email"    icon={Mail}     type="email" value={profile.email}    onChange={(v) => set('email', v)}    placeholder="nian@example.com" />
              <Field label="Phone"    icon={Phone}    type="tel"   value={profile.phone}    onChange={(v) => set('phone', v)}    placeholder="+91 xxxx xxxx xx" />
              <Field label="Location" icon={MapPin}               value={profile.location} onChange={(v) => set('location', v)} placeholder="Gujarat, INDIA" />
              <Field label="Website"  icon={LinkIcon} type="url"   value={profile.website}  onChange={(v) => set('website', v)}  placeholder="https://yoursite.com" />
            </div>
          </div>
        </div>

        {/* Save row */}
        <div className="flex items-center justify-end gap-3 pt-1">
          {saved && (
            <span
              className="flex items-center gap-1.5 text-sm font-medium animate-fade-in"
              style={{ color: 'var(--success)' }}
            >
              <CheckCircle2 size={15} /> Profile saved
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-semibold rounded-xl btn-accent"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  )
}
