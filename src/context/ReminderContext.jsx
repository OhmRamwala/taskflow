/**
 * Standalone reminders — independent of tasks.
 * Each reminder: { id, title, date, time, note, createdAt }
 * Persisted to localStorage.
 */
import { createContext, useContext, useState, useEffect } from 'react'

const ReminderContext = createContext(null)
const STORAGE_KEY = 'taskflow-reminders'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

export function ReminderProvider({ children }) {
  const [reminders, setReminders] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
  }, [reminders])

  const addReminder = (data) => {
    const item = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...data }
    setReminders((prev) => [item, ...prev])
    return item
  }

  const deleteReminder = (id) => setReminders((prev) => prev.filter((r) => r.id !== id))

  const updateReminder = (id, updates) =>
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)))

  return (
    <ReminderContext.Provider value={{ reminders, addReminder, updateReminder, deleteReminder }}>
      {children}
    </ReminderContext.Provider>
  )
}

export function useReminders() {
  return useContext(ReminderContext)
}
