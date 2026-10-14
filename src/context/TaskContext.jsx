import { createContext, useContext, useState, useEffect } from 'react'

const TaskContext = createContext(null)
const STORAGE_KEY = 'taskflow-tasks'

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(loadTasks)

  // Persist every change to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const addTask = (task) => {
    const newTask = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'active',
      ...task,
    }
    setTasks((prev) => [newTask, ...prev])
  }

  const updateTask = (id, updates) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const completeTask = (id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: 'completed', completedAt: new Date().toISOString() } : t
      )
    )
  }

  const uncompleteTask = (id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: 'active', completedAt: undefined } : t
      )
    )
  }

  const clearTasks = () => setTasks([])

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, completeTask, uncompleteTask, clearTasks }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  return useContext(TaskContext)
}
