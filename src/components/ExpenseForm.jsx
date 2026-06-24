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
    <div style={overlay}>
      <div className="card" style={{ width: '100%', maxWidth: 460, position: 'relative' }}>
        <h3 style={{ marginBottom: 20, fontWeight: 700 }}>{initial ? 'Editar gasto' : 'Nuevo gasto'}</h3>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={lbl}>Descripción</label>
            <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Ej: Supermercado" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Monto ($)</label>
              <input type="number" step="0.01" min="0" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0.00" required />
            </div>
            <div>
              <label style={lbl}>Fecha</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Categoría</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Miembro</label>
              <select value={form.member} onChange={e => set('member', e.target.value)}>
                {members.filter(m => m !== 'Todos').map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={lbl}>Nota (opcional)</label>
            <input value={form.note} onChange={e => set('note', e.target.value)} placeholder="Comentario adicional" />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{initial ? 'Guardar' : 'Agregar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0, background: '#00000088',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 16, zIndex: 100,
}

const lbl = { display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 6, fontWeight: 500 }
