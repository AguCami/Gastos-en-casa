import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

export default function Summary({ expenses, members, categories }) {
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const monthExpenses = expenses.filter(e => e.date?.startsWith(thisMonth))
  const totalMonth = monthExpenses.reduce((s, e) => s + e.amount, 0)
  const totalAll = expenses.reduce((s, e) => s + e.amount, 0)

  // By category (this month)
  const byCat = categories.map(c => ({
    name: c.label,
    value: monthExpenses.filter(e => e.category === c.id).reduce((s, e) => s + e.amount, 0),
    color: c.color,
    emoji: c.emoji,
  })).filter(c => c.value > 0)

  // By member (this month)
  const byMember = members.filter(m => m !== 'Todos').map(m => ({
    name: m,
    total: monthExpenses.filter(e => e.member === m).reduce((s, e) => s + e.amount, 0),
  }))

  // Last 6 months bar chart
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('es-AR', { month: 'short', year: '2-digit' })
    months.push({ key, label, total: expenses.filter(e => e.date?.startsWith(key)).reduce((s, e) => s + e.amount, 0) })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <Kpi label="Este mes" value={totalMonth} accent="var(--accent)" />
        <Kpi label="Total registrado" value={totalAll} accent="var(--green)" />
        <Kpi label="Gastos este mes" value={monthExpenses.length} isMoney={false} accent="var(--yellow)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {/* Pie por categoría */}
        {byCat.length > 0 && (
          <div className="card">
            <h4 style={{ marginBottom: 16, fontWeight: 600 }}>Por categoría — {monthLabel(thisMonth)}</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byCat} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {byCat.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip formatter={v => `$${v.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bar por miembro */}
        {byMember.length > 0 && (
          <div className="card">
            <h4 style={{ marginBottom: 16, fontWeight: 600 }}>Por miembro — {monthLabel(thisMonth)}</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byMember} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text2)" tick={{ fill: 'var(--text2)', fontSize: 12 }} />
                <YAxis stroke="var(--text2)" tick={{ fill: 'var(--text2)', fontSize: 12 }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={v => `$${v.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="total" fill="var(--accent)" radius={[6, 6, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Evolución mensual */}
      <div className="card">
        <h4 style={{ marginBottom: 16, fontWeight: 600 }}>Últimos 6 meses</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={months} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="label" stroke="var(--text2)" tick={{ fill: 'var(--text2)', fontSize: 12 }} />
            <YAxis stroke="var(--text2)" tick={{ fill: 'var(--text2)', fontSize: 12 }} tickFormatter={v => `$${v}`} />
            <Tooltip formatter={v => `$${v.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
            <Bar dataKey="total" fill="var(--green)" radius={[6, 6, 0, 0]} name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detalle por categoría */}
      {byCat.length > 0 && (
        <div className="card">
          <h4 style={{ marginBottom: 14, fontWeight: 600 }}>Detalle por categoría</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {byCat.sort((a, b) => b.value - a.value).map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>{c.emoji}</span>
                <span style={{ flex: 1, fontSize: 14 }}>{c.name}</span>
                <div style={{ width: 120, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(c.value / totalMonth * 100).toFixed(1)}%`, height: '100%', background: c.color, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, minWidth: 80, textAlign: 'right' }}>
                  ${c.value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Kpi({ label, value, accent, isMoney = true }) {
  return (
    <div className="card" style={{ borderLeft: `3px solid ${accent}` }}>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700 }}>
        {isMoney ? `$${value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : value}
      </div>
    </div>
  )
}

function monthLabel(key) {
  const [y, m] = key.split('-')
  const d = new Date(y, m - 1, 1)
  return d.toLocaleString('es-AR', { month: 'long', year: 'numeric' })
}
