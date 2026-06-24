import { useState } from 'react'

const today = () => new Date().toISOString().slice(0, 10)

export default function ExpenseForm({ members, categories, onAdd, onClose, initial }) {
  const [form, setForm] = useState(initial || {
    description: '',
    amount: '',
    category: 'comida',
    member: members.find(m => m !== 'Todos') || members[0],
    date: today(),
    note: '',
  })

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function submit(e) {
    e.preventDefault()
    if (!form.description.trim() || !form.amount || isNaN(Number(form.amount))) return
    onAdd({ ...form, amount: parseFloat(form.amount) })
    onClose()
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        width: '100%',
        maxWidth: 460,
        background: 'rgba(20,30,60,0.65)',
        backdropFilter: 'blur(48px) saturate(200%)',
        WebkitBackdropFilter: 'blur(48px) saturate(200%)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 28,
        padding: 28,
        boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.25)',
      }}>
        {/* Handle bar */}
        <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 2, margin: '0 auto 20px' }} />

        <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 22, letterSpacing: '-0.02em' }}>
          {initial ? 'Editar gasto' : 'Nuevo gasto'}
        </h3>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Descripción">
            <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Ej: Supermercado" required />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Monto ($)">
              <input type="number" step="0.01" min="0" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" required />
            </Field>
            <Field label="Fecha">
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Categoría">
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select>
            </Field>
            <Field label="Miembro">
              <select value={form.member} onChange={e => set('member', e.target.value)}>
                {members.filter(m => m !== 'Todos').map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Nota (opcional)">
            <input value={form.note} onChange={e => set('note', e.target.value)} placeholder="Comentario adicional" />
          </Field>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
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
      <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,10,0.6)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  padding: '0 12px 24px',
  zIndex: 100,
}
