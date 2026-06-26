import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function Summary({ expenses, incomes, members, categories }) {
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const monthExp = expenses.filter(e => e.date?.startsWith(thisMonth))
  const monthInc = incomes.filter(e => e.date?.startsWith(thisMonth))
  const totalExp = monthExp.reduce((s, e) => s + e.amount, 0)
  const totalInc = monthInc.reduce((s, e) => s + e.amount, 0)
  const net = totalInc - totalExp

  const byCat = categories.map(c => ({
    name: c.label,
    value: monthExp.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0),
    color: c.color, emoji: c.emoji,
  })).filter(c => c.value > 0)

  const byMember = members.map(m => ({
    name: m,
    gastos:   monthExp.filter(e => e.member === m).reduce((s, e) => s + e.amount, 0),
    ingresos: monthInc.filter(e => e.member === m).reduce((s, e) => s + e.amount, 0),
  }))

  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    months.push({
      key, label: d.toLocaleString('es-AR', { month: 'short' }),
      gastos:   expenses.filter(e => e.date?.startsWith(key)).reduce((s, e) => s + e.amount, 0),
      ingresos: incomes.filter(e => e.date?.startsWith(key)).reduce((s, e) => s + e.amount, 0),
    })
  }

  const ttStyle = {
    background: 'rgba(8,14,32,0.95)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
    color: '#fff', fontSize: 13, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  }

  if (expenses.length === 0 && incomes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.25)' }}>
        <div style={{ fontSize: 52, marginBottom: 14 }}>📊</div>
        <div style={{ fontSize: 15 }}>Todavía no hay datos para mostrar</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))', gap: 10 }}>
        <HeroKpi label="Ingresos" value={totalInc} color="var(--green)" sign="+" />
        <HeroKpi label="Gastos"   value={totalExp} color="var(--red)"   sign="-" />
        <HeroKpi label="Balance"  value={Math.abs(net)} color={net >= 0 ? 'var(--green)' : 'var(--red)'} sign={net >= 0 ? '+' : '-'} />
        <HeroKpi label="N° gastos" value={monthExp.length} color="var(--yellow)" isMoney={false} />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {byCat.length > 0 && (
          <ChartCard title={`Gastos por categoría — ${monthLabel(thisMonth)}`}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byCat} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={88} innerRadius={42}>
                  {byCat.map((c, i) => <Cell key={i} fill={c.color} stroke="rgba(0,0,0,0.35)" strokeWidth={2} />)}
                </Pie>
                <Tooltip formatter={v => `$${v.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} contentStyle={ttStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {byMember.length > 0 && (
          <ChartCard title={`Por miembro — ${monthLabel(thisMonth)}`}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byMember} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.25)" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }} tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}`} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => `$${v.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} contentStyle={ttStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="ingresos" fill="#30d158" radius={[5, 5, 0, 0]} name="Ingresos" />
                <Bar dataKey="gastos" fill="url(#grad1)" radius={[5, 5, 0, 0]} name="Gastos" />
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5a8fff" /><stop offset="100%" stopColor="#7c6df7" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* 6-month evolution */}
      <ChartCard title="Evolución — últimos 6 meses">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={months} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
            <XAxis dataKey="label" stroke="rgba(255,255,255,0.25)" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }} tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}`} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => `$${v.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} contentStyle={ttStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="ingresos" fill="#30d158" radius={[5, 5, 0, 0]} name="Ingresos" />
            <Bar dataKey="gastos" fill="url(#grad2)" radius={[5, 5, 0, 0]} name="Gastos" />
            <defs>
              <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5a8fff" /><stop offset="100%" stopColor="#7c6df7" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Category breakdown */}
      {byCat.length > 0 && (
        <ChartCard title="Desglose por categoría">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[...byCat].sort((a, b) => b.value - a.value).map(c => {
              const pct = totalExp > 0 ? c.value / totalExp : 0
              return (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: `${c.color}18`, border: `1px solid ${c.color}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
                  }}>{c.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                      <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{c.name}</span>
                      <span style={{ color: c.color, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        {(pct * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct * 100}%`, height: '100%', background: `linear-gradient(90deg, ${c.color}, ${c.color}99)`, borderRadius: 3, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, minWidth: 90, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'rgba(255,255,255,0.9)' }}>
                    ${c.value.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              )
            })}
          </div>
        </ChartCard>
      )}
    </div>
  )
}

function HeroKpi({ label, value, color, sign = '', isMoney = true }) {
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
        {isMoney ? `${sign}$${fmt(value)}` : value}
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <div style={{ fontSize: 13, fontWeight: 650, letterSpacing: '-0.01em', marginBottom: 16, color: 'rgba(255,255,255,0.85)' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

const fmt = v => Math.round(v).toLocaleString('es-AR')

function monthLabel(key) {
  const [y, m] = key.split('-')
  return new Date(y, m - 1, 1).toLocaleString('es-AR', { month: 'long', year: 'numeric' })
}
