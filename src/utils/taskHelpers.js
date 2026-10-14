// Returns today's date as YYYY-MM-DD in the user's LOCAL timezone.
// Never use toISOString().split('T')[0] — that returns UTC which can
// shift the calendar day depending on timezone.
export function getTodayLocalStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Converts a Date object to YYYY-MM-DD in LOCAL time (not UTC).
export function dateToLocalStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function isOverdue(task) {
  if (task.status === 'completed') return false
  if (!task.dueDate) return false
  const due = new Date(`${task.dueDate}${task.dueTime ? 'T' + task.dueTime : 'T23:59:59'}`)
  return due < new Date()
}

export function getEffectiveStatus(task) {
  if (task.status === 'completed') return 'completed'
  if (isOverdue(task)) return 'overdue'
  return 'active'
}

export function getRemainingTime(task) {
  if (!task.dueDate) return null
  const due = new Date(`${task.dueDate}${task.dueTime ? 'T' + task.dueTime : 'T23:59:59'}`)
  const now = new Date()
  const diff = due - now
  if (diff < 0) return 'Overdue'

  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h left`
  if (hours > 0) return `${hours}h ${mins % 60}m left`
  return `${mins}m left`
}

export function priorityColor(priority) {
  switch (priority) {
    case 'high': return 'text-red-600 bg-red-50 border-red-200'
    case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'low': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    default: return 'text-slate-600 bg-slate-50 border-slate-200'
  }
}

export function statusColor(status) {
  switch (status) {
    case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    case 'overdue': return 'text-red-600 bg-red-50 border-red-200'
    case 'active': return 'text-blue-600 bg-blue-50 border-blue-200'
    default: return 'text-slate-600 bg-slate-50 border-slate-200'
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function formatDateTime(dateStr, timeStr) {
  if (!dateStr) return ''
  const base = formatDate(dateStr)
  if (!timeStr) return base
  const [h, m] = timeStr.split(':')
  const d = new Date()
  d.setHours(+h, +m)
  return `${base} at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}
