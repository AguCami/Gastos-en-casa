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
      background: 'rgba(10, 8, 28, 0.65)',
      backdropFilter: 'blur(40px) saturate(200%)',
      WebkitBackdropFilter: 'blur(40px) saturate(200%)',
      borderBottom: '1px solid rgba(255,255,255,0.12)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.06)',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 14, height: 62 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginRight: 4 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(90,143,255,0.9), rgba(124,109,247,0.9))',
            border: '1px solid rgba(255,255,255,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            boxShadow: '0 2px 12px rgba(90,143,255,0.45), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}>🏠</div>
          <div>
            <div style={{ fontWeight: 750, fontSize: 14, letterSpacing: '-0.02em', lineHeight: 1.2, color: 'rgba(255,255,255,0.95)' }}>
              Gastos en Casa
            </div>
            {household && (
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', lineHeight: 1.1, marginTop: 1 }}>
                {household.name}
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav style={{
          display: 'flex', flex: 1, gap: 1,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 13, padding: '3px',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '6px 13px', borderRadius: 10,
              fontSize: 13, fontWeight: tab === t ? 600 : 400,
              whiteSpace: 'nowrap', letterSpacing: '-0.01em',
              background: tab === t
                ? 'linear-gradient(135deg, rgba(90,143,255,0.72), rgba(124,109,247,0.72))'
                : 'transparent',
              color: tab === t ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.42)',
              border: tab === t ? '1px solid rgba(255,255,255,0.20)' : '1px solid transparent',
              boxShadow: tab === t ? '0 2px 10px rgba(90,143,255,0.3), inset 0 1px 0 rgba(255,255,255,0.18)' : 'none',
              transition: 'all 0.18s',
            }}>{t}</button>
          ))}
        </nav>

        {/* User button */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setShowMenu(m => !m)}
            style={{
              width: 34, height: 34, borderRadius: 10,
              background: showMenu
                ? 'linear-gradient(135deg, rgba(90,143,255,0.6), rgba(124,109,247,0.6))'
                : 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
              boxShadow: showMenu ? '0 2px 12px rgba(90,143,255,0.35)' : 'none',
              transition: 'all 0.18s',
            }}
          >👤</button>

          {showMenu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowMenu(false)} />
              <div style={{
                position: 'absolute', top: 'calc(100% + 9px)', right: 0, minWidth: 220, zIndex: 50,
                background: 'rgba(8, 6, 28, 0.90)',
                backdropFilter: 'blur(36px) saturate(200%)', WebkitBackdropFilter: 'blur(36px) saturate(200%)',
                border: '1px solid rgba(255,255,255,0.16)', borderRadius: 18,
                boxShadow: '0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.14)',
                overflow: 'hidden',
              }}>
                {household && (
                  <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Código de invitación
                    </div>
                    <div style={{
                      fontWeight: 800, fontSize: 24, letterSpacing: '0.20em',
                      background: 'linear-gradient(135deg, #5a8fff, #7c6df7)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                      fontVariantNumeric: 'tabular-nums',
                    }}>{household.invite_code}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 5 }}>
                      Compartilo para que otros se unan
                    </div>
                  </div>
                )}
                <button
                  onClick={logout}
                  style={{
                    width: '100%', padding: '13px 18px', textAlign: 'left',
                    background: 'none', color: '#ff6b6b', fontSize: 13, fontWeight: 500,
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,69,58,0.12)'}
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
