import { useState } from 'react'
import { supabase } from '../supabase'
import { useUser } from '../AuthContext'

export default function OnboardingPage() {
  const user = useUser()
  const [tab, setTab] = useState('create')  // 'create' | 'join'
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
      // Create household
      const { data: hh, error: err1 } = await supabase
        .from('households').insert({ name }).select().single()
      if (err1) throw err1
      // Link user
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
    <div style={wrap}>
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={icon}>🏠</div>
          <h2 style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', marginBottom: 6 }}>Configurá tu hogar</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>Creá un hogar nuevo o unite a uno existente</p>
        </div>

        {/* Toggle */}
        <div style={toggle}>
          {(['create', 'join']).map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }} style={{
              flex: 1, padding: '9px', borderRadius: 10, fontSize: 14, fontWeight: tab === t ? 600 : 400,
              background: tab === t ? 'rgba(255,255,255,0.18)' : 'transparent',
              color: tab === t ? '#fff' : 'rgba(255,255,255,0.45)',
              border: tab === t ? '1px solid rgba(255,255,255,0.25)' : '1px solid transparent',
              transition: 'all 0.18s',
            }}>
              {t === 'create' ? '✨ Crear hogar' : '🔗 Unirse a uno'}
            </button>
          ))}
        </div>

        {tab === 'create' ? (
          <form onSubmit={createHousehold} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
            <div>
              <label style={lbl}>Nombre del hogar</label>
              <input value={householdName} onChange={e => setHouseholdName(e.target.value)} placeholder="Ej: Casa de los García" required />
            </div>
            {error && <ErrBox msg={error} />}
            <button type="submit" className="btn btn-primary" style={{ padding: 12, fontSize: 15, fontWeight: 600 }} disabled={loading}>
              {loading ? 'Creando...' : 'Crear hogar'}
            </button>
          </form>
        ) : (
          <form onSubmit={joinHousehold} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
            <div>
              <label style={lbl}>Código de invitación</label>
              <input
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Ej: AB12CD"
                maxLength={6}
                style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, letterSpacing: '0.15em' }}
                required
              />
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>
                Pedile el código a quien ya tiene el hogar creado
              </p>
            </div>
            {error && <ErrBox msg={error} />}
            <button type="submit" className="btn btn-primary" style={{ padding: 12, fontSize: 15, fontWeight: 600 }} disabled={loading}>
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
    <div style={{ background: 'rgba(255,69,58,0.15)', border: '1px solid rgba(255,69,58,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ff6b6b' }}>
      {msg}
    </div>
  )
}

const wrap = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }
const card = {
  width: '100%', maxWidth: 420,
  background: 'rgba(15,25,55,0.7)', backdropFilter: 'blur(48px) saturate(200%)', WebkitBackdropFilter: 'blur(48px) saturate(200%)',
  border: '1px solid rgba(255,255,255,0.18)', borderRadius: 28, padding: 32,
  boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
}
const icon = {
  width: 60, height: 60, borderRadius: 18, margin: '0 auto 14px',
  background: 'linear-gradient(135deg, rgba(79,142,247,0.9), rgba(94,92,230,0.9))',
  border: '1px solid rgba(255,255,255,0.3)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
  boxShadow: '0 4px 20px rgba(79,142,247,0.4)',
}
const toggle = {
  display: 'flex', background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: 4, gap: 4,
}
const lbl = { display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }
