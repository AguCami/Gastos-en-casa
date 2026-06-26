import { useState } from 'react'
import { supabase } from '../supabase'

export default function Header({ tab, setTab, tabs, household }) {
  const [showMenu, setShowMenu] = useState(false)

  async function logout() {
    await supabase.auth.signOut()
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50, padding: '0 16px',
      background: 'rgba(0,0,0,0.38)',
      backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, height: 64 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(79,142,247,0.9), rgba(94,92,230,0.9))',
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            boxShadow: '0 2px 12px rgba(79,142,247,0.35)',
          }}>🏠</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', lineHeight: 1.2 }}>Gastos en Casa</div>
            {household && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1 }}>{household.name}</div>}
          </div>
        </div>

        {/* Tabs */}
        <nav style={{
          display: 'flex', flex: 1, justifyContent: 'center',
          background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: 3, gap: 2,
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 13px', borderRadius: 10, fontSize: 13, whiteSpace: 'nowrap',
              fontWeight: tab === t ? 600 : 400,
              background: tab === t ? 'rgba(255,255,255,0.17)' : 'transparent',
              color: tab === t ? '#fff' : 'rgba(255,255,255,0.5)',
              border: tab === t ? '1px solid rgba(255,255,255,0.22)' : '1px solid transparent',
              boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.18)' : 'none',
              transition: 'all 0.18s',
            }}>{t}</button>
          ))}
        </nav>

        {/* User menu */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setShowMenu(m => !m)}
            style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              transition: 'background 0.15s',
            }}
          >👤</button>

          {showMenu && (
            <div style={{
              position: 'absolute', top: '110%', right: 0, minWidth: 200,
              background: 'rgba(12,22,50,0.9)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.18)', borderRadius: 16,
              boxShadow: '0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
              overflow: 'hidden',
            }}>
              {household && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Código de invitación</div>
                  <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.12em', color: '#4f8ef7' }}>{household.invite_code}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Compartilo para que se unan</div>
                </div>
              )}
              <button
                onClick={logout}
                style={{
                  width: '100%', padding: '12px 16px', textAlign: 'left',
                  background: 'none', color: '#ff453a', fontSize: 14, fontWeight: 500,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.target.style.background = 'rgba(255,69,58,0.1)'}
                onMouseLeave={e => e.target.style.background = 'none'}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
