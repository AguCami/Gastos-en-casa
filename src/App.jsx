import { useState } from 'react'
import { useStore } from './useStore'
import Header from './components/Header'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import Summary from './components/Summary'
import Members from './components/Members'

export default function App() {
  const [tab, setTab] = useState('Gastos')
  const [showForm, setShowForm] = useState(false)
  const { members, expenses, addMember, removeMember, addExpense, removeExpense, editExpense, CATEGORIES } = useStore()

  const hasMembers = members.filter(m => m !== 'Todos').length > 0

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header tab={tab} setTab={setTab} />

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px 100px' }}>
        {tab === 'Gastos' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em' }}>Gastos</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
                disabled={!hasMembers}
                title={!hasMembers ? 'Primero agrega un miembro' : ''}
                style={{ opacity: hasMembers ? 1 : 0.4 }}
              >
                + Nuevo gasto
              </button>
            </div>

            {!hasMembers ? (
              <div style={{
                textAlign: 'center', padding: '60px 20px',
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 24,
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
                <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
                  Primero agregá a los integrantes del hogar
                </div>
                <button className="btn btn-primary" onClick={() => setTab('Miembros')}>
                  Ir a Miembros
                </button>
              </div>
            ) : (
              <ExpenseList
                expenses={expenses}
                members={members}
                categories={CATEGORIES}
                onRemove={removeExpense}
                onEdit={editExpense}
              />
            )}
          </>
        )}

        {tab === 'Resumen' && (
          <>
            <h2 style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em', marginBottom: 20 }}>Resumen</h2>
            <Summary expenses={expenses} members={members} categories={CATEGORIES} />
          </>
        )}

        {tab === 'Miembros' && (
          <>
            <h2 style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em', marginBottom: 20 }}>Miembros del hogar</h2>
            <Members members={members} expenses={expenses} onAdd={addMember} onRemove={removeMember} />
          </>
        )}
      </main>

      {showForm && (
        <ExpenseForm
          members={members}
          categories={CATEGORIES}
          onAdd={addExpense}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
