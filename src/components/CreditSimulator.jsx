import { useState, useMemo } from 'react'

export default function CreditSimulator() {
  const [form, setForm] = useState({ amount: '', rate: '', months: '12', type: 'french' })
  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  const result = useMemo(() => {
    const P = parseFloat(form.amount)
    const anual = parseFloat(form.rate)
    const n = parseInt(form.months)
    if (!P || !anual || !n) return null

    const r = anual / 100 / 12  // tasa mensual

    if (form.type === 'french') {
      // Cuota fija: P * r * (1+r)^n / ((1+r)^n - 1)
      const cuota = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
      const totalPago = cuota * n
      const totalIntereses = totalPago - P
      const cftAnual = (Math.pow(cuota * n / P, 12 / n) - 1) * 100

      const tabla = Array.from({ length: n }, (_, i) => {
        const interes = i === 0 ? P * r : null  // lazy: only first shown
        return { cuota: Math.round(cuota * 100) / 100 }
      })

      return { cuota, totalPago, totalIntereses, cftAnual, tabla: tabla.slice(0, 3), n }
    }

    if (form.type === 'german') {
      // Capital fijo
      const capitalCuota = P / n
      const rows = []
      let saldo = P
      let totalPago = 0
      for (let i = 0; i < n; i++) {
        const interes = saldo * r
        const cuota = capitalCuota + interes
        totalPago += cuota
        saldo -= capitalCuota
        if (i < 3) rows.push({ num: i + 1, cuota: Math.round(cuota * 100) / 100, interes: Math.round(interes * 100) / 100 })
      }
      const cuota1 = rows[0]?.cuota || 0
      return { cuota: cuota1, totalPago, totalIntereses: totalPago - P, tabla: rows, n }
    }
  }, [form])

  return (
    <div style={{ maxWidth: 600 }}>
      {/* Inputs */}
      <div className="card" style={{ borderRadius: 22, marginBottom: 16 }}>
        <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 18 }}>💳 Calculadora de crédito</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Type toggle */}
          <div>
            <label style={lbl}>Sistema de amortización</label>
            <div style={toggle}>
              {[['french','Francés (cuota fija)'],['german','Alemán (capital fijo)']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => set('type', v)} style={{
                  flex: 1, padding: '8px', borderRadius: 10, fontSize: 13, fontWeight: form.type === v ? 600 : 400,
                  background: form.type === v ? 'rgba(255,255,255,0.18)' : 'transparent',
                  color: form.type === v ? '#fff' : 'rgba(255,255,255,0.45)',
                  border: form.type === v ? '1px solid rgba(255,255,255,0.25)' : '1px solid transparent',
                  transition: 'all 0.18s',
                }}>{l}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Monto ($)</label>
              <input type="number" min="0" step="1000" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="500,000" />
            </div>
            <div>
              <label style={lbl}>TNA (%)</label>
              <input type="number" min="0" step="0.5" value={form.rate} onChange={e => set('rate', e.target.value)} placeholder="80" />
            </div>
            <div>
              <label style={lbl}>Cuotas</label>
              <input type="number" min="1" max="360" value={form.months} onChange={e => set('months', e.target.value)} placeholder="12" />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
            <ResultKpi label={form.type === 'french' ? 'Cuota mensual' : '1° cuota'} value={result.cuota} color="#4f8ef7" />
            <ResultKpi label="Total a pagar" value={result.totalPago} color="#ffd60a" />
            <ResultKpi label="Total intereses" value={result.totalIntereses} color="#ff453a" />
            <ResultKpi label="% interés total" value={result.totalIntereses / parseFloat(form.amount) * 100} color="#ec4899" isPercent />
          </div>

          {/* Amortization preview */}
          <div className="card" style={{ borderRadius: 20 }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
              Primeras cuotas (de {result.n} total)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.tabla.map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(79,142,247,0.2)', border: '1px solid rgba(79,142,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#4f8ef7', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>
                    ${row.cuota.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </div>
                  {row.interes !== undefined && (
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                      int: ${row.interes.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>
              ))}
              {result.n > 3 && (
                <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)', padding: '4px 0' }}>
                  ... {result.n - 3} cuotas más
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!result && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>💳</div>
          <div>Completá los campos para ver el resultado</div>
        </div>
      )}
    </div>
  )
}

function ResultKpi({ label, value, color, isPercent }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid rgba(255,255,255,0.1)`, borderTop: `2px solid ${color}`,
      borderRadius: 16, padding: '14px 16px',
    }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 19, fontWeight: 700, color, letterSpacing: '-0.02em' }}>
        {isPercent ? `${value.toFixed(1)}%` : `$${Math.round(value).toLocaleString('es-AR')}`}
      </div>
    </div>
  )
}

const lbl = { display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }
const toggle = {
  display: 'flex', background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 3, gap: 3,
}
