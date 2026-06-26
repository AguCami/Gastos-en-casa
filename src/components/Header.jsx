import { useState } from 'react'
import { supabase } from '../supabase'

export default function Header({ tab, setTab, tabs, household }) {
  const [showMenu, setShowMenu] = useState(false)

  async function logout() {
    await supabase.auth.signOut()
    setShowMenu(false)
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(8,12,20,0.75)',
      backdropFilter: 'blur(40px) saturate(200%)',
      WebkitBackdropFilter: 'blur(40px) saturate(200%)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 14, height: 60 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginRight: 4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: 'linear-gradient(145deg, #5a8fff 0%, #4f6ef7 100%)',
            border: '1px solid rgba(255,255,255,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
            boxShadow: '0 2px 10px rgba(79,110,247,0.4)',
          }}>🏠</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em', lineHeight: 1.2, color: 'rgba(255,255,255,0.95)' }}>
              Gastos en Casa
            </div>
            {household && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.1, marginTop: 1 }}>
                {household.name}
              </div>
            )}
          </div>
        </div>

        {/* Nav tabs */}
        <nav style={{
          display: 'flex', flex: 1, gap: 1,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: '3px',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '6px 13px', borderRadius: 9,
              fontSize: 13, fontWeight: tab === t ? 600 : 400,
              whiteSpace: 'nowrap', letterSpacing: '-0.01em',
              background: tab === t ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: tab === t ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.42)',
              border: tab === t ? '1px solid rgba(255,255,255,0.14)' : '1px solid transparent',
              boxShadow: tab === t ? '0 1px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.12)' : 'none',
              transition: 'all 0.18s',
            }}>{t}</button>
          ))}
        </nav>

        {/* User button */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setShowMenu(m => !m)}
            style={{
              width: 32, height: 32, borderRadius: 9,
              background: showMenu ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              transition: 'all 0.15s',
            }}
          >👤</button>

          {showMenu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowMenu(false)} />
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 210, zIndex: 50,
                background: 'rgba(10,16,32,0.92)',
                backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16,
                boxShadow: '0 20px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)',
                overflow: 'hidden',
              }}>
                {household && (
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Código de invitación
                    </div>
                    <div style={{
                      fontWeight: 800, fontSize: 22, letterSpacing: '0.18em', color: '#5a8fff',
                      fontVariantNumeric: 'tabular-nums',
                    }}>{household.invite_code}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 4 }}>
                      Compartilo para que otros se unan
                    </div>
                  </div>
                )}
                <button
                  onClick={logout}
                  style={{
                    width: '100%', padding: '12px 16px', textAlign: 'left',
                    background: 'none', color: '#ff6b6b', fontSize: 13, fontWeight: 500,
                    borderTop: 'none',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,69,58,0.10)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  )
}
