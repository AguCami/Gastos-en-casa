import { useState, useEffect } from 'react'

export const CATEGORIES = [
  { id: 'comida', label: 'Comida', color: '#f97316', emoji: '🛒' },
  { id: 'servicios', label: 'Servicios', color: '#06b6d4', emoji: '💡' },
  { id: 'transporte', label: 'Transporte', color: '#8b5cf6', emoji: '🚗' },
  { id: 'salud', label: 'Salud', color: '#ec4899', emoji: '🏥' },
  { id: 'entretenimiento', label: 'Entretenimiento', color: '#eab308', emoji: '🎬' },
  { id: 'ropa', label: 'Ropa', color: '#14b8a6', emoji: '👕' },
  { id: 'hogar', label: 'Hogar', color: '#84cc16', emoji: '🏠' },
  { id: 'otro', label: 'Otro', color: '#94a3b8', emoji: '📦' },
]

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)) }

export function useStore() {
  const [members, setMembers] = useState(() => load('gc_members', []))
  const [entries, setEntries] = useState(() => load('gc_entries', []))   // gastos + ingresos
  const [budgets, setBudgets] = useState(() => load('gc_budgets', {}))   // { catId: amount }

  useEffect(() => { save('gc_members', members) }, [members])
  useEffect(() => { save('gc_entries', entries) }, [entries])
  useEffect(() => { save('gc_budgets', budgets) }, [budgets])

  // members helpers
  function addMember(name) {
    const n = name.trim()
    if (n && !members.includes(n)) setMembers(m => [...m, n])
  }
  function removeMember(name) {
    setMembers(m => m.filter(x => x !== name))
    setEntries(e => e.filter(x => x.member !== name))
  }

  // entries helpers
  function addEntry(entry) {
    setEntries(e => [{ ...entry, id: Date.now() + Math.random() }, ...e])
  }
  function removeEntry(id) { setEntries(e => e.filter(x => x.id !== id)) }
  function editEntry(updated) { setEntries(e => e.map(x => x.id === updated.id ? updated : x)) }

  // budgets helpers
  function setBudget(catId, amount) {
    setBudgets(b => ({ ...b, [catId]: amount }))
  }

  // derived
  const expenses = entries.filter(e => e.type === 'expense')
  const incomes  = entries.filter(e => e.type === 'income')

  return {
    members, expenses, incomes, entries, budgets,
    addMember, removeMember,
    addEntry, removeEntry, editEntry,
    setBudget,
    CATEGORIES,
  }
}
