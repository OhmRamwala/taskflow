import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare, CalendarDays, Bell,
  TrendingUp, UserCircle,
  SlidersHorizontal, ChevronLeft, User,
} from 'lucide-react'

/* ─────────────────────────────────────────────────────────────────
   Shared nav items
───────────────────────────────────────────────────────────────── */
const navItems = [
  { to: '/',         label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks',    label: 'Tasks',     icon: CheckSquare },
  { to: '/calendar', label: 'Calendar',  icon: CalendarDays },
  { to: '/progress', label: 'Progress',  icon: TrendingUp },
]

const bottomItems = [
  { to: '/profile',  label: 'My Profile', icon: UserCircle },
]

const profileNavItems = [
  { to: '/profile',               label: 'Personal Information', icon: User,               end: true  },
  { to: '/profile/preferences',   label: 'Preferences',          icon: SlidersHorizontal,  end: false },
  { to: '/profile/notifications', label: 'Notifications',        icon: Bell,               end: false },
]

/* ─────────────────────────────────────────────────────────────────
   TaskFlow logo mark
───────────────────────────────────────────────────────────────── */
function TaskFlowMark({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="TaskFlow logo"
    >
      <defs>
        <linearGradient id="tf-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#7C5CE8" />
          <stop offset="100%" stopColor="#5B7CF6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7.5" fill="url(#tf-grad)" />
      <polyline points="9,10.5 13.5,15 22,7" stroke="white" strokeWidth="2.8"
        strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="1" />
      <circle cx="8" cy="20" r="2.2" fill="white" opacity="0.95" />
      <rect x="12.5" y="17.9" width="12" height="4.2" rx="2.1" fill="white" opacity="0.88" />
      <circle cx="8" cy="27" r="2.2" fill="white" opacity="0.85" />
      <rect x="12.5" y="24.9" width="11" height="4.2" rx="2.1" fill="white" opacity="0.72" />
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Standard NavItem (used in main sidebar)
───────────────────────────────────────────────────────────────── */
function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
        ${isActive
          ? 'text-[color:var(--accent-text)]'
          : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute inset-0 rounded-xl"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 14px color-mix(in srgb, var(--accent) 35%, transparent)' }}
            />
          )}
          {!isActive && (
            <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: 'var(--bg-elevated)' }} />
          )}
          <Icon size={17} className={`relative z-10 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`} />
          <span className="relative z-10 truncate">{label}</span>
          {isActive && (
            <span className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: 'color-mix(in srgb, var(--accent-text) 60%, transparent)' }} />
          )}
        </>
      )}
    </NavLink>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Profile NavItem — same visual style, used in profile sidebar
───────────────────────────────────────────────────────────────── */
function ProfileNavItem({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
        ${isActive
          ? 'text-[color:var(--accent-text)]'
          : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute inset-0 rounded-xl"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 14px color-mix(in srgb, var(--accent) 35%, transparent)' }}
            />
          )}
          {!isActive && (
            <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: 'var(--bg-elevated)' }} />
          )}
          <Icon size={17} className={`relative z-10 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`} />
          <span className="relative z-10 truncate">{label}</span>
          {isActive && (
            <span className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: 'color-mix(in srgb, var(--accent-text) 60%, transparent)' }} />
          )}
        </>
      )}
    </NavLink>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Main sidebar content
───────────────────────────────────────────────────────────────── */
function MainSidebarContent() {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-5"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <TaskFlowMark size={32} />
        <div>
          <span className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            TaskFlow
          </span>
          <p className="text-[10px] font-medium -mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Productivity Workspace
          </p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-3"
          style={{ color: 'var(--text-muted)' }}>
          Menu
        </p>
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px" style={{ background: 'var(--border-subtle)' }} />

      {/* Bottom nav */}
      <div className="px-3 py-4 space-y-1">
        {bottomItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Profile sidebar content — replaces main sidebar on /profile/*
───────────────────────────────────────────────────────────────── */
function ProfileSidebarContent() {
  const navigate = useNavigate()

  const handleBackToMenu = () => {
    navigate('/')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Brand — same header as main sidebar */}
      <div className="flex items-center gap-2.5 px-4 py-5"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <TaskFlowMark size={32} />
        <div>
          <span className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            TaskFlow
          </span>
          <p className="text-[10px] font-medium -mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Productivity Workspace
          </p>
        </div>
      </div>

      {/* Profile nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-3"
          style={{ color: 'var(--text-muted)' }}>
          Profile Menu
        </p>
        {profileNavItems.map((item) => (
          <ProfileNavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px" style={{ background: 'var(--border-subtle)' }} />

      {/* Back to Menu — fixed at bottom in same position as bottom nav */}
      <div className="px-3 py-4">
        <button
          onClick={handleBackToMenu}
          className="group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
        >
          <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: 'var(--bg-elevated)' }} />
          <ChevronLeft size={17} className="relative z-10 shrink-0 transition-transform duration-200 group-hover:scale-110" />
          <span className="relative z-10 truncate">Back to Menu</span>
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Sidebar — swaps content based on current route
───────────────────────────────────────────────────────────────── */
export default function Sidebar() {
  const { pathname } = useLocation()
  const isProfileArea = pathname === '/profile' || pathname.startsWith('/profile/')

  return (
    <aside
      className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0"
      style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)' }}
    >
      {isProfileArea ? <ProfileSidebarContent /> : <MainSidebarContent />}
    </aside>
  )
}
