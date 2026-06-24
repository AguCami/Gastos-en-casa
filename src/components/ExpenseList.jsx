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
      {/* Filter bar */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center',
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: '10px 14px',
      }}>
        <select value={filter.member} onChange={e => setFilter(f => ({ ...f, member: e.target.value }))} style={{ width: 'auto', flex: '1 1 120px' }}>
          {members.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))} style={{ width: 'auto', flex: '1 1 160px' }}>
          <option value="todas">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </select>
        <input type="month" value={filter.month} onChange={e => setFilter(f => ({ ...f, month: e.target.value }))} style={{ width: 'auto', flex: '1 1 140px' }} />
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
          {filtered.length} · <strong style={{ color: '#fff' }}>${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.35)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💸</div>
          <div style={{ fontSize: 16 }}>No hay gastos registrados</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(exp => {
            const cat = getCat(exp.category)
            return (
              <div
                key={exp.id}
                className="card"
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px',
                  borderRadius: 18,
                }}
              >
                {/* Category icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                  background: `linear-gradient(135deg, ${cat.color}55, ${cat.color}22)`,
                  border: `1px solid ${cat.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                  backdropFilter: 'blur(8px)',
                }}>
                  {cat.emoji}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {exp.description}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      background: `${cat.color}25`,
                      color: cat.color,
                      borderRadius: 6, padding: '1px 7px',
                      border: `1px solid ${cat.color}40`,
                    }}>{cat.label}</span>
                    <span>{exp.member}</span>
                    <span>·</span>
                    <span>{formatDate(exp.date)}</span>
                    {exp.note && <><span>·</span><span>{exp.note}</span></>}
                  </div>
                </div>

                <div style={{ fontWeight: 700, fontSize: 17, flexShrink: 0, letterSpacing: '-0.02em' }}>
                  ${exp.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: '6px 10px', fontSize: 13, borderRadius: 10 }}
                    onClick={() => { setEditing(exp); setShowForm(true) }}
                  >✏️</button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '6px 10px', fontSize: 13, borderRadius: 10 }}
                    onClick={() => onRemove(exp.id)}
                  >✕</button>
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
