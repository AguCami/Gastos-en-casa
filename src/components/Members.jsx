import { useState } from 'react'

const COLORS = ['#5a8fff','#30d158','#ff9f0a','#ff453a','#bf5af2','#40c8e0','#f670c7','#ffd60a']
const AVATARS = ['👤','👩','👨','👧','👦','🧑','👴','👵','🧔','👩‍🦱']

export default function Members({ members, expenses, onAdd, onRemove }) {
  const [name, setName] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name)
    setName('')
  }

  const real = members.filter(m => m !== 'Todos')

  return (
    <div style={{ maxWidth: 520 }}>
      {/* Add form */}
      <div style={{
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '14px 16px', marginBottom: 14,
      }}>
        <form onSubmit={submit} style={{ display: 'flex', gap: 10 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del integrante" style={{ flex: 1 }} />
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Agregar</button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {real.map((m, i) => {
          const total = expenses.filter(e => e.member === m).reduce((s, e) => s + e.amount, 0)
          const count = expenses.filter(e => e.member === m).length
          const color = COLORS[i % COLORS.length]
          return (
            <div key={m} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 18 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: `${color}18`, border: `1px solid ${color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>
                {AVATARS[i % AVATARS.length]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 650, fontSize: 15, letterSpacing: '-0.01em' }}>{m}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>
                  {count} {count === 1 ? 'gasto' : 'gastos'} ·{' '}
                  <span style={{ color, fontWeight: 600 }}>${total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
                </div>
              </div>
              <button
                className="btn btn-danger"
                style={{ padding: '5px 13px', fontSize: 12, borderRadius: 9 }}
                onClick={() => window.confirm(`¿Eliminar a ${m}? Se borrarán todos sus gastos.`) && onRemove(m)}
              >Eliminar</button>
            </div>
          )
        })}
      </div>

      {real.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.25)' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>👥</div>
          <div style={{ fontSize: 14 }}>Agregá a los integrantes del hogar</div>
        </div>
      )}
    </div>
  )
}
