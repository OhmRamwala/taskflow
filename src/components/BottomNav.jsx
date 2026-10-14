import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Plus, CalendarDays, UserCircle } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',         label: 'Home',     icon: LayoutDashboard },
  { to: '/tasks',    label: 'Tasks',    icon: CheckSquare },
  // center slot is the Add button (handled separately)
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/profile',  label: 'Profile',  icon: UserCircle },
]

export default function BottomNav() {
  const navigate = useNavigate()

  return (
    /* Only visible on mobile — completely hidden on lg+ */
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2"
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        height: '64px',
        /* Safe-area inset for notched phones */
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      }}
    >
      {/* Left two items: Home, Tasks */}
      {NAV_ITEMS.slice(0, 2).map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all"
        >
          {({ isActive }) => (
            <>
              <Icon
                size={22}
                style={{
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  transition: 'color 0.15s ease, transform 0.15s ease',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                }}
              />
              <span
                className="text-[10px] font-semibold"
                style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}

      {/* Center: prominent Add button */}
      <div className="flex flex-col items-center justify-center flex-1">
        <button
          onClick={() => navigate('/tasks?add=1')}
          className="flex items-center justify-center rounded-2xl transition-all active:scale-95"
          style={{
            width: 48,
            height: 48,
            background: 'var(--accent)',
            boxShadow: '0 4px 16px color-mix(in srgb, var(--accent) 45%, transparent)',
          }}
          aria-label="Add new task"
        >
          <Plus size={22} style={{ color: 'var(--accent-text)' }} />
        </button>
      </div>

      {/* Right two items: Calendar, Profile */}
      {NAV_ITEMS.slice(2).map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all"
        >
          {({ isActive }) => (
            <>
              <Icon
                size={22}
                style={{
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  transition: 'color 0.15s ease, transform 0.15s ease',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                }}
              />
              <span
                className="text-[10px] font-semibold"
                style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
