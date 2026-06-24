export default function Header({ tab, setTab, total }) {
  return (
    <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🏠</span>
          <span style={{ fontWeight: 700, fontSize: 18 }}>Gastos en Casa</span>
        </div>
        <nav style={{ display: 'flex', gap: 4 }}>
          {['Gastos', 'Resumen', 'Miembros'].map(t => (
            <button
              key={t}
              className="btn"
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? 'var(--accent)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--text2)',
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
