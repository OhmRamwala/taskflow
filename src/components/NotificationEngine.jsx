/**
 * NotificationEngine — mounts once inside the app, polls every 60 seconds.
 *
 * Fires toasts for:
 *   • Task reminders — calculated from the task's dueDate+dueTime minus the
 *     selected reminder offset (5min, 15min, 30min, 1hr, 1day).
 *   • Overdue tasks
 *   • Tasks due today that are still active
 *   • Today's notes
 *   • Standalone reminders whose time has arrived
 *
 * Uses sessionStorage to avoid re-firing the same notification within a tab
 * session. Clears on tab close so reminders fire again next visit.
 */
import { useEffect } from 'react'
import { useTasks }         from '../context/TaskContext'
import { useNotes }         from '../context/NoteContext'
import { useReminders }     from '../context/ReminderContext'
import { useNotifications } from '../context/NotificationContext'
import { getEffectiveStatus, getTodayLocalStr } from '../utils/taskHelpers'

const FIRED_KEY   = 'taskflow-notif-fired'
const POLL_MS     = 60_000   // check every 60 seconds
const WINDOW_MS   = 2 * 60 * 1000  // fire if within 2-minute window

/* ── Reminder offset map (ms before due time) ───────────────────── */
const REMINDER_OFFSET_MS = {
  '5min':  5  * 60 * 1000,
  '15min': 15 * 60 * 1000,
  '30min': 30 * 60 * 1000,
  '1hr':   60 * 60 * 1000,
  '1day':  24 * 60 * 60 * 1000,
}

function getFired() {
  try { return new Set(JSON.parse(sessionStorage.getItem(FIRED_KEY) || '[]')) }
  catch { return new Set() }
}
function markFired(id) {
  const s = getFired(); s.add(id)
  sessionStorage.setItem(FIRED_KEY, JSON.stringify([...s]))
}

/* ── Friendly message pools ──────────────────────────────────────── */
const MSG = {
  taskReminder: (title) => `Reminder: ${title}`,
  overdue:      ['This task slipped past the deadline — take a moment to tackle it.',
                 'Still on your list. There\'s still time to finish it.',
                 'A little overdue, but you\'ve got this.'],
  today:        ['Heads up — this task is due today!',
                 'You\'ve got this on the schedule for today.',
                 'Don\'t let today slip by without finishing this.'],
  note:         ['Take a look at your note for today.',
                 'You left yourself a note — peek at it when you can.',
                 'A reminder from your past self — check your note!'],
  reminder:     ['You asked to be reminded about this.',
                 'Ring ring! Your reminder is here.',
                 'Just a friendly nudge you set up.'],
}
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

export default function NotificationEngine() {
  const { tasks }     = useTasks()
  const { notes }     = useNotes()
  const { reminders } = useReminders()
  const { push }      = useNotifications()

  useEffect(() => {
    function check() {
      const now      = new Date()
      const todayStr = getTodayLocalStr()
      const fired    = getFired()

      // ── Task reminder offsets (5min, 15min, 30min, 1hr, 1day) ──
      tasks.forEach((t) => {
        if (t.status === 'completed') return
        if (!t.reminder || !t.dueDate)  return
        const offsetMs = REMINDER_OFFSET_MS[t.reminder]
        if (!offsetMs) return

        const dueTime     = t.dueTime || '23:59'
        const dueDate     = new Date(`${t.dueDate}T${dueTime}`)
        const reminderAt  = new Date(dueDate.getTime() - offsetMs)
        const diffMs      = now - reminderAt

        // Fire if we're inside the 2-minute firing window
        if (diffMs < 0 || diffMs > WINDOW_MS) return

        const notifId = `task-reminder-${t.id}-${t.reminder}`
        if (fired.has(notifId)) return

        push({
          type:  'reminder',
          id:    notifId,
          title: MSG.taskReminder(t.title),
          body:  `Due ${t.dueDate}${t.dueTime ? ' at ' + t.dueTime : ''}`,
        })
        markFired(notifId)
      })

      // ── Overdue tasks ───────────────────────────────────────────
      tasks.forEach((t) => {
        if (getEffectiveStatus(t) !== 'overdue') return
        const notifId = `overdue-${t.id}-${todayStr}`
        if (fired.has(notifId)) return
        push({ type: 'overdue', id: notifId, title: t.title, body: pick(MSG.overdue) })
        markFired(notifId)
      })

      // ── Tasks due today (still active) ─────────────────────────
      tasks.forEach((t) => {
        if (t.status === 'completed' || t.dueDate !== todayStr) return
        const notifId = `today-${t.id}-${todayStr}`
        if (fired.has(notifId)) return
        push({ type: 'task', id: notifId, title: t.title, body: pick(MSG.today) })
        markFired(notifId)
      })

      // ── Notes for today ─────────────────────────────────────────
      notes.forEach((n) => {
        if (n.date !== todayStr) return
        const notifId = `note-${n.id}-${todayStr}`
        if (fired.has(notifId)) return
        push({ type: 'note', id: notifId, title: n.title, body: pick(MSG.note) })
        markFired(notifId)
      })

      // ── Standalone reminders ────────────────────────────────────
      reminders.forEach((r) => {
        if (!r.date) return
        const reminderTime = new Date(`${r.date}T${r.time || '00:00'}`)
        const diffMs       = now - reminderTime
        if (diffMs < 0 || diffMs > WINDOW_MS) return
        const notifId = `reminder-${r.id}`
        if (fired.has(notifId)) return
        push({ type: 'reminder', id: notifId, title: r.title, body: r.note || pick(MSG.reminder) })
        markFired(notifId)
      })
    }

    check()
    const interval = setInterval(check, POLL_MS)
    return () => clearInterval(interval)
  }, [tasks, notes, reminders, push])

  return null
}
