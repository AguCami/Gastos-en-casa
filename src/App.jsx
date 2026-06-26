import { useState } from 'react'
import { AuthProvider, useUser } from './AuthContext'
import { useStore } from './useStore'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import Header from './components/Header'
import EntryForm from './components/EntryForm'
import EntryList from './components/EntryList'
import Summary from './components/Summary'
import Members from './components/Members'
import Balances from './components/Balances'
import Budgets from './components/Budgets'
import Goals from './components/Goals'
import Recurring from './components/Recurring'
import Dashboard from './components/Dashboard'
import CreditSimulator from './components/CreditSimulator'

export default function App() {
  return (
    <AuthProvider>
      <Inner />
    </AuthProvider>
  )
}

function Inner() {
  const user = useUser()
  if (user === undefined) return <Splash />
  if (user === null) return <AuthPage />
  return <MainApp />
}

function MainApp() {
  const [tab, setTab] = useState('Inicio')
  const [entryType, setEntryType] = useState('expense')
  const [showForm, setShowForm] = useState(false)
  const store = useStore()

  const {
    loading, household, members, expenses, incomes, entries, budgets, goals, recurring,
    addMember, removeMember,
    addEntry, removeEntry, editEntry,
    setBudget,
    addGoal, updateGoal, removeGoal,
    addRecurring, removeRecurring, toggleRecurring,
    CATEGORIES,
  } = store

  if (loading) return <Splash />
  if (!household) return <OnboardingPage />

  const hasMembers = members.length > 0
  const tabs = ['Inicio', 'Gastos', 'Resumen', 'Balances', 'Presupuesto', 'Metas', 'Recurrentes', 'Simulador', 'Miembros']

  function registerRecurring(r) {
    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    addEntry({
      type: r.type, description: r.description, amount: r.amount,
      category: r.category, member: r.member, note: 'Recurrente',
      date: `${thisMonth}-${String(r.day_of_month).padStart(2, '0')}`,
    })
  }

  return (
    <div className="dashboard-bg">
      <Header tab={tab} setTab={setTab} tabs={tabs} household={household} />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px 100px' }}>

        {tab === 'Inicio' && (
          <Dashboard
            expenses={expenses} incomes={incomes} members={members}
            categories={CATEGORIES} budgets={budgets} goals={goals}
            recurring={recurring} entries={entries}
            onGoTo={setTab}
            onRegisterRecurring={registerRecurring}
          />
        )}

        {tab === 'Gastos' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={pageTitle}>Movimientos</h2>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={toggleStyle}>
                  {(['expense','income']).map(t => (
                    <button key={t} onClick={() => setEntryType(t)} style={{
                      padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: entryType === t ? 600 : 400,
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
            {!hasMembers ? <EmptyMembers onGo={() => setTab('Miembros')} /> : (
              <EntryList type={entryType} entries={entries} members={members} expenseCats={CATEGORIES} onRemove={removeEntry} onEdit={editEntry} />
            )}
          </>
        )}

        {tab === 'Resumen' && (
          <>
            <h2 style={{ ...pageTitle, marginBottom: 20 }}>Resumen</h2>
            <Summary expenses={expenses} incomes={incomes} members={members} categories={CATEGORIES} />
          </>
        )}

        {tab === 'Balances' && (
          <>
            <h2 style={{ ...pageTitle, marginBottom: 20 }}>Balances</h2>
            <Balances expenses={expenses} members={members} />
          </>
        )}

        {tab === 'Presupuesto' && (
          <>
            <h2 style={{ ...pageTitle, marginBottom: 20 }}>Presupuesto mensual</h2>
            <Budgets expenses={expenses} categories={CATEGORIES} budgets={budgets} setBudget={setBudget} />
          </>
        )}

        {tab === 'Metas' && (
          <>
            <h2 style={{ ...pageTitle, marginBottom: 20 }}>Metas de ahorro</h2>
            <Goals goals={goals} onAdd={addGoal} onUpdate={updateGoal} onRemove={removeGoal} />
          </>
        )}

        {tab === 'Recurrentes' && (
          <>
            <h2 style={{ ...pageTitle, marginBottom: 20 }}>Movimientos recurrentes</h2>
            <Recurring
              recurring={recurring} members={members} categories={CATEGORIES}
              onAdd={addRecurring} onRemove={removeRecurring} onToggle={toggleRecurring}
              onAddEntry={addEntry}
            />
          </>
        )}

        {tab === 'Simulador' && (
          <>
            <h2 style={{ ...pageTitle, marginBottom: 20 }}>Simulador de créditos</h2>
            <CreditSimulator />
          </>
        )}

        {tab === 'Miembros' && (
          <>
            <h2 style={{ ...pageTitle, marginBottom: 20 }}>Miembros del hogar</h2>
            <Members members={members} expenses={expenses} onAdd={addMember} onRemove={removeMember} />
          </>
        )}
      </main>

      {showForm && (
        <EntryForm
          type={entryType} members={members} expenseCats={CATEGORIES}
          onAdd={addEntry} onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

function Splash() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{
        width: 64, height: 64, borderRadius: 20,
        background: 'linear-gradient(145deg, #5a8fff 0%, #4f6ef7 100%)',
        border: '1px solid rgba(255,255,255,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
        boxShadow: '0 8px 32px rgba(79,110,247,0.45)',
      }}>🏠</div>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, letterSpacing: '0.02em' }}>Cargando...</div>
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
      <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>Primero agregá a los integrantes del hogar</div>
      <button className="btn btn-primary" onClick={onGo}>Ir a Miembros</button>
    </div>
  )
}

const pageTitle = { fontWeight: 750, fontSize: 22, letterSpacing: '-0.04em' }
const toggleStyle = {
  display: 'flex', background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, padding: 3, gap: 3,
}
