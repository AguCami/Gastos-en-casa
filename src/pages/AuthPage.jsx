import { useState } from 'react'
import { supabase } from '../supabase'

export default function AuthPage() {
  const [mode, setMode] = useState('login')  // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError('') }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.name } },
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email, password: form.password,
        })
        if (error) throw error
      }
    } catch (err) {
      setError(translateError(err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={wrap}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,0.25) 0%, transparent 70%)', top: '-100px', left: '-100px' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(94,92,230,0.2) 0%, transparent 70%)', bottom: '-50px', right: '-50px' }} />
      </div>

      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={icon}>🏠</div>
          <h1 style={{ fontWeight: 800, fontSize: 26, letterSpacing: '-0.03em', marginBottom: 6 }}>Gastos en Casa</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
            {mode === 'login' ? 'Ingresá a tu hogar' : 'Creá tu cuenta'}
          </p>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'register' && (
            <Field label="Tu nombre">
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ej: Agustín" required />
            </Field>
          )}
          <Field label="Email">
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="tu@email.com" required />
          </Field>
          <Field label="Contraseña">
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} />
          </Field>

          {error && (
            <div style={{ background: 'rgba(255,69,58,0.15)', border: '1px solid rgba(255,69,58,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ff6b6b' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ marginTop: 8, padding: '12px', fontSize: 15, fontWeight: 600 }} disabled={loading}>
            {loading ? 'Cargando...' : (mode === 'login' ? 'Ingresar' : 'Crear cuenta')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>
          {mode === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            style={{ background: 'none', color: 'var(--accent)', fontWeight: 600, padding: 0, fontSize: 14 }}>
            {mode === 'login' ? 'Registrate' : 'Ingresá'}
          </button>
        </div>
      </div>
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

function translateError(msg) {
  if (msg.includes('Invalid login')) return 'Email o contraseña incorrectos'
  if (msg.includes('already registered')) return 'Ese email ya está registrado'
  if (msg.includes('Password should')) return 'La contraseña debe tener al menos 6 caracteres'
  return msg
}

const wrap = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative' }
const card = {
  width: '100%', maxWidth: 400, position: 'relative', zIndex: 1,
  background: 'rgba(15,25,55,0.7)',
  backdropFilter: 'blur(48px) saturate(200%)', WebkitBackdropFilter: 'blur(48px) saturate(200%)',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: 28, padding: 32,
  boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
}
const icon = {
  width: 60, height: 60, borderRadius: 18, margin: '0 auto 14px',
  background: 'linear-gradient(135deg, rgba(79,142,247,0.9), rgba(94,92,230,0.9))',
  border: '1px solid rgba(255,255,255,0.3)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 28, boxShadow: '0 4px 20px rgba(79,142,247,0.4)',
}
