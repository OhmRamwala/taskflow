import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import ThemeBackground from './ThemeBackground'
import { Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)', position: 'relative' }}>
      {/* Ambient background blobs — fixed, behind everything */}
      <ThemeBackground />

      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar />

      {/* Main content — pb-20 on mobile so bottom nav doesn't cover content */}
      <main className="flex-1 overflow-y-auto" style={{ position: 'relative', zIndex: 1 }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:py-8 lg:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom navigation — hidden on desktop */}
      <BottomNav />
    </div>
  )
}
