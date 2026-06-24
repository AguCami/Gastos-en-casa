export default function Balances({ expenses, members }) {
  if (members.length < 2) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.35)' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚖️</div>
        <div>Necesitás al menos 2 miembros para dividir gastos</div>
      </div>
    )
  }

  // Get current month expenses only
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [selectedMonth, setSelectedMonth] = useState(thisMonth)

  const monthExp = expenses.filter(e => !selectedMonth || e.date?.startsWith(selectedMonth))

  // Total paid per member
  const paid = {}
  members.forEach(m => { paid[m] = 0 })
  monthExp.forEach(e => { if (paid[e.member] !== undefined) paid[e.member] += e.amount })

  const total = Object.values(paid).reduce((s, v) => s + v, 0)
  const share = total / members.length  // equal split

  // Balance: positive = gets money back, negative = owes
  const balance = {}
  members.forEach(m => { balance[m] = paid[m] - share })

  // Settle debts: greedy algorithm
  const settlements = settle(members, balance)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Month selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ width: 'auto' }} />
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          Total: ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })} · Parte por persona: ${share.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Per-member balance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {members.map(m => {
          const b = balance[m]
          const isPos = b >= 0
          return (
            <div key={m} style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${isPos ? 'rgba(52,208,88,0.3)' : 'rgba(255,69,58,0.3)'}`,
              borderRadius: 20, padding: '16px 18px',
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1)`,
            }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 500 }}>{m}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 4 }}>
                Pagó: ${paid[m].toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: isPos ? '#34d058' : '#ff453a', letterSpacing: '-0.02em' }}>
                {isPos ? '+' : ''}{b.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
                {isPos ? 'le deben' : 'debe'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Settlements */}
      <div className="card" style={{ borderRadius: 22 }}>
        <h4 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: 'rgba(255,255,255,0.8)' }}>
          Cómo quedar a mano
        </h4>
        {settlements.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
            ✅ Todos están a mano
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {settlements.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14, padding: '12px 16px',
              }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, color: '#ff453a' }}>{s.from}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 8px' }}>le paga a</span>
                  <span style={{ fontWeight: 600, color: '#34d058' }}>{s.to}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: '-0.02em' }}>
                  ${s.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Minimal transactions to settle debts
function settle(members, balance) {
  const debtors  = members.filter(m => balance[m] < -0.01).map(m => ({ name: m, amount: -balance[m] })).sort((a, b) => b.amount - a.amount)
  const creditors = members.filter(m => balance[m] > 0.01).map(m => ({ name: m, amount: balance[m] })).sort((a, b) => b.amount - a.amount)
  const result = []
  let i = 0, j = 0
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount)
    result.push({ from: debtors[i].name, to: creditors[j].name, amount: Math.round(pay * 100) / 100 })
    debtors[i].amount -= pay
    creditors[j].amount -= pay
    if (debtors[i].amount < 0.01) i++
    if (creditors[j].amount < 0.01) j++
  }
  return result
}

// useState needs to be imported
import { useState } from 'react'
