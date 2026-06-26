import { useState } from 'react'
import { supabase } from '../supabase'
import { useUser } from '../AuthContext'

export default function OnboardingPage() {
  const user = useUser()
  const [tab, setTab] = useState('create')
  const [householdName, setHouseholdName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function createHousehold(e) {
    e.preventDefault()
    const name = householdName.trim()
    if (!name) return
    setLoading(true); setError('')
    try {
      const { data: hh, error: err1 } = await supabase
        .from('households').insert({ name }).select().single()
      if (err1) throw err1
      const { error: err2 } = await supabase
        .from('household_users').insert({ household_id: hh.id, user_id: user.id })
      if (err2) throw err2
      window.location.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function joinHousehold(e) {
    e.preventDefault()
    const code = inviteCode.trim().toUpperCase()
    if (!code) return
    setLoading(true); setError('')
    try {
      const { data: hh, error: err1 } = await supabase
        .from('households').select('id').eq('invite_code', code).single()
      if (err1 || !hh) throw new Error('Código de hogar incorrecto')
      const { error: err2 } = await supabase
        .from('household_users').insert({ household_id: hh.id, user_id: user.id })
      if (err2) throw err2
      window.location.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 420, padding: 32 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={iconWrap}>
            <svg width="28" height="28" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12L12 3l9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
            </svg>
          </div>
          <h2 style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', color: '#1a1a3e', marginBottom: 5 }}>
            Configurá tu hogar
          </h2>
          <p style={{ color: 'rgba(30,30,80,0.58)', fontSize: 13 }}>
            Creá un hogar nuevo o unite a uno existente
          </p>
        </div>

        {/* Toggle */}
        <div style={toggle}>
          {(['create', 'join']).map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }} style={{
              flex: 1, padding: '9px', borderRadius: 10, fontSize: 13, fontWeight: tab === t ? 600 : 400,
              background: tab === t ? 'rgba(255,255,255,0.55)' : 'transparent',
              color: tab === t ? '#1a1a3e' : 'rgba(30,30,80,0.50)',
              border: tab === t ? '1px solid rgba(255,255,255,0.70)' : '1px solid transparent',
              boxShadow: tab === t ? '0 2px 8px rgba(31,38,135,0.12)' : 'none',
              transition: 'all 0.18s',
            }}>
              {t === 'create' ? '✨ Crear hogar' : '🔗 Unirse a uno'}
            </button>
          ))}
        </div>

        {tab === 'create' ? (
          <form onSubmit={createHousehold} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
            <div>
              <label className="label-dark">Nombre del hogar</label>
              <input className="glass-input" value={householdName} onChange={e => setHouseholdName(e.target.value)} placeholder="Ej: Casa de los García" required />
            </div>
            {error && <ErrBox msg={error} />}
            <button type="submit" className="btn-glass-primary" style={{ padding: 12, fontSize: 14, fontWeight: 600 }} disabled={loading}>
              {loading ? 'Creando...' : 'Crear hogar'}
            </button>
          </form>
        ) : (
          <form onSubmit={joinHousehold} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
            <div>
              <label className="label-dark">Código de invitación</label>
              <input
                className="glass-input"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="AB12CD"
                maxLength={6}
                style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, letterSpacing: '0.20em' }}
                required
              />
              <p style={{ fontSize: 11, color: 'rgba(30,30,80,0.48)', marginTop: 6, textAlign: 'center' }}>
                Pedile el código a quien ya tiene el hogar creado
              </p>
            </div>
            {error && <ErrBox msg={error} />}
            <button type="submit" className="btn-glass-primary" style={{ padding: 12, fontSize: 14, fontWeight: 600 }} disabled={loading}>
              {loading ? 'Buscando...' : 'Unirse'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function ErrBox({ msg }) {
  return (
    <p style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.35)', color: '#b91c1c', borderRadius: 12, padding: '10px 14px', fontSize: 13, fontWeight: 500 }}>
      {msg}
    </p>
  )
}

const iconWrap = {
  width: 64, height: 64, borderRadius: 18, margin: '0 auto 14px',
  background: 'linear-gradient(135deg, rgba(102,126,234,0.75), rgba(118,75,162,0.75))',
  border: '1px solid rgba(255,255,255,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 4px 24px rgba(102,126,234,0.42), inset 0 1px 0 rgba(255,255,255,0.35)',
}
const toggle = {
  display: 'flex', background: 'rgba(255,255,255,0.20)',
  border: '1px solid rgba(255,255,255,0.40)', borderRadius: 12, padding: 3, gap: 3,
}
