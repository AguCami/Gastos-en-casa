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
    <div style={wrap}>
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={iconWrap}>🏠</div>
          <h2 style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.03em', marginBottom: 6 }}>Configurá tu hogar</h2>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13 }}>Creá un hogar nuevo o unite a uno existente</p>
        </div>

        {/* Toggle */}
        <div style={toggle}>
          {(['create', 'join']).map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }} style={{
              flex: 1, padding: '9px', borderRadius: 10, fontSize: 13, fontWeight: tab === t ? 600 : 400,
              background: tab === t
                ? 'linear-gradient(135deg, rgba(90,143,255,0.72), rgba(124,109,247,0.72))'
                : 'transparent',
              color: tab === t ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.42)',
              border: tab === t ? '1px solid rgba(255,255,255,0.22)' : '1px solid transparent',
              boxShadow: tab === t ? '0 2px 10px rgba(90,143,255,0.3), inset 0 1px 0 rgba(255,255,255,0.18)' : 'none',
              transition: 'all 0.18s',
            }}>
              {t === 'create' ? '✨ Crear hogar' : '🔗 Unirse a uno'}
            </button>
          ))}
        </div>

        {tab === 'create' ? (
          <form onSubmit={createHousehold} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
            <div>
              <label className="label">Nombre del hogar</label>
              <input value={householdName} onChange={e => setHouseholdName(e.target.value)} placeholder="Ej: Casa de los García" required />
            </div>
            {error && <ErrBox msg={error} />}
            <button type="submit" className="btn btn-primary" style={{ padding: 12, fontSize: 14, fontWeight: 600, borderRadius: 12 }} disabled={loading}>
              {loading ? 'Creando...' : 'Crear hogar'}
            </button>
          </form>
        ) : (
          <form onSubmit={joinHousehold} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
            <div>
              <label className="label">Código de invitación</label>
              <input
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="AB12CD"
                maxLength={6}
                style={{ textAlign: 'center', fontSize: 22, fontWeight: 800, letterSpacing: '0.18em' }}
                required
              />
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.30)', marginTop: 6, textAlign: 'center' }}>
                Pedile el código a quien ya tiene el hogar creado
              </p>
            </div>
            {error && <ErrBox msg={error} />}
            <button type="submit" className="btn btn-primary" style={{ padding: 12, fontSize: 14, fontWeight: 600, borderRadius: 12 }} disabled={loading}>
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
    <div style={{ background: 'rgba(255,69,58,0.14)', border: '1px solid rgba(255,69,58,0.28)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#ff6b6b' }}>
      {msg}
    </div>
  )
}

const wrap = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }
const card = {
  width: '100%', maxWidth: 420,
  background: 'rgba(255,255,255,0.10)',
  backdropFilter: 'blur(48px) saturate(200%)', WebkitBackdropFilter: 'blur(48px) saturate(200%)',
  border: '1px solid rgba(255,255,255,0.22)',
  borderRadius: 28, padding: 32,
  boxShadow: '0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)',
}
const iconWrap = {
  width: 58, height: 58, borderRadius: 17, margin: '0 auto 14px',
  background: 'linear-gradient(135deg, rgba(90,143,255,0.9), rgba(124,109,247,0.9))',
  border: '1px solid rgba(255,255,255,0.30)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 27, boxShadow: '0 6px 28px rgba(90,143,255,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
}
const toggle = {
  display: 'flex', background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 3, gap: 3,
}
