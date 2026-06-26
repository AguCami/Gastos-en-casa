import { useState } from 'react'

const EMOJIS = ['🎯','🏖️','🚗','🏠','💍','✈️','📱','🎓','👶','💊','🛋️','🎮']

export default function Goals({ goals, onAdd, onUpdate, onRemove }) {
  const [showForm, setShowForm] = useState(false)
  const [adding, setAdding] = useState(false)
  const [deposit, setDeposit] = useState({})  // { goalId: amount }

  async function handleAdd(e) {
    e.preventDefault()
    const fd = new FormData(e.target)
    const goal = {
      name: fd.get('name'),
      emoji: fd.get('emoji'),
      target_amount: parseFloat(fd.get('target')),
      saved_amount: 0,
      deadline: fd.get('deadline') || null,
    }
    setAdding(true)
    await onAdd(goal)
    setAdding(false)
    setShowForm(false)
  }

  async function handleDeposit(goal) {
    const amount = parseFloat(deposit[goal.id] || 0)
    if (!amount || isNaN(amount)) return
    const newSaved = Math.min(goal.saved_amount + amount, goal.target_amount)
    await onUpdate(goal.id, { saved_amount: newSaved })
    setDeposit(d => ({ ...d, [goal.id]: '' }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Nueva meta</button>
      </div>

      {goals.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.35)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <div>Todavía no tenés metas de ahorro</div>
        </div>
      )}

      {goals.map(goal => {
        const pct = goal.target_amount > 0 ? Math.min(goal.saved_amount / goal.target_amount, 1) : 0
        const done = pct >= 1
        const remaining = goal.target_amount - goal.saved_amount
        const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / 86400000) : null

        return (
          <div key={goal.id} className="card" style={{ borderRadius: 22, padding: '20px 22px', borderTop: done ? '2px solid #34d058' : '2px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 36, lineHeight: 1 }}>{goal.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em' }}>{goal.name}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>
                  Meta: <span style={{ color: '#fff', fontWeight: 600 }}>${goal.target_amount.toLocaleString('es-AR')}</span>
                  {goal.deadline && (
                    <span style={{ marginLeft: 10, color: daysLeft < 30 ? '#ffd60a' : 'rgba(255,255,255,0.45)' }}>
                      · {daysLeft > 0 ? `${daysLeft} días` : 'Vencida'}
                    </span>
                  )}
                </div>
              </div>
              <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => onRemove(goal.id)}>✕</button>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: done ? '#34d058' : 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                  ${goal.saved_amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })} ahorrado
                </span>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {done ? '¡Completado! 🎉' : `Faltan $${remaining.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                </span>
              </div>
              <div style={{ height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{
                  width: `${pct * 100}%`, height: '100%', borderRadius: 5,
                  background: done
                    ? 'linear-gradient(90deg, #34d058, #22a845)'
                    : `linear-gradient(90deg, #4f8ef7, #5e5ce6)`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ textAlign: 'right', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
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
                <button className="btn btn-primary" style={{ flexShrink: 0, background: 'rgba(52,208,88,0.8)' }}
                  onClick={() => handleDeposit(goal)}>
                  + Guardar
                </button>
              </div>
            )}
          </div>
        )
      })}

      {/* Form modal */}
      {showForm && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={sheet}>
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 2, margin: '0 auto 20px' }} />
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Nueva meta de ahorro</h3>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Emoji">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {EMOJIS.map(em => (
                    <label key={em} style={{ cursor: 'pointer' }}>
                      <input type="radio" name="emoji" value={em} defaultChecked={em === '🎯'} style={{ display: 'none' }} />
                      <span style={{ fontSize: 28, lineHeight: 1, filter: 'grayscale(0.3)', cursor: 'pointer' }}>{em}</span>
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Nombre de la meta">
                <input name="name" placeholder="Ej: Viaje a Europa" required />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Monto objetivo ($)">
                  <input name="target" type="number" min="1" step="100" placeholder="0" required />
                </Field>
                <Field label="Fecha límite (opcional)">
                  <input name="deadline" type="date" />
                </Field>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
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

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</label>
      {children}
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,10,0.65)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 12px 24px', zIndex: 100,
}
const sheet = {
  width: '100%', maxWidth: 480,
  background: 'rgba(12,22,50,0.75)', backdropFilter: 'blur(52px) saturate(220%)', WebkitBackdropFilter: 'blur(52px) saturate(220%)',
  border: '1px solid rgba(255,255,255,0.2)', borderRadius: 28, padding: 28,
  boxShadow: '0 24px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.22)',
}
