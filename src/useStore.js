import { useState, useEffect } from 'react'
import { supabase } from './supabase'

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

export function useStore() {
  const [members, setMembers] = useState([])
  const [entries, setEntries]  = useState([])
  const [budgets, setBudgetsState] = useState({})
  const [loading, setLoading]  = useState(true)

  // ── Initial load ──────────────────────────────────────
  useEffect(() => {
    async function fetchAll() {
      const [{ data: mem }, { data: ent }, { data: bud }] = await Promise.all([
        supabase.from('members').select('*').order('created_at'),
        supabase.from('entries').select('*').order('created_at', { ascending: false }),
        supabase.from('budgets').select('*'),
      ])
      setMembers((mem || []).map(r => r.name))
      setEntries(ent || [])
      const budMap = {}
      ;(bud || []).forEach(r => { budMap[r.category_id] = r.amount })
      setBudgetsState(budMap)
      setLoading(false)
    }
    fetchAll()
  }, [])

  // ── Real-time sync ────────────────────────────────────
  useEffect(() => {
    const ch = supabase
      .channel('realtime-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        supabase.from('members').select('*').order('created_at').then(({ data }) => {
          if (data) setMembers(data.map(r => r.name))
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entries' }, () => {
        supabase.from('entries').select('*').order('created_at', { ascending: false }).then(({ data }) => {
          if (data) setEntries(data)
        })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets' }, () => {
        supabase.from('budgets').select('*').then(({ data }) => {
          if (data) {
            const m = {}
            data.forEach(r => { m[r.category_id] = r.amount })
            setBudgetsState(m)
          }
        })
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  // ── Members ───────────────────────────────────────────
  async function addMember(name) {
    const n = name.trim()
    if (!n || members.includes(n)) return
    setMembers(m => [...m, n])  // optimistic
    await supabase.from('members').insert({ name: n })
  }

  async function removeMember(name) {
    setMembers(m => m.filter(x => x !== name))
    setEntries(e => e.filter(x => x.member !== name))
    await supabase.from('members').delete().eq('name', name)
    await supabase.from('entries').delete().eq('member', name)
  }

  // ── Entries ───────────────────────────────────────────
  async function addEntry(entry) {
    const { id, ...rest } = entry  // strip any local id
    const row = { ...rest, amount: parseFloat(rest.amount) }
    const { data } = await supabase.from('entries').insert(row).select().single()
    if (data) setEntries(e => [data, ...e])
  }

  async function removeEntry(id) {
    setEntries(e => e.filter(x => x.id !== id))
    await supabase.from('entries').delete().eq('id', id)
  }

  async function editEntry(updated) {
    const { id, created_at, ...fields } = updated
    setEntries(e => e.map(x => x.id === id ? updated : x))
    await supabase.from('entries').update(fields).eq('id', id)
  }

  // ── Budgets ───────────────────────────────────────────
  async function setBudget(catId, amount) {
    setBudgetsState(b => ({ ...b, [catId]: amount }))
    await supabase.from('budgets').upsert({ category_id: catId, amount, updated_at: new Date().toISOString() }, { onConflict: 'category_id' })
  }

  // ── Derived ───────────────────────────────────────────
  const expenses = entries.filter(e => e.type === 'expense')
  const incomes  = entries.filter(e => e.type === 'income')

  return {
    loading,
    members, expenses, incomes, entries, budgets,
    addMember, removeMember,
    addEntry, removeEntry, editEntry,
    setBudget,
    CATEGORIES,
  }
}
