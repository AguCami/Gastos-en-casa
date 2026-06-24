import { useState } from 'react'

const AVATARS = ['👤', '👩', '👨', '👧', '👦', '🧑', '👴', '👵', '🧔', '👩‍🦱']

export default function Members({ members, expenses, onAdd, onRemove }) {
  const [name, setName] = useState('')

  function submit(e) {
    e.preventDefault()
    onAdd(name)
    setName('')
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <form onSubmit={submit} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del miembro" />
        <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>Agregar</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {members.filter(m => m !== 'Todos').map((m, i) => {
          const total = expenses.filter(e => e.member === m).reduce((s, e) => s + e.amount, 0)
          const count = expenses.filter(e => e.member === m).length
          return (
            <div key={m} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                {AVATARS[i % AVATARS.length]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{m}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                  {count} gastos · ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <button
                className="btn btn-danger"
                style={{ padding: '5px 12px', fontSize: 12 }}
                onClick={() => {
                  if (window.confirm(`¿Eliminar a ${m}? Se borrarán todos sus gastos.`)) onRemove(m)
                }}
              >
                Eliminar
              </button>
            </div>
          )
        })}
      </div>

      {members.filter(m => m !== 'Todos').length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text2)', padding: 40 }}>
          No hay miembros. ¡Agrega uno para empezar!
        </div>
      )}
    </div>
  )
}
