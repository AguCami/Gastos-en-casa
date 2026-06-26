import { useState, useRef } from 'react'
import { supabase } from '../supabase'

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
    description: '', amount: '', category: cats[0].id,
    member: members[0] || '', date: today(), note: '', receipt_url: '',
  })
  const [cuotas, setCuotas] = useState(false)
  const [numCuotas, setNumCuotas] = useState('12')
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(initial?.receipt_url || null)
  const fileRef = useRef()

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `receipts/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('receipts').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('receipts').getPublicUrl(path)
      set('receipt_url', data.publicUrl)
      setPreview(data.publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.description.trim() || !form.amount || isNaN(Number(form.amount))) return
    const amount = parseFloat(form.amount)

    if (cuotas && type === 'expense' && !initial) {
      const n = Math.max(1, parseInt(numCuotas) || 1)
      const cuotaAmt = Math.round((amount / n) * 100) / 100
      const [y, m, d] = form.date.split('-').map(Number)
      for (let i = 0; i < n; i++) {
        const date = new Date(y, m - 1 + i, d)
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        await onAdd({
          ...form, amount: cuotaAmt, type,
          description: `${form.description} (${i + 1}/${n})`,
          date: dateStr,
          note: form.note || `Cuota ${i + 1} de ${n}`,
          receipt_url: i === 0 ? form.receipt_url : '',
        })
      }
    } else {
      await onAdd({ ...form, amount, type })
    }
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
              placeholder={isExpense ? 'Ej: TV Samsung' : 'Ej: Sueldo de junio'} required />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Monto total ($)">
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

          {/* Cuotas */}
          {isExpense && !initial && (
            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={cuotas} onChange={e => setCuotas(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#4f8ef7', cursor: 'pointer' }} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>💳 Compra en cuotas</span>
              </label>
              {cuotas && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>Número de cuotas</span>
                  <input type="number" min="2" max="72" value={numCuotas}
                    onChange={e => setNumCuotas(e.target.value)} style={{ width: 70, textAlign: 'center' }} />
                  {form.amount && numCuotas && (
                    <span style={{ fontSize: 13, color: '#4f8ef7', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      = ${(parseFloat(form.amount) / parseInt(numCuotas || 1)).toLocaleString('es-AR', { minimumFractionDigits: 2 })} / mes
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <Field label="Nota (opcional)">
            <input value={form.note} onChange={e => set('note', e.target.value)} placeholder="Comentario adicional" />
          </Field>

          {/* Receipt photo */}
          <div>
            <label style={lbl}>Foto del ticket (opcional)</label>
            <input ref={fileRef} type="file" accept="image/*" capture="environment"
              onChange={handleFile} style={{ display: 'none' }} />
            {preview ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={preview} alt="ticket" style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)' }} />
                <button type="button" onClick={() => { setPreview(null); set('receipt_url', '') }}
                  style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: '#fff', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current.click()}
                disabled={uploading}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12, fontSize: 14,
                  background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                {uploading ? '⏳ Subiendo...' : '📷 Agregar foto del ticket'}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, background: isExpense ? undefined : 'rgba(52,208,88,0.85)' }} disabled={uploading}>
              {initial ? 'Guardar' : cuotas ? `Crear ${numCuotas} cuotas` : 'Agregar'}
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
      <label style={lbl}>{label}</label>
      {children}
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,10,0.65)',
  backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
  padding: '0 12px 24px', zIndex: 100,
}
const sheet = {
  width: '100%', maxWidth: 480,
  background: 'rgba(12,22,50,0.72)', backdropFilter: 'blur(52px) saturate(220%)', WebkitBackdropFilter: 'blur(52px) saturate(220%)',
  border: '1px solid rgba(255,255,255,0.2)', borderRadius: 28, padding: 28,
  boxShadow: '0 24px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.22)',
  maxHeight: '90vh', overflowY: 'auto',
}
const handle = { width: 36, height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 2, margin: '0 auto 20px' }
const title  = { fontWeight: 700, fontSize: 20, marginBottom: 22, letterSpacing: '-0.02em' }
const lbl    = { display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }
