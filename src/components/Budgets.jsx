import { useState } from 'react'

export default function Budgets({ expenses, categories, budgets, setBudget }) {
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [editing, setEditing] = useState(null)  // catId being edited
  const [draft, setDraft] = useState('')

  const monthExp = expenses.filter(e => e.date?.startsWith(thisMonth))

  function saveEdit(catId) {
    const val = parseFloat(draft)
    if (!isNaN(val) && val > 0) setBudget(catId, val)
    else if (draft === '' || val === 0) setBudget(catId, 0)
    setEditing(null)
    setDraft('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>
        Establecé un límite mensual por categoría. Hacé clic en el monto para editarlo.
      </p>
      {categories.map(cat => {
        const spent = monthExp.filter(e => e.category === cat.id).reduce((s, e) => s + e.amount, 0)
        const budget = budgets[cat.id] || 0
        const pct = budget > 0 ? Math.min(spent / budget, 1) : 0
        const over = budget > 0 && spent > budget
        const warn = budget > 0 && pct >= 0.8 && !over

        return (
          <div key={cat.id} className="card" style={{ borderRadius: 20, padding: '16px 18px', border: over ? '1px solid rgba(255,69,58,0.4)' : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: budget > 0 ? 12 : 0 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: `linear-gradient(135deg, ${cat.color}55, ${cat.color}22)`,
                border: `1px solid ${cat.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>{cat.emoji}</div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{cat.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                  Gastado: <span style={{ color: over ? '#ff453a' : warn ? '#ffd60a' : '#fff', fontWeight: 600 }}>
                    ${spent.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Budget amount */}
              {editing === cat.id ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    type="number" min="0" step="100"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(cat.id); if (e.key === 'Escape') { setEditing(null); setDraft('') } }}
                    autoFocus
                    style={{ width: 110, textAlign: 'right' }}
                    placeholder="0"
                  />
                  <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => saveEdit(cat.id)}>OK</button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditing(cat.id); setDraft(budget > 0 ? String(budget) : '') }}
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 10, padding: '6px 14px', color: budget > 0 ? '#fff' : 'rgba(255,255,255,0.35)',
                    fontSize: 14, fontWeight: budget > 0 ? 600 : 400,
                  }}
                >
                  {budget > 0 ? `$${budget.toLocaleString('es-AR')}` : '+ Límite'}
                </button>
              )}

              {over && <span style={{ fontSize: 18 }}>🔴</span>}
              {warn && <span style={{ fontSize: 18 }}>🟡</span>}
            </div>

            {/* Progress bar */}
            {budget > 0 && (
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  width: `${pct * 100}%`,
                  height: '100%',
                  borderRadius: 3,
                  background: over
                    ? 'linear-gradient(90deg, #ff453a, #ff6b6b)'
                    : warn
                    ? 'linear-gradient(90deg, #ffd60a, #ff9f0a)'
                    : `linear-gradient(90deg, ${cat.color}, ${cat.color}aa)`,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            )}
            {budget > 0 && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 6, textAlign: 'right' }}>
                {over
                  ? `Excedido por $${(spent - budget).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                  : `Disponible: $${(budget - spent).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                }
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
