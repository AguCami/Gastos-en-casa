import { useState } from 'react'

const today = () => new Date().toISOString().slice(0, 10)

const INCOME_CATS = [
  { id: 'sueldo', label: 'Sueldo', emoji: '💼' },
  { id: 'freelance', label: 'Freelance', emoji: '💻' },
  { id: 'alquiler', label: 'Alquiler cobrado', emoji: '🏘️' },
  { id: 'transferencia', label: 'Transferencia', emoji: '💸' },
  { id: 'otro_ing', label: 'Otro', emoji: '📥' },
]

export default function EntryForm({ type, members, expenseCats, onAdd, onClose, initial }) {
  const cats = type === 'expense' ? expenseCats : INCOME_CATS
  const [form, setForm] = useState(initial || {
    description: '',
    amount: '',
    category: cats[0].id,
    member: members[0] || '',
    date: today(),
    note: '',
  })

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function submit(e) {
    e.preventDefault()
    if (!form.description.trim() || !form.amount || isNaN(Number(form.amount))) return
    onAdd({ ...form, amount: parseFloat(form.amount), type })
    onClose()
  }

  const isExpense = type === 'expense'

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={sheet}>
        <div style={handle} />
        <h3 style={title}>{initial ? 'Editar' : (isExpense ? 'Nuevo gasto' : 'Nuevo ingreso')}</h3>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Descripción">
            <input value={form.description} onChange={e => set('description', e.target.value)}
              placeholder={isExpense ? 'Ej: Supermercado' : 'Ej: Sueldo de junio'} required />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Monto ($)">
              <input type="number" step="0.01" min="0" value={form.amount}
                onChange={e => set('amount', e.target.value)} placeholder="0.00" required />
            </Field>
            <Field label="Fecha">
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Categoría">
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {cats.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select>
            </Field>
            <Field label="Miembro">
              <select value={form.member} onChange={e => set('member', e.target.value)}>
                {members.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Nota (opcional)">
            <input value={form.note} onChange={e => set('note', e.target.value)} placeholder="Comentario adicional" />
          </Field>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, background: isExpense ? undefined : 'rgba(52,208,88,0.85)' }}>
              {initial ? 'Guardar' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,10,0.65)',
  backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  padding: '0 12px 24px', zIndex: 100,
}
const sheet = {
  width: '100%', maxWidth: 480,
  background: 'rgba(12,22,50,0.72)',
  backdropFilter: 'blur(52px) saturate(220%)',
  WebkitBackdropFilter: 'blur(52px) saturate(220%)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 28, padding: 28,
  boxShadow: '0 24px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.22)',
}
const handle = { width: 36, height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 2, margin: '0 auto 20px' }
const title  = { fontWeight: 700, fontSize: 20, marginBottom: 22, letterSpacing: '-0.02em' }
