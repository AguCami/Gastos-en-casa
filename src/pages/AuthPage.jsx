import { useState } from 'react'
import { supabase } from '../supabase'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); setError('') }

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email: form.email, password: form.password,
          options: { data: { full_name: form.name } },
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
        if (error) throw error
      }
    } catch (err) { setError(translateError(err.message)) }
    finally { setLoading(false) }
  }

  return (
    <div style={wrap}>
      <div style={card}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={logoWrap}>🏠</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6, color: 'rgba(255,255,255,0.95)' }}>
            Gastos en Casa
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)' }}>
            {mode === 'login' ? 'Ingresá a tu cuenta' : 'Creá tu cuenta gratuita'}
          </p>
        </div>

        {/* Mode toggle */}
        <div style={modeToggle}>
          {['login','register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '8px', borderRadius: 9, fontSize: 13, fontWeight: mode === m ? 600 : 400,
              background: mode === m ? 'rgba(255,255,255,0.14)' : 'transparent',
              color: mode === m ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.38)',
              border: mode === m ? '1px solid rgba(255,255,255,0.16)' : '1px solid transparent',
              transition: 'all 0.18s',
            }}>
              {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 20 }}>
          {mode === 'register' && (
            <div>
              <label className="label">Tu nombre</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Agustín García" required />
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="tu@email.com" required />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} />
          </div>

          {error && (
            <div style={{ background: 'rgba(255,69,58,0.12)', border: '1px solid rgba(255,69,58,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ff7066' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ marginTop: 4, padding: '13px', fontSize: 14, fontWeight: 700, borderRadius: 12 }} disabled={loading}>
            {loading ? 'Un momento...' : (mode === 'login' ? 'Ingresar' : 'Crear cuenta')}
          </button>
        </form>
      </div>
    </div>
  )
}

function translateError(msg) {
  if (msg.includes('Invalid login')) return 'Email o contraseña incorrectos'
  if (msg.includes('already registered')) return 'Ese email ya tiene una cuenta'
  if (msg.includes('Password should')) return 'La contraseña debe tener al menos 6 caracteres'
  return msg
}

const wrap = {
  minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
}
const card = {
  width: '100%', maxWidth: 400,
  background: 'rgba(12,18,36,0.80)',
  backdropFilter: 'blur(48px) saturate(200%)', WebkitBackdropFilter: 'blur(48px) saturate(200%)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 28, padding: '36px 32px',
  boxShadow: '0 40px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.14)',
}
const logoWrap = {
  width: 56, height: 56, borderRadius: 16, margin: '0 auto 14px',
  background: 'linear-gradient(145deg, #5a8fff 0%, #4f6ef7 100%)',
  border: '1px solid rgba(255,255,255,0.22)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 26, boxShadow: '0 6px 24px rgba(79,110,247,0.45)',
}
const modeToggle = {
  display: 'flex', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 11, padding: 3, gap: 3,
}
