import { useState } from 'react'
import EntryForm from './EntryForm'
import ExportButton from './ExportButton'

const INCOME_CATS = [
  { id: 'sueldo',        label: 'Sueldo',           emoji: '💼', color: '#30d158' },
  { id: 'freelance',     label: 'Freelance',         emoji: '💻', color: '#30d158' },
  { id: 'alquiler',      label: 'Alquiler cobrado',  emoji: '🏘️', color: '#30d158' },
  { id: 'transferencia', label: 'Transferencia',     emoji: '💸', color: '#30d158' },
  { id: 'otro_ing',      label: 'Otro',              emoji: '📥', color: '#30d158' },
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

  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date))
  const total  = filtered.reduce((s, e) => s + e.amount, 0)
  const isInc  = type === 'income'

  function getCat(id) {
    return cats.find(c => c.id === id) || cats[cats.length - 1]
  }

  return (
    <div>
      {/* Filter bar */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center',
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '10px 14px',
      }}>
        <select value={filter.member} onChange={e => setFilter(f => ({ ...f, member: e.target.value }))} style={{ width: 'auto', flex: '1 1 100px' }}>
          {allMembers.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filter.category} onChange={e => setFilter(f => ({ ...f, category: e.target.value }))} style={{ width: 'auto', flex: '1 1 150px' }}>
          <option value="todas">Todas las categorías</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </select>
        <input type="month" value={filter.month} onChange={e => setFilter(f => ({ ...f, month: e.target.value }))} style={{ width: 'auto', flex: '1 1 120px' }} />
        <ExportButton entries={filtered} categories={cats} />
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
          {filtered.length} · <strong style={{ color: isInc ? 'var(--green)' : 'rgba(255,255,255,0.9)' }}>
            {isInc ? '+' : ''}${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </strong>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '72px 0', color: 'rgba(255,255,255,0.22)' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>{isInc ? '💰' : '💸'}</div>
          <div style={{ fontSize: 14 }}>No hay {isInc ? 'ingresos' : 'gastos'} registrados</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {sorted.map(entry => {
            const cat = getCat(entry.category)
            const entryIsInc = entry.type === 'income'
            const accentColor = entryIsInc ? '#30d158' : cat.color

            return (
              <div key={entry.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', borderRadius: 17 }}>
                {/* Icon */}
                <div style={{
                  width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                  background: `${accentColor}18`, border: `1px solid ${accentColor}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>{cat.emoji}</div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>
                    {entry.description}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 3, display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{
                      background: `${accentColor}18`, color: accentColor,
                      borderRadius: 5, padding: '1px 6px', fontSize: 10, fontWeight: 600,
                      border: `1px solid ${accentColor}30`,
                    }}>{cat.label}</span>
                    <span>{entry.member}</span>
                    <span>·</span>
                    <span>{formatDate(entry.date)}</span>
                    {entry.note && <><span>·</span><span style={{ fontStyle: 'italic' }}>{entry.note}</span></>}
                  </div>
                </div>

                {/* Amount */}
                <div style={{ fontWeight: 750, fontSize: 16, flexShrink: 0, letterSpacing: '-0.02em', color: entryIsInc ? 'var(--green)' : 'rgba(255,255,255,0.95)', fontVariantNumeric: 'tabular-nums' }}>
                  {entryIsInc ? '+' : ''}${entry.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 5, flexShrink: 0, alignItems: 'center' }}>
                  {entry.receipt_url && (
                    <a href={entry.receipt_url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                      <img src={entry.receipt_url} alt="ticket" style={{ width: 34, height: 34, objectFit: 'cover', borderRadius: 9, border: '1px solid rgba(255,255,255,0.12)', display: 'block' }} />
                    </a>
                  )}
                  <button className="btn btn-ghost" style={{ padding: '5px 9px', fontSize: 13, borderRadius: 9 }} onClick={() => setEditing(entry)}>✏️</button>
                  <button className="btn btn-danger" style={{ padding: '5px 9px', fontSize: 13, borderRadius: 9 }} onClick={() => onRemove(entry.id)}>✕</button>
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
