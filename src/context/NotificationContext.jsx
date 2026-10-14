import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext(null)

// types: 'task' | 'note' | 'reminder' | 'overdue'
export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback(({ type = 'reminder', title, body, id }) => {
    const toastId = id || crypto.randomUUID()
    // Don't duplicate the same toast within a session
    setToasts((prev) => {
      if (prev.find((t) => t.id === toastId)) return prev
      return [...prev, { id: toastId, type, title, body, at: Date.now() }]
    })
    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId))
    }, 6000)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ toasts, push, dismiss }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
