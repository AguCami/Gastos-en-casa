import { useState } from 'react'
import { useStore } from './useStore'
import Header from './components/Header'
import EntryForm from './components/EntryForm'
import EntryList from './components/EntryList'
import Summary from './components/Summary'
import Members from './components/Members'
import Balances from './components/Balances'
import Budgets from './components/Budgets'

export default function App() {
  const [tab, setTab] = useState('Gastos')
  const [entryType, setEntryType] = useState('expense')  // 'expense' | 'income'
  const [showForm, setShowForm] = useState(false)
  const { members, expenses, incomes, entries, budgets, addMember, removeMember, addEntry, removeEntry, editEntry, setBudget, CATEGORIES } = useStore()

  const hasMembers = members.length > 0

  const tabs = ['Gastos', 'Resumen', 'Balances', 'Presupuesto', 'Miembros']

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header tab={tab} setTab={setTab} tabs={tabs} />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px 100px' }}>

        {/* ── Gastos / Ingresos ─────────────────────────────── */}
        {tab === 'Gastos' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={pageTitle}>Movimientos</h2>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {/* Toggle gastos/ingresos */}
                <div style={toggle}>
                  {(['expense', 'income']).map(t => (
                    <button key={t} onClick={() => setEntryType(t)} style={{
                      padding: '7px 16px', borderRadius: 10, fontSize: 13, fontWeight: entryType === t ? 600 : 400,
                      background: entryType === t ? (t === 'expense' ? 'rgba(255,69,58,0.3)' : 'rgba(52,208,88,0.3)') : 'transparent',
                      color: entryType === t ? (t === 'expense' ? '#ff453a' : '#34d058') : 'rgba(255,255,255,0.45)',
                      border: entryType === t ? `1px solid ${t === 'expense' ? 'rgba(255,69,58,0.4)' : 'rgba(52,208,88,0.4)'}` : '1px solid transparent',
                      transition: 'all 0.2s',
                    }}>
                      {t === 'expense' ? '💸 Gastos' : '💰 Ingresos'}
                    </button>
                  ))}
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)} disabled={!hasMembers} style={{ opacity: hasMembers ? 1 : 0.4 }}>
                  + Nuevo
                </button>
              </div>
            </div>

            {!hasMembers ? (
              <EmptyMembers onGo={() => setTab('Miembros')} />
            ) : (
              <EntryList
                type={entryType}
                entries={entries}
                members={members}
                expenseCats={CATEGORIES}
                onRemove={removeEntry}
                onEdit={editEntry}
              />
            )}
          </>
        )}

        {/* ── Resumen ──────────────────────────────────────── */}
        {tab === 'Resumen' && (
          <>
            <h2 style={{ ...pageTitle, marginBottom: 20 }}>Resumen</h2>
            <Summary expenses={expenses} incomes={incomes} members={members} categories={CATEGORIES} />
          </>
        )}

        {/* ── Balances ─────────────────────────────────────── */}
        {tab === 'Balances' && (
          <>
            <h2 style={{ ...pageTitle, marginBottom: 20 }}>Balances</h2>
            <Balances expenses={expenses} members={members} />
          </>
        )}

        {/* ── Presupuesto ──────────────────────────────────── */}
        {tab === 'Presupuesto' && (
          <>
            <h2 style={{ ...pageTitle, marginBottom: 20 }}>Presupuesto mensual</h2>
            <Budgets expenses={expenses} categories={CATEGORIES} budgets={budgets} setBudget={setBudget} />
          </>
        )}

        {/* ── Miembros ─────────────────────────────────────── */}
        {tab === 'Miembros' && (
          <>
            <h2 style={{ ...pageTitle, marginBottom: 20 }}>Miembros del hogar</h2>
            <Members members={members} expenses={expenses} onAdd={addMember} onRemove={removeMember} />
          </>
        )}
      </main>

      {showForm && (
        <EntryForm
          type={entryType}
          members={members}
          expenseCats={CATEGORIES}
          onAdd={addEntry}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

function EmptyMembers({ onGo }) {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 20px',
      background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24,
    }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
      <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
        Primero agregá a los integrantes del hogar
      </div>
      <button className="btn btn-primary" onClick={onGo}>Ir a Miembros</button>
    </div>
  )
}

const pageTitle = { fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em' }
const toggle = {
  display: 'flex', background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 3, gap: 2,
}
