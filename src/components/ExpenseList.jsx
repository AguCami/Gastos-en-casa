import { useState } from 'react'
import ExpenseForm from './ExpenseForm'

export default function ExpenseList({ expenses, members, categories, onRemove, onEdit }) {
  const [filter, setFilter] = useState({ member: 'Todos', category: 'todas', month: '' })
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const filtered = expenses.filter(e => {
    if (filter.member !== 'Todos' && e.member !== filter.member) return false
    if (filter.category !== 'todas' && e.category !== filter.category) return false
    if (filter.month && !e.date.startsWith(filter.month)) return false
    return true
  })

  const total = filtered.reduce((s, e) => s + e.amount, 0)

  function getCat(id) { return categories.find(c => c.id === id) || categories[categories.length - 1] }

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <select value={filter.member} onChange={e => setFilter(f => ({ ...f, member: e.target.value }))} style={{ width: 'auto' }}>
          {members.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))} style={{ width: 'auto' }}>
          <option value="todas">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </select>
        <input
          type="month"
          value={filter.month}
          onChange={e => setFilter(f => ({ ...f, month: e.target.value }))}
          style={{ width: 'auto' }}
          placeholder="Mes"
        />
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text2)' }}>
          {filtered.length} gastos · <strong style={{ color: 'var(--text)' }}>${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text2)', padding: 40 }}>
          No hay gastos registrados
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(exp => {
            const cat = getCat(exp.category)
            return (
              <div key={exp.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: cat.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {cat.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp.description}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                    <span style={{ background: cat.color + '33', color: cat.color, borderRadius: 6, padding: '1px 7px', marginRight: 6 }}>{cat.label}</span>
                    {exp.member} · {formatDate(exp.date)}
                    {exp.note && <span> · {exp.note}</span>}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 17, flexShrink: 0 }}>
                  ${exp.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => { setEditing(exp); setShowForm(true) }}>✏️</button>
                  <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: 12 }} onClick={() => onRemove(exp.id)}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <ExpenseForm
          members={members}
          categories={categories}
          initial={{ ...editing, amount: String(editing.amount) }}
          onAdd={updated => onEdit({ ...updated, id: editing.id })}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

function formatDate(d) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}
