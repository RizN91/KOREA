import { useEffect, useState } from 'react'
import { db, Customer } from '../services/db'
import { exportCsv, importCsv } from '../utils/csv'

export default function CustomersPage(){
  const [items, setItems] = useState<Customer[]>([])
  const [name, setName] = useState('')

  useEffect(()=>{ db.customers.list().then(setItems) }, [])

  async function add() {
    if (!name.trim()) return
    await db.customers.create({ name, contactName: 'Manager', email: name.toLowerCase().replace(/\s+/g,'')+'@example.com', phone: '03 9000 0000', notes: '', addresses: [{ street:'1 Test St', suburb:'Melbourne', state:'VIC', postcode:'3000', type:'Site' }] })
    setName('')
    db.customers.list().then(setItems)
  }

  async function importFile(file: File){
    const rows = await importCsv(file)
    for (const r of rows) {
      if (!r.name) continue
      await db.customers.create({ name: r.name, contactName: r.contactName || 'Manager', email: r.email || `${r.name?.toLowerCase().replace(/\s+/g,'')}@example.com`, phone: r.phone || '03 9000 0000', notes: r.notes || '', addresses: [{ street: r.street || '1 Imported St', suburb: r.suburb || 'Melbourne', state: r.state || 'VIC', postcode: r.postcode || '3000', type:'Site' }] })
    }
    db.customers.list().then(setItems)
  }

  return (
    <div className="space-y-3">
      <div className="text-xl font-semibold">Customers</div>
      <div className="card p-3 flex gap-2 flex-wrap items-center">
        <input className="input" placeholder="New customer name" value={name} onChange={e=>setName(e.target.value)} />
        <button className="btn" onClick={add}>Add</button>
        <button className="btn-secondary" onClick={()=>exportCsv(items, 'customers.csv')}>Export CSV</button>
        <label className="btn-secondary cursor-pointer">Import CSV<input type="file" accept=".csv" className="hidden" onChange={e=> e.target.files && importFile(e.target.files[0])} /></label>
      </div>
      <div className="card">
        <table className="w-full">
          <thead><tr><th className="p-2 text-left">Name</th><th className="p-2">Contact</th><th className="p-2">Phone</th></tr></thead>
          <tbody>
            {items.map(c=> (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.contactName}</td>
                <td className="p-2">{c.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}