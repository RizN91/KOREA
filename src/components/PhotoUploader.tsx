import { useRef } from 'react'
import type { Photo } from '../services/db'

export default function PhotoUploader({ photos, setPhotos }: { photos: Photo[]; setPhotos: (p: Photo[])=>void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function onFiles(files: FileList | null) {
    if (!files) return
    const arr: Photo[] = []
    for (const f of Array.from(files)) {
      const url = await fileToDataUrl(f)
      arr.push({ id: crypto.randomUUID(), url })
    }
    setPhotos([...(photos||[]), ...arr])
  }
  function move(idx: number, dir: -1 | 1) {
    const next = [...photos]
    const ni = idx + dir
    if (ni < 0 || ni >= next.length) return
    const [it] = next.splice(idx, 1)
    next.splice(ni, 0, it)
    setPhotos(next)
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={e=>onFiles(e.target.files)} />
      <button className="btn-secondary" onClick={()=>inputRef.current?.click()}>Upload Photos</button>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
        {(photos||[]).map((p, i) => (
          <div key={p.id} className="card p-2">
            <img src={p.url} alt="" className="w-full h-32 object-cover rounded" />
            <div className="flex justify-between mt-1 text-xs">
              <button className="btn-secondary px-2 py-1" onClick={()=>move(i,-1)}>↑</button>
              <button className="btn-secondary px-2 py-1" onClick={()=>move(i,1)}>↓</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}