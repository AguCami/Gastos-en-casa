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
  const net       = totalInc - totalExp
  const projectedExp = daysPassed > 0 ? (totalExp / daysPassed) * daysInMonth : 0
  const projPct = daysPassed / daysInMonth

  const budgetAlerts = useMemo(() =>
    categories.map(cat => {
      const spent  = monthExp.filter(e => e.category === cat.id).reduce((s, e) => s + e.amount, 0)
      const budget = budgets[cat.id] || 0
      return { ...cat, spent, budget, pct: budget > 0 ? spent / budget : 0 }
    }).filter(c => c.budget > 0 && c.pct >= 0.8).sort((a, b) => b.pct - a.pct)
  , [monthExp, budgets])

  const pendingRecurring = useMemo(() =>
    recurring.filter(r => r.active && !entries.some(e =>
      e.date?.startsWith(thisMonth) && e.description === r.description &&
      e.amount === r.amount && e.member === r.member
    ))
  , [recurring, entries, thisMonth])

  const activeGoals = goals.filter(g => g.saved_amount < g.target_amount).slice(0, 3)
  const recent = [...entries].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Hero KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))', gap: 10 }}>
        <HeroKpi label="Ingresos" value={totalInc} color="var(--green)" sign="+" />
        <HeroKpi label="Gastos"   value={totalExp} color="var(--red)"   sign="-" />
        <HeroKpi label="Balance"  value={Math.abs(net)} color={net >= 0 ? 'var(--green)' : 'var(--red)'} sign={net >= 0 ? '+' : '-'} />
        <HeroKpi label="Proyección" value={projectedExp} color="var(--yellow)" note={`día ${daysPassed}/${daysInMonth}`} />
      </div>

      {/* ── Progress bar ── */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Progreso del mes</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            {Math.round(projPct * 100)}% transcurrido
          </span>
        </div>
        <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: '0 auto 0 0', width: `${projPct * 100}%`, background: 'linear-gradient(90deg, #5a8fff, #7c6df7)', borderRadius: 3, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12 }}>
          <span style={{ color: 'rgba(255,255,255,0.38)' }}>Gastado <strong style={{ color: 'var(--red)' }}>${fmt(totalExp)}</strong></span>
          <span style={{ color: 'rgba(255,255,255,0.38)' }}>Estimado fin de mes <strong style={{ color: 'var(--yellow)' }}>${fmt(projectedExp)}</strong></span>
        </div>
      </div>

      {/* ── Two col: alerts + recurring ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>

        {/* Budget alerts */}
        <Panel icon="⚠️" title="Alertas de presupuesto" action="Ver todo" onAction={() => onGoTo('Presupuesto')}>
          {budgetAlerts.length === 0
            ? <Empty icon="✅" text="Todo dentro del presupuesto" />
            : budgetAlerts.map(c => (
              <AlertRow key={c.id} color={c.color} emoji={c.emoji} label={c.label} pct={c.pct} spent={c.spent} budget={c.budget} />
            ))
          }
        </Panel>

        {/* Pending recurring */}
        <Panel icon="🔄" title="Recurrentes pendientes" action="Ver todo" onAction={() => onGoTo('Recurrentes')}>
          {pendingRecurring.length === 0
            ? <Empty icon="✅" text="Todo registrado este mes" />
            : pendingRecurring.slice(0, 4).map(r => (
              <RecurringRow key={r.id} r={r} onRegister={() => onRegisterRecurring(r)} />
            ))
          }
        </Panel>
      </div>

      {/* ── Goals ── */}
      {activeGoals.length > 0 && (
        <Panel icon="🎯" title="Metas de ahorro" action="Ver todo" onAction={() => onGoTo('Metas')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {activeGoals.map(g => {
              const pct = Math.min(g.saved_amount / g.target_amount, 1)
              return (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{g.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>{g.name}</span>
                      <span style={{ color: 'rgba(255,255,255,0.38)', fontVariantNumeric: 'tabular-nums' }}>
                        ${fmtShort(g.saved_amount)} / ${fmtShort(g.target_amount)}
                      </span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct * 100}%`, height: '100%', background: 'linear-gradient(90deg, #5a8fff, #7c6df7)', borderRadius: 3, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: '#5a8fff', fontWeight: 700, minWidth: 36, textAlign: 'right' }}>
                    {Math.round(pct * 100)}%
                  </span>
                </div>
              )
            })}
          </div>
        </Panel>
      )}

      {/* ── Recent ── */}
      <Panel icon="🕐" title="Últimos movimientos" action="Ver todo" onAction={() => onGoTo('Gastos')}>
        {recent.length === 0
          ? <Empty icon="💸" text="No hay movimientos aún" />
          : recent.map(e => {
              const cat = categories.find(c => c.id === e.category)
              const isIncome = e.type === 'income'
              return (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  className="recent-row">
                  <div style={{
                    width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                    background: isIncome ? 'rgba(48,209,88,0.14)' : `${cat?.color || '#94a3b8'}18`,
                    border: `1px solid ${isIncome ? 'rgba(48,209,88,0.25)' : (cat?.color || '#94a3b8') + '35'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>{isIncome ? '💰' : (cat?.emoji || '📦')}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>
                      {e.description}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                      {e.member} · {formatDate(e.date)}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isIncome ? 'var(--green)' : 'rgba(255,255,255,0.9)', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {isIncome ? '+' : ''}${e.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              )
            })
        }
      </Panel>
    </div>
  )
}

/* ── Sub-components ── */

function HeroKpi({ label, value, color, sign, note }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 18, padding: '16px 18px',
      boxShadow: `0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px ${color}18`,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 750, letterSpacing: '-0.03em', color, fontVariantNumeric: 'tabular-nums' }}>
        {sign}${fmt(value)}
      </div>
      {note && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 4 }}>{note}</div>}
    </div>
  )
}

function Panel({ icon, title, action, onAction, children }) {
  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 650, letterSpacing: '-0.01em' }}>{icon} {title}</span>
        {action && (
          <button onClick={onAction} style={{ background: 'none', color: '#5a8fff', fontSize: 12, fontWeight: 600, padding: '3px 0', opacity: 0.85 }}>
            {action} →
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function AlertRow({ color, emoji, label, pct, spent, budget }) {
  const over = pct >= 1
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <span style={{ fontSize: 18, width: 24, textAlign: 'center', flexShrink: 0 }}>{emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
          <span style={{ fontWeight: 500 }}>{label}</span>
          <span style={{ fontWeight: 700, color: over ? 'var(--red)' : 'var(--yellow)', fontVariantNumeric: 'tabular-nums' }}>
            {Math.round(pct * 100)}%
          </span>
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(pct, 1) * 100}%`, height: '100%', background: over ? 'var(--red)' : 'var(--yellow)', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  )
}

function RecurringRow({ r, onRegister }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <span style={{ fontSize: 17, width: 24, textAlign: 'center', flexShrink: 0 }}>{r.type === 'income' ? '💰' : '💸'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.description}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
          ${r.amount.toLocaleString('es-AR')} · día {r.day_of_month}
        </div>
      </div>
      <button
        className="btn btn-ghost"
        style={{ padding: '5px 12px', fontSize: 12, borderRadius: 8, flexShrink: 0, fontWeight: 600 }}
        onClick={onRegister}
      >Registrar</button>
    </div>
  )
}

function Empty({ icon, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '18px 0', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
      {icon} {text}
    </div>
  )
}

const fmt      = v => Math.round(v).toLocaleString('es-AR')
const fmtShort = v => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v/1_000).toFixed(0)}K` : v.toLocaleString('es-AR')

function formatDate(d) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}
