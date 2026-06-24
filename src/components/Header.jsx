export default function Header({ tab, setTab, tabs }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50, padding: '0 16px',
      background: 'rgba(0,0,0,0.35)',
      backdropFilter: 'blur(32px) saturate(180%)',
      WebkitBackdropFilter: 'blur(32px) saturate(180%)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 64, flexWrap: 'wrap' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(79,142,247,0.9), rgba(94,92,230,0.9))',
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            boxShadow: '0 2px 12px rgba(79,142,247,0.4)',
          }}>🏠</div>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>Gastos en Casa</span>
        </div>

        <nav style={{
          display: 'flex', flex: 1, justifyContent: 'flex-end',
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 14, padding: 3, gap: 2,
          overflowX: 'auto',
        }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '7px 14px', borderRadius: 10, fontSize: 13, whiteSpace: 'nowrap',
              fontWeight: tab === t ? 600 : 400,
              background: tab === t ? 'rgba(255,255,255,0.17)' : 'transparent',
              color: tab === t ? '#fff' : 'rgba(255,255,255,0.5)',
              border: tab === t ? '1px solid rgba(255,255,255,0.22)' : '1px solid transparent',
              boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.18)' : 'none',
              transition: 'all 0.18s',
            }}>{t}</button>
          ))}
        </nav>

      </div>
    </header>
  )
}
