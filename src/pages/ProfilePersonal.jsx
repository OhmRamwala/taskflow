import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  UserCircle, Mail, Phone, MapPin, Briefcase,
  CheckCircle2, Link as LinkIcon, ChevronLeft, Camera, Upload, X,
} from 'lucide-react'
import { useProfilePhoto } from '../hooks/useProfilePhoto'

/* ── Avatar ─────────────────────────────────────────────────────── */
function Avatar({ initials, photo, size = 72 }) {
  if (photo) {
    return (
      <div
        className="rounded-full overflow-hidden shadow-md shrink-0"
        style={{ width: size, height: size }}
      >
        <img
          src={photo}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

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

/* ── Field input ────────────────────────────────────────────────── */
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

const PROFILE_KEY = 'taskflow-profile'

export default function ProfilePersonal() {
  const fileInputRef = useRef(null)
  const { getPhoto, uploadPhoto, removePhoto, error, isUploading, clearError } = useProfilePhoto()

  const [saved, setSaved] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(getPhoto())
  const [showPhotoActions, setShowPhotoActions] = useState(false)

  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY)
      return raw
        ? JSON.parse(raw)
        : { name: '', email: '', phone: '', location: '', role: '', website: '', bio: '' }
    } catch {
      return { name: '', email: '', phone: '', location: '', role: '', website: '', bio: '' }
    }
  })

  // Sync photo state when profile changes in localStorage
  useEffect(() => {
    const photo = getPhoto()
    setProfilePhoto(photo)
  }, [getPhoto, profile])

  const set = (k, v) => setProfile((prev) => ({ ...prev, [k]: v }))

  const handleSave = (e) => {
    e.preventDefault()
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const photo = await uploadPhoto(file)
    if (photo) {
      setProfilePhoto(photo)
      setShowPhotoActions(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemovePhoto = () => {
    removePhoto()
    setProfilePhoto(null)
    setShowPhotoActions(false)
  }

  const initials = profile.name
    ? profile.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : null

  return (
    <div className="space-y-5">

      {/* ── Back link ─────────────────────────────────────────────── */}
      <Link
        to="/profile"
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors animate-fade-up"
        style={{ color: 'var(--accent)', textDecoration: 'none' }}
      >
        <ChevronLeft size={16} />
        Back to Profile
      </Link>

      {/* ── Page heading ──────────────────────────────────────────── */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Personal Information
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Update your name, contact details, and bio.
        </p>
      </div>

      {/* ── Avatar row ────────────────────────────────────────────── */}
      <div
        className="flex items-start gap-4 p-4 rounded-2xl animate-fade-up"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', animationDelay: '20ms' }}
      >
        {/* Avatar with photo controls */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative shrink-0">
            <Avatar initials={initials} photo={profilePhoto} size={80} />

            {/* Camera button */}
            <button
              onClick={() => setShowPhotoActions(!showPhotoActions)}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all"
              style={{
                background: 'var(--accent)',
                border: '2px solid var(--bg-surface)',
                color: 'var(--accent-text)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              aria-label={profilePhoto ? 'Change photo' : 'Add photo'}
              title={profilePhoto ? 'Change photo' : 'Add photo'}
            >
              <Camera size={13} />
            </button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload profile photo"
            />
          </div>

          {/* Photo action buttons */}
          {showPhotoActions && (
            <div className="flex flex-col gap-2 w-full animate-fade-in">
              <button
                onClick={handlePhotoClick}
                disabled={isUploading}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all active:scale-95"
                style={{
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                  opacity: isUploading ? 0.6 : 1,
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => !isUploading && (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => !isUploading && (e.currentTarget.style.opacity = '1')}
              >
                <Upload size={12} />
                {isUploading ? 'Uploading...' : (profilePhoto ? 'Change Photo' : 'Add Photo')}
              </button>

              {profilePhoto && (
                <button
                  onClick={handleRemovePhoto}
                  disabled={isUploading}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all active:scale-95"
                  style={{
                    background: 'var(--danger-light)',
                    color: 'var(--danger)',
                    border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)',
                    opacity: isUploading ? 0.6 : 1,
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => !isUploading && (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={(e) => !isUploading && (e.currentTarget.style.opacity = '1')}
                >
                  <X size={12} />
                  Remove Photo
                </button>
              )}
            </div>
          )}
        </div>

        {/* Profile info */}
        <div className="flex-1 min-w-0 pt-1">
          <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            {profile.name || 'Your Name'}
          </p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {profile.role || 'Your Role'}
          </p>
          {profile.email && (
            <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
              {profile.email}
            </p>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="flex items-start gap-2 p-3 rounded-xl animate-fade-in"
          style={{
            background: 'var(--danger-light)',
            border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)',
          }}
        >
          <X size={14} style={{ color: 'var(--danger)', marginTop: 1, flexShrink: 0 }} />
          <div className="flex-1">
            <p className="text-xs font-semibold" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          </div>
          <button
            onClick={clearError}
            className="shrink-0"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            aria-label="Dismiss error"
          >
            <X size={14} style={{ color: 'var(--danger)', opacity: 0.6 }} />
          </button>
        </div>
      )}

      {/* ── Form ──────────────────────────────────────────────────── */}
      <form onSubmit={handleSave} className="space-y-4 animate-fade-up" style={{ animationDelay: '40ms' }}>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
        >
          {/* Personal section */}
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Personal
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Full Name"
                icon={UserCircle}
                value={profile.name}
                onChange={(v) => set('name', v)}
                placeholder="Luan Nian"
              />
              <Field
                label="Role / Title"
                icon={Briefcase}
                value={profile.role}
                onChange={(v) => set('role', v)}
                placeholder="Product Designer"
              />
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

          {/* Contact section */}
          <div
            className="px-5 py-3.5"
            style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}
          >
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Contact
            </p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Email"
                icon={Mail}
                type="email"
                value={profile.email}
                onChange={(v) => set('email', v)}
                placeholder="nian@example.com"
              />
              <Field
                label="Phone"
                icon={Phone}
                type="tel"
                value={profile.phone}
                onChange={(v) => set('phone', v)}
                placeholder="+91 xxxx xxxx xx"
              />
              <Field
                label="Location"
                icon={MapPin}
                value={profile.location}
                onChange={(v) => set('location', v)}
                placeholder="Gujarat, INDIA"
              />
              <Field
                label="Website"
                icon={LinkIcon}
                type="url"
                value={profile.website}
                onChange={(v) => set('website', v)}
                placeholder="https://yoursite.com"
              />
            </div>
          </div>
        </div>

        {/* Save row */}
        <div className="flex items-center justify-end gap-3 pb-1">
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
