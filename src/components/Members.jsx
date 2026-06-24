import { useState } from 'react'

const AVATARS = ['👤', '👩', '👨', '👧', '👦', '🧑', '👴', '👵', '🧔', '👩‍🦱']
const COLORS = ['#4f8ef7', '#34d058', '#ff9f0a', '#ff453a', '#bf5af2', '#64d2ff', '#ff6b6b', '#ffd60a']

export default function Members({ members, expenses, onAdd, onRemove }) {
  const [name, setName] = useState('')

  function submit(e) {
    e.preventDefault()
    onAdd(name)
    setName('')
  }

  const realMembers = members.filter(m => m !== 'Todos')

  return (
    <div style={{ maxWidth: 520 }}>
      {/* Add form */}
      <div style={{
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 20,
        padding: '16px 16px',
        marginBottom: 16,
      }}>
        <form onSubmit={submit} style={{ display: 'flex', gap: 10 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del miembro del hogar" />
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>Agregar</button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {realMembers.map((m, i) => {
          const total = expenses.filter(e => e.member === m).reduce((s, e) => s + e.amount, 0)
          const count = expenses.filter(e => e.member === m).length
          const color = COLORS[i % COLORS.length]
          return (
            <div key={m} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, borderRadius: 20, padding: '14px 18px' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                background: `linear-gradient(135deg, ${color}44, ${color}22)`,
                border: `1px solid ${color}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
              }}>
                {AVATARS[i % AVATARS.length]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{m}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>
                  {count} {count === 1 ? 'gasto' : 'gastos'} · <span style={{ color }}>${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <button
                className="btn btn-danger"
                style={{ padding: '6px 14px', fontSize: 13, borderRadius: 10 }}
                onClick={() => {
                  if (window.confirm(`¿Eliminar a ${m}? Se borrarán todos sus gastos.`)) onRemove(m)
                }}
              >Eliminar</button>
            </div>
          )
        })}
      </div>

      {realMembers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.35)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <div>Agregá a los integrantes del hogar</div>
        </div>
      )}
    </div>
  )
}
