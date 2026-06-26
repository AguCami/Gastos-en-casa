import { useState, useMemo } from 'react'

export default function CreditSimulator() {
  const [form, setForm] = useState({ amount: '', rate: '', months: '12', type: 'french' })
  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  const result = useMemo(() => {
    const P = parseFloat(form.amount)
    const anual = parseFloat(form.rate)
    const n = parseInt(form.months)
    if (!P || !anual || !n) return null

    const r = anual / 100 / 12

    if (form.type === 'french') {
      const cuota = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
      const totalPago = cuota * n
      return { cuota, totalPago, totalIntereses: totalPago - P, tabla: Array.from({ length: 3 }, () => ({ cuota })), n }
    }

    if (form.type === 'german') {
      const capitalCuota = P / n
      const rows = []
      let saldo = P, totalPago = 0
      for (let i = 0; i < n; i++) {
        const interes = saldo * r
        const cuota = capitalCuota + interes
        totalPago += cuota
        saldo -= capitalCuota
        if (i < 3) rows.push({ cuota: Math.round(cuota * 100) / 100, interes: Math.round(interes * 100) / 100 })
      }
      return { cuota: rows[0]?.cuota || 0, totalPago, totalIntereses: totalPago - P, tabla: rows, n }
    }
  }, [form])

  const isFrench = form.type === 'french'

  return (
    <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Input card */}
      <div className="card" style={{ padding: '20px 22px' }}>
        <div style={{ fontSize: 13, fontWeight: 650, letterSpacing: '-0.01em', marginBottom: 20 }}>
          💳 Calculadora de crédito
        </div>

        {/* Type toggle */}
        <div style={{ marginBottom: 18 }}>
          <label className="label">Sistema de amortización</label>
          <div style={toggle}>
            {[['french','Francés (cuota fija)'],['german','Alemán (capital fijo)']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => set('type', v)} style={{
                flex: 1, padding: '9px', borderRadius: 10, fontSize: 13, fontWeight: form.type === v ? 600 : 400,
                background: form.type === v ? 'rgba(255,255,255,0.14)' : 'transparent',
                color: form.type === v ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.42)',
                border: form.type === v ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                transition: 'all 0.18s',
              }}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label className="label">Monto ($)</label>
            <input type="number" min="0" step="1000" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="500,000" />
          </div>
          <div>
            <label className="label">TNA (%)</label>
            <input type="number" min="0" step="0.5" value={form.rate} onChange={e => set('rate', e.target.value)} placeholder="80" />
          </div>
          <div>
            <label className="label">Cuotas</label>
            <input type="number" min="1" max="360" value={form.months} onChange={e => set('months', e.target.value)} placeholder="12" />
          </div>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
            <ResultKpi label={isFrench ? 'Cuota mensual' : '1° cuota'} value={result.cuota}            color="#5a8fff" />
            <ResultKpi label="Total a pagar"                            value={result.totalPago}        color="var(--yellow)" />
            <ResultKpi label="Total intereses"                          value={result.totalIntereses}   color="var(--red)" />
            <ResultKpi label="% interés"
              value={result.totalIntereses / parseFloat(form.amount) * 100}
              color="#f670c7" isPercent
            />
          </div>

          {/* Amortization preview */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginBottom: 14 }}>
              Primeras cuotas de {result.n} total
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.tabla.map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(90,143,255,0.18)', border: '1px solid rgba(90,143,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#5a8fff',
                  }}>{i + 1}</div>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    ${row.cuota.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </div>
                  {row.interes !== undefined && (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' }}>
                      interés: ${row.interes.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>
              ))}
              {result.n > 3 && (
                <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)', padding: '4px 0' }}>
                  ··· {result.n - 3} cuotas más
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.22)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
          <div style={{ fontSize: 14 }}>Completá los campos para ver el resultado</div>
        </div>
      )}
    </div>
  )
}

function ResultKpi({ label, value, color, isPercent }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16, padding: '15px 16px',
      boxShadow: `inset 0 0 0 1px ${color}14, inset 0 1px 0 rgba(255,255,255,0.08)`,
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.32)', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 750, letterSpacing: '-0.03em', color, fontVariantNumeric: 'tabular-nums' }}>
        {isPercent ? `${value.toFixed(1)}%` : `$${Math.round(value).toLocaleString('es-AR')}`}
      </div>
    </div>
  )
}

const toggle = {
  display: 'flex', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 3, gap: 3,
}
