import { createContext, useContext, useState, useEffect } from 'react'

const NoteContext = createContext(null)

const STORAGE_KEY = 'taskflow-notes'

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function NoteProvider({ children }) {
  const [notes, setNotes] = useState(loadNotes)

  // Persist whenever notes change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  }, [notes])

  const addNote = (note) => {
    const newNote = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...note,
    }
    setNotes((prev) => [newNote, ...prev])
    return newNote
  }

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  const updateNote = (id, updates) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)))
  }

  return (
    <NoteContext.Provider value={{ notes, addNote, updateNote, deleteNote }}>
      {children}
    </NoteContext.Provider>
  )
}

export function useNotes() {
  return useContext(NoteContext)
}
