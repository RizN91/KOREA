import { useNavigate } from 'react-router-dom'
import Scanner from '../components/Scanner'

export default function ScanPage(){
  const nav = useNavigate()
  function onResult(text: string){
    try {
      const url = new URL(text)
      const id = url.searchParams.get('job') || url.pathname.split('/').pop() || ''
      if (id) nav(`/jobs/${id}`)
    } catch {
      // treat as id
      nav(`/jobs/${text}`)
    }
  }
  return (
    <div className="space-y-3">
      <div className="text-xl font-semibold">Scan Job QR</div>
      <Scanner onResult={onResult} />
    </div>
  )
}