export default function Header({ tab, setTab }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 24px',
      background: 'rgba(0,0,0,0.35)',
      backdropFilter: 'blur(32px) saturate(180%)',
      WebkitBackdropFilter: 'blur(32px) saturate(180%)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(79,142,247,0.9), rgba(94,92,230,0.9))',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
            boxShadow: '0 2px 12px rgba(79,142,247,0.4)',
          }}>🏠</div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>Gastos en Casa</span>
        </div>

        {/* Pill tab switcher */}
        <nav style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 14,
          padding: 4,
          gap: 2,
        }}>
          {['Gastos', 'Resumen', 'Miembros'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '7px 16px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: tab === t ? 600 : 400,
                background: tab === t
                  ? 'rgba(255,255,255,0.18)'
                  : 'transparent',
                color: tab === t ? '#fff' : 'rgba(255,255,255,0.5)',
                border: tab === t ? '1px solid rgba(255,255,255,0.25)' : '1px solid transparent',
                boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
