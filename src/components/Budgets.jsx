import { useState } from 'react'

export default function Budgets({ expenses, categories, budgets, setBudget }) {
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [editing, setEditing] = useState(null)
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 4 }}>
        Establecé un límite mensual por categoría. Tocá el monto para editarlo.
      </p>

      {categories.map(cat => {
        const spent  = monthExp.filter(e => e.category === cat.id).reduce((s, e) => s + e.amount, 0)
        const budget = budgets[cat.id] || 0
        const pct    = budget > 0 ? Math.min(spent / budget, 1) : 0
        const over   = budget > 0 && spent > budget
        const warn   = budget > 0 && pct >= 0.8 && !over
        const trackColor = over ? 'var(--red)' : warn ? 'var(--yellow)' : cat.color

        return (
          <div key={cat.id} className="card" style={{ borderRadius: 18, padding: '15px 18px', border: over ? `1px solid rgba(255,69,58,0.35)` : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: budget > 0 ? 12 : 0 }}>
              {/* Icon */}
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: `${cat.color}18`, border: `1px solid ${cat.color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19,
              }}>{cat.emoji}</div>

              {/* Label + spent */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 650, fontSize: 14, letterSpacing: '-0.01em' }}>{cat.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>
                  Gastado:{' '}
                  <span style={{ color: over ? 'var(--red)' : warn ? 'var(--yellow)' : 'rgba(255,255,255,0.75)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    ${spent.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              {/* Budget input / button */}
              {editing === cat.id ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    type="number" min="0" step="100" value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(cat.id); if (e.key === 'Escape') { setEditing(null); setDraft('') } }}
                    autoFocus
                    style={{ width: 100, textAlign: 'right' }}
                    placeholder="0"
                  />
                  <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => saveEdit(cat.id)}>OK</button>
                </div>
              ) : (
                <button
                  onClick={() => { setEditing(cat.id); setDraft(budget > 0 ? String(budget) : '') }}
                  style={{
                    background: budget > 0 ? `${trackColor}18` : 'rgba(255,255,255,0.07)',
                    border: `1px solid ${budget > 0 ? trackColor + '35' : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: 10, padding: '6px 13px',
                    color: budget > 0 ? trackColor : 'rgba(255,255,255,0.35)',
                    fontSize: 13, fontWeight: budget > 0 ? 700 : 400,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {budget > 0 ? `$${budget.toLocaleString('es-AR')}` : '+ Límite'}
                </button>
              )}
            </div>

            {/* Progress bar */}
            {budget > 0 && (
              <>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct * 100}%`, height: '100%', borderRadius: 3,
                    background: `linear-gradient(90deg, ${trackColor}, ${trackColor}cc)`,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {over
                    ? <span style={{ color: 'var(--red)' }}>Excedido por ${(spent - budget).toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
                    : `Disponible: $${(budget - spent).toLocaleString('es-AR', { minimumFractionDigits: 0 })}`
                  }
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
