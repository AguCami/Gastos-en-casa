import { useState } from 'react'

export default function Balances({ expenses, members }) {
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const [selectedMonth, setSelectedMonth] = useState(thisMonth)

  if (members.length < 2) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255,255,255,0.22)' }}>
        <div style={{ fontSize: 52, marginBottom: 14 }}>⚖️</div>
        <div style={{ fontSize: 14 }}>Necesitás al menos 2 miembros para dividir gastos</div>
      </div>
    )
  }

  const monthExp = expenses.filter(e => !selectedMonth || e.date?.startsWith(selectedMonth))

  const paid = {}
  members.forEach(m => { paid[m] = 0 })
  monthExp.forEach(e => { if (paid[e.member] !== undefined) paid[e.member] += e.amount })

  const total = Object.values(paid).reduce((s, v) => s + v, 0)
  const share = total / members.length
  const balance = {}
  members.forEach(m => { balance[m] = paid[m] - share })

  const settlements = settle(members, balance)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Month + summary */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '12px 16px',
      }}>
        <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ width: 'auto' }} />
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', flex: 1, fontVariantNumeric: 'tabular-nums' }}>
          Total: <strong style={{ color: 'rgba(255,255,255,0.75)' }}>${fmt(total)}</strong>
          <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
          Parte por persona: <strong style={{ color: 'rgba(255,255,255,0.75)' }}>${fmt(share)}</strong>
        </div>
      </div>

      {/* Per-member cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 10 }}>
        {members.map(m => {
          const b = balance[m]
          const isPos = b >= 0
          const color = isPos ? 'var(--green)' : 'var(--red)'
          return (
            <div key={m} style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${isPos ? 'rgba(48,209,88,0.22)' : 'rgba(255,69,58,0.22)'}`,
              borderRadius: 18, padding: '16px 18px',
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px ${isPos ? 'rgba(48,209,88,0.08)' : 'rgba(255,69,58,0.08)'}`,
            }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 6, fontWeight: 600, letterSpacing: '-0.01em' }}>{m}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', marginBottom: 8 }}>
                Pagó <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>${fmt(paid[m])}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 750, color, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                {isPos ? '+' : ''}${fmt(b)}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 4 }}>
                {isPos ? 'le deben' : 'debe'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Settlements */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 650, letterSpacing: '-0.01em', marginBottom: 14 }}>
          ⚖️ Cómo quedar a mano
        </div>
        {settlements.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
            ✅ Todos están a mano
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {settlements.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 13, padding: '12px 16px',
              }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700, color: 'var(--red)' }}>{s.from}</span>
                  <span style={{ color: 'rgba(255,255,255,0.35)', margin: '0 8px', fontSize: 13 }}>le paga a</span>
                  <span style={{ fontWeight: 700, color: 'var(--green)' }}>{s.to}</span>
                </div>
                <div style={{ fontWeight: 750, fontSize: 17, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
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

function settle(members, balance) {
  const debtors   = members.filter(m => balance[m] < -0.01).map(m => ({ name: m, amount: -balance[m] })).sort((a, b) => b.amount - a.amount)
  const creditors = members.filter(m => balance[m] >  0.01).map(m => ({ name: m, amount:  balance[m] })).sort((a, b) => b.amount - a.amount)
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

const fmt = v => Math.round(v).toLocaleString('es-AR')
