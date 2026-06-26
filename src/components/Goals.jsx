import { useState } from 'react'

const EMOJIS = ['🎯','🏖️','🚗','🏠','💍','✈️','📱','🎓','👶','💊','🛋️','🎮']

export default function Goals({ goals, onAdd, onUpdate, onRemove }) {
  const [showForm, setShowForm] = useState(false)
  const [adding,   setAdding]   = useState(false)
  const [deposit,  setDeposit]  = useState({})

  async function handleAdd(e) {
    e.preventDefault()
    const fd = new FormData(e.target)
    setAdding(true)
    await onAdd({
      name: fd.get('name'), emoji: fd.get('emoji'),
      target_amount: parseFloat(fd.get('target')),
      saved_amount: 0,
      deadline: fd.get('deadline') || null,
    })
    setAdding(false)
    setShowForm(false)
  }

  async function handleDeposit(goal) {
    const amount = parseFloat(deposit[goal.id] || 0)
    if (!amount || isNaN(amount)) return
    await onUpdate(goal.id, { saved_amount: Math.min(goal.saved_amount + amount, goal.target_amount) })
    setDeposit(d => ({ ...d, [goal.id]: '' }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Nueva meta</button>
      </div>

      {goals.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.22)' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🎯</div>
          <div style={{ fontSize: 14 }}>Todavía no tenés metas de ahorro</div>
        </div>
      )}

      {goals.map(goal => {
        const pct       = goal.target_amount > 0 ? Math.min(goal.saved_amount / goal.target_amount, 1) : 0
        const done      = pct >= 1
        const remaining = goal.target_amount - goal.saved_amount
        const daysLeft  = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / 86400000) : null

        return (
          <div key={goal.id} className="card" style={{
            borderRadius: 20, padding: '20px 22px',
            borderTop: `2px solid ${done ? '#30d158' : 'rgba(255,255,255,0.08)'}`,
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
              <div style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>{goal.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>{goal.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 3 }}>
                  Meta:{' '}
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    ${goal.target_amount.toLocaleString('es-AR')}
                  </span>
                  {goal.deadline && (
                    <span style={{ marginLeft: 8, color: daysLeft !== null && daysLeft < 30 ? 'var(--yellow)' : 'rgba(255,255,255,0.38)' }}>
                      · {daysLeft !== null && daysLeft > 0 ? `${daysLeft} días` : 'Vencida'}
                    </span>
                  )}
                </div>
              </div>
              <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12, borderRadius: 8, flexShrink: 0 }} onClick={() => onRemove(goal.id)}>✕</button>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: done ? 0 : 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: done ? 'var(--green)' : 'rgba(255,255,255,0.7)', fontVariantNumeric: 'tabular-nums' }}>
                  ${goal.saved_amount.toLocaleString('es-AR')} ahorrado
                </span>
                <span style={{ color: 'rgba(255,255,255,0.38)' }}>
                  {done ? '¡Completado! 🎉' : `Faltan $${remaining.toLocaleString('es-AR')}`}
                </span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${pct * 100}%`, height: '100%', borderRadius: 4,
                  background: done
                    ? 'linear-gradient(90deg, #30d158, #22a845)'
                    : 'linear-gradient(90deg, #5a8fff, #7c6df7)',
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ textAlign: 'right', fontSize: 11, color: done ? 'var(--green)' : '#5a8fff', fontWeight: 700, marginTop: 5 }}>
                {(pct * 100).toFixed(0)}%
              </div>
            </div>

            {/* Deposit */}
            {!done && (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number" min="0" step="100"
                  value={deposit[goal.id] || ''}
                  onChange={e => setDeposit(d => ({ ...d, [goal.id]: e.target.value }))}
                  placeholder="Agregar ahorro..."
                  style={{ flex: 1 }}
                />
                <button
                  className="btn btn-primary"
                  style={{ flexShrink: 0, background: 'linear-gradient(135deg, #30d158, #22a845)', borderColor: 'rgba(255,255,255,0.2)' }}
                  onClick={() => handleDeposit(goal)}
                >
                  + Guardar
                </button>
              </div>
            )}
          </div>
        )
      })}

      {/* New goal modal */}
      {showForm && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={sheet}>
            <div style={handle} />
            <h3 style={{ fontWeight: 700, fontSize: 19, marginBottom: 22, letterSpacing: '-0.02em' }}>Nueva meta de ahorro</h3>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Emoji</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
                  {EMOJIS.map(em => (
                    <label key={em} style={{ cursor: 'pointer' }}>
                      <input type="radio" name="emoji" value={em} defaultChecked={em === '🎯'} style={{ display: 'none' }} />
                      <span style={{ fontSize: 28, lineHeight: 1, cursor: 'pointer', display: 'block' }}>{em}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Nombre de la meta</label>
                <input name="name" placeholder="Ej: Viaje a Europa" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Monto objetivo ($)</label>
                  <input name="target" type="number" min="1" step="100" placeholder="0" required />
                </div>
                <div>
                  <label className="label">Fecha límite (opcional)</label>
                  <input name="deadline" type="date" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={adding}>
                  {adding ? 'Guardando...' : 'Crear meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,10,0.7)',
  backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  padding: '0 12px 24px', zIndex: 100,
}
const sheet = {
  width: '100%', maxWidth: 480,
  background: 'rgba(10,18,40,0.88)', backdropFilter: 'blur(56px) saturate(220%)', WebkitBackdropFilter: 'blur(56px) saturate(220%)',
  border: '1px solid rgba(255,255,255,0.14)', borderRadius: 28, padding: 28,
  boxShadow: '0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.16)',
  maxHeight: '90vh', overflowY: 'auto',
}
const handle = { width: 36, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 22px' }
