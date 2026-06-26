import { useState } from 'react'

const INCOME_CATS = [
  { id: 'sueldo', label: 'Sueldo', emoji: '💼' },
  { id: 'freelance', label: 'Freelance', emoji: '💻' },
  { id: 'alquiler', label: 'Alquiler cobrado', emoji: '🏘️' },
  { id: 'transferencia', label: 'Transferencia', emoji: '💸' },
  { id: 'otro_ing', label: 'Otro', emoji: '📥' },
]

export default function Recurring({ recurring, members, categories, onAdd, onRemove, onToggle, onAddEntry }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    description: '', amount: '', category: 'hogar', member: members[0] || '',
    day_of_month: '1', type: 'expense',
  })

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    await onAdd({ ...form, amount: parseFloat(form.amount), day_of_month: parseInt(form.day_of_month) })
    setShowForm(false)
    setForm({ description: '', amount: '', category: 'hogar', member: members[0] || '', day_of_month: '1', type: 'expense' })
  }

  // Detect which recurring items haven't been added this month
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const allCats = [...categories, ...INCOME_CATS]
  function getCat(r) { return allCats.find(c => c.id === r.category) || categories[categories.length - 1] }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
          Gastos e ingresos que se repiten todos los meses
        </p>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Agregar</button>
      </div>

      {recurring.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.35)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔄</div>
          <div>No tenés movimientos recurrentes</div>
        </div>
      )}

      {recurring.map(item => {
        const cat = getCat(item)
        const isIncome = item.type === 'income'
        return (
          <div key={item.id} className="card" style={{ borderRadius: 20, padding: '14px 18px', opacity: item.active ? 1 : 0.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: isIncome ? 'rgba(52,208,88,0.15)' : `${cat.color}22`,
                border: isIncome ? '1px solid rgba(52,208,88,0.3)' : `1px solid ${cat.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>{cat.emoji}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{item.description}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                  {item.member} · día {item.day_of_month} de cada mes · {cat.label}
                </div>
              </div>

              <div style={{ fontWeight: 700, fontSize: 16, flexShrink: 0, color: isIncome ? '#34d058' : '#fff' }}>
                {isIncome ? '+' : ''}${item.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </div>

              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {/* Registrar ahora */}
                <button
                  className="btn btn-ghost"
                  style={{ padding: '6px 10px', fontSize: 12, borderRadius: 10 }}
                  title="Registrar este mes"
                  onClick={() => onAddEntry({
                    type: item.type,
                    description: item.description,
                    amount: item.amount,
                    category: item.category,
                    member: item.member,
                    date: `${thisMonth}-${String(item.day_of_month).padStart(2,'0')}`,
                    note: 'Recurrente',
                  })}
                >📥</button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '6px 10px', fontSize: 12, borderRadius: 10 }}
                  onClick={() => onToggle(item.id, !item.active)}
                >{item.active ? '⏸' : '▶️'}</button>
                <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: 12, borderRadius: 10 }} onClick={() => onRemove(item.id)}>✕</button>
              </div>
            </div>
          </div>
        )
      })}

      {showForm && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={sheet}>
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 2, margin: '0 auto 20px' }} />
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Nuevo movimiento recurrente</h3>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Type toggle */}
              <div style={toggle}>
                {(['expense','income']).map(t => (
                  <button key={t} type="button" onClick={() => set('type', t)} style={{
                    flex: 1, padding: '8px', borderRadius: 10, fontSize: 13, fontWeight: form.type === t ? 600 : 400,
                    background: form.type === t ? (t === 'expense' ? 'rgba(255,69,58,0.3)' : 'rgba(52,208,88,0.3)') : 'transparent',
                    color: form.type === t ? (t === 'expense' ? '#ff453a' : '#34d058') : 'rgba(255,255,255,0.45)',
                    border: form.type === t ? `1px solid ${t === 'expense' ? 'rgba(255,69,58,0.4)' : 'rgba(52,208,88,0.4)'}` : '1px solid transparent',
                    transition: 'all 0.18s',
                  }}>
                    {t === 'expense' ? '💸 Gasto' : '💰 Ingreso'}
                  </button>
                ))}
              </div>

              <Field label="Descripción">
                <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Ej: Alquiler" required />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Monto ($)">
                  <input type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" required />
                </Field>
                <Field label="Día del mes">
                  <input type="number" min="1" max="28" value={form.day_of_month} onChange={e => set('day_of_month', e.target.value)} />
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Categoría">
                  <select value={form.category} onChange={e => set('category', e.target.value)}>
                    {(form.type === 'expense' ? categories : INCOME_CATS).map(c => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Miembro">
                  <select value={form.member} onChange={e => set('member', e.target.value)}>
                    {members.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </Field>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
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
const toggle = {
  display: 'flex', background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 4, gap: 4,
}
