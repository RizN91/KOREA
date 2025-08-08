import Papa from 'papaparse'

export function exportCsv<T>(rows: T[], filename: string) {
  const csv = Papa.unparse(rows as any)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}

export function importCsv(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: results => resolve(results.data as any[]),
      error: err => reject(err)
    })
  })
}