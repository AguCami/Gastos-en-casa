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

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header tab={tab} setTab={setTab} />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
        {tab === 'Gastos' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 700, fontSize: 20 }}>Gastos</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
                disabled={members.filter(m => m !== 'Todos').length === 0}
                title={members.filter(m => m !== 'Todos').length === 0 ? 'Primero agrega un miembro' : ''}
              >
                + Nuevo gasto
              </button>
            </div>
            {members.filter(m => m !== 'Todos').length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>
                Primero andá a <strong style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => setTab('Miembros')}>Miembros</strong> y agregá alguien del hogar.
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
            <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Resumen</h2>
            <Summary expenses={expenses} members={members} categories={CATEGORIES} />
          </>
        )}

        {tab === 'Miembros' && (
          <>
            <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Miembros del hogar</h2>
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
