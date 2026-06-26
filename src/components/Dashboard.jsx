import { useMemo } from 'react'

export default function Dashboard({ expenses, incomes, members, categories, budgets, goals, recurring, entries, onGoTo, onRegisterRecurring }) {
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysPassed  = now.getDate()

  const monthExp = expenses.filter(e => e.date?.startsWith(thisMonth))
  const monthInc = incomes.filter(e => e.date?.startsWith(thisMonth))
  const totalExp = monthExp.reduce((s, e) => s + e.amount, 0)
  const totalInc = monthInc.reduce((s, e) => s + e.amount, 0)
  const netMonth  = totalInc - totalExp

  // Projection
  const projectedExp = daysPassed > 0 ? (totalExp / daysPassed) * daysInMonth : 0
  const projPct = daysInMonth > 0 ? daysPassed / daysInMonth : 0

  // Budget alerts
  const budgetAlerts = useMemo(() => categories.map(cat => {
    const spent  = monthExp.filter(e => e.category === cat.id).reduce((s, e) => s + e.amount, 0)
    const budget = budgets[cat.id] || 0
    const pct    = budget > 0 ? spent / budget : 0
    return { ...cat, spent, budget, pct }
  }).filter(c => c.budget > 0 && c.pct >= 0.8).sort((a, b) => b.pct - a.pct), [monthExp, budgets])

  // Pending recurring (not registered this month yet)
  const pendingRecurring = useMemo(() => recurring.filter(r => {
    if (!r.active) return false
    return !entries.some(e =>
      e.date?.startsWith(thisMonth) &&
      e.description === r.description &&
      e.amount === r.amount &&
      e.member === r.member
    )
  }), [recurring, entries, thisMonth])

  // Goals with progress
  const activeGoals = goals.filter(g => g.saved_amount < g.target_amount).slice(0, 3)

  // Recent entries
  const recent = [...entries].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        <Kpi label="Ingresos del mes" value={totalInc} color="#34d058" prefix="+" />
        <Kpi label="Gastos del mes"   value={totalExp} color="#ff453a" prefix="-" />
        <Kpi label="Balance neto"     value={netMonth} color={netMonth >= 0 ? '#34d058' : '#ff453a'} prefix={netMonth >= 0 ? '+' : '-'} abs />
        <Kpi label="Proyección gastos" value={projectedExp} color="#ffd60a" note={`día ${daysPassed}/${daysInMonth}`} />
      </div>

      {/* Projection bar */}
      <div className="card" style={{ borderRadius: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>📅 Progreso del mes</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
            {daysPassed} de {daysInMonth} días · {Math.round(projPct * 100)}%
          </span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ width: `${projPct * 100}%`, height: '100%', background: 'linear-gradient(90deg, #4f8ef7, #5e5ce6)', borderRadius: 4, transition: 'width 0.5s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          <span>Gastado: <strong style={{ color: '#ff453a' }}>${totalExp.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</strong></span>
          <span>Proyectado: <strong style={{ color: '#ffd60a' }}>${Math.round(projectedExp).toLocaleString('es-AR')}</strong></span>
        </div>
      </div>

      {/* Alerts + Pending in 2 cols */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>

        {/* Budget alerts */}
        <div className="card" style={{ borderRadius: 20 }}>
          <SectionTitle icon="🚨" label="Alertas de presupuesto" action="Ver todo" onAction={() => onGoTo('Presupuesto')} />
          {budgetAlerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>✅ Todo bajo control</div>
          ) : budgetAlerts.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>{c.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{c.label}</span>
                  <span style={{ color: c.pct >= 1 ? '#ff453a' : '#ffd60a', fontWeight: 600 }}>{Math.round(c.pct * 100)}%</span>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(c.pct, 1) * 100}%`, height: '100%', background: c.pct >= 1 ? '#ff453a' : '#ffd60a', borderRadius: 3 }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pending recurring */}
        <div className="card" style={{ borderRadius: 20 }}>
          <SectionTitle icon="🔄" label="Recurrentes pendientes" action="Ver todo" onAction={() => onGoTo('Recurrentes')} />
          {pendingRecurring.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>✅ Todo registrado</div>
          ) : pendingRecurring.slice(0, 4).map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 18, width: 26, textAlign: 'center' }}>{r.type === 'income' ? '💰' : '💸'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.description}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>${r.amount.toLocaleString('es-AR')} · día {r.day_of_month}</div>
              </div>
              <button
                className="btn btn-ghost"
                style={{ padding: '4px 10px', fontSize: 12, borderRadius: 8, flexShrink: 0 }}
                onClick={() => onRegisterRecurring(r)}
              >Registrar</button>
            </div>
          ))}
        </div>
      </div>

      {/* Goals */}
      {activeGoals.length > 0 && (
        <div className="card" style={{ borderRadius: 20 }}>
          <SectionTitle icon="🎯" label="Metas de ahorro" action="Ver todo" onAction={() => onGoTo('Metas')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeGoals.map(g => {
              const pct = Math.min(g.saved_amount / g.target_amount, 1)
              return (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{g.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                      <span style={{ fontWeight: 600 }}>{g.name}</span>
                      <span style={{ color: 'rgba(255,255,255,0.45)' }}>${g.saved_amount.toLocaleString('es-AR')} / ${g.target_amount.toLocaleString('es-AR')}</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct * 100}%`, height: '100%', background: 'linear-gradient(90deg, #4f8ef7, #5e5ce6)', borderRadius: 3 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: '#4f8ef7', fontWeight: 600, minWidth: 36, textAlign: 'right' }}>{Math.round(pct * 100)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent */}
      <div className="card" style={{ borderRadius: 20 }}>
        <SectionTitle icon="🕐" label="Últimos movimientos" action="Ver todo" onAction={() => onGoTo('Gastos')} />
        {recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No hay movimientos aún</div>
        ) : recent.map(e => {
          const cat = categories.find(c => c.id === e.category)
          const isIncome = e.type === 'income'
          return (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: isIncome ? 'rgba(52,208,88,0.15)' : `${cat?.color || '#94a3b8'}22`,
                border: `1px solid ${isIncome ? 'rgba(52,208,88,0.3)' : (cat?.color || '#94a3b8') + '44'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
              }}>{isIncome ? '💰' : (cat?.emoji || '📦')}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.description}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{e.member} · {formatDate(e.date)}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: isIncome ? '#34d058' : '#fff', flexShrink: 0 }}>
                {isIncome ? '+' : ''}${e.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Kpi({ label, value, color, prefix = '', note, abs }) {
  const display = abs ? Math.abs(value) : value
  return (
    <div style={{
      background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)', borderTop: `2px solid ${color}`,
      borderRadius: 20, padding: '16px 18px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
    }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.03em', color }}>
        {prefix}${display.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
      </div>
      {note && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{note}</div>}
    </div>
  )
}

function SectionTitle({ icon, label, action, onAction }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <span style={{ fontWeight: 600, fontSize: 14 }}>{icon} {label}</span>
      {action && <button onClick={onAction} style={{ background: 'none', color: '#4f8ef7', fontSize: 12, fontWeight: 500, padding: 0 }}>{action} →</button>}
    </div>
  )
}

function formatDate(d) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}
