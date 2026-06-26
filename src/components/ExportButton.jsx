export default function ExportButton({ entries, categories }) {
  function exportCSV() {
    const INCOME_CATS = [
      { id: 'sueldo', label: 'Sueldo' }, { id: 'freelance', label: 'Freelance' },
      { id: 'alquiler', label: 'Alquiler cobrado' }, { id: 'transferencia', label: 'Transferencia' },
      { id: 'otro_ing', label: 'Otro' },
    ]
    const allCats = [...categories, ...INCOME_CATS]
    const getCat = id => allCats.find(c => c.id === id)?.label || id

    const rows = [
      ['Fecha', 'Tipo', 'Descripción', 'Categoría', 'Miembro', 'Monto', 'Nota'],
      ...entries.map(e => [
        e.date,
        e.type === 'expense' ? 'Gasto' : 'Ingreso',
        e.description,
        getCat(e.category),
        e.member,
        e.amount,
        e.note || '',
      ])
    ]

    const csv = rows.map(r => r.map(cell => {
      const s = String(cell ?? '')
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"` : s
    }).join(',')).join('\n')

    const bom = '﻿'  // UTF-8 BOM for Excel
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gastos-en-casa-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      className="btn btn-ghost"
      onClick={exportCSV}
      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
    >
      📥 Exportar CSV
    </button>
  )
}
