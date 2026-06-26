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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 400, padding: '36px 32px' }}>

        {/* Logo + título */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={logoWrap}>
            {/* ícono casa */}
            <svg width="28" height="28" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#1a1a3e', marginBottom: 5 }}>
            Gastos en Casa
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(30,30,80,0.60)' }}>
            {mode === 'login' ? 'Ingresá con tus credenciales' : 'Creá tu cuenta gratuita'}
          </p>
        </div>

        {/* Toggle login / registro */}
        <div style={modeToggle}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '8px', borderRadius: 10, fontSize: 13, fontWeight: mode === m ? 600 : 400,
              background: mode === m ? 'rgba(255,255,255,0.55)' : 'transparent',
              color: mode === m ? '#1a1a3e' : 'rgba(30,30,80,0.50)',
              border: mode === m ? '1px solid rgba(255,255,255,0.70)' : '1px solid transparent',
              boxShadow: mode === m ? '0 2px 8px rgba(31,38,135,0.12)' : 'none',
              transition: 'all 0.18s',
            }}>
              {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        {/* Formulario */}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}>
          {mode === 'register' && (
            <div>
              <label className="label-dark">Tu nombre</label>
              <input className="glass-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Agustín García" required />
            </div>
          )}
          <div>
            <label className="label-dark">Email</label>
            <input className="glass-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="tu@email.com" required />
          </div>
          <div>
            <label className="label-dark">Contraseña</label>
            <input className="glass-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>

          {error && (
            <p style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.35)', color: '#b91c1c', borderRadius: 12, padding: '10px 14px', fontSize: 13, fontWeight: 500 }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-glass-primary" style={{ marginTop: 4, fontSize: 14, fontWeight: 700, padding: '13px' }} disabled={loading}>
            {loading ? 'Un momento...' : (mode === 'login' ? 'Ingresar' : 'Crear cuenta')}
          </button>
        </form>

        {mode === 'login' && (
          <p style={{ textAlign: 'center', fontSize: 13, marginTop: 16, color: 'rgba(30,30,80,0.60)' }}>
            ¿No tenés cuenta?{' '}
            <button onClick={() => setMode('register')} style={{ background: 'none', color: '#4f46e5', fontWeight: 700, fontSize: 13, padding: 0 }}>
              Registrate
            </button>
          </p>
        )}
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

const logoWrap = {
  width: 64, height: 64, borderRadius: 18, margin: '0 auto 14px',
  background: 'linear-gradient(135deg, rgba(102,126,234,0.75), rgba(118,75,162,0.75))',
  border: '1px solid rgba(255,255,255,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 4px 24px rgba(102,126,234,0.42), inset 0 1px 0 rgba(255,255,255,0.35)',
}
const modeToggle = {
  display: 'flex', background: 'rgba(255,255,255,0.20)',
  border: '1px solid rgba(255,255,255,0.40)', borderRadius: 12, padding: 3, gap: 3,
}
