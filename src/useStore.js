import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export const CATEGORIES = [
  { id: 'comida',          label: 'Comida',           color: '#f97316', emoji: '🛒' },
  { id: 'servicios',       label: 'Servicios',         color: '#06b6d4', emoji: '💡' },
  { id: 'transporte',      label: 'Transporte',        color: '#8b5cf6', emoji: '🚗' },
  { id: 'salud',           label: 'Salud',             color: '#ec4899', emoji: '🏥' },
  { id: 'entretenimiento', label: 'Entretenimiento',   color: '#eab308', emoji: '🎬' },
  { id: 'ropa',            label: 'Ropa',              color: '#14b8a6', emoji: '👕' },
  { id: 'hogar',           label: 'Hogar',             color: '#84cc16', emoji: '🏠' },
  { id: 'otro',            label: 'Otro',              color: '#94a3b8', emoji: '📦' },
]

export function useStore() {
  const [householdId, setHouseholdId] = useState(null)
  const [household, setHousehold]     = useState(null)
  const [members,   setMembers]       = useState([])
  const [entries,   setEntries]       = useState([])
  const [budgets,   setBudgetsState]  = useState({})
  const [goals,     setGoals]         = useState([])
  const [recurring, setRecurring]     = useState([])
  const [loading,   setLoading]       = useState(true)

  // ── Load household + data ─────────────────────────────
  useEffect(() => {
    async function init() {
      // Find user's household
      const { data: hu } = await supabase
        .from('household_users').select('household_id').single()
      if (!hu) { setLoading(false); return }

      const hid = hu.household_id
      setHouseholdId(hid)

      const [
        { data: hh },
        { data: mem },
        { data: ent },
        { data: bud },
        { data: gls },
        { data: rec },
      ] = await Promise.all([
        supabase.from('households').select('*').eq('id', hid).single(),
        supabase.from('members').select('*').eq('household_id', hid).order('created_at'),
        supabase.from('entries').select('*').eq('household_id', hid).order('created_at', { ascending: false }),
        supabase.from('budgets').select('*').eq('household_id', hid),
        supabase.from('goals').select('*').eq('household_id', hid).order('created_at'),
        supabase.from('recurring').select('*').eq('household_id', hid).order('created_at'),
      ])

      setHousehold(hh)
      setMembers((mem || []).map(r => r.name))
      setEntries(ent || [])
      const bmap = {};(bud || []).forEach(r => { bmap[r.category_id] = r.amount })
      setBudgetsState(bmap)
      setGoals(gls || [])
      setRecurring(rec || [])
      setLoading(false)
    }
    init()
  }, [])

  // ── Realtime ──────────────────────────────────────────
  useEffect(() => {
    if (!householdId) return
    const ch = supabase.channel('realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members', filter: `household_id=eq.${householdId}` }, () => {
        supabase.from('members').select('*').eq('household_id', householdId).order('created_at')
          .then(({ data }) => data && setMembers(data.map(r => r.name)))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entries', filter: `household_id=eq.${householdId}` }, () => {
        supabase.from('entries').select('*').eq('household_id', householdId).order('created_at', { ascending: false })
          .then(({ data }) => data && setEntries(data))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals', filter: `household_id=eq.${householdId}` }, () => {
        supabase.from('goals').select('*').eq('household_id', householdId).order('created_at')
          .then(({ data }) => data && setGoals(data))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recurring', filter: `household_id=eq.${householdId}` }, () => {
        supabase.from('recurring').select('*').eq('household_id', householdId).order('created_at')
          .then(({ data }) => data && setRecurring(data))
      })
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [householdId])

  // ── Members ───────────────────────────────────────────
  async function addMember(name) {
    const n = name.trim()
    if (!n || members.includes(n) || !householdId) return
    setMembers(m => [...m, n])
    await supabase.from('members').insert({ household_id: householdId, name: n })
  }

  async function removeMember(name) {
    setMembers(m => m.filter(x => x !== name))
    setEntries(e => e.filter(x => x.member !== name))
    await supabase.from('members').delete().eq('household_id', householdId).eq('name', name)
    await supabase.from('entries').delete().eq('household_id', householdId).eq('member', name)
  }

  // ── Entries ───────────────────────────────────────────
  async function addEntry(entry) {
    const row = { ...entry, household_id: householdId, amount: parseFloat(entry.amount) }
    delete row.id
    const { data } = await supabase.from('entries').insert(row).select().single()
    if (data) setEntries(e => [data, ...e])
  }

  async function removeEntry(id) {
    setEntries(e => e.filter(x => x.id !== id))
    await supabase.from('entries').delete().eq('id', id)
  }

  async function editEntry(updated) {
    const { id, created_at, household_id, ...fields } = updated
    setEntries(e => e.map(x => x.id === id ? updated : x))
    await supabase.from('entries').update(fields).eq('id', id)
  }

  // ── Budgets ───────────────────────────────────────────
  async function setBudget(catId, amount) {
    setBudgetsState(b => ({ ...b, [catId]: amount }))
    await supabase.from('budgets').upsert(
      { household_id: householdId, category_id: catId, amount, updated_at: new Date().toISOString() },
      { onConflict: 'household_id,category_id' }
    )
  }

  // ── Goals ─────────────────────────────────────────────
  async function addGoal(goal) {
    const { data } = await supabase.from('goals').insert({ ...goal, household_id: householdId }).select().single()
    if (data) setGoals(g => [...g, data])
  }

  async function updateGoal(id, fields) {
    setGoals(g => g.map(x => x.id === id ? { ...x, ...fields } : x))
    await supabase.from('goals').update(fields).eq('id', id)
  }

  async function removeGoal(id) {
    setGoals(g => g.filter(x => x.id !== id))
    await supabase.from('goals').delete().eq('id', id)
  }

  // ── Recurring ─────────────────────────────────────────
  async function addRecurring(item) {
    const { data } = await supabase.from('recurring').insert({ ...item, household_id: householdId }).select().single()
    if (data) setRecurring(r => [...r, data])
  }

  async function removeRecurring(id) {
    setRecurring(r => r.filter(x => x.id !== id))
    await supabase.from('recurring').delete().eq('id', id)
  }

  async function toggleRecurring(id, active) {
    setRecurring(r => r.map(x => x.id === id ? { ...x, active } : x))
    await supabase.from('recurring').update({ active }).eq('id', id)
  }

  // ── Derived ───────────────────────────────────────────
  const expenses = entries.filter(e => e.type === 'expense')
  const incomes  = entries.filter(e => e.type === 'income')

  return {
    loading, household, householdId,
    members, expenses, incomes, entries, budgets, goals, recurring,
    addMember, removeMember,
    addEntry, removeEntry, editEntry,
    setBudget,
    addGoal, updateGoal, removeGoal,
    addRecurring, removeRecurring, toggleRecurring,
    CATEGORIES,
  }
}
