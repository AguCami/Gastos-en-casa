import { useState, useEffect } from 'react'

const CATEGORIES = [
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
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function useStore() {
  const [members, setMembers] = useState(() => load('gc_members', ['Todos']))
  const [expenses, setExpenses] = useState(() => load('gc_expenses', []))

  useEffect(() => { save('gc_members', members) }, [members])
  useEffect(() => { save('gc_expenses', expenses) }, [expenses])

  function addMember(name) {
    const n = name.trim()
    if (n && !members.includes(n)) setMembers(m => [...m, n])
  }

  function removeMember(name) {
    if (name === 'Todos') return
    setMembers(m => m.filter(x => x !== name))
    setExpenses(e => e.filter(x => x.member !== name))
  }

  function addExpense(exp) {
    const newExp = { ...exp, id: Date.now() + Math.random() }
    setExpenses(e => [newExp, ...e])
  }

  function removeExpense(id) {
    setExpenses(e => e.filter(x => x.id !== id))
  }

  function editExpense(updated) {
    setExpenses(e => e.map(x => x.id === updated.id ? updated : x))
  }

  return { members, expenses, addMember, removeMember, addExpense, removeExpense, editExpense, CATEGORIES }
}
