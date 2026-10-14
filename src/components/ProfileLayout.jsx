/**
 * ProfileLayout
 *
 * Desktop (lg+):
 *   Transparent <Outlet> pass-through. The sidebar swap is handled in Sidebar.jsx.
 *
 * Mobile (< lg):
 *   A) Overview  — shown when at /profile (index) and user hasn't tapped a section yet.
 *      Compact avatar card + vertical "Profile Sections" list (icon / label / description / chevron).
 *      "Back to Menu" at the top navigates to Dashboard.
 *
 *   B) Section   — shown after tapping any row, or when on a sub-route.
 *      "← Back to Profile" returns to the overview.
 *      "Back to Menu" (right side) goes to Dashboard.
 *      <Outlet> renders the selected panel.
 *
 *   Personal Information is the /profile index route. Tapping it sets a
 *   sessionStorage flag so Profile.jsx knows to render the form instead of
 *   being hidden behind the overview.
 */
import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  User, SlidersHorizontal, Bell,
  ChevronLeft, ChevronRight, UserCircle, Pencil,
} from 'lucide-react'

const PROFILE_KEY   = 'taskflow-profile'
const SESSION_FLAG  = 'tf-profile-section-open'

/* ── Helpers ──────────────────────────────────────────────────── */
function getProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

/* ── Section row (vertical list item) ────────────────────────── */
function SectionRow({ icon: Icon, label, description, to, end, onClick, last }) {
  const inner = (
    <div
      className="flex items-center gap-3.5 px-5 py-3.5 transition-colors"
      style={{ borderBottom: last ? 'none' : '1px solid var(--border-subtle)' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'var(--accent-light)' }}>
        <Icon size={16} style={{ color: 'var(--accent)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>
      </div>
      <ChevronRight size={15} style={{ color: 'var(--text-muted)' }} />
    </div>
  )

  // Personal Information taps use a button (sets sessionStorage flag before navigating)
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        {inner}
      </button>
    )
  }

  return (
    <NavLink to={to} end={end} style={{ textDecoration: 'none', display: 'block' }}>
      {inner}
    </NavLink>
  )
}

/* ═════════════════════════════════════════════════════════════ */
export default function ProfileLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isIndex = pathname === '/profile'

  // Track whether user has explicitly opened a section from the mobile overview
  const [sectionOpen, setSectionOpen] = useState(
    () => sessionStorage.getItem(SESSION_FLAG) === '1'
  )

  // Clear the flag whenever we leave the /profile index route
  useEffect(() => {
    if (!isIndex) {
      sessionStorage.removeItem(SESSION_FLAG)
      setSectionOpen(false)
    }
  }, [isIndex])

  const openPersonalInfo = () => {
    sessionStorage.setItem(SESSION_FLAG, '1')
    setSectionOpen(true)
  }

  const backToOverview = () => {
    sessionStorage.removeItem(SESSION_FLAG)
    setSectionOpen(false)
    if (!isIndex) navigate('/profile')
  }

  // Mobile overview: at /profile index AND section not yet opened
  const showMobileOverview = isIndex && !sectionOpen

  return (
    <>
      {/* ── DESKTOP: pure pass-through ────────────────────────── */}
      <div className="hidden lg:block">
        <Outlet />
      </div>

      {/* ── MOBILE ────────────────────────────────────────────── */}
      <div className="lg:hidden space-y-4">

        {showMobileOverview ? (
          /* ── A: Overview ────────────────────────────── */
          <>
            {/* Back to Menu */}
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-sm font-medium"
              style={{ color: 'var(--accent)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <ChevronLeft size={16} /> Back to Menu
            </button>

            {/* ── Profile header card ───────────────────── */}
            {(() => {
              const p = getProfile()
              const initials = p.name
                ? p.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
                : null
              return (
                <div
                  className="flex items-center gap-4 p-5 rounded-2xl"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow)',
                  }}
                >
                  {/* Avatar — prominent, left-aligned */}
                  <div
                    className="rounded-full flex items-center justify-center shadow-md shrink-0"
                    style={{
                      width: 64, height: 64,
                      background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, #000))',
                    }}
                  >
                    {initials
                      ? <span className="font-bold" style={{ color: 'var(--accent-text)', fontSize: 64 * 0.33 }}>{initials}</span>
                      : <UserCircle size={64 * 0.55} style={{ color: 'var(--accent-text)', opacity: 0.8 }} />
                    }
                  </div>

                  {/* Name + role + edit button */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base leading-snug truncate"
                      style={{ color: 'var(--text-primary)' }}>
                      {p.name || 'Your Name'}
                    </p>
                    <p className="text-sm mt-0.5 truncate"
                      style={{ color: 'var(--text-muted)' }}>
                      {p.role || 'Add your role'}
                    </p>
                    <button
                      onClick={openPersonalInfo}
                      className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
                      style={{
                        background: 'var(--accent-light)',
                        color: 'var(--accent)',
                        border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      <Pencil size={11} /> Edit Profile
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* ── Profile & Preferences list ────────────── */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <p className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}>
                  Profile &amp; Preferences
                </p>
              </div>

              <SectionRow
                icon={User}
                label="Personal Information"
                description="Name, contact details, and bio."
                onClick={openPersonalInfo}
              />
              <SectionRow
                icon={SlidersHorizontal}
                label="Preferences"
                description="Themes and app appearance."
                to="/profile/preferences"
              />
              <SectionRow
                icon={Bell}
                label="Notifications"
                description="Reminder and notification preferences."
                to="/profile/notifications"
                last
              />
            </div>
          </>
        ) : (
          /* ── B: Section view ────────────────────────── */
          <>
            {/* Navigation row: ← Back to Profile  ·  Back to Menu */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={backToOverview}
                className="inline-flex items-center gap-1.5 text-sm font-medium"
                style={{ color: 'var(--accent)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <ChevronLeft size={16} /> Back to Profile
              </button>
              <button
                onClick={() => { backToOverview(); navigate('/') }}
                className="text-xs font-medium"
                style={{ color: 'var(--text-muted)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                Back to Menu
              </button>
            </div>

            {/* Panel content */}
            <Outlet />
          </>
        )}
      </div>
    </>
  )
}
