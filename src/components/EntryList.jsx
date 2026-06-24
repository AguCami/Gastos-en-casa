import { useState } from 'react'
import EntryForm from './EntryForm'

const INCOME_CATS = [
  { id: 'sueldo', label: 'Sueldo', emoji: '💼', color: '#34d058' },
  { id: 'freelance', label: 'Freelance', emoji: '💻', color: '#34d058' },
  { id: 'alquiler', label: 'Alquiler cobrado', emoji: '🏘️', color: '#34d058' },
  { id: 'transferencia', label: 'Transferencia', emoji: '💸', color: '#34d058' },
  { id: 'otro_ing', label: 'Otro', emoji: '📥', color: '#34d058' },
]

export default function EntryList({ type, entries, members, expenseCats, onRemove, onEdit }) {
  const [filter, setFilter] = useState({ member: 'Todos', category: 'todas', month: '' })
  const [editing, setEditing] = useState(null)

  const cats = type === 'expense' ? expenseCats : INCOME_CATS
  const allMembers = ['Todos', ...members]

  const filtered = entries.filter(e => {
    if (e.type !== type) return false
    if (filter.member !== 'Todos' && e.member !== filter.member) return false
    if (filter.category !== 'todas' && e.category !== filter.category) return false
    if (filter.month && !e.date?.startsWith(filter.month)) return false
    return true
  })

  const total = filtered.reduce((s, e) => s + e.amount, 0)

  function getCat(id) {
    return cats.find(c => c.id === id) || cats[cats.length - 1]
  }

  return (
    <div>
      {/* Filters */}
      <div style={filterBar}>
        <select value={filter.member} onChange={e => setFilter(f => ({ ...f, member: e.target.value }))} style={{ width: 'auto', flex: '1 1 110px' }}>
          {allMembers.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))} style={{ width: 'auto', flex: '1 1 160px' }}>
          <option value="todas">Todas las categorías</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </select>
        <input type="month" value={filter.month} onChange={e => setFilter(f => ({ ...f, month: e.target.value }))} style={{ width: 'auto', flex: '1 1 130px' }} />
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {filtered.length} · <strong style={{ color: type === 'income' ? '#34d058' : '#fff' }}>
            {type === 'income' ? '+' : ''}${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </strong>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.35)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{type === 'income' ? '💰' : '💸'}</div>
          <div>No hay {type === 'income' ? 'ingresos' : 'gastos'} registrados</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(entry => {
            const cat = getCat(entry.category)
            const isIncome = entry.type === 'income'
            return (
              <div key={entry.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 18 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                  background: isIncome ? 'rgba(52,208,88,0.15)' : `linear-gradient(135deg, ${cat.color}55, ${cat.color}22)`,
                  border: isIncome ? '1px solid rgba(52,208,88,0.3)' : `1px solid ${cat.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>
                  {cat.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {entry.description}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ background: isIncome ? 'rgba(52,208,88,0.15)' : `${cat.color}25`, color: isIncome ? '#34d058' : cat.color, borderRadius: 6, padding: '1px 7px', border: `1px solid ${isIncome ? 'rgba(52,208,88,0.3)' : cat.color + '40'}` }}>{cat.label}</span>
                    <span>{entry.member}</span>
                    <span>·</span>
                    <span>{formatDate(entry.date)}</span>
                    {entry.note && <><span>·</span><span>{entry.note}</span></>}
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 17, flexShrink: 0, letterSpacing: '-0.02em', color: isIncome ? '#34d058' : '#fff' }}>
                  {isIncome ? '+' : ''}${entry.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 13, borderRadius: 10 }} onClick={() => setEditing(entry)}>✏️</button>
                  <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: 13, borderRadius: 10 }} onClick={() => onRemove(entry.id)}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing && (
        <EntryForm
          type={editing.type}
          members={members}
          expenseCats={expenseCats}
          initial={{ ...editing, amount: String(editing.amount) }}
          onAdd={updated => onEdit({ ...updated, id: editing.id })}
          onClose={() => setEditing(null)}
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

const filterBar = {
  display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center',
  background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '10px 14px',
}
