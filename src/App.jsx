import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TaskProvider }         from './context/TaskContext'
import { ThemeProvider }        from './context/ThemeContext'
import { NoteProvider }         from './context/NoteContext'
import { ReminderProvider }     from './context/ReminderContext'
import { NotificationProvider } from './context/NotificationContext'
import AppLayout                from './components/AppLayout'
import ProfileLayout            from './components/ProfileLayout'
import NotificationToast        from './components/NotificationToast'
import NotificationEngine       from './components/NotificationEngine'
import Dashboard            from './pages/Dashboard'
import Tasks                from './pages/Tasks'
import Calendar             from './pages/Calendar'
import Reminders            from './pages/Reminders'
import Progress             from './pages/Progress'
import Settings             from './pages/Settings'
import Profile              from './pages/Profile'
import ProfilePreferences   from './pages/ProfilePreferences'
import ProfileNotifications from './pages/ProfileNotifications'

export default function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <NoteProvider>
          <ReminderProvider>
            <NotificationProvider>
              <BrowserRouter>
                <NotificationEngine />

                <Routes>
                  <Route element={<AppLayout />}>
                    <Route index            element={<Dashboard />} />
                    <Route path="tasks"     element={<Tasks />} />
                    <Route path="calendar"  element={<Calendar />} />
                    <Route path="reminders" element={<Reminders />} />
                    <Route path="progress"  element={<Progress />} />
                    <Route path="settings"  element={<Settings />} />

                    {/* Profile area — sidebar swap handled in Sidebar.jsx */}
                    <Route path="profile" element={<ProfileLayout />}>
                      <Route index                element={<Profile />} />
                      <Route path="preferences"   element={<ProfilePreferences />} />
                      <Route path="notifications" element={<ProfileNotifications />} />
                    </Route>
                  </Route>
                </Routes>

                <NotificationToast />
              </BrowserRouter>
            </NotificationProvider>
          </ReminderProvider>
        </NoteProvider>
      </TaskProvider>
    </ThemeProvider>
  )
}
