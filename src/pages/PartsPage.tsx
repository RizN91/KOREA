import { useEffect, useState } from 'react'
import { db, Part } from '../services/db'
import { exportCsv, importCsv } from '../utils/csv'

export default function PartsPage(){
  const [items, setItems] = useState<Part[]>([])
  useEffect(()=>{ db.parts.list().then(setItems) }, [])

  async function importFile(file: File){
    const rows = await importCsv(file)
    for (const r of rows) {
      if (!r.sku) continue
      await (db.parts as any).create?.({ sku: r.sku, name: r.name || r.sku, profileCode: r.profileCode || 'GEN', colour: (r.colour||'black'), lengthMm: Number(r.lengthMm||2100), priceEx: Number(r.priceEx||20), taxRate: Number(r.taxRate||0.1), stockQty: Number(r.stockQty||0) })
    }
    db.parts.list().then(setItems)
  }

  return (
    <div className="space-y-3">
      <div className="text-xl font-semibold">Parts & Inventory</div>
      <div className="flex gap-2 items-center">
        <button className="btn-secondary" onClick={()=>exportCsv(items, 'parts.csv')}>Export CSV</button>
        <label className="btn-secondary cursor-pointer">Import CSV<input type="file" accept=".csv" className="hidden" onChange={e=> e.target.files && importFile(e.target.files[0])} /></label>
      </div>
      <div className="card">
        <table className="w-full">
          <thead><tr><th className="p-2 text-left">SKU</th><th className="p-2">Profile</th><th className="p-2">Colour</th><th className="p-2">Length</th><th className="p-2">Price ex</th><th className="p-2">Stock</th></tr></thead>
          <tbody>
            {items.map(p=> (
              <tr key={p.id} className={`border-t ${p.stockQty<10?'bg-rose-50 dark:bg-rose-900/20':''}`}>
                <td className="p-2">{p.sku}</td>
                <td className="p-2">{p.profileCode}</td>
                <td className="p-2">{p.colour}</td>
                <td className="p-2">{p.lengthMm}mm</td>
                <td className="p-2">${p.priceEx.toFixed(2)}</td>
                <td className="p-2">{p.stockQty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}