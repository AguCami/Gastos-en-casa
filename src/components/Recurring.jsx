import { useState } from 'react'

const INCOME_CATS = [
  { id: 'sueldo',        label: 'Sueldo',          emoji: '💼' },
  { id: 'freelance',     label: 'Freelance',        emoji: '💻' },
  { id: 'alquiler',      label: 'Alquiler cobrado', emoji: '🏘️' },
  { id: 'transferencia', label: 'Transferencia',    emoji: '💸' },
  { id: 'otro_ing',      label: 'Otro',             emoji: '📥' },
]

export default function Recurring({ recurring, members, categories, onAdd, onRemove, onToggle, onAddEntry }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    description: '', amount: '', category: 'hogar', member: members[0] || '', day_of_month: '1', type: 'expense',
  })

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    await onAdd({ ...form, amount: parseFloat(form.amount), day_of_month: parseInt(form.day_of_month) })
    setShowForm(false)
    setForm({ description: '', amount: '', category: 'hogar', member: members[0] || '', day_of_month: '1', type: 'expense' })
  }

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const allCats = [...categories, ...INCOME_CATS]
  function getCat(r) { return allCats.find(c => c.id === r.category) || categories[categories.length - 1] }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>
          Gastos e ingresos que se repiten todos los meses
        </p>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Agregar</button>
      </div>

      {recurring.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.22)' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🔄</div>
          <div style={{ fontSize: 14 }}>No tenés movimientos recurrentes</div>
        </div>
      )}

      {recurring.map(item => {
        const cat = getCat(item)
        const isIncome = item.type === 'income'
        const accentColor = isIncome ? '#30d158' : (cat.color || '#5a8fff')

        return (
          <div key={item.id} className="card" style={{ borderRadius: 18, padding: '14px 17px', opacity: item.active ? 1 : 0.45, transition: 'opacity 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                background: `${accentColor}18`, border: `1px solid ${accentColor}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>{cat.emoji}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 650, fontSize: 14, letterSpacing: '-0.01em' }}>{item.description}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>
                  {item.member} · día {item.day_of_month} · {cat.label}
                  {!item.active && <span style={{ marginLeft: 6, color: 'var(--yellow)', fontWeight: 600 }}>· Pausado</span>}
                </div>
              </div>

              <div style={{ fontWeight: 750, fontSize: 15, flexShrink: 0, color: isIncome ? 'var(--green)' : 'rgba(255,255,255,0.9)', fontVariantNumeric: 'tabular-nums' }}>
                {isIncome ? '+' : ''}${item.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </div>

              <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '5px 9px', fontSize: 12, borderRadius: 9 }}
                  title="Registrar este mes"
                  onClick={() => onAddEntry({
                    type: item.type, description: item.description,
                    amount: item.amount, category: item.category,
                    member: item.member, note: 'Recurrente',
                    date: `${thisMonth}-${String(item.day_of_month).padStart(2,'0')}`,
                  })}
                >📥</button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '5px 9px', fontSize: 12, borderRadius: 9 }}
                  title={item.active ? 'Pausar' : 'Reanudar'}
                  onClick={() => onToggle(item.id, !item.active)}
                >{item.active ? '⏸' : '▶️'}</button>
                <button className="btn btn-danger" style={{ padding: '5px 9px', fontSize: 12, borderRadius: 9 }} onClick={() => onRemove(item.id)}>✕</button>
              </div>
            </div>
          </div>
        )
      })}

      {/* Modal */}
      {showForm && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={sheet}>
            <div style={handle} />
            <h3 style={{ fontWeight: 700, fontSize: 19, marginBottom: 22, letterSpacing: '-0.02em' }}>Nuevo movimiento recurrente</h3>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Type toggle */}
              <div style={toggle}>
                {(['expense', 'income']).map(t => (
                  <button key={t} type="button" onClick={() => set('type', t)} style={{
                    flex: 1, padding: '8px', borderRadius: 10, fontSize: 13, fontWeight: form.type === t ? 600 : 400,
                    background: form.type === t ? (t === 'expense' ? 'rgba(255,69,58,0.25)' : 'rgba(48,209,88,0.25)') : 'transparent',
                    color: form.type === t ? (t === 'expense' ? 'var(--red)' : 'var(--green)') : 'rgba(255,255,255,0.42)',
                    border: form.type === t ? `1px solid ${t === 'expense' ? 'rgba(255,69,58,0.4)' : 'rgba(48,209,88,0.4)'}` : '1px solid transparent',
                    transition: 'all 0.18s',
                  }}>
                    {t === 'expense' ? '💸 Gasto' : '💰 Ingreso'}
                  </button>
                ))}
              </div>

              <div>
                <label className="label">Descripción</label>
                <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Ej: Alquiler" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Monto ($)</label>
                  <input type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" required />
                </div>
                <div>
                  <label className="label">Día del mes</label>
                  <input type="number" min="1" max="28" value={form.day_of_month} onChange={e => set('day_of_month', e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Categoría</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)}>
                    {(form.type === 'expense' ? categories : INCOME_CATS).map(c => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Miembro</label>
                  <select value={form.member} onChange={e => set('member', e.target.value)}>
                    {members.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Guardar</button>
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
const toggle = {
  display: 'flex', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 4, gap: 4,
}
