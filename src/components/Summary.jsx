import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function Summary({ expenses, incomes, members, categories }) {
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const monthExp = expenses.filter(e => e.date?.startsWith(thisMonth))
  const monthInc = incomes.filter(e => e.date?.startsWith(thisMonth))
  const totalExpMonth = monthExp.reduce((s, e) => s + e.amount, 0)
  const totalIncMonth = monthInc.reduce((s, e) => s + e.amount, 0)
  const netMonth = totalIncMonth - totalExpMonth

  const byCat = categories.map(c => ({
    name: c.label, value: monthExp.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0),
    color: c.color, emoji: c.emoji,
  })).filter(c => c.value > 0)

  const byMember = members.map(m => ({
    name: m,
    gastos: monthExp.filter(e => e.member === m).reduce((s, e) => s + e.amount, 0),
    ingresos: monthInc.filter(e => e.member === m).reduce((s, e) => s + e.amount, 0),
  }))

  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('es-AR', { month: 'short' })
    months.push({
      key, label,
      gastos: expenses.filter(e => e.date?.startsWith(key)).reduce((s, e) => s + e.amount, 0),
      ingresos: incomes.filter(e => e.date?.startsWith(key)).reduce((s, e) => s + e.amount, 0),
    })
  }

  const ttStyle = {
    background: 'rgba(10,18,42,0.9)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff', fontSize: 13,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        <Kpi label="Ingresos este mes" value={totalIncMonth} color="#34d058" prefix="+" />
        <Kpi label="Gastos este mes" value={totalExpMonth} color="#ff453a" prefix="-" />
        <Kpi label="Balance neto" value={netMonth} color={netMonth >= 0 ? '#34d058' : '#ff453a'} prefix={netMonth >= 0 ? '+' : ''} />
        <Kpi label="N° de gastos" value={monthExp.length} color="#ffd60a" isMoney={false} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {byCat.length > 0 && (
          <div className="card">
            <SectionTitle>Gastos por categoría — {monthLabel(thisMonth)}</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byCat} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={40}>
                  {byCat.map((c, i) => <Cell key={i} fill={c.color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />)}
                </Pie>
                <Tooltip formatter={v => `$${v.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} contentStyle={ttStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {byMember.length > 0 && (
          <div className="card">
            <SectionTitle>Por miembro — {monthLabel(thisMonth)}</SectionTitle>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byMember} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} tickFormatter={v => `$${v}`} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => `$${v.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} contentStyle={ttStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="ingresos" fill="#34d058" radius={[6, 6, 0, 0]} name="Ingresos" />
                <Bar dataKey="gastos" fill="url(#blueGrad)" radius={[6, 6, 0, 0]} name="Gastos" />
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f8ef7" /><stop offset="100%" stopColor="#5e5ce6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Evolution */}
      <div className="card">
        <SectionTitle>Últimos 6 meses</SectionTitle>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={months} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} tickFormatter={v => `$${v}`} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => `$${v.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} contentStyle={ttStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="ingresos" fill="#34d058" radius={[6, 6, 0, 0]} name="Ingresos" />
            <Bar dataKey="gastos" fill="url(#blueGrad2)" radius={[6, 6, 0, 0]} name="Gastos" />
            <defs>
              <linearGradient id="blueGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f8ef7" /><stop offset="100%" stopColor="#5e5ce6" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown */}
      {byCat.length > 0 && (
        <div className="card">
          <SectionTitle>Desglose por categoría</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
            {byCat.sort((a, b) => b.value - a.value).map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{c.emoji}</span>
                <span style={{ flex: 1, fontSize: 14 }}>{c.name}</span>
                <div style={{ width: 100, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(c.value / totalExpMonth * 100).toFixed(1)}%`, height: '100%', background: `linear-gradient(90deg, ${c.color}, ${c.color}aa)`, borderRadius: 3, transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, minWidth: 90, textAlign: 'right', letterSpacing: '-0.01em' }}>
                  ${c.value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {expenses.length === 0 && incomes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.35)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <div>Todavía no hay datos para mostrar</div>
        </div>
      )}
    </div>
  )
}

function Kpi({ label, value, color, isMoney = true, prefix = '' }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.12)', borderTop: `2px solid ${color}`,
      borderRadius: 20, padding: '18px 20px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
    }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color }}>
        {isMoney ? `${prefix}$${Math.abs(value).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : value}
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return <h4 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: 'rgba(255,255,255,0.8)' }}>{children}</h4>
}

function monthLabel(key) {
  const [y, m] = key.split('-')
  return new Date(y, m - 1, 1).toLocaleString('es-AR', { month: 'long', year: 'numeric' })
}
